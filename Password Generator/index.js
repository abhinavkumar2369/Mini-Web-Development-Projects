document.addEventListener('DOMContentLoaded', function() {
    var passwordLengthInput = document.getElementById('passwordLength');
    var uppercaseCheckbox = document.getElementById('uppercase');
    var numberCheckbox = document.getElementById('number');
    var lowercaseCheckbox = document.getElementById('lowercase');
    var symbolsCheckbox = document.getElementById('symbols');
    var generatePasswordButton = document.getElementById('generatePassword');
    var passwordOutput = document.getElementById('passwordOutput');
    var copyPasswordButton = document.getElementById('copyPassword');
    var savePasswordButton = document.getElementById('savePassword');

    // Function to generate a random password
    function generatePassword() {
        var length = parseInt(passwordLengthInput.value);
        var charset = '';
        var password = '';

        if (uppercaseCheckbox.checked) {
            charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        if (lowercaseCheckbox.checked) {
            charset += 'abcdefghijklmnopqrstuvwxyz';
        }
        if (numberCheckbox.checked) {
            charset += '0123456789';
        }
        if (symbolsCheckbox.checked) {
            charset += '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
        }

        for (var i = 0; i < length; i++) {
            var randomIndex = Math.floor(Math.random() * charset.length);
            password += charset.charAt(randomIndex); // Use charAt instead of array indexing
        }

        return password;
    }

    // Generate Password button
    generatePasswordButton.addEventListener('click', function() {
        var newPassword = generatePassword();
        passwordOutput.value = newPassword;
    });

    // Copy Password button
    copyPasswordButton.addEventListener('click', function() {
        if (!passwordOutput.value) {
            alert('No password generated.');
            return;
        }

        navigator.clipboard.writeText(passwordOutput.value)
            .then(function() {
                alert('Password copied to clipboard');
            })
            .catch(function(error) {
                console.error('Failed to copy password: ', error);
            });
    });

    // Save Password button
    savePasswordButton.addEventListener('click', function() {
        var password = passwordOutput.value;
        if (!password) {
            alert('No password generated.');
            return;
        }
        var blob = new Blob([password], { type: 'text/plain' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'password.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    });
});
