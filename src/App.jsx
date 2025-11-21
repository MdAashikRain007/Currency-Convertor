import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'

function App() {
  const [amount, setAmount] = useState('1')
  const [rates, setRates] = useState({})
  const [selectedCurrency, setSelectedCurrency] = useState('')
  const [convertedAmount, setConvertedAmount] = useState(null)
  const [lastUpdated, setLastUpdated] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inputError, setInputError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function fetchRates() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(API_URL, { signal: controller.signal })

        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates')
        }

        const data = await response.json()
        const fetchedRates = data?.usd ?? {}
        const [firstCurrency] = Object.keys(fetchedRates)

        setRates(fetchedRates)
        setLastUpdated(data?.date ?? '')
        setSelectedCurrency((prev) => prev || firstCurrency || '')
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          return
        }
        setError('Unable to load exchange rates. Please try again shortly.')
      } finally {
        setLoading(false)
      }
    }

    fetchRates()

    return () => controller.abort()
  }, [])

  const currencyOptions = useMemo(
    () => Object.keys(rates).sort((a, b) => a.localeCompare(b)),
    [rates],
  )

  const formattedDate = useMemo(() => {
    if (!lastUpdated) return ''
    const date = new Date(lastUpdated)

    if (Number.isNaN(date.getTime())) {
      return lastUpdated
    }

    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }, [lastUpdated])

  const handleConvert = (event) => {
    event.preventDefault()

    if (!selectedCurrency) {
      return
    }

    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setConvertedAmount(null)
      setInputError('Enter an amount greater than 0.')
      return
    }

    setInputError('')
    const rate = rates[selectedCurrency]

    if (!rate) {
      setConvertedAmount(null)
      return
    }

    setConvertedAmount(numericAmount * rate)
  }

  const formatNumber = (value) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value)

  return (
    <main className="app">
      <section className="converter-card">
        <header className="converter-header">
          <p className="pill">Live FX Rates</p>
          <h1>USD Currency Converter</h1>
          <p className="subheading">
            Convert US Dollars into over a hundred global currencies using live
            rates from the open-source Currency API.
          </p>
        </header>

        <form className="converter-form" onSubmit={handleConvert}>
          <label htmlFor="amount">Amount in USD</label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={loading}
          />

          <label htmlFor="currency">Convert to</label>
          <select
            id="currency"
            value={selectedCurrency}
            onChange={(event) => setSelectedCurrency(event.target.value)}
            disabled={loading || currencyOptions.length === 0}
          >
            {currencyOptions.map((code) => (
              <option key={code} value={code}>
                {code.toUpperCase()}
              </option>
            ))}
          </select>

          {inputError && <p className="input-error">{inputError}</p>}

          <button type="submit" disabled={loading || !selectedCurrency}>
            {loading ? 'Loading rates...' : 'Convert'}
          </button>
        </form>

        {error && <p className="status-message error">{error}</p>}
        {!error && loading && (
          <p className="status-message">Fetching the latest exchange rates…</p>
        )}

        {convertedAmount !== null && !error && (
          <div className="result-card">
            <p className="label">Converted amount</p>
            <p className="value">
              {formatNumber(convertedAmount)} {selectedCurrency.toUpperCase()}
            </p>
            {selectedCurrency && rates[selectedCurrency] && (
              <p className="rate">
                1 USD = {formatNumber(rates[selectedCurrency])}{' '}
                {selectedCurrency.toUpperCase()}
              </p>
            )}
            {formattedDate && (
              <p className="updated">Rates updated on {formattedDate}</p>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
