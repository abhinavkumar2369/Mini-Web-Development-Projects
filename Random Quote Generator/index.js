const quotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
    },
    {
        text: "Life is what happens when you're busy making other plans.",
        author: "John Lennon"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
    },
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
    },
    {
        text: "In the end, it's not the years in your life that count. It's the life in your years.",
        author: "Abraham Lincoln"
    }
];

function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function displayNewQuote() {
    const quote = getRandomQuote();
    document.getElementById('quote-text').textContent = quote.text;
    document.getElementById('author').textContent = `- ${quote.author}`;
}

function speakQuote() {
    const quoteText = document.getElementById('quote-text').textContent;
    const authorText = document.getElementById('author').textContent;
    const utterance = new SpeechSynthesisUtterance(`${quoteText} by ${authorText}`);
    speechSynthesis.speak(utterance);
}

function copyQuote() {
    const quoteText = document.getElementById('quote-text').textContent;
    const authorText = document.getElementById('author').textContent;
    const textToCopy = `${quoteText} ${authorText}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Quote copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function tweetQuote() {
    const quoteText = document.getElementById('quote-text').textContent;
    const authorText = document.getElementById('author').textContent;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${quoteText}" ${authorText}`)}`;
    window.open(twitterUrl, '_blank');
}

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('new-quote').addEventListener('click', displayNewQuote);

    document.querySelector('.class').addEventListener('click', speakQuote);

    document.querySelector('.copy').addEventListener('click', copyQuote);

    document.querySelector('.twitter').addEventListener('click', tweetQuote);

    displayNewQuote();
});