async function check() {
  try {
    const res = await fetch('https://shunnyo.itsupport.com.bd/assets/index-CzMM9I3V.js');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('JS Bundle length:', text.length);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
check();
