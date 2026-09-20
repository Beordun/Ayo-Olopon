const http = require('http');

async function testEndpoint(port = 3000) {
  const payload = JSON.stringify({
    board: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    scores: { south: 0, north: 0 },
    currentTurn: 'north',
    legalMoves: [6, 7, 8, 9, 10, 11],
  });

  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: port,
        path: '/api/ai-move',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 1300,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const latency = Date.now() - startTime;
          try {
            const body = JSON.parse(data);
            const passed =
              latency <= 1200 &&
              typeof body.selected_pit === 'number' &&
              [6, 7, 8, 9, 10, 11].includes(body.selected_pit);

            resolve({ passed, latency, body, status: res.statusCode });
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Endpoint exceeded 1,300ms network timeout'));
    });

    req.write(payload);
    req.end();
  });
}

module.exports = { testEndpoint };
