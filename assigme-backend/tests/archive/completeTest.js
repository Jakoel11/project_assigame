const axios = require('axios');
const BASE_URL = 'http://localhost:5001';

// Configuration
const config = {
  auth: {
    email: 'test.conversation@example.com',
    password: 'password123'
  },
  annonce: {
    titre: 'Test annonce conversation',
    description: 'Annonce créée pour tester les conversations',
    prix: 5000,
    categorie_id: 1,
    ville: 'Lomé',
    images: 'https://example.com/image.jpg',
    is_boosted: false
  },
  message: 'Bonjour, je suis intéressé par votre annonce'
};

// Fonction utilitaire pour afficher les résultats
function displayResult(title, data) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(data, null, 2));
  console.log('='.repeat(50));
}

async function runFullTest() {
  try {
    // 1. Inscription utilisateur (si nécessaire)
    console.log('1. INSCRIPTION UTILISATEUR');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        full_name: 'Test Conversation',
        email: config.auth.email,
        password: config.auth.password
      });
      displayResult('Inscription réussie', registerResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 400 && 
          error.response.data.message.includes('existe déjà')) {
        console.log('Utilisateur existe déjà, on continue avec la connexion');
      } else {
        throw error;
      }
    }

    // 2. Connexion pour obtenir le token
    console.log('\n2. CONNEXION');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: config.auth.email,
      password: config.auth.password
    });
    
    displayResult('Connexion réussie', loginResponse.data);
    
    const token = loginResponse.data.token;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Récupérer les annonces
    console.log('\n3. RÉCUPÉRATION DES ANNONCES');
    const annoncesResponse = await axios.get(`${BASE_URL}/api/annonces`);
    
    console.log(`Nombre d'annonces: ${annoncesResponse.data.annonces.length}`);
    if (annoncesResponse.data.annonces.length > 0) {
      console.log(`Première annonce: ID=${annoncesResponse.data.annonces[0].id}, Titre=${annoncesResponse.data.annonces[0].titre}`);
    }

    // 4. Créer une annonce (facultatif)
    console.log('\n4. CRÉATION D\'UNE ANNONCE');
    const createAnnonceResponse = await axios.post(
      `${BASE_URL}/api/annonces`,
      config.annonce,
      authHeader
    );
    
    displayResult('Annonce créée', createAnnonceResponse.data);
    const annonceId = createAnnonceResponse.data.annonce.id;

    // 5. Récupérer les conversations existantes
    console.log('\n5. RÉCUPÉRATION DES CONVERSATIONS');
    const conversationsResponse = await axios.get(
      `${BASE_URL}/api/conversations`,
      authHeader
    );
    
    displayResult('Conversations', conversationsResponse.data);

    // 6. Créer une nouvelle conversation
    console.log('\n6. CRÉATION D\'UNE CONVERSATION');
    const createConvResponse = await axios.post(
      `${BASE_URL}/api/conversations/${annonceId}`,
      { message: config.message },
      authHeader
    );
    
    displayResult('Conversation créée', createConvResponse.data);
    const conversationId = createConvResponse.data.conversationId;

    // 7. Récupérer les messages de la conversation
    console.log('\n7. RÉCUPÉRATION DES MESSAGES');
    const messagesResponse = await axios.get(
      `${BASE_URL}/api/conversations/${conversationId}/messages`,
      authHeader
    );
    
    displayResult('Messages', messagesResponse.data);

    // 8. Envoyer un nouveau message
    console.log('\n8. ENVOI D\'UN NOUVEAU MESSAGE');
    const sendMsgResponse = await axios.post(
      `${BASE_URL}/api/conversations/${conversationId}/messages`,
      { content: 'Message de suivi pour tester' },
      authHeader
    );
    
    displayResult('Message envoyé', sendMsgResponse.data);

    console.log('\n✅ TEST COMPLET RÉUSSI');
    
  } catch (error) {
    console.log('\n❌ ERREUR DANS LE TEST:');
    console.log(`Message: ${error.message}`);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Données:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Exécuter le test complet
runFullTest();
