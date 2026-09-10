async function test() {
  console.log("Testing native fetch...");
  const start = Date.now();
  try {
    const res = await globalThis.fetch("https://hxammkcbwqpbeqgixogv.supabase.co/auth/v1/health", {
      method: 'GET'
    });
    console.log("Native fetch OK in", Date.now() - start, "ms. Status:", res.status);
  } catch (e) {
    console.error("Native fetch failed after", Date.now() - start, "ms:", e.message);
  }
}
test();
