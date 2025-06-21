let qrcode = null;

function generateQRCode() {
    const textInput = document.getElementById('text-input');
    const text = textInput.value.trim();
    const generateBtn = document.querySelector('.generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const errorMessage = document.getElementById('error-message');
    
    // Reset error state
    textInput.classList.remove('error');
    errorMessage.style.display = 'none';
    
    if (!text) {
        textInput.classList.add('error');
        errorMessage.style.display = 'block';
        textInput.focus();
        return;
    }
    
    // Show loading state
    btnText.innerHTML = '<span class="loading"></span>Generating...';
    generateBtn.disabled = true;
    
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    // Simulate loading delay for better UX
    setTimeout(() => {
        try {
            // Generate QR code
            qrcode = new QRCode(qrContainer, {
                text: text,
                width: 256,
                height: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
            
            // Success animation
            qrContainer.classList.add('success-animation');
            setTimeout(() => qrContainer.classList.remove('success-animation'), 300);
            
            document.getElementById('download-btn').style.display = 'block';
        } catch (error) {
            console.error('Error generating QR code:', error);
            textInput.classList.add('error');
            errorMessage.textContent = 'Error generating QR code. Please try again.';
            errorMessage.style.display = 'block';
        } finally {
            // Reset button state
            btnText.textContent = 'Generate QR Code';
            generateBtn.disabled = false;
        }
    }, 500);
}

function clearQRCode() {
    const textInput = document.getElementById('text-input');
    const errorMessage = document.getElementById('error-message');
    
    textInput.value = '';
    textInput.classList.remove('error');
    errorMessage.style.display = 'none';
    document.getElementById('qrcode').innerHTML = '';
    document.getElementById('download-btn').style.display = 'none';
    qrcode = null;
    textInput.focus();
}

function downloadQRCode() {
    const canvas = document.querySelector('#qrcode canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `qrcode-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Enhanced event listeners
document.getElementById('text-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generateQRCode();
    }
});

document.getElementById('text-input').addEventListener('input', function() {
    const errorMessage = document.getElementById('error-message');
    this.classList.remove('error');
    errorMessage.style.display = 'none';
});

// Auto-focus input on page load
window.addEventListener('load', function() {
    document.getElementById('text-input').focus();
});