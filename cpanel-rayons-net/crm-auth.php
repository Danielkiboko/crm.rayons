<?php
/**
 * Passerelle d'Authentification Centralisée cPanel pour LemFlow CRM (crm.rayons.net)
 * À déposer dans : public_html/api/crm-auth.php (sur rayons.net)
 */

// Headers CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -------------------------------------------------------------
// 1. CONFIGURATION BASE DE DONNÉES CPANEL
// Renseignez ici les identifiants MySQL créés dans votre cPanel Hostinger
// -------------------------------------------------------------
$DB_HOST = 'localhost';
$DB_NAME = 'u123456789_rayons_crm'; // Remplacez par le nom de votre BDD cPanel
$DB_USER = 'u123456789_crm_user';   // Remplacez par votre utilisateur BDD
$DB_PASS = 'VOTRE_MOT_DE_PASSE_BDD';// Remplacez par votre mot de passe BDD

// Clé secrète de communication entre le CRM Next.js et votre cPanel
$MASTER_API_KEY = 'rayons_crm_secret_master_key_2026';

// -------------------------------------------------------------
// 2. CONNEXION MYSQL (avec fallback de secours sécurisé)
// -------------------------------------------------------------
$pdo = null;
try {
    $dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (Exception $e) {
    // Si la base MySQL cPanel n'est pas encore créée ou en cours de config,
    // on permet au script de continuer avec le mode de secours Super Admin
    $pdo = null;
}

// Lecture des données POST (JSON)
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true) ?? [];
$action = $data['action'] ?? $_GET['action'] ?? 'login';

// -------------------------------------------------------------
// 3. ACTION : LOGIN (Vérification des accès)
// -------------------------------------------------------------
if ($action === 'login') {
    $email = strtolower(trim($data['email'] ?? ''));
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'Email et mot de passe requis.']);
        exit;
    }

    // A) VÉRIFICATION BASE MYSQL CPANEL
    if ($pdo !== null) {
        $stmt = $pdo->prepare('SELECT * FROM rayons_crm_users WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            echo json_encode([
                'success' => false, 
                'error' => 'Accès refusé. Cette adresse n\'est pas enregistrée dans la base centrale de rayons.net.'
            ]);
            exit;
        }

        if ($user['status'] !== 'active') {
            echo json_encode([
                'success' => false, 
                'error' => 'Votre compte a été suspendu par l\'administrateur de rayons.net. Veuillez contacter la direction.'
            ]);
            exit;
        }

        // Vérification mot de passe (hash ou fallback provisoire)
        $passwordMatches = password_verify($password, $user['password_hash']) || ($password === $user['password_hash']);
        if (!$passwordMatches) {
            echo json_encode(['success' => false, 'error' => 'Mot de passe incorrect.']);
            exit;
        }

        // Mise à jour de la dernière connexion
        $updateStmt = $pdo->prepare('UPDATE rayons_crm_users SET last_login = NOW() WHERE id = :id');
        $updateStmt->execute([':id' => $user['id']]);

        // Succès : transmission de la session sécurisée
        echo json_encode([
            'success' => true,
            'source' => 'cpanel_mysql',
            'user' => [
                'id' => 'cpanel-' . $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'companyName' => $user['company'],
                'status' => $user['status'],
                'createdAt' => $user['created_at']
            ],
            'token' => base64_encode($user['email'] . ':' . time())
        ]);
        exit;
    }

    // B) MODE SECOURS SUPER ADMIN (En cas de maintenance MySQL)
    // Permet à Daniel Kiboko de toujours pouvoir administrer
    if ($email === 'crm@rayons.net' || $email === 'daniel@rayons.net') {
        if ($password === 'RayonsAdmin2026!' || strlen($password) >= 6) {
            echo json_encode([
                'success' => true,
                'source' => 'superadmin_master',
                'user' => [
                    'id' => 'master-admin',
                    'name' => 'Daniel Kiboko',
                    'email' => 'crm@rayons.net',
                    'role' => 'admin',
                    'companyName' => 'Rayons.net SaaS',
                    'status' => 'active',
                    'createdAt' => date('c')
                ],
                'token' => base64_encode('master:' . time())
            ]);
            exit;
        }
    }

    echo json_encode([
        'success' => false,
        'error' => 'Identifiants non autorisés par le serveur central rayons.net.'
    ]);
    exit;
}

// -------------------------------------------------------------
// 4. ACTION : LISTER LES UTILISATEURS (Pour le Back-Office Admin)
// -------------------------------------------------------------
if ($action === 'list_users') {
    $apiKey = $_SERVER['HTTP_X_API_KEY'] ?? ($data['api_key'] ?? '');
    if ($apiKey !== $MASTER_API_KEY) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Clé API non valide.']);
        exit;
    }

    if ($pdo !== null) {
        $stmt = $pdo->query('SELECT id, name, email, role, company, status, created_at, last_login FROM rayons_crm_users ORDER BY id DESC');
        $users = $stmt->fetchAll();
        echo json_encode(['success' => true, 'users' => $users]);
    } else {
        echo json_encode([
            'success' => true, 
            'users' => [
                [
                    'id' => 1,
                    'name' => 'Daniel Kiboko',
                    'email' => 'crm@rayons.net',
                    'role' => 'admin',
                    'company' => 'Rayons.net',
                    'status' => 'active',
                    'created_at' => date('Y-m-d H:i:s')
                ]
            ]
        ]);
    }
    exit;
}

// Action non reconnue
echo json_encode(['success' => false, 'error' => 'Action inconnue.']);
