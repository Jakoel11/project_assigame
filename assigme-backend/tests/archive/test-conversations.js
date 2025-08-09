import fetch from 'node-fetch';
import FormData from 'form-data';

async function runTests() {
    try {
        // 1. Test Login
        console.log('🔵 Test 1: Login');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@test.com',
                password: 'password123'
            })
        });
        const loginData = await loginResponse.json();
        console.log('Login Response:', loginData);
        
        const token = loginData.token;

        // 2. Test Création Conversation
        console.log('\n🔵 Test 2: Création Conversation');
        const convResponse = await fetch('http://localhost:5000/api/conversations/annonce/1', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const convData = await convResponse.json();
        console.log('Conversation Response:', convData);

        // 3. Test Envoi Message Vocal
        console.log('\n🔵 Test 3: Envoi Message Vocal');
        const formData = new FormData();
        formData.append('voice', new Blob(['test audio content'], { type: 'audio/wav' }), 'test-voice.wav');
        
        const voiceResponse = await fetch('http://localhost:5000/api/conversations/1/voice', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const voiceData = await voiceResponse.json();
        console.log('Voice Message Response:', voiceData);

        // 4. Test Liste des Messages
        console.log('\n🔵 Test 4: Liste des Messages');
        const messagesResponse = await fetch('http://localhost:5000/api/conversations/1/messages', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const messagesData = await messagesResponse.json();
        console.log('Messages Response:', messagesData);

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    }
}

runTests();
