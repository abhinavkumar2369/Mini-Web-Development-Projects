const passwordEl = document.getElementById('password');
const lengthEl = document.getElementById('length');
const lengthValueEl = document.getElementById('length-value');
const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');
const strengthBars = document.querySelectorAll('.bar');

const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

lengthEl.addEventListener('input', () => {
    lengthValueEl.textContent = lengthEl.value;
});

generateBtn.addEventListener('click', generatePassword);
document.addEventListener('DOMContentLoaded', generatePassword);

copyBtn.addEventListener('click', () => {
    const password = passwordEl.value;
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
        showToast();
    });
});

function generatePassword() {
    const length = +lengthEl.value;
    const hasUppercase = uppercaseEl.checked;
    const hasLowercase = lowercaseEl.checked;
    const hasNumbers = numbersEl.checked;
    const hasSymbols = symbolsEl.checked;
    if (!hasUppercase && !hasLowercase && !hasNumbers && !hasSymbols) {
        lowercaseEl.checked = true;
        return generatePassword();
    }
    passwordEl.value = createPassword(
        length,
        hasLowercase,
        hasUppercase,
        hasNumbers,
        hasSymbols
    );
    updateStrengthMeter();
}

function createPassword(length, lower, upper, number, symbol) {
    let generatedPassword = '';
    const typesCount = lower + upper + number + symbol;
    const typesArr = [{ lower }, { upper }, { number }, { symbol }].filter(item => Object.values(item)[0]);
    if (typesCount === 0) return '';
    for (let i = 0; i < length; i++) {
        const randomTypeIndex = Math.floor(Math.random() * typesArr.length);
        const currentType = Object.keys(typesArr[randomTypeIndex])[0];
        if (currentType === 'lower') {
            generatedPassword += getRandomChar(lowercaseChars);
        } else if (currentType === 'upper') {
            generatedPassword += getRandomChar(uppercaseChars);
        } else if (currentType === 'number') {
            generatedPassword += getRandomChar(numberChars);
        } else if (currentType === 'symbol') {
            generatedPassword += getRandomChar(symbolChars);
        }
    }
    return shufflePassword(generatedPassword);
}

function getRandomChar(charSet) {
    return charSet[Math.floor(Math.random() * charSet.length)];
}

function shufflePassword(password) {
    const array = password.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

function updateStrengthMeter() {
    const password = passwordEl.value;
    const length = password.length;
    strengthBars.forEach(bar => {
        bar.className = 'bar';
    });
    let strength = 0;
    if (length >= 8) strength++;
    if (length >= 12) strength++;
    if (length >= 16) strength++;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/.test(password);
    const variety = hasLower + hasUpper + hasNumber + hasSymbol;
    if (variety >= 3) strength++;
    for (let i = 0; i < strength; i++) {
        if (strength === 1) {
            strengthBars[i].classList.add('weak');
        } else if (strength === 2) {
            strengthBars[i].classList.add('medium');
        } else if (strength === 3) {
            strengthBars[i].classList.add('strong');
        } else if (strength === 4) {
            strengthBars[i].classList.add('very-strong');
        }
    }
}

function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}