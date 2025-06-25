const expressionElement = document.getElementById('expression');
const outputElement = document.getElementById('output');
const buttons = document.querySelectorAll('.btn');

let currentExpression = '';
let currentResult = '0';
let lastOperation = false;

function updateDisplay() {
    expressionElement.innerText = currentExpression;
    outputElement.innerText = currentResult;
}

function evaluateExpression(expr) {
    try {
        expr = expr.replace(/×/g, '*');
        return new Function('return ' + expr)();
    } catch (error) {
        return 'Error';
    }
}

function buttonClick(event) {
    const button = event.target;
    const buttonId = button.id;
    const buttonValue = button.innerText;
    
    if (lastOperation && !['b-c', 'b-ce', 'b-equal', 'b-add', 'b-', 'b-mul', 'b-div', 'b-per'].includes(buttonId)) {
        currentExpression = '';
        currentResult = '0';
        lastOperation = false;
    }
    
    switch(buttonId) {
        case 'b-equal':
            if (currentExpression) {
                currentResult = evaluateExpression(currentExpression);
                if (!isNaN(currentResult) && isFinite(currentResult)) {
                    if (currentResult % 1 !== 0) {
                        currentResult = parseFloat(currentResult.toFixed(8));
                    }
                }
                lastOperation = true;
            }
            break;
        
        case 'b-c':
            currentExpression = '';
            currentResult = '0';
            lastOperation = false;
            break;
        
        case 'b-ce':
            currentExpression = currentExpression.slice(0, -1);
            if (currentExpression) {
                currentResult = evaluateExpression(currentExpression);
            } else {
                currentResult = '0';
            }
            break;
        
        case 'b-per':
            if (currentExpression) {
                try {
                    const currentValue = evaluateExpression(currentExpression);
                    currentResult = currentValue / 100;
                    currentExpression = currentResult.toString();
                } catch (e) {
                    currentResult = 'Error';
                }
            }
            break;
        
        case 'b-mul':
            currentExpression += '×';
            break;
        
        case 'b-div':
            currentExpression += '/';
            break;
        
        case 'b-':
            currentExpression += '-';
            break;
        
        case 'b-add':
            currentExpression += '+';
            break;
        
        case 'b-dot':
            const parts = currentExpression.split(/[+\-×/]/);
            const lastPart = parts[parts.length - 1];
            
            if (!lastPart.includes('.')) {
                currentExpression += '.';
            }
            break;
        
        default:
            if (buttonId.match(/b-[0-9]/)) {
                if (currentExpression === '0' && buttonValue !== '0') {
                    currentExpression = buttonValue;
                } else {
                    currentExpression += buttonValue;
                }
                
                try {
                    currentResult = evaluateExpression(currentExpression);
                } catch (e) {
                }
            }
            break;
    }
    
    updateDisplay();
}

buttons.forEach(button => {
    if (button.id && button.id !== 'b-u') {
        button.addEventListener('click', buttonClick);
    }
});

updateDisplay();
