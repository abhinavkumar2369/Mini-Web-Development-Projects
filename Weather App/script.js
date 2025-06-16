const weatherIcons = {
    Clear: "clear.svg", // Clear sky
    Clouds: "cloudy.svg", // Any type of clouds
    Rain: "rainy.svg", // Light to heavy rain
    Drizzle: "drizzle.svg", // Light rain/drizzle
    Thunderstorm: "thunderstorm.svg", // Any thunderstorm
    Snow: "snow.svg", // Any snowfall
    Atmosphere: "mist.svg", // Mist, haze, dust, etc
    Fog:"mist.svg",
    Mist:"mist.svg"
};

const weatherBackgrounds = {
    '01d': 'clear-day',
    '01n': 'clear-night',

    '02d': 'partly-cloudy-day',
    '02n': 'partly-cloudy-night',

    '03d': 'cloudy',
    '03n': 'cloudy',
    '04d': 'cloudy',
    '04n': 'cloudy',
    
    '09d': 'rain',
    '09n': 'rain',
    '10d': 'rain',
    '10n': 'rain',
    
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',

    '13d': 'snow',
    '13n': 'snow',
    
    '50d': 'mist',
    '50n': 'mist'
};



const apiKey = '<------- API KEY ------->';
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const dateTimeElement = document.getElementById('date-time');


function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    dateTimeElement.textContent = now.toLocaleString('en-US', options).replace(',', '');
}


function setWeatherBackground(iconCode) {
    const container = document.querySelector('body');
    container.className = '';
    const backgroundClass = weatherBackgrounds[iconCode] || 'default';
    container.classList.add(backgroundClass);
}


async function getWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
                
        if (!response.ok) {
            throw new Error('City not found');
        }
                
        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        alert(error.message);
    }
}


function updateWeatherUI(data) {
    document.getElementById('city').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;

    const iconCode = data.weather[0].main;
    const iconName = weatherIcons[iconCode] || 'cloudy.svg';
    document.getElementById('weather-icon').src = `Images/${iconName}`;
    document.getElementById('weather-icon').alt = data.weather[0].description;

    setWeatherBackground(iconCode);
}


searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});


cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
            if (city) {
                getWeatherData(city);
            }
        }
});


updateDateTime();
setInterval(updateDateTime, 1000);