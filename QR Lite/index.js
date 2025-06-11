let qrcode = null;

        function generateQRCode() {
            const text = document.getElementById('text-input').value.trim();
            
            if (!text) {
                alert('Please enter a URL or text');
                return;
            }
            
            const qrContainer = document.getElementById('qrcode');
            qrContainer.innerHTML = '';
            
            // ------- Generate QR code -------
            qrcode = new QRCode(qrContainer, {
                text: text,
                width: 256,
                height: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
            
            document.getElementById('download-btn').style.display = 'block';
        }
        
        function clearQRCode() {
            document.getElementById('text-input').value = '';
            document.getElementById('qrcode').innerHTML = '';
            document.getElementById('download-btn').style.display = 'none';
            qrcode = null;
        }
        
        function downloadQRCode() {
            const canvas = document.querySelector('#qrcode canvas');
            if (!canvas) return;
            
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
        
        // Generate QR code
        document.getElementById('text-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                generateQRCode();
            }
        });