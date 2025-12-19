const http = require('http');

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
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

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testLogin() {
  console.log('🧪 Testing Admin Login...\n');

  try {
    const result = await makeRequest('POST', '/auth/login', {
      username: 'marciel',
      password: '142514',
    });
    console.log('Status Code:', result.status);
    console.log('Response:', result.data);

    if (result.status === 200) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed!');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin();
