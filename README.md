# 🎯 Assigmé - Plateforme de Petites Annonces

Une plateforme complète de petites annonces développée avec Node.js/Express (backend) et React (frontend).

## 📋 Structure du Projet

```
E:\Projet_Assigame/
├── assigme-backend/           # API REST Node.js/Express
├── assigme-frontend/          # Interface utilisateur React
├── document/                  # Documentation et spécifications
├── tables_assigame.sql       # Structure de base de données
└── Business Requirements.docx # Cahier des charges
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (v16+)
- PostgreSQL (v13+)
- npm ou yarn

### Backend (API)
```bash
cd assigme-backend
npm install
cp .env.example .env  # Configurer les variables
npm start
```
Serveur disponible sur : http://localhost:5001

### Frontend (React)
```bash
cd assigme-frontend  
npm install
npm start
```
Application disponible sur : http://localhost:3000

## 🛠️ Technologies Utilisées

### Backend
- **Framework** : Express.js
- **Base de données** : PostgreSQL
- **Authentification** : JWT + bcryptjs
- **CORS** : Support multi-origines
- **Validation** : Middlewares personnalisés

### Frontend  
- **Framework** : React.js
- **Routage** : React Router
- **HTTP Client** : Axios
- **Styling** : CSS3 + Bootstrap/Material-UI

## 📊 Fonctionnalités

### ✅ Authentification
- [x] Inscription utilisateur
- [x] Connexion/Déconnexion
- [x] JWT Token sécurisé
- [x] Protection des routes

### ✅ Gestion des Annonces
- [x] Création d annonces
- [x] Liste des annonces (publique)
- [x] Détail d une annonce
- [x] Modification/Suppression (propriétaire)
- [x] Filtrage par catégories
- [x] Recherche par ville

### ✅ Catégories
- [x] Liste des catégories
- [x] Sous-catégories
- [x] Filtrage des annonces

## 🗃️ Base de Données

Structure PostgreSQL avec les tables principales :
- `users` : Utilisateurs de la plateforme
- `annonces` : Petites annonces
- `categories` : Catégories principales  
- `sous_categories` : Sous-catégories
- Relations et contraintes définies

## 🔧 Configuration

### Variables d environnement (.env)
```env
PORT=5001
DATABASE_URL=postgresql://user:password@localhost:5432/assigme_db
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## 🌐 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Annonces
- `GET /api/annonces` - Liste publique
- `POST /api/annonces` - Créer (auth requise)
- `GET /api/annonces/:id` - Détail
- `PUT /api/annonces/:id` - Modifier (propriétaire)
- `DELETE /api/annonces/:id` - Supprimer (propriétaire)

### Catégories
- `GET /api/categories` - Liste avec sous-catégories
- `GET /api/categories/list` - Liste simple
- `GET /api/categories/:id/sous-categories` - Sous-catégories

## 📝 Statut du Développement

- ✅ Backend API fonctionnel
- ✅ Authentification sécurisée
- ✅ CRUD complet des annonces
- ✅ Gestion des catégories
- 🔄 Frontend en cours de finalisation
- 🔄 Tests et débogage

## 👥 Équipe

Développement par l équipe Assigmé
- Backend : Node.js/Express/PostgreSQL
- Frontend : React.js
- Base de données : PostgreSQL

## 📞 Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les logs d erreur
3. Vérifier la configuration .env
4. Tester les endpoints avec Postman

---

**Dernière mise à jour** : Août 2025
**Version** : 1.0.0
