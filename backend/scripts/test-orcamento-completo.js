require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const http = require('http');

// Dados de teste para criar um novo orçamento
const dados = {
  cliente: {
    nome: "João Silva Teste",
    telefone: "11987654321",
    email: "joao.teste@example.com"
  },
  itens: [],
  mao_obra: 0,
  equipamento: "Freezer",
  defeito: "não liga e está fazendo barulho estranho",
  validade: "7",
  garantia: "90",
  tecnico: "João Técnico",
  observacoes: "Cliente solicitou orçamento urgente",
  valor_total: 2500.00
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/orcamentos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', responseData);
    
    try {
      const result = JSON.parse(responseData);
      if (result.protocolo) {
        console.log('\n✅ Orçamento criado com protocolo:', result.protocolo);
        console.log('📧 Email status:', result.emailEnviado ? 'Enviado' : 'Não enviado');
      }
    } catch (e) {
      console.log('Erro ao parsear resposta:', e.message);
    }
    
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Erro na requisição:', e.message);
  process.exit(1);
});

// Escrever dados na requisição
req.write(JSON.stringify(dados));
req.end();

console.log('📤 Enviando orçamento de teste...');
console.log('Equipamento:', dados.equipamento);
console.log('Defeito:', dados.defeito);
console.log('Valor Total:', dados.valor_total);
