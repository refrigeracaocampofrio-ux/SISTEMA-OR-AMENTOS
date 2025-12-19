const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}

async function test() {
  console.log('🧪 Testing Email Status Endpoint...\n');
  
  try {
    const result = await makeRequest('/email/status');
    console.log('Status Code:', result.status);
    console.log('Response:', result.data);
    console.log('✅ Test passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

test();
