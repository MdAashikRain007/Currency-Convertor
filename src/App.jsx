import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";

function App() {
  const [amount, setAmount] = useState("1");
  const [rates, setRates] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRates() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const currencyRates = data.usd;
        setRates(currencyRates);

        const first = Object.keys(currencyRates)[142];
        setSelectedCurrency(first);

        setLoading(false);
      } catch {
        setError("Failed to load currency rates");
        setLoading(false);
      }
    }

    loadRates();
  }, []);

  function convertCurrency(e) {
    e.preventDefault();

    if (!amount || amount <= 0) {
      setConvertedAmount(null);
      return;
    }

    const rate = rates[selectedCurrency];
    setConvertedAmount(amount * rate);
  }

  return (
    <main className="app">
      <section className="converter-card">
        <header className="converter-header">
          <p className="pill">Live FX Rates</p>
          <h1>USD Currency Converter</h1>
          <p className="subheading">
            Convert US Dollars using live exchange rates from an open API.
          </p>
        </header>

        {loading && <p className="status-message">Fetching latest rates…</p>}
        {error && <p className="status-message error">{error}</p>}

        {!loading && !error && (
          <>
            <form className="converter-form" onSubmit={convertCurrency}>
              <label>Amount in USD</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
              />

              <label>Convert To</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                {Object.keys(rates).map((code) => (
                  <option key={code} value={code}>
                    {code.toUpperCase()}
                  </option>
                ))}
              </select>

              <button type="submit">Convert</button>
            </form>

            {convertedAmount !== null && (
              <div className="result-card">
                <p className="label">Converted amount</p>
                <p className="value">
                  {convertedAmount.toFixed(2)} {selectedCurrency.toUpperCase()}
                </p>

                <p className="rate">
                  1 USD = {rates[selectedCurrency].toFixed(4)}{" "}
                  {selectedCurrency.toUpperCase()}
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default App;
