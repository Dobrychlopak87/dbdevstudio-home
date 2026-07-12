<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Cache-Control: no-store');

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

const SQLITE_FILE = __DIR__ . '/dbdevstudio.sqlite';

/**
 * API Router for DBDEVSTUDIO
 */
class ApiRouter {
    private PDO $db;
    private array $request;
    
    public function __construct() {
        $this->db = $this->getDatabaseConnection();
        $this->request = $this->parseRequest();
    }
    
    private function getDatabaseConnection(): PDO {
        try {
            $db = new PDO('sqlite:' . SQLITE_FILE);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            return $db;
        } catch (PDOException $e) {
            $this->sendError('Database connection failed', 500);
            exit;
        }
    }
    
    private function parseRequest(): array {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? $_POST ?? [];
    }
    
    public function handle(): void {
        $action = $this->request['action'] ?? '';
        
        try {
            match ($action) {
                'login' => $this->handleLogin(),
                'logout' => $this->handleLogout(),
                'password-reset' => $this->handlePasswordReset(),
                'verify-session' => $this->handleVerifySession(),
                'get-files' => $this->handleGetFiles(),
                'contact' => $this->handleContact(),
                default => $this->sendError('Unknown action', 400)
            };
        } catch (Throwable $e) {
            error_log($e->getMessage());
            $this->sendError('Internal server error', 500);
        }
    }
    
    private function handleLogin(): void {
        $email = filter_var($this->request['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $password = $this->request['password'] ?? '';
        
        if (!$email || empty($password)) {
            $this->sendError('Invalid email or password');
            return;
        }
        
        $stmt = $this->db->prepare('SELECT id, email, password_hash, name FROM clients WHERE email = ? AND active = 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->sendError('Invalid credentials');
            return;
        }
        
        $_SESSION['client_id'] = $user['id'];
        $_SESSION['client_email'] = $user['email'];
        $_SESSION['client_name'] = $user['name'];
        
        $this->sendSuccess([
            'name' => $user['name'],
            'email' => $user['email']
        ]);
    }
    
    private function handleLogout(): void {
        session_destroy();
        $this->sendSuccess(['message' => 'Logged out']);
    }
    
    private function handleVerifySession(): void {
        if (isset($_SESSION['client_id'])) {
            $this->sendSuccess([
                'authenticated' => true,
                'name' => $_SESSION['client_name'],
                'email' => $_SESSION['client_email']
            ]);
        } else {
            $this->sendError('Not authenticated', 401);
        }
    }
    
    private function handlePasswordReset(): void {
        $email = filter_var($this->request['email'] ?? '', FILTER_VALIDATE_EMAIL);
        
        if (!$email) {
            $this->sendError('Invalid email address');
            return;
        }
        
        $stmt = $this->db->prepare('SELECT id FROM clients WHERE email = ?');
        $stmt->execute([$email]);
        
        if (!$stmt->fetch()) {
            // Don't reveal if email exists
            $this->sendSuccess(['message' => 'If the email exists, a reset link will be sent']);
            return;
        }
        
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        $stmt = $this->db->prepare('UPDATE clients SET reset_token = ?, reset_expires = ? WHERE email = ?');
        $stmt->execute([$token, $expires, $email]);
        
        // In production, send email here
        $this->sendSuccess(['message' => 'If the email exists, a reset link will be sent']);
    }
    
    private function handleGetFiles(): void {
        $this->requireAuth();
        
        $clientId = $_SESSION['client_id'];
        $clientDir = __DIR__ . '/client-files/u_' . $clientId . '_' . str_replace(['@', '.'], ['_at_', '_'], $_SESSION['client_email']);
        
        $files = [];
        if (is_dir($clientDir)) {
            foreach (glob($clientDir . '/*') as $file) {
                if (is_file($file)) {
                    $files[] = [
                        'name' => basename($file),
                        'size' => filesize($file),
                        'modified' => date('Y-m-d H:i:s', filemtime($file))
                    ];
                }
            }
        }
        
        $this->sendSuccess(['files' => $files]);
    }
    
    private function handleContact(): void {
        $name = htmlspecialchars(trim($this->request['name'] ?? ''));
        $email = filter_var(trim($this->request['email'] ?? ''), FILTER_VALIDATE_EMAIL);
        $message = htmlspecialchars(trim($this->request['message'] ?? ''));
        
        if (empty($name) || !$email || empty($message)) {
            $this->sendError('All fields are required');
            return;
        }
        
        // Store in database
        $stmt = $this->db->prepare('INSERT INTO contact_submissions (name, email, message, created_at) VALUES (?, ?, ?, datetime("now"))');
        $stmt->execute([$name, $email, $message]);
        
        $this->sendSuccess(['message' => 'Message sent successfully']);
    }
    
    private function requireAuth(): void {
        if (!isset($_SESSION['client_id'])) {
            $this->sendError('Authentication required', 401);
            exit;
        }
    }
    
    private function sendSuccess(array $data): void {
        echo json_encode(['success' => true, ...$data]);
    }
    
    private function sendError(string $message, int $code = 400): void {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $message]);
    }
}

// Initialize and handle request
$router = new ApiRouter();
$router->handle();
