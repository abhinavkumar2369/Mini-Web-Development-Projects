document.getElementById('loan-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const interest = parseFloat(document.getElementById('interest').value) / 100 / 12;
    const years = parseFloat(document.getElementById('years').value) * 12;
    
    const x = Math.pow(1 + interest, years);
    const monthly = (amount * x * interest) / (x - 1);
    
    if (isFinite(monthly)) {
        const monthlyPayment = monthly.toFixed(2);
        const totalPayment = (monthly * years).toFixed(2);
        const totalInterest = ((monthly * years) - amount).toFixed(2);
        
        document.getElementById('monthly-payment').textContent = `$${monthlyPayment}`;
        document.getElementById('total-payment').textContent = `$${totalPayment}`;
        document.getElementById('total-interest').textContent = `$${totalInterest}`;
        document.getElementById('result').style.display = 'block';
        
        document.getElementById('result').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('result').style.opacity = '1';
        }, 100);
    } else {
        showError('Please check your numbers');
    }
});


function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.style.color = 'red';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.marginTop = '1rem';
    errorDiv.appendChild(document.createTextNode(message));
    
    const calculator = document.querySelector('.calculator');
    const result = document.getElementById('result');
    
    calculator.insertBefore(errorDiv, result);
    
    setTimeout(() => document.querySelector('.error').remove(), 3000);
}