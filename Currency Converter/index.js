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
            this.showLoading(true);
            // Using a free API service for exchange rates
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${this.baseCurrency}`);
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }
            const data = await response.json();
            this.rates = data.rates;
            this.lastUpdated = new Date(data.date);
            this.updateLastUpdatedDisplay();
            this.hideError();
        } catch (error) {
            console.error('Error loading exchange rates:', error);
            this.showError('Unable to load current exchange rates. Using approximate rates.');
            // Fallback rates for basic functionality
            this.rates = {
                USD: 1,
                EUR: 0.85,
                GBP: 0.73,
                JPY: 110,
                CAD: 1.25,
                AUD: 1.35,
                CHF: 0.92,
                CNY: 6.45,
                INR: 74.5,
                BRL: 5.2,
                RUB: 73.5,
                KRW: 1180,
                SGD: 1.35,
                HKD: 7.8,
                MXN: 20.1
            };
        } finally {
            this.showLoading(false);
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

        // Format number input
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
            this.clearResult();
            return;
        }

        try {
            // Convert from base currency to target currency
            const fromRate = this.rates[fromCurrency] || 1;
            const toRate = this.rates[toCurrency] || 1;
            // Convert to USD first, then to target currency
            const usdAmount = fromAmount / fromRate;
            const convertedAmount = usdAmount * toRate;
            this.displayResult(convertedAmount, fromAmount, fromCurrency, toCurrency);
        } catch (error) {
            console.error('Conversion error:', error);
            this.showError('Error performing conversion');
        }
    }

    displayResult(convertedAmount, originalAmount, fromCurrency, toCurrency) {
        const resultSection = document.getElementById('result-section');
        const resultAmount = document.getElementById('result-amount');
        const toAmountInput = document.getElementById('to-amount');
        const rateDisplay = document.getElementById('rate-display');

        // Format the converted amount
        const formatted = this.formatCurrency(convertedAmount, toCurrency);
        resultAmount.textContent = formatted;
        toAmountInput.value = convertedAmount.toFixed(2);

        // Calculate and display exchange rate
        const rate = convertedAmount / originalAmount;
        const rateText = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
        rateDisplay.textContent = rateText;

        resultSection.style.display = 'block';
    }

    formatCurrency(amount, currency) {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            return `${amount.toFixed(2)} ${currency}`;
        }
    }

    swapCurrencies() {
        const fromCurrency = document.getElementById('from-currency');
        const toCurrency = document.getElementById('to-currency');
        const fromAmount = document.getElementById('from-amount');
        const toAmount = document.getElementById('to-amount');

        // Swap currency selections
        const tempCurrency = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = tempCurrency;

        if (toAmount.value && !isNaN(parseFloat(toAmount.value))) {
            fromAmount.value = toAmount.value;
        }

        this.convert();
    }

    clearResult() {
        document.getElementById('result-section').style.display = 'none';
        document.getElementById('to-amount').value = '';
    }

    showLoading(show) {
        const indicator = document.getElementById('loading-indicator');
        indicator.style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    hideError() {
        document.getElementById('error-message').style.display = 'none';
    }

    updateLastUpdatedDisplay() {
        const lastUpdatedElement = document.getElementById('last-updated');
        if (this.lastUpdated) {
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            const dateString = this.lastUpdated.toLocaleDateString('en-US', options);
            lastUpdatedElement.textContent = `Last updated: ${dateString}`;
        }
    }
}

function quickConvert(from, to) {
    document.getElementById('from-currency').value = from;
    document.getElementById('to-currency').value = to;
    document.getElementById('from-amount').value = '1';
    converter.convert();
}

// Initialization
const converter = new CurrencyConverter();

window.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.converter-container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    setTimeout(() => {
        container.style.transition = 'all 0.6s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
});
