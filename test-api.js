const http = require('http');

// Test the API
async function testAPI() {
  const data = JSON.stringify({
    messages: [{ role: 'user', content: 'Explain what OpenRouter is in 2-3 sentences.' }],
    model: 'mistralai/mistral-7b-instruct',
    stream: false
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', responseData);
        resolve(responseData);
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

testAPI().catch(console.error);