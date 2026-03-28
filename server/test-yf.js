const yf = require('yahoo-finance2').default;
try {
  console.log(typeof yf);
  console.log(Object.keys(yf));
  yf.quote('AAPL').then(console.log).catch(e => console.error("QUOTE ERROR:", e.message));
} catch (e) {
  console.error("CATCH ERROR:", e.message);
}
