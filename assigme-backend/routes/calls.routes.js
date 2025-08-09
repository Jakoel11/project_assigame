const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
    initiateCall,
    handleCallResponse,
    endCall
} = require('../controllers/calls.controller');

// Protection de toutes les routes d'appels avec l'authentification
router.use(auth);

// Initier un appel
router.post('/', initiateCall);

// Répondre à un appel (accepter/rejeter)
router.put('/:call_id/response', handleCallResponse);

// Terminer un appel
router.put('/:call_id/end', endCall);

module.exports = router;
