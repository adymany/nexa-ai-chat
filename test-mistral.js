const http = require('http');

// Test both OpenRouter models
async function testModels() {
  const models = [
    'mistralai/mistral-7b-instruct',
    'openrouter/auto'
  ];

  for (const model of models) {
    console.log(`\n--- Testing ${model} ---`);
    
    const data = JSON.stringify({
      messages: [{ role: 'user', content: 'What is 2+2? Answer with just the number.' }],
      model: model,
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

    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let responseData = '';

          res.on('data', (chunk) => {
            responseData += chunk;
          });

          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: responseData
            });
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.write(data);
        req.end();
      });

      console.log('Status Code:', response.statusCode);
      if (response.statusCode === 200) {
        try {
          const jsonData = JSON.parse(response.data);
          console.log('Content:', JSON.stringify(jsonData.message.content));
          console.log('Usage:', jsonData.usage);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          console.log('Raw response:', response.data);
        }
      } else {
        console.log('Error response:', response.data);
      }
    } catch (error) {
      console.error('Request Error:', error);
    }
  }
}

testModels().catch(console.error);