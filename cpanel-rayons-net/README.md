# Guide d'Installation de l'Administration Centrale sur votre cPanel (rayons.net)

Ce dossier contient les fichiers nécessaires pour centraliser la gestion des accès et des utilisateurs de votre SaaS **LemFlow** sur votre propre hébergement cPanel Hostinger.

---

## 📁 Contenu du dossier :
1. **`database.sql`** : Script de création de la table MySQL des utilisateurs autorisés.
2. **`crm-auth.php`** : API passerelle d'authentification sécurisée (appelée par `crm.rayons.net`).
3. **`admin.php`** : Interface Web d'administration réservée à Daniel Kiboko pour créer et suspendre des comptes en 1 clic.

---

## 🚀 Installation en 3 Étapes sur Hostinger cPanel :

### Étape 1 : Créer la Base de Données MySQL
1. Sur **hPanel Hostinger**, allez dans **Bases de données** > **Gestion des bases de données MySQL**.
2. Créez une nouvelle base de données (ex: `rayons_crm`).
3. Notez le **Nom de la BDD**, le **Nom d'utilisateur** et le **Mot de passe**.
4. Ouvrez **phpMyAdmin**, cliquez sur votre base `rayons_crm`, allez dans l'onglet **Importer**, et sélectionnez le fichier [`database.sql`](database.sql).
5. Cliquez sur **Exécuter**. La table `rayons_crm_users` est créée avec le compte Super-Admin `crm@rayons.net`.

### Étape 2 : Déposer les fichiers PHP
1. Dans le **Gestionnaire de Fichiers** Hostinger de votre site `rayons.net`, ouvrez le dossier :
   ```
   public_html/api/
   ```
   *(Créez le sous-dossier `api` s'il n'existe pas).*
2. Téléversez-y les deux fichiers :
   - `crm-auth.php`
   - `admin.php`
3. Ouvrez `crm-auth.php` et `admin.php` avec l'éditeur de texte Hostinger pour renseigner vos identifiants MySQL (lignes 21-24).

### Étape 3 : Gérer vos utilisateurs
- Pour gérer, ajouter ou suspendre des utilisateurs SaaS, ouvrez simplement dans votre navigateur :
  👉 **`https://rayons.net/api/admin.php`**
- Mot de passe Maître par défaut : **`RayonsAdmin2026!`**
