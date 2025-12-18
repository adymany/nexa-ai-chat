// Native fetch is available in Node 18+

async function runTests() {
    const modelId = 'llama-3.1-8b-instant'; // Testing with a fast model

    const results = [];
    const TOTAL_RUNS = 10;
    const ENDPOINT = 'http://localhost:3000/api/chat';

    console.log(`Starting Reliability & Performance Test (${TOTAL_RUNS} runs) with model ${modelId}...`);

    for (let i = 1; i <= TOTAL_RUNS; i++) {
        const startTime = performance.now();
        let success = false;
        let error = null;

        try {
            const response = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: 'Say hello' }],
                    model: modelId,
                    stream: false
                })
            });

            if (response.ok) {
                success = true;
            } else {
                error = `Status: ${response.status}`;
            }
        } catch (e) {
            error = e.message;
        }

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        results.push({ attempt: i, success, duration, error });
        console.log(`Run ${i}: ${success ? 'PASS' : 'FAIL'} (${duration}ms)`);

        // key delay to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(JSON.stringify(results, null, 2));
}

runTests();
