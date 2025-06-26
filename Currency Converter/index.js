class CurrencyConverter {
    constructor() {
        this.rates = {};
        this.lastUpdated = null;
        this.baseCurrency = 'USD';
        this.init();
    }

    async init() {
        await this.loadExchangeRates();
        this.setupEventListeners();
        this.convert();
    }

    async loadExchangeRates() {
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${this.baseCurrency}`);
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }
            const data = await response.json();
            this.rates = data.rates;
            this.lastUpdated = new Date(data.date);
            this.updateLastUpdatedDisplay();
        } catch (error) {
            console.error('Error loading exchange rates:', error);
            // Fallback rates for basic functionality
            this.rates = {
                USD: 1,
                EUR: 0.93,
                GBP: 0.79,
                JPY: 157.5,
                INR: 83.5,
                AUD: 1.5,
                CAD: 1.37,
                CHF: 0.9,
                CNY: 7.25
            };
            this.updateLastUpdatedDisplay();
        }
    }

    setupEventListeners() {
        const fromAmount = document.getElementById('from-amount');
        const fromCurrency = document.getElementById('from-currency');
        const toCurrency = document.getElementById('to-currency');
        const swapBtn = document.getElementById('swap-btn');

        fromAmount.addEventListener('input', () => this.convert());
        fromCurrency.addEventListener('change', () => this.convert());
        toCurrency.addEventListener('change', () => this.convert());
        swapBtn.addEventListener('click', () => this.swapCurrencies());

        fromAmount.addEventListener('blur', () => {
            const value = parseFloat(fromAmount.value);
            if (!isNaN(value)) {
                fromAmount.value = value.toFixed(2);
            }
        });
    }

    convert() {
        const fromAmount = parseFloat(document.getElementById('from-amount').value);
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;

        if (isNaN(fromAmount) || fromAmount < 0) {
            document.getElementById('to-amount').value = '';
            document.getElementById('rate-display').textContent = '';
            return;
        }

        try {
            const fromRate = this.rates[fromCurrency] || 1;
            const toRate = this.rates[toCurrency] || 1;
            const usdAmount = fromAmount / fromRate;
            const convertedAmount = usdAmount * toRate;
            this.displayResult(convertedAmount, fromAmount, fromCurrency, toCurrency);
        } catch (error) {
            console.error('Conversion error:', error);
            document.getElementById('to-amount').value = 'Error';
        }
    }

    displayResult(convertedAmount, originalAmount, fromCurrency, toCurrency) {
        const toAmountInput = document.getElementById('to-amount');
        const rateDisplay = document.getElementById('rate-display');

        toAmountInput.value = convertedAmount.toFixed(2);

        if (originalAmount > 0) {
            const rate = convertedAmount / originalAmount;
            rateDisplay.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
        } else {
            rateDisplay.textContent = '';
        }
    }

    swapCurrencies() {
        const fromCurrency = document.getElementById('from-currency');
        const toCurrency = document.getElementById('to-currency');

        const tempCurrency = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = tempCurrency;

        this.convert();
    }

    updateLastUpdatedDisplay() {
        const lastUpdatedElement = document.getElementById('last-updated');
        if (this.lastUpdated) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            lastUpdatedElement.textContent = `Rates from ${this.lastUpdated.toLocaleDateString('en-US', options)}`;
        } else {
            lastUpdatedElement.textContent = 'Using fallback rates';
        }
    }
}

// Initialization
const converter = new CurrencyConverter();
