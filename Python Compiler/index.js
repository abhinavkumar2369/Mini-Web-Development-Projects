// Function to load Skulpt with fallback CDNs
function loadSkulptWithFallback() {
    return new Promise((resolve, reject) => {
        if (typeof Sk !== 'undefined') {
            resolve();
            return;
        }
        
        const cdnUrls = [
            {
                skulpt: 'https://unpkg.com/skulpt@0.11.1/dist/skulpt.min.js',
                stdlib: 'https://unpkg.com/skulpt@0.11.1/dist/skulpt-stdlib.js'
            },
            {
                skulpt: 'https://cdnjs.cloudflare.com/ajax/libs/skulpt/0.11.1/skulpt.min.js',
                stdlib: 'https://cdnjs.cloudflare.com/ajax/libs/skulpt/0.11.1/skulpt-stdlib.js'
            },
            {
                skulpt: 'https://cdn.jsdelivr.net/npm/skulpt@0.11.1/dist/skulpt.min.js',
                stdlib: 'https://cdn.jsdelivr.net/npm/skulpt@0.11.1/dist/skulpt-stdlib.js'
            }
        ];
        
        let currentCdn = 0;
        
        function tryLoadCdn() {
            if (currentCdn >= cdnUrls.length) {
                reject(new Error('All CDN sources failed to load'));
                return;
            }
            
            const { skulpt, stdlib } = cdnUrls[currentCdn];
            
            // Load skulpt main library
            const skulptScript = document.createElement('script');
            skulptScript.src = skulpt;
            skulptScript.onload = () => {
                // Load skulpt stdlib
                const stdlibScript = document.createElement('script');
                stdlibScript.src = stdlib;
                stdlibScript.onload = () => resolve();
                stdlibScript.onerror = () => {
                    currentCdn++;
                    tryLoadCdn();
                };
                document.head.appendChild(stdlibScript);
            };
            skulptScript.onerror = () => {
                currentCdn++;
                tryLoadCdn();
            };
            document.head.appendChild(skulptScript);
        }
        
        tryLoadCdn();
    });
}

// Python Compiler using Skulpt
class PythonCompiler {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setupSkulpt();
        this.updateLineCount();
        this.examples = this.loadExamples();
    }

    initializeElements() {
        this.codeEditor = document.getElementById('codeEditor');
        this.output = document.getElementById('output');
        this.runBtn = document.getElementById('runBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.clearOutputBtn = document.getElementById('clearOutputBtn');
        this.exampleBtn = document.getElementById('exampleBtn');
        this.lineCount = document.getElementById('lineCount');
        this.status = document.getElementById('status');
        this.execTime = document.getElementById('execTime');
        this.modal = document.getElementById('examplesModal');
        this.closeModal = document.querySelector('.close');
        this.exampleCards = document.querySelectorAll('.example-card');
    }

    setupEventListeners() {
        // Run button
        this.runBtn.addEventListener('click', () => this.runCode());
        
        // Clear button
        this.clearBtn.addEventListener('click', () => this.clearCode());
        
        // Clear output button
        this.clearOutputBtn.addEventListener('click', () => this.clearOutput());
        
        // Example button
        this.exampleBtn.addEventListener('click', () => this.showExamples());
        
        // Code editor input
        this.codeEditor.addEventListener('input', () => this.updateLineCount());
        
        // Keyboard shortcuts
        this.codeEditor.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Modal controls
        this.closeModal.addEventListener('click', () => this.hideExamples());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideExamples();
        });
        
        // Example cards
        this.exampleCards.forEach(card => {
            card.addEventListener('click', () => {
                const example = card.getAttribute('data-example');
                this.loadExample(example);
                this.hideExamples();
            });
        });
        
        // Window resize
        window.addEventListener('resize', () => {});
    }

    setupSkulpt() {
        // Configure Skulpt
        Sk.configure({
            output: (text) => this.appendOutput(text),
            read: (filename) => {
                if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
                    throw "File not found: '" + filename + "'";
                }
                return Sk.builtinFiles["files"][filename];
            },
            inputfun: (prompt) => {
                return window.prompt(prompt || "Enter input:");
            },
            inputfunTakesPrompt: true
        });
    }

    updateLineCount() {
        const lines = this.codeEditor.value.split('\n');
        const lineCount = lines.length;
        
        // Update line count display
        this.lineCount.textContent = `Lines: ${lineCount}`;
    }

    handleKeyboard(e) {
        // Ctrl+Enter to run code
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.runCode();
        }
        
        // Tab handling
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.codeEditor.selectionStart;
            const end = this.codeEditor.selectionEnd;
            
            this.codeEditor.value = this.codeEditor.value.substring(0, start) + 
                                   '    ' + 
                                   this.codeEditor.value.substring(end);
            
            this.codeEditor.selectionStart = this.codeEditor.selectionEnd = start + 4;
            this.updateLineCount();
        }
    }

    async runCode() {
        const code = this.codeEditor.value.trim();
        
        if (!code) {
            this.showError('Please enter some Python code to run.');
            return;
        }

        this.setStatus('running', 'Running...');
        this.clearOutput();
        
        const startTime = Date.now();
        
        try {
            // Add loading indicator
            this.runBtn.innerHTML = '<div class="loading"></div> Running...';
            this.runBtn.disabled = true;

            // Run Python code using Skulpt
            const promise = Sk.misceval.asyncToPromise(() => {
                return Sk.importMainWithBody("<stdin>", false, code, true);
            });

            await promise;

            const endTime = Date.now();
            const executionTime = endTime - startTime;
            
            this.setStatus('ready', 'Execution completed');
            this.execTime.textContent = `Executed in ${executionTime}ms`;
            
        } catch (error) {
            console.error('Python execution error:', error);
            let errorMessage = error.toString();
            
            // Clean up error message
            if (errorMessage.includes('Traceback')) {
                const lines = errorMessage.split('\n');
                const relevantLines = lines.filter(line => 
                    line.trim() && 
                    !line.includes('File "<stdin>"') && 
                    !line.includes('Traceback')
                );
                errorMessage = relevantLines.join('\n') || errorMessage;
            }
            
            this.showError(errorMessage);
        } finally {
            // Reset run button
            this.runBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
            this.runBtn.disabled = false;
        }
    }

    appendOutput(text) {
        this.output.textContent += text;
        this.output.scrollTop = this.output.scrollHeight;
    }

    showError(error) {
        console.error('Python execution error:', error);
        
        let errorMessage = error;
        if (typeof error === 'object' && error.toString) {
            errorMessage = error.toString();
        }
        
        this.output.textContent += `Error: ${errorMessage}\n`;
        this.output.classList.add('error');
        this.setStatus('error', 'Execution failed');
        this.execTime.textContent = '';
        
        // Remove error class after a few seconds
        setTimeout(() => {
            this.output.classList.remove('error');
        }, 5000);
    }

    setStatus(type, message) {
        this.status.textContent = message;
        this.status.className = `status-${type}`;
    }

    clearCode() {
        this.codeEditor.value = '';
        this.updateLineCount();
        this.clearOutput();
        this.setStatus('ready', 'Ready');
        this.execTime.textContent = '';
    }

    clearOutput() {
        this.output.textContent = '';
        this.output.classList.remove('error', 'success');
    }

    showExamples() {
        this.modal.style.display = 'block';
    }

    hideExamples() {
        this.modal.style.display = 'none';
    }

    loadExamples() {
        return {
            hello: `# Hello World Example
print("Hello, World!")
print("Welcome to Python Compiler!")

# Variables and strings
name = "Python Developer"
print(f"Nice to meet you, {name}!")

# More examples
print("This is a simple Python compiler running in your browser!")`,

            calculator: `# Simple Calculator
def calculator(num1, operator, num2):
    """Simple calculator function"""
    if operator == '+':
        return num1 + num2
    elif operator == '-':
        return num1 - num2
    elif operator == '*':
        return num1 * num2
    elif operator == '/':
        if num2 != 0:
            return num1 / num2
        else:
            return "Error: Division by zero!"
    else:
        return "Error: Invalid operator!"

# Test the calculator
print("=== Python Calculator ===")
result1 = calculator(10, '+', 5)
print(f"10 + 5 = {result1}")

result2 = calculator(20, '*', 3)
print(f"20 * 3 = {result2}")

result3 = calculator(15, '/', 3)
print(f"15 / 3 = {result3}")

result4 = calculator(10, '/', 0)
print(f"10 / 0 = {result4}")`,

            fibonacci: `# Fibonacci Sequence Generator
def fibonacci(n):
    """Generate first n numbers in Fibonacci sequence"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    sequence = [0, 1]
    for i in range(2, n):
        next_num = sequence[i-1] + sequence[i-2]
        sequence.append(next_num)
    
    return sequence

# Generate first 10 Fibonacci numbers
fib_numbers = fibonacci(10)
print("First 10 Fibonacci numbers:")
print(fib_numbers)

# Print them in a nice format
print("\\nFibonacci sequence:")
for i, num in enumerate(fib_numbers):
    print(f"F({i}) = {num}")`,

            sorting: `# Bubble Sort Algorithm
def bubble_sort(arr):
    """Sort array using bubble sort algorithm"""
    n = len(arr)
    
    # Traverse through all array elements
    for i in range(n):
        # Flag to optimize - if no swapping occurs, array is sorted
        swapped = False
        
        # Last i elements are already in place
        for j in range(0, n - i - 1):
            # Traverse the array from 0 to n-i-1
            # Swap if the element found is greater than the next element
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # If no swapping occurred, array is sorted
        if not swapped:
            break
    
    return arr

# Test the sorting algorithm
numbers = [64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42]
print("Original array:")
print(numbers)

sorted_numbers = bubble_sort(numbers.copy())
print("\\nSorted array:")
print(sorted_numbers)

# Demonstrate with strings
words = ["banana", "apple", "cherry", "date"]
print("\\nOriginal words:")
print(words)

sorted_words = bubble_sort(words.copy())
print("\\nSorted words:")
print(sorted_words)`,

            loops: `# Loops and Conditional Statements
print("=== Loops and Conditions Demo ===\\n")

# 1. For loop with range
print("1. Counting from 1 to 5:")
for i in range(1, 6):
    print(f"Count: {i}")

print()

# 2. While loop
print("2. Countdown using while loop:")
countdown = 5
while countdown > 0:
    print(f"T-minus {countdown}")
    countdown -= 1
print("Blast off! 🚀")

print()

# 3. For loop with list
print("3. Iterating through a list:")
fruits = ["apple", "banana", "cherry", "date"]
for fruit in fruits:
    print(f"I like {fruit}")

print()

# 4. Conditional statements
print("4. Number classification:")
numbers = [15, 8, 23, 4, 42, 7]

for num in numbers:
    if num % 2 == 0:
        parity = "even"
    else:
        parity = "odd"
    
    if num < 10:
        size = "single digit"
    elif num < 100:
        size = "double digit"
    else:
        size = "triple digit or more"
    
    print(f"{num} is {parity} and {size}")

print()

# 5. Nested loops - multiplication table
print("5. Multiplication table (5x5):")
for i in range(1, 6):
    for j in range(1, 6):
        product = i * j
        print(f"{product:3}", end=" ")
    print()  # New line after each row`,

            functions: `# Functions in Python
print("=== Python Functions Demo ===\\n")

# 1. Basic function
def greet(name):
    """Simple greeting function"""
    return f"Hello, {name}!"

print("1. Basic function:")
message = greet("Alice")
print(message)
print()

# 2. Function with multiple parameters
def calculate_area(length, width):
    """Calculate area of a rectangle"""
    area = length * width
    return area

print("2. Function with multiple parameters:")
rect_area = calculate_area(5, 3)
print(f"Area of rectangle (5x3): {rect_area}")
print()

# 3. Function with default parameters
def power(base, exponent=2):
    """Calculate power with default exponent of 2"""
    return base ** exponent

print("3. Function with default parameters:")
print(f"2^3 = {power(2, 3)}")
print(f"5^2 = {power(5)}")  # Uses default exponent
print()

# 4. Function returning multiple values
def get_circle_properties(radius):
    """Calculate circle area and circumference"""
    import math
    area = math.pi * radius ** 2
    circumference = 2 * math.pi * radius
    return area, circumference

print("4. Function returning multiple values:")
area, circumference = get_circle_properties(3)
print(f"Circle with radius 3:")
print(f"Area: {area:.2f}")
print(f"Circumference: {circumference:.2f}")
print()

# 5. Recursive function
def factorial(n):
    """Calculate factorial using recursion"""
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n - 1)

print("5. Recursive function:")
for i in range(6):
    print(f"{i}! = {factorial(i)}")
print()

# 6. Lambda function
print("6. Lambda function:")
square = lambda x: x ** 2
numbers = [1, 2, 3, 4, 5]
squared = list(map(square, numbers))
print(f"Original: {numbers}")
print(f"Squared: {squared}")

# Using lambda with filter
even_numbers = list(filter(lambda x: x % 2 == 0, numbers))
print(f"Even numbers: {even_numbers}")`
        };
    }

    loadExample(exampleName) {
        if (this.examples[exampleName]) {
            this.codeEditor.value = this.examples[exampleName];
            this.updateLineCount();
            this.clearOutput();
            this.setStatus('ready', 'Example loaded');
            this.execTime.textContent = '';
        }
    }
}

// Initialize the Python Compiler when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Try to load Skulpt with fallback CDNs
        await loadSkulptWithFallback();
        
        // Check if Skulpt is loaded
        if (typeof Sk === 'undefined') {
            throw new Error('Skulpt library not loaded properly');
        }
        
        const compiler = new PythonCompiler();
        
        // Set initial status
        compiler.setStatus('ready', 'Ready - Python Compiler Loaded');
        
        console.log('Python Compiler initialized successfully!');
        console.log('Skulpt version:', Sk.version || 'Unknown');
        
    } catch (error) {
        console.error('Failed to initialize Python compiler:', error);
        
        // Show error message in the UI
        const statusElement = document.getElementById('status');
        const outputElement = document.getElementById('output');
        
        if (statusElement) {
            statusElement.textContent = 'Failed to load';
            statusElement.className = 'status-error';
        }
        
        if (outputElement) {
            outputElement.textContent = `Error: Failed to load Python compiler libraries.
            
Possible solutions:
1. Check your internet connection
2. Refresh the page
3. Try using a different browser
4. Disable ad blockers temporarily

Technical details: ${error.message}`;
            outputElement.classList.add('error');
        }
        
        // Disable buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
    }
});
