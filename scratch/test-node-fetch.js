const fetch = require('node-fetch');
async function test() {
  console.log("Testing node-fetch...");
  const start = Date.now();
  try {
    const res = await fetch("https://hxammkcbwqpbeqgixogv.supabase.co/auth/v1/health", {
      method: 'GET'
    });
    console.log("node-fetch OK in", Date.now() - start, "ms. Status:", res.status);
  } catch (e) {
    console.error("node-fetch failed after", Date.now() - start, "ms:", e.message);
  }
}
test();
