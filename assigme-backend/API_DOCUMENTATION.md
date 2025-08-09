# API Documentation - Assigmé Backend

## Base URL
http://localhost:5001/api

## Authentification# API Documentation - Assigmé Backend

## Base URL
http://localhost:5001/api

## Authentification
- POST /api/auth/register
- POST /api/auth/login  
- GET /api/auth/profile (protégé)

## Annonces
- GET /api/annonces
- GET /api/annonces/:id
- POST /api/annonces (protégé)
- PUT /api/annonces/:id (protégé)
- DELETE /api/annonces/:id (protégé)
- GET /api/annonces/mes-annonces (protégé)

## Catégories
- GET /api/categories
- GET /api/categories/list
- GET /api/categories/:id/sous-categories

## Favoris (protégé)
- GET /api/favoris
- POST /api/favoris/:annonceId
- DELETE /api/favoris/:annonceId
- GET /api/favoris/:annonceId/check

## Conversations (protégé)  
- POST /api/conversations/annonce/:annonceId
- GET /api/conversations
- GET /api/conversations/:id/messages
- POST /api/conversations/:id/messages
- PUT /api/conversations/:id/status

## Images (protégé)
- POST /api/annonces/:id/images
- DELETE /api/annonces/:id/images/:imageId
- PUT /api/annonces/:id/images/order

Header pour routes protégées: Authorization: Bearer <token>
- POST /api/auth/register
- POST /api/auth/login  
- GET /api/auth/profile (protégé)

## Annonces
- GET /api/annonces
- GET /api/annonces/:id
- POST /api/annonces (protégé)
- PUT /api/annonces/:id (protégé)
- DELETE /api/annonces/:id (protégé)
- GET /api/annonces/mes-annonces (protégé)

## Catégories
- GET /api/categories
- GET /api/categories/list
- GET /api/categories/:id/sous-categories

## Favoris (protégé)
- GET /api/favoris
- POST /api/favoris/:annonceId
- DELETE /api/favoris/:annonceId
- GET /api/favoris/:annonceId/check

## Conversations (protégé)  
- POST /api/conversations/annonce/:annonceId
- GET /api/conversations
- GET /api/conversations/:id/messages
- POST /api/conversations/:id/messages
- PUT /api/conversations/:id/status

## Images (protégé)
- POST /api/annonces/:id/images
- DELETE /api/annonces/:id/images/:imageId
- PUT /api/annonces/:id/images/order

Header pour routes protégées: Authorization: Bearer <token>