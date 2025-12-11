const http = require('http');

// Test the Mistral model after our fixes
async function testMistral() {
  const data = JSON.stringify({
    messages: [{ role: 'user', content: 'What is 2+2? Answer with just the number.' }],
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
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(responseData);
            console.log('Content:', JSON.stringify(jsonData.message.content));
            console.log('Usage:', jsonData.usage);
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            console.log('Raw response:', response.data);
          }
        } else {
          console.log('Error response:', responseData);
        }
        resolve(responseData);
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

testMistral().catch(console.error);