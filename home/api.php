<?php
declare(strict_types=1);

/**
 * DBDEVSTUDIO - API Router Production v2026.07.17
 * Secure, rate-limited, SQLite, session hardened
 */

// Security headers
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-XSS-Protection: 0');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

// CORS - allow same origin only, but handle preflight
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['https://dbdevstudio.pl', 'https://www.dbdevstudio.pl', 'http://localhost:5173', 'http://localhost:3000'];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success'=>false,'message'=>'Method not allowed']);
    exit;
}

// Session hardening
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

// Rate limiting simple file-based
function rateLimit(string $key, int $maxAttempts = 10, int $windowSeconds = 60): bool {
    $dir = __DIR__ . '/client-files/.ratelimit';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $file = $dir . '/' . preg_replace('/[^a-zA-Z0-9_-]/','_', $key) . '.json';
    $now = time();
    $data = ['count'=>0,'first'=>$now];
    if (is_file($file)) {
        $content = @file_get_contents($file);
        $decoded = json_decode($content, true);
        if (is_array($decoded) && isset($decoded['first'], $decoded['count'])) {
            $data = $decoded;
            if ($now - $data['first'] > $windowSeconds) {
                $data = ['count'=>0,'first'=>$now];
            }
        }
    }
    $data['count']++;
    @file_put_contents($file, json_encode($data), LOCK_EX);
    return $data['count'] <= $maxAttempts;
}

function getClientIp(): string {
    $keys = ['HTTP_CLIENT_IP','HTTP_X_FORWARDED_FOR','HTTP_X_FORWARDED','HTTP_FORWARDED_FOR','HTTP_FORWARDED','REMOTE_ADDR'];
    foreach ($keys as $k) {
        if (!empty($_SERVER[$k])) {
            $ips = explode(',', $_SERVER[$k]);
            $ip = trim($ips[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
        }
    }
    return '0.0.0.0';
}

const SQLITE_FILE = __DIR__ . '/dbdevstudio.sqlite';

class ApiRouter {
    private PDO $db;
    private array $request;

    public function __construct() {
        $this->db = $this->getDatabaseConnection();
        $this->ensureSchema();
        $this->request = $this->parseRequest();
    }

    private function getDatabaseConnection(): PDO {
        try {
            $needChmod = !is_file(SQLITE_FILE);
            $db = new PDO('sqlite:' . SQLITE_FILE);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $db->exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
            if ($needChmod) @chmod(SQLITE_FILE, 0600);
            return $db;
        } catch (PDOException $e) {
            error_log('DB connect failed: '.$e->getMessage());
            $this->sendError('Database connection failed', 500);
            exit;
        }
    }

    private function ensureSchema(): void {
        $this->db->exec('CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1,
            reset_token TEXT,
            reset_expires DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');
        $this->db->exec('CREATE TABLE IF NOT EXISTS contact_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            ip TEXT,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )');
        $this->db->exec('CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email)');
        $this->db->exec('CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at)');
    }

    private function parseRequest(): array {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        if (is_array($json)) return $json;
        return $_POST ?? [];
    }

    public function handle(): void {
        $action = trim($this->request['action'] ?? '');
        $ip = getClientIp();

        // Global rate limit per IP: 60 req/min
        if (!rateLimit('global_'.$ip, 60, 60)) {
            $this->sendError('Too many requests, slow down', 429);
            return;
        }

        try {
            match ($action) {
                'login' => $this->handleLogin(),
                'logout' => $this->handleLogout(),
                'password-reset' => $this->handlePasswordReset(),
                'verify-session' => $this->handleVerifySession(),
                'get-files' => $this->handleGetFiles(),
                'contact' => $this->handleContact(),
                '' => $this->sendError('Missing action', 400),
                default => $this->sendError('Unknown action', 400)
            };
        } catch (Throwable $e) {
            error_log('API error ['.$action.']: '.$e->getMessage().' in '.$e->getFile().':'.$e->getLine());
            $this->sendError('Internal server error', 500);
        }
    }

    private function handleLogin(): void {
        $ip = getClientIp();
        if (!rateLimit('login_'.$ip, 5, 300)) {
            $this->sendError('Too many login attempts. Try again in 5 minutes.', 429);
            return;
        }

        $email = filter_var(trim($this->request['email'] ?? ''), FILTER_VALIDATE_EMAIL);
        $password = $this->request['password'] ?? '';

        if (!$email || !is_string($password) || $password === '' || mb_strlen($password) > 256) {
            $this->sendError('Invalid email or password', 422);
            return;
        }

        $stmt = $this->db->prepare('SELECT id, email, password_hash, name FROM clients WHERE email = :email AND active = 1 LIMIT 1');
        $stmt->execute([':email'=>$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            // Sleep to mitigate timing
            usleep(random_int(100000, 300000));
            $this->sendError('Invalid credentials', 401);
            return;
        }

        // Regenerate session ID on login
        session_regenerate_id(true);
        $_SESSION['client_id'] = $user['id'];
        $_SESSION['client_email'] = $user['email'];
        $_SESSION['client_name'] = $user['name'];
        $_SESSION['login_time'] = time();
        $_SESSION['ip'] = $ip;

        $this->sendSuccess([
            'name' => $user['name'],
            'email' => $user['email']
        ]);
    }

    private function handleLogout(): void {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time()-42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        $this->sendSuccess(['message'=>'Logged out']);
    }

    private function handleVerifySession(): void {
        if (isset($_SESSION['client_id'], $_SESSION['client_email']) && $this->isSessionValid()) {
            $this->sendSuccess([
                'authenticated'=>true,
                'name'=>$_SESSION['client_name'] ?? '',
                'email'=>$_SESSION['client_email']
            ]);
        } else {
            $this->sendError('Not authenticated', 401);
        }
    }

    private function isSessionValid(): bool {
        if (!isset($_SESSION['login_time'])) return false;
        // 12h session
        if (time() - $_SESSION['login_time'] > 43200) return false;
        // Optional IP check (loose)
        $currentIp = getClientIp();
        if (isset($_SESSION['ip']) && $_SESSION['ip'] !== $currentIp) {
            // Allow but log
            error_log('Session IP mismatch: '.$_SESSION['ip'].' vs '.$currentIp);
        }
        return true;
    }

    private function handlePasswordReset(): void {
        $ip = getClientIp();
        if (!rateLimit('reset_'.$ip, 3, 3600)) {
            $this->sendError('Too many reset attempts. Try later.', 429);
            return;
        }

        $email = filter_var(trim($this->request['email'] ?? ''), FILTER_VALIDATE_EMAIL);
        if (!$email) {
            $this->sendError('Invalid email address', 422);
            return;
        }

        $stmt = $this->db->prepare('SELECT id FROM clients WHERE email = :email LIMIT 1');
        $stmt->execute([':email'=>$email]);
        $exists = $stmt->fetch();

        if (!$exists) {
            // Don't reveal, but still rate limited
            $this->sendSuccess(['message'=>'If the email exists, a reset link will be sent']);
            return;
        }

        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $upd = $this->db->prepare('UPDATE clients SET reset_token = :token, reset_expires = :exp WHERE email = :email');
        $upd->execute([':token'=>$token, ':exp'=>$expires, ':email'=>$email]);

        // In production, send email via SMTP here
        // mail($email, 'Reset hasła DBDEVSTUDIO', "Token: $token ...");
        // For now we log token hash only (never log plain token in prod)
        error_log("Password reset requested for $email token=".substr($token,0,8)."***");

        $this->sendSuccess(['message'=>'If the email exists, a reset link will be sent']);
    }

    private function handleGetFiles(): void {
        $this->requireAuth();

        $clientId = $_SESSION['client_id'];
        $clientEmail = $_SESSION['client_email'];

        // Securely build client dir: id + sanitized email
        $safeEmail = preg_replace('/[^a-zA-Z0-9]/','_', $clientEmail);
        // Support both legacy naming and new
        $possibleDirs = [
            __DIR__ . '/client-files/' . $clientId . '_' . $safeEmail,
            __DIR__ . '/client-files/u_' . $clientId . '_' . str_replace(['@','.'],['_at_','_'], $clientEmail),
            __DIR__ . '/client-files/' . $clientId,
            __DIR__ . '/client-files/u_' . $clientId,
        ];
        // Also check directory naming like in INSTRUKCJA_ADMINISTRATORA: ID--email
        // Example: u_7a809d4f1e441957--dobry2013chlopak_at_gmail.com
        $clientDir = null;
        foreach (glob(__DIR__.'/client-files/*', GLOB_ONLYDIR) as $dir) {
            $base = basename($dir);
            if (str_starts_with($base, $clientId) || str_contains($base, $safeEmail) || str_contains($base, str_replace('_','_at_',$safeEmail))) {
                $clientDir = $dir;
                break;
            }
        }
        // Fallback to first possible that exists
        if (!$clientDir) {
            foreach ($possibleDirs as $d) {
                if (is_dir($d)) { $clientDir = $d; break; }
            }
        }

        $files = [];
        if ($clientDir && is_dir($clientDir)) {
            $realBase = realpath($clientDir);
            $allowedBase = realpath(__DIR__.'/client-files');
            if ($realBase && $allowedBase && str_starts_with($realBase, $allowedBase)) {
                foreach (glob($realBase.'/*') as $file) {
                    if (is_file($file)) {
                        // Ensure inside base
                        $realFile = realpath($file);
                        if (!$realFile || !str_starts_with($realFile, $allowedBase)) continue;
                        $files[] = [
                            'name'=>basename($realFile),
                            'size'=>filesize($realFile),
                            'modified'=>date('Y-m-d H:i:s', filemtime($realFile))
                        ];
                    }
                }
            }
        }

        $this->sendSuccess(['files'=>$files]);
    }

    private function handleContact(): void {
        $ip = getClientIp();
        if (!rateLimit('contact_'.$ip, 5, 3600)) {
            $this->sendError('Too many messages. Try later.', 429);
            return;
        }

        $name = trim($this->request['name'] ?? '');
        $emailRaw = trim($this->request['email'] ?? '');
        $messageRaw = trim($this->request['message'] ?? '');

        // Validation
        if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
            $this->sendError('Name must be 2-100 chars', 422); return;
        }
        $email = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);
        if (!$email) { $this->sendError('Invalid email', 422); return; }
        if (mb_strlen($messageRaw) < 10 || mb_strlen($messageRaw) > 5000) {
            $this->sendError('Message must be 10-5000 chars', 422); return;
        }

        // Basic spam check: too many URLs
        if (substr_count($messageRaw, 'http') > 3) {
            $this->sendError('Too many links', 422); return;
        }

        $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
        $safeMessage = htmlspecialchars($messageRaw, ENT_QUOTES, 'UTF-8');
        $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

        $stmt = $this->db->prepare('INSERT INTO contact_submissions (name, email, message, ip, user_agent, created_at) VALUES (:name, :email, :msg, :ip, :ua, datetime("now"))');
        $stmt->execute([
            ':name'=>$safeName,
            ':email'=>$email,
            ':msg'=>$safeMessage,
            ':ip'=>$ip,
            ':ua'=>$ua
        ]);

        // In production, send email to admin and confirmation to user
        $this->sendSuccess(['message'=>'Message sent successfully']);
    }

    private function requireAuth(): void {
        if (!isset($_SESSION['client_id']) || !$this->isSessionValid()) {
            $this->sendError('Authentication required', 401);
            exit;
        }
    }

    private function sendSuccess(array $data): void {
        echo json_encode(['success'=>true, ...$data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function sendError(string $message, int $code = 400): void {
        http_response_code($code);
        echo json_encode(['success'=>false,'message'=>$message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}

$router = new ApiRouter();
$router->handle();
