// routes/conversations.routes.js
const express = require('express');
const router = express.Router();
const conversationsController = require('../controllers/conversations.controller');
const auth = require('../middlewares/auth');

// Toutes les routes nécessitent une authentification
router.use(auth);

// Démarrer une conversation pour une annonce
router.post('/annonce/:annonceId', conversationsController.startConversation);

// Liste des conversations de l'utilisateur
router.get('/', conversationsController.listConversations);

// Obtenir les messages d'une conversation
router.get('/:conversationId/messages', conversationsController.getMessages);

// Envoyer un message dans une conversation
router.post('/:conversationId/messages', conversationsController.sendMessage);

// Modifier le statut d'une conversation (archiver/bloquer)
router.put('/:conversationId/status', conversationsController.updateConversationStatus);

module.exports = router;
