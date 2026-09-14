#!/bin/bash
# ========================================================
# CRM RAYONS - SCRIPT DE DÉPLOIEMENT EN LIGNE (PRODUCTION)
# ========================================================

echo "🚀 Préparation du déploiement de CRM Rayons en ligne..."

# 1. Vérification du build de production
echo "📦 Vérification de la compilation..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Erreur lors de la compilation. Déploiement interrompu."
  exit 1
fi

echo "✅ Compilation réussie !"

# 2. Déploiement sur Vercel
echo "🌐 Envoi en ligne sur Vercel..."
npx vercel --prod

echo "🎉 Déploiement terminé ! Votre application CRM Rayons est en ligne."
