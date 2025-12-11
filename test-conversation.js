const http = require('http');

// Test single message with Mistral model
async function testMistral() {
  console.log(`\n--- Testing single message with mistralai/mistral-7b-instruct ---`);
  
  // Single message
  let messages = [{ role: 'user', content: 'What is the capital of France? Answer in one word.' }];
  
  let data = JSON.stringify({
    messages: messages,
    model: 'mistralai/mistral-7b-instruct',
    stream: false
  });

  let options = {
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
    let response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        });
      });
      req.on('error', (error) => { reject(error); });
      req.write(data);
      req.end();
    });

    console.log('Message status:', response.statusCode);
    if (response.statusCode === 200) {
      let jsonData = JSON.parse(response.data);
      console.log('Response:', JSON.stringify(jsonData.message.content));
    } else {
      console.log('Error:', response.data);
    }
  } catch (error) {
    console.error('Request Error:', error);
  }
}

testMistral().catch(console.error);

// Test conversation with OpenRouter models - with conversation history
async function testConversation() {
  console.log(`\n--- Testing conversation with openrouter/auto ---`);
  
  // First message
  let messages = [{ role: 'user', content: 'What is the capital of France?' }];
  
  let data = JSON.stringify({
    messages: messages,
    model: 'openrouter/auto',
    stream: false
  });

  let options = {
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
    let response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        });
      });
      req.on('error', (error) => { reject(error); });
      req.write(data);
      req.end();
    });

    console.log('First message status:', response.statusCode);
    if (response.statusCode === 200) {
      let jsonData = JSON.parse(response.data);
      console.log('First response:', JSON.stringify(jsonData.message.content));
      
      // Second message - send conversation history but limit to just the last exchange
      messages = [
        { role: 'user', content: 'What is the capital of France?' },
        { role: 'assistant', content: jsonData.message.content },
        { role: 'user', content: 'What about Germany?' }
      ];
      
      data = JSON.stringify({
        messages: messages,
        model: 'openrouter/auto',
        stream: false
      });

      options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let responseData = '';
          res.on('data', (chunk) => { responseData += chunk; });
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              data: responseData
            });
          });
        });
        req.on('error', (error) => { reject(error); });
        req.write(data);
        req.end();
      });

      console.log('Second message status:', response.statusCode);
      console.log('Second message response:', response.data);
      if (response.statusCode === 200) {
        jsonData = JSON.parse(response.data);
        console.log('Second response:', JSON.stringify(jsonData.message.content));
      } else {
        console.log('Second message error:', response.data);
      }
    } else {
      console.log('First message error:', response.data);
    }
  } catch (error) {
    console.error('Request Error:', error);
  }
}

testConversation().catch(console.error);