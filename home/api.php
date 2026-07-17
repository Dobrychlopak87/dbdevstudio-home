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
const CLIENT_FILES_DIR = __DIR__ . '/client-files';
const CONTACT_EMAIL = 'kontakt@dbdevstudio.pl';
const SITE_URL = 'https://dbdevstudio.pl';

function response(bool $success, array $data = [], ?string $error = null, int $status = 200): never {
    http_response_code($status);
    echo json_encode(array_merge(['success' => $success], $data, $error ? ['error' => $error] : []), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function token(int $bytes = 32): string { return bin2hex(random_bytes($bytes)); }
function mailSafe(string $to, string $subject, string $body): bool {
    $headers = "From: DBDEVSTUDIO <kontakt@dbdevstudio.pl>\r\n";
    $headers .= "Reply-To: kontakt@dbdevstudio.pl\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    return @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
}
function clientIp(): string { return substr($_SERVER['REMOTE_ADDR'] ?? 'unknown', 0, 64); }
function activeUser(PDO $pdo): ?array {
    if (empty($_SESSION['user_id'])) return null;
    $q = $pdo->prepare('SELECT id,name,email,phone,company,address,details,email_verified_at FROM users WHERE id=?');
    $q->execute([$_SESSION['user_id']]);
    return $q->fetch() ?: null;
}
function clientFolderName(array $user): string {
    $email = strtolower((string)($user['email'] ?? 'client'));
    $email = str_replace('@', '_at_', $email);
    $email = preg_replace('/[^a-z0-9._-]+/', '_', $email) ?: 'client';
    return (string)$user['id'] . '--' . substr($email, 0, 80);
}
function clientFileDirectory(array $user, bool $create = false): string {
    $directory = CLIENT_FILES_DIR . DIRECTORY_SEPARATOR . clientFolderName($user);
    if ($create && !is_dir($directory)) @mkdir($directory, 0750, true);
    return $directory;
}
function encodeFileId(string $name): string {
    return rtrim(strtr(base64_encode($name), '+/', '-_'), '=');
}
function decodeFileId(string $id): string|false {
    if (!preg_match('/^[A-Za-z0-9_-]+$/', $id)) return false;
    $padding = (4 - strlen($id) % 4) % 4;
    return base64_decode(strtr($id, '-_', '+/') . str_repeat('=', $padding), true);
}
function humanFileSize(int $bytes): string {
    if ($bytes >= 1073741824) return number_format($bytes / 1073741824, 1, ',', ' ') . ' GB';
    if ($bytes >= 1048576) return number_format($bytes / 1048576, 1, ',', ' ') . ' MB';
    if ($bytes >= 1024) return number_format($bytes / 1024, 0, ',', ' ') . ' KB';
    return $bytes . ' B';
}
function enforceRateLimit(PDO $pdo, string $action, int $limit = 5, int $window = 900): void {
    $cutoff = time() - $window;
    $pdo->prepare('DELETE FROM rate_limits WHERE created_at < ?')->execute([$cutoff]);
    $q = $pdo->prepare('SELECT COUNT(*) FROM rate_limits WHERE ip=? AND action=? AND created_at>=?');
    $q->execute([clientIp(), $action, $cutoff]);
    if ((int)$q->fetchColumn() >= $limit) response(false, [], 'Zbyt wiele prób. Spróbuj ponownie za 15 minut.', 429);
    $pdo->prepare('INSERT INTO rate_limits(ip,action,created_at) VALUES(?,?,?)')->execute([clientIp(), $action, time()]);
}

try {
    $pdo = new PDO('sqlite:' . SQLITE_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec('PRAGMA foreign_keys=ON');
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL,phone TEXT DEFAULT '',company TEXT DEFAULT '',address TEXT DEFAULT '',details TEXT DEFAULT '',email_verified_at TEXT DEFAULT NULL)");
    $cols = array_column($pdo->query('PRAGMA table_info(users)')->fetchAll(), 'name');
    if (!in_array('email_verified_at', $cols, true)) $pdo->exec('ALTER TABLE users ADD COLUMN email_verified_at TEXT DEFAULT NULL');
    $pdo->exec("CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,type TEXT NOT NULL,budget TEXT NOT NULL,timeline TEXT NOT NULL,domain_option TEXT NOT NULL,features TEXT NOT NULL,msg TEXT NOT NULL,date TEXT NOT NULL,status TEXT NOT NULL)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NULL,name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT DEFAULT '',type TEXT DEFAULT '',budget TEXT DEFAULT '',timeline TEXT DEFAULT '',domain_option TEXT DEFAULT '',features TEXT DEFAULT '[]',message TEXT NOT NULL,created_at TEXT NOT NULL,status TEXT DEFAULT 'new')");
    $pdo->exec("CREATE TABLE IF NOT EXISTS subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT NOT NULL UNIQUE,status TEXT NOT NULL DEFAULT 'pending',token_hash TEXT,created_at TEXT NOT NULL,confirmed_at TEXT)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS auth_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,type TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,expires_at INTEGER NOT NULL,used_at INTEGER)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS rate_limits (id INTEGER PRIMARY KEY AUTOINCREMENT,ip TEXT NOT NULL,action TEXT NOT NULL,created_at INTEGER NOT NULL)");
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_rate_limits ON rate_limits(ip,action,created_at)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_auth_tokens ON auth_tokens(token_hash,type,expires_at)');
} catch (Throwable $e) {
    error_log($e->getMessage());
    response(false, [], 'Błąd połączenia z bazą danych.', 500);
}

$action = preg_replace('/[^a-z_]/', '', $_GET['action'] ?? '');
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'download_file') {
    $user = activeUser($pdo);
    if (!$user) response(false, [], 'Użytkownik niezalogowany.', 401);
    $fileName = decodeFileId((string)($_GET['file'] ?? ''));
    if ($fileName === false || $fileName === '' || basename($fileName) !== $fileName || str_contains($fileName, "\0")) response(false, [], 'Nieprawidłowy plik.', 400);
    $directory = clientFileDirectory($user);
    $filePath = $directory . DIRECTORY_SEPARATOR . $fileName;
    $realDirectory = realpath($directory);
    $realFile = realpath($filePath);
    if ($realDirectory === false || $realFile === false || !is_file($realFile) || is_link($filePath) || strpos($realFile, $realDirectory . DIRECTORY_SEPARATOR) !== 0) response(false, [], 'Plik nie istnieje.', 404);
    $mime = 'application/octet-stream';
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) { $detected = finfo_file($finfo, $realFile); if (is_string($detected)) $mime = $detected; finfo_close($finfo); }
    }
    $fallbackName = preg_replace('/[^A-Za-z0-9._-]/', '_', $fileName) ?: 'download';
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . (string)filesize($realFile));
    header('Content-Disposition: attachment; filename="' . $fallbackName . '"; filename*=UTF-8\'\'' . rawurlencode($fileName));
    header('Cache-Control: private, no-store');
    readfile($realFile);
    exit;
}

if ($action === 'csrf_token') {
    $_SESSION['csrf_token'] ??= token();
    response(true, ['csrf_token' => $_SESSION['csrf_token']]);
}
if ($_SERVER['REQUEST_METHOD'] === 'GET' && in_array($action, ['verify_email', 'newsletter_confirm'], true)) {
    $raw = (string)($_GET['token'] ?? '');
    if (!$raw) response(false, [], 'Brak tokenu.', 400);
    $hash = hash('sha256', $raw);
    if ($action === 'verify_email') {
        $q=$pdo->prepare("SELECT * FROM auth_tokens WHERE token_hash=? AND type='verify_email' AND expires_at>? AND used_at IS NULL"); $q->execute([$hash,time()]); $row=$q->fetch();
        if(!$row) response(false, [], 'Link jest nieprawidłowy lub wygasł.', 400);
        $pdo->beginTransaction(); $pdo->prepare('UPDATE users SET email_verified_at=? WHERE id=?')->execute([date(DATE_ATOM),$row['user_id']]); $pdo->prepare('UPDATE auth_tokens SET used_at=? WHERE id=?')->execute([time(),$row['id']]); $pdo->commit();
        header('Location: '.SITE_URL.'/strefa-klienta?verified=1'); exit;
    }
    $q=$pdo->prepare("SELECT id FROM subscribers WHERE token_hash=? AND status='pending'"); $q->execute([$hash]); $id=$q->fetchColumn();
    if(!$id) response(false, [], 'Link jest nieprawidłowy lub został już użyty.', 400);
    $pdo->prepare("UPDATE subscribers SET status='confirmed',confirmed_at=?,token_hash=NULL WHERE id=?")->execute([date(DATE_ATOM),$id]);
    header('Location: '.SITE_URL.'/?newsletter=confirmed'); exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') response(false, [], 'Metoda niedozwolona.', 405);
$csrf = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($input['csrf_token'] ?? '');
if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], (string)$csrf)) response(false, [], 'Nieprawidłowy token CSRF.', 403);

switch ($action) {
case 'register':
    enforceRateLimit($pdo, 'register');
    $name = trim((string)($input['name'] ?? ''));
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $password = (string)($input['password'] ?? '');
    if (mb_strlen($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 10) response(false, [], 'Podaj poprawne dane i hasło o długości min. 10 znaków.', 422);
    $q=$pdo->prepare('SELECT 1 FROM users WHERE email=?'); $q->execute([$email]);
    if ($q->fetchColumn()) response(false, [], 'Konto o tym adresie e-mail już istnieje.', 409);
    $id='u_'.bin2hex(random_bytes(8));
    $pdo->prepare('INSERT INTO users(id,name,email,password) VALUES(?,?,?,?)')->execute([$id,$name,$email,password_hash($password,PASSWORD_DEFAULT)]);
    clientFileDirectory(['id'=>$id,'email'=>$email], true);
    $raw=token();
    $pdo->prepare('INSERT INTO auth_tokens(user_id,type,token_hash,expires_at) VALUES(?,?,?,?)')->execute([$id,'verify_email',hash('sha256',$raw),time()+86400]);
    mailSafe($email, 'Potwierdź adres e-mail — DBDEVSTUDIO', "Dzień dobry $name,\n\nPotwierdź adres e-mail:\n".SITE_URL."/api.php?action=verify_email&token=$raw\n\nLink jest ważny 24 godziny.");
    response(true, ['verification_required'=>true, 'message'=>'Sprawdź skrzynkę i potwierdź adres e-mail.']);

case 'login':
    enforceRateLimit($pdo, 'login');
    $email=strtolower(trim((string)($input['email']??''))); $password=(string)($input['password']??'');
    $q=$pdo->prepare('SELECT * FROM users WHERE email=?'); $q->execute([$email]); $user=$q->fetch();
    if (!$user || !password_verify($password,$user['password'])) response(false, [], 'Nieprawidłowy e-mail lub hasło.', 401);
    if (empty($user['email_verified_at'])) response(false, [], 'Najpierw potwierdź adres e-mail.', 403);
    session_regenerate_id(true); $_SESSION['user_id']=$user['id'];
    $q=$pdo->prepare('SELECT * FROM projects WHERE user_id=? ORDER BY date DESC'); $q->execute([$user['id']]); $projects=$q->fetchAll();
    foreach($projects as &$p) $p['features']=json_decode($p['features'],true)?:[];
    unset($user['password']); $user['projects']=$projects;
    response(true,['user'=>$user]);

case 'logout':
    $_SESSION=[]; session_destroy(); response(true);

case 'get_profile':
    $user=activeUser($pdo); if(!$user) response(false, [], 'Użytkownik niezalogowany.', 401);
    $q=$pdo->prepare('SELECT * FROM projects WHERE user_id=? ORDER BY date DESC'); $q->execute([$user['id']]); $user['projects']=$q->fetchAll();
    foreach($user['projects'] as &$p) $p['features']=json_decode($p['features'],true)?:[];
    response(true,['user'=>$user]);

case 'list_files':
    $user=activeUser($pdo); if(!$user) response(false, [], 'Użytkownik niezalogowany.', 401);
    $directory=clientFileDirectory($user, true);
    $files=[];
    if (is_dir($directory)) {
        foreach (new DirectoryIterator($directory) as $file) {
            if ($file->isDot() || !$file->isFile() || $file->isLink() || str_starts_with($file->getFilename(), '.')) continue;
            $files[]=['id'=>encodeFileId($file->getFilename()),'name'=>$file->getFilename(),'size'=>humanFileSize($file->getSize()),'date'=>date('d.m.Y',$file->getMTime()),'_mtime'=>$file->getMTime()];
        }
    }
    usort($files, fn(array $a, array $b): int => $b['_mtime'] <=> $a['_mtime']);
    foreach ($files as &$file) unset($file['_mtime']);
    response(true, ['files'=>$files]);

case 'update_profile':
    $user=activeUser($pdo); if(!$user) response(false, [], 'Użytkownik niezalogowany.', 401);
    $name=trim((string)($input['name']??$user['name'])); if(!$name) response(false, [], 'Imię i nazwisko jest wymagane.', 422);
    $pdo->prepare('UPDATE users SET name=?,phone=?,company=?,address=?,details=? WHERE id=?')->execute([$name,trim((string)($input['phone']??'')),trim((string)($input['company']??'')),trim((string)($input['address']??'')),trim((string)($input['details']??'')),$user['id']]);
    response(true);

case 'add_project':
case 'contact':
    enforceRateLimit($pdo, 'contact', 10, 900);
    $user=activeUser($pdo);
    $name=trim((string)($input['name']??($user['name']??''))); $email=strtolower(trim((string)($input['email']??($user['email']??'')))); $message=trim((string)($input['msg']??$input['message']??''));
    if(mb_strlen($name)<2 || !filter_var($email,FILTER_VALIDATE_EMAIL) || mb_strlen($message)<5) response(false, [], 'Uzupełnij imię, e-mail i opis projektu.', 422);
    $features=json_encode($input['features']??[],JSON_UNESCAPED_UNICODE);
    $type=trim((string)($input['type']??''));
    $budget=trim((string)($input['budget']??''));
    $timeline=trim((string)($input['timeline']??''));
    $domainOption=trim((string)($input['domainOption']??''));
    if ($action === 'add_project' && $user !== null) {
        $projectId='p_'.bin2hex(random_bytes(8));
        $pdo->prepare('INSERT INTO projects(id,user_id,type,budget,timeline,domain_option,features,msg,date,status) VALUES(?,?,?,?,?,?,?,?,?,?)')->execute([$projectId,$user['id'],$type,$budget,$timeline,$domainOption,$features,$message,date(DATE_ATOM),'diagnosis']);
    } else {
        $pdo->prepare('INSERT INTO leads(user_id,name,email,phone,type,budget,timeline,domain_option,features,message,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)')->execute([$user['id']??null,$name,$email,trim((string)($input['phone']??($user['phone']??''))),$type,$budget,$timeline,$domainOption,$features,$message,date(DATE_ATOM)]);
    }
    $body="Nowy lead z dbdevstudio.pl\n\nImię: $name\nE-mail: $email\nTelefon: ".($input['phone']??'')."\nTyp: $type\nBudżet: $budget\nTermin: $timeline\n\nWiadomość:\n$message";
    mailSafe(CONTACT_EMAIL,'Nowy lead: '.$name,$body);
    mailSafe($email,'Potwierdzenie zapytania — DBDEVSTUDIO',"Dziękujemy za wiadomość. Odpowiemy w ciągu 24 godzin roboczych.\n\nDBDEVSTUDIO");
    response(true);

case 'newsletter_subscribe':
    enforceRateLimit($pdo, 'newsletter', 5, 3600);
    $email=strtolower(trim((string)($input['email']??''))); if(!filter_var($email,FILTER_VALIDATE_EMAIL)) response(false, [], 'Podaj poprawny e-mail.', 422);
    $raw=token(); $hash=hash('sha256',$raw); $now=date(DATE_ATOM);
    $pdo->prepare("INSERT INTO subscribers(email,status,token_hash,created_at) VALUES(?,'pending',?,?) ON CONFLICT(email) DO UPDATE SET status='pending',token_hash=excluded.token_hash,created_at=excluded.created_at")->execute([$email,$hash,$now]);
    mailSafe($email,'Potwierdź zapis do newslettera — DBDEVSTUDIO',"Potwierdź zapis, klikając:\n".SITE_URL."/api.php?action=newsletter_confirm&token=$raw\n\nJeśli to nie Ty, zignoruj tę wiadomość.");
    response(true,['message'=>'Sprawdź e-mail i potwierdź zapis.']);

case 'password_reset':
    enforceRateLimit($pdo, 'password_reset', 5, 3600);
    $rawToken=(string)($input['token']??''); $newPassword=(string)($input['new_password']??'');
    if($rawToken && strlen($newPassword)<10) response(false, [], 'Nowe hasło musi mieć co najmniej 10 znaków.', 422);
    if($rawToken && strlen($newPassword)>=10){
        $q=$pdo->prepare("SELECT * FROM auth_tokens WHERE token_hash=? AND type='password_reset' AND expires_at>? AND used_at IS NULL"); $q->execute([hash('sha256',$rawToken),time()]); $row=$q->fetch();
        if(!$row) response(false, [], 'Token jest nieprawidłowy lub wygasł.', 400);
        $pdo->beginTransaction(); $pdo->prepare('UPDATE users SET password=? WHERE id=?')->execute([password_hash($newPassword,PASSWORD_DEFAULT),$row['user_id']]); $pdo->prepare('UPDATE auth_tokens SET used_at=? WHERE id=?')->execute([time(),$row['id']]); $pdo->commit(); response(true,['message'=>'Hasło zostało zmienione.']);
    }
    $email=strtolower(trim((string)($input['email']??'')));
    if(filter_var($email,FILTER_VALIDATE_EMAIL)){ $q=$pdo->prepare('SELECT id,name FROM users WHERE email=?'); $q->execute([$email]); if($u=$q->fetch()){ $raw=token(); $pdo->prepare('INSERT INTO auth_tokens(user_id,type,token_hash,expires_at) VALUES(?,?,?,?)')->execute([$u['id'],'password_reset',hash('sha256',$raw),time()+3600]); mailSafe($email,'Reset hasła — DBDEVSTUDIO',"Ustaw nowe hasło:\n".SITE_URL."/reset-hasla?token=$raw\n\nLink jest ważny godzinę."); }}
    response(true,['message'=>'Jeśli konto istnieje, wysłaliśmy instrukcję resetu.']);

default: response(false, [], 'Nieznana akcja.', 404);
}
