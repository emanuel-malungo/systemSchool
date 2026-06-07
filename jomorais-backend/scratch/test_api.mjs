

async function test() {
  try {
    const res = await fetch('http://localhost:8000/health');
    const data = await res.json();
    console.log('API Status:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('API is not responding:', error.message);
  }
}

test();
