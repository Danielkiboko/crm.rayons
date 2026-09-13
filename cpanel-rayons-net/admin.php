<?php
/**
 * Interface Web d'Administration des Accès SaaS cPanel
 * À déposer dans : public_html/api/admin.php (sur rayons.net)
 */

session_start();

// Configuration BDD
$DB_HOST = 'localhost';
$DB_NAME = 'u123456789_rayons_crm';
$DB_USER = 'u123456789_crm_user';
$DB_PASS = 'VOTRE_MOT_DE_PASSE_BDD';

// Mot de passe Master pour ouvrir cet écran d'administration
$MASTER_ADMIN_PASSWORD = 'RayonsAdmin2026!';

// Gestion Connexion Admin
if (isset($_POST['admin_pass'])) {
    if ($_POST['admin_pass'] === $MASTER_ADMIN_PASSWORD) {
        $_SESSION['rayons_admin_logged'] = true;
    } else {
        $error = "Mot de passe Maître incorrect.";
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

$isLogged = !empty($_SESSION['rayons_admin_logged']);

$pdo = null;
$dbConnected = false;
try {
    $pdo = new PDO("mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $dbConnected = true;
} catch (Exception $e) {
    $dbError = $e->getMessage();
}

// Action : Ajouter un utilisateur
$message = '';
if ($isLogged && $pdo && isset($_POST['action']) && $_POST['action'] === 'add_user') {
    $name = trim($_POST['name'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $pass = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'sales';
    $company = trim($_POST['company'] ?? 'Rayons.net');

    if ($email && $pass) {
        $hash = password_hash($pass, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('INSERT INTO rayons_crm_users (name, email, password_hash, role, company, status) VALUES (?, ?, ?, ?, ?, "active")');
        try {
            $stmt->execute([$name, $email, $hash, $role, $company]);
            $message = "Utilisateur {$email} créé et autorisé avec succès !";
        } catch (Exception $e) {
            $message = "Erreur : " . $e->getMessage();
        }
    }
}

// Action : Basculer statut (Actif / Suspendu)
if ($isLogged && $pdo && isset($_GET['toggle_id'])) {
    $id = (int)$_GET['toggle_id'];
    $stmt = $pdo->prepare('UPDATE rayons_crm_users SET status = IF(status = "active", "suspended", "active") WHERE id = ?');
    $stmt->execute([$id]);
    header('Location: admin.php');
    exit;
}

// Récupération des utilisateurs
$users = [];
if ($isLogged && $pdo) {
    $users = $pdo->query('SELECT * FROM rayons_crm_users ORDER BY id DESC')->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Administration Centrale des Accès SaaS - Rayons.net</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 30px; }
        .container { max-width: 960px; margin: 0 auto; }
        h1 { font-size: 1.6rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #222; padding-bottom: 15px; }
        .card { background: #111; border: 1px solid #222; border-radius: 6px; padding: 20px; margin-bottom: 25px; }
        input, select, button { padding: 10px 14px; background: #000; border: 1px solid #333; color: #fff; border-radius: 4px; font-size: 0.9rem; }
        button { background: #fff; color: #000; font-weight: bold; cursor: pointer; border: none; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.88rem; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #222; }
        th { color: #888; text-transform: uppercase; font-size: 0.75rem; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 3px; font-size: 0.72rem; font-weight: bold; text-transform: uppercase; }
        .badge-active { background: #fff; color: #000; }
        .badge-suspended { background: #333; color: #888; }
        a { color: #fff; text-decoration: none; }
        .alert { padding: 12px; background: #222; border-left: 3px solid #fff; margin-bottom: 20px; }
    </style>
</head>
<body>
<div class="container">
    <h1>RAYONS.NET — CONSOLE D'ACCÈS SAAS</h1>

    <?php if (!$isLogged): ?>
        <div class="card" style="max-width: 400px; margin: 60px auto;">
            <h2 style="font-size: 1.1rem; margin-top: 0;">Connexion Super-Administrateur</h2>
            <p style="font-size: 0.82rem; color: #888;">Entrez le mot de passe maître de votre cPanel rayons.net :</p>
            <?php if (!empty($error)): ?><div style="color: red; margin-bottom: 10px;"><?= htmlspecialchars($error) ?></div><?php endif; ?>
            <form method="POST">
                <input type="password" name="admin_pass" placeholder="Mot de passe Maître" style="width: 100%; box-sizing: border-box; margin-bottom: 15px;" required>
                <button type="submit" style="width: 100%;">Ouvrir la Console</button>
            </form>
        </div>
    <?php else: ?>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <span style="font-size: 0.85rem; color: #888;">Session Maître : <strong>Daniel Kiboko (rayons.net)</strong></span>
            <a href="?logout=1" style="font-size: 0.8rem; border: 1px solid #333; padding: 6px 12px; border-radius: 4px;">Déconnexion</a>
        </div>

        <?php if (!empty($message)): ?>
            <div class="alert"><?= htmlspecialchars($message) ?></div>
        <?php endif; ?>

        <!-- Formulaire création utilisateur -->
        <div class="card">
            <h2 style="font-size: 1.1rem; margin-top: 0;">Créer un Nouvel Accès SaaS</h2>
            <p style="font-size: 0.82rem; color: #888;">Dès création, cet utilisateur sera autorisé à se connecter sur <strong>crm.rayons.net</strong>.</p>
            
            <form method="POST" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                <input type="hidden" name="action" value="add_user">
                <input type="text" name="name" placeholder="Nom complet (ex: Sarah Laurent)" required>
                <input type="email" name="email" placeholder="Email professionnel" required>
                <input type="text" name="password" placeholder="Mot de passe" required>
                <select name="role">
                    <option value="sales">Rôle : Commercial / Sales</option>
                    <option value="admin">Rôle : Administrateur</option>
                    <option value="viewer">Rôle : Observateur / Client</option>
                </select>
                <input type="text" name="company" placeholder="Entreprise (ex: Rayons.net)">
                <button type="submit">Valider et Autoriser l'accès</button>
            </form>
        </div>

        <!-- Tableau des utilisateurs autorisés -->
        <div class="card">
            <h2 style="font-size: 1.1rem; margin-top: 0;">Comptes Autorisés (<?= count($users) ?>)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nom & Email</th>
                        <th>Rôle</th>
                        <th>Entreprise</th>
                        <th>Statut</th>
                        <th>Dernière Connexion</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($users as $u): ?>
                    <tr>
                        <td>
                            <strong><?= htmlspecialchars($u['name']) ?></strong><br>
                            <span style="color: #888; font-family: monospace; font-size: 0.8rem;"><?= htmlspecialchars($u['email']) ?></span>
                        </td>
                        <td><?= strtoupper($u['role']) ?></td>
                        <td><?= htmlspecialchars($u['company']) ?></td>
                        <td>
                            <span class="badge <?= $u['status'] === 'active' ? 'badge-active' : 'badge-suspended' ?>">
                                <?= $u['status'] === 'active' ? 'AUTORISÉ' : 'SUSPENDU' ?>
                            </span>
                        </td>
                        <td style="color: #888; font-size: 0.8rem;"><?= $u['last_login'] ?? 'Jamais' ?></td>
                        <td>
                            <a href="?toggle_id=<?= $u['id'] ?>" style="font-size: 0.75rem; border: 1px solid #333; padding: 4px 8px; border-radius: 3px;">
                                <?= $u['status'] === 'active' ? 'Suspendre' : 'Réactiver' ?>
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</div>
</body>
</html>
