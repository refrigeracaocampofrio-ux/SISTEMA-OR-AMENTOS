// Teste direto da requisição
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🧪 Testando login...');
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'marciel', password: '142514' })
    });
    
    const json = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', json);
    
    if (res.ok) {
      console.log('✅ Login funcionando!');
    } else {
      console.log('❌ Erro no login:', json.error);
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

testLogin();
