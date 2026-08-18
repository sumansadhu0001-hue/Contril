const https = require('https');

const models = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

const apiKey = 'AIzaSyDC72lXEVy-YnooYhSOiADOLiDFXkll6tg';

async function testModel(m) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      contents: [{ parts: [{ text: 'Hello, respond with 1 word.' }] }]
    });

    const start = Date.now();
    const req = https.request(
      `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => {
          const lat = Date.now() - start;
          try {
            const j = JSON.parse(b);
            const text = j.candidates?.[0]?.content?.parts?.[0]?.text;
            resolve({ model: m, status: res.statusCode, latency: lat, text: text || j.error?.message });
          } catch(e) {
            resolve({ model: m, status: res.statusCode, latency: lat, error: b });
          }
        });
      }
    );
    req.on('error', err => resolve({ model: m, error: err.message }));
    req.write(data);
    req.end();
  });
}

(async () => {
  for (const m of models) {
    const r = await testModel(m);
    console.log(JSON.stringify(r));
  }
})();
