-- Base de données pour la gestion centralisée des accès SaaS LemFlow
-- À exécuter dans phpMyAdmin sur votre cPanel (rayons.net)

CREATE TABLE IF NOT EXISTS `rayons_crm_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(180) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'sales', 'viewer') NOT NULL DEFAULT 'sales',
  `company` VARCHAR(150) NOT NULL DEFAULT 'Rayons.net',
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Compte Super-Administrateur initial
-- Email : crm@rayons.net
-- Mot de passe par défaut : RayonsAdmin2026! (À modifier dès la première connexion)
INSERT INTO `rayons_crm_users` (`name`, `email`, `password_hash`, `role`, `company`, `status`)
VALUES (
  'Daniel Kiboko',
  'crm@rayons.net',
  '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', -- RayonsAdmin2026!
  'admin',
  'Rayons.net SaaS',
  'active'
)
ON DUPLICATE KEY UPDATE `status` = 'active';

-- Compte Commercial de test pré-autorisé
-- Email : commercial@rayons.net / Mot de passe : Commercial2026!
INSERT INTO `rayons_crm_users` (`name`, `email`, `password_hash`, `role`, `company`, `status`)
VALUES (
  'Équipe Commerciale',
  'commercial@rayons.net',
  '$2y$10$eWkZ6Nqj8jS3aGg/t7aDSe9u2.z8J5h8jP.p6hX9R9E5u9z1Q3mWa', -- Commercial2026!
  'sales',
  'Rayons.net SaaS',
  'active'
)
ON DUPLICATE KEY UPDATE `status` = 'active';
