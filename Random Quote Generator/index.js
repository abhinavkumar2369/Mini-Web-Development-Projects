const quotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "Motivation"
    },
    {
        text: "Life is what happens when you're busy making other plans.",
        author: "John Lennon",
        category: "Life"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "Dreams"
    },
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        category: "Success"
    },
    {
        text: "In the end, it's not the years in your life that count. It's the life in your years.",
        author: "Abraham Lincoln",
        category: "Life"
    },
    {
        text: "Be yourself; everyone else is already taken.",
        author: "Oscar Wilde",
        category: "Authenticity"
    },
    {
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs",
        category: "Leadership"
    },
    {
        text: "The only impossible journey is the one you never begin.",
        author: "Tony Robbins",
        category: "Motivation"
    },
    {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt",
        category: "Confidence"
    },
    {
        text: "It does not matter how slowly you go as long as you do not stop.",
        author: "Confucius",
        category: "Perseverance"
    }
];

let currentQuoteIndex = -1;

function getRandomQuote() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * quotes.length);
    } while (newIndex === currentQuoteIndex && quotes.length > 1);
    
    currentQuoteIndex = newIndex;
    return quotes[newIndex];
}

function displayNewQuote() {
    const quoteElement = document.querySelector('.quote');
    const newQuoteBtn = document.getElementById('new-quote');
    
    // Add loading state
    newQuoteBtn.textContent = '⏳ Loading...';
    newQuoteBtn.style.pointerEvents = 'none';
    
    // Fade out current quote
    quoteElement.classList.add('fade-out');
    
    setTimeout(() => {
        const quote = getRandomQuote();
        document.getElementById('quote-text').textContent = quote.text;
        document.getElementById('author').textContent = `- ${quote.author}`;
        
        // Fade in new quote
        quoteElement.classList.remove('fade-out');
        quoteElement.classList.add('fade-in');
        
        // Reset button
        newQuoteBtn.textContent = '✨ New Quote';
        newQuoteBtn.style.pointerEvents = 'auto';
        
        // Remove fade-in class after animation
        setTimeout(() => {
            quoteElement.classList.remove('fade-in');
        }, 300);
    }, 150);
}

function speakQuote() {
    const speakBtn = document.querySelector('.class');
    const quoteText = document.getElementById('quote-text').textContent;
    const authorText = document.getElementById('author').textContent;
    
    // Stop any ongoing speech
    speechSynthesis.cancel();
    
    // Add visual feedback
    speakBtn.classList.add('success');
    setTimeout(() => speakBtn.classList.remove('success'), 300);
    
    const utterance = new SpeechSynthesisUtterance(`${quoteText} by ${authorText}`);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
}

function copyQuote() {
    const copyBtn = document.querySelector('.copy');
    const quoteText = document.getElementById('quote-text').textContent;
    const authorText = document.getElementById('author').textContent;
    const textToCopy = `"${quoteText}" ${authorText}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Visual feedback
        copyBtn.classList.add('success');
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
            copyBtn.classList.remove('success');
        }, 1000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        copyBtn.classList.add('success');
        setTimeout(() => copyBtn.classList.remove('success'), 300);
    });
}

function tweetQuote() {
    const twitterBtn = document.querySelector('.twitter');
    const quoteText = document.getElementById('quote-text').textContent;
    const authorText = document.getElementById('author').textContent;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${quoteText}" ${authorText} #quotes #inspiration`)}`;
    
    // Visual feedback
    twitterBtn.classList.add('success');
    setTimeout(() => twitterBtn.classList.remove('success'), 300);
    
    window.open(twitterUrl, '_blank');
}

// Keyboard shortcuts
function handleKeyPress(event) {
    switch(event.key) {
        case ' ':
        case 'Enter':
            event.preventDefault();
            displayNewQuote();
            break;
        case 'c':
        case 'C':
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                copyQuote();
            }
            break;
        case 's':
        case 'S':
            event.preventDefault();
            speakQuote();
            break;
        case 't':
        case 'T':
            event.preventDefault();
            tweetQuote();
            break;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Event listeners
    document.getElementById('new-quote').addEventListener('click', displayNewQuote);
    document.querySelector('.class').addEventListener('click', speakQuote);
    document.querySelector('.copy').addEventListener('click', copyQuote);
    document.querySelector('.twitter').addEventListener('click', tweetQuote);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
    
    // Load initial quote
    displayNewQuote();
    
    // Auto-refresh quote every 30 seconds (optional)
    // setInterval(displayNewQuote, 30000);
});