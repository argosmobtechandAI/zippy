import pg from 'pg';

async function test(port) {
  const liveUrl = `postgresql://postgres:argosmob@db.zippyapp.online:${port}/postgres`;
  console.log(`Testing port ${port}...`);
  const client = new pg.Client({ connectionString: liveUrl });
  try {
    await client.connect();
    const res = await client.query("SELECT COUNT(*) FROM users");
    console.log(`✅ Success on port ${port}! Users:`, res.rows[0].count);
  } catch (err) {
    console.error(`❌ Failed on port ${port}:`, err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  await test(5432);
  await test(6543);
  await test(54321); // Some self-host configs use 54321
}

main();
