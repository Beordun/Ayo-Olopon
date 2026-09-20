# AI Grandmaster Latency Benchmark & Proverb Matrix

## 1. Automated Latency Benchmark Script (`benchmarking.js`)

Save or execute this Node.js script to verify endpoint conformance:

```javascript
// references/benchmarking.js
const http = require('http');

async function testEndpoint(port = 3000) {
  const payload = JSON.stringify({
    board: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    scores: { south: 0, north: 0 },
    currentTurn: 'north',
    legalMoves: [6, 7, 8, 9, 10, 11]
  });

  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/api/ai-move',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 1300
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const latency = Date.now() - startTime;
        try {
          const body = JSON.parse(data);
          const passed = latency <= 1200 && 
            typeof body.selected_pit === 'number' &&
            [6,7,8,9,10,11].includes(body.selected_pit);
          
          resolve({ passed, latency, body, status: res.statusCode });
        } catch (e) {
          reject(e);
        }
      });
    });

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
```

---

## 2. Curated Authentic Yoruba Proverbs & Tactical Context

When Gemini generates dialogue or when fallback triggers, align proverbs to match the state context:

| Context | Yoruba Proverb (*Òwe Ayò*) | English Translation | Strategic Implication |
| :--- | :--- | :--- | :--- |
| **Aggressive Capture (Multi-pit)** | *Ẹni tí ó gbọ́n ní ń jẹ ọ̀pọ̀.* | "He who is wise reaps the abundant harvest." | Mocking the opponent for leaving open hollows. |
| **Defusing Opponent Trap** | *Ojú ló ń tà'yò, kò sí ogun níbẹ̀.* | "The eyes and mind play Ayò; it is not a war of muscle." | Praising foresight and defusing an opponent trap. |
| **Opponent Low Seeds** | *Bí a bá ń tà'yò, a kì í bínú; ogbọ́n la fi ń jẹ ọmọ ayò.* | "When playing Ayò, one must not rage; wisdom wins seeds." | Calming an opponent on the verge of starvation. |
| **General Tactical Taunt** | *Ọmọdé kò mọ ayò tà, ó ń kígbe pé ayò dọ́gba.* | "A novice who cannot play Ayò cries that the game is a draw." | Challenging the player to think two steps ahead. |
| **Endgame Close Match** | *Ayò kì í ṣe eré agbára, eré ìmọ̀ ni.* | "Ayò is not a trial of force, but a contest of intellect." | Respectful Grandmaster acknowledgement of tension. |
