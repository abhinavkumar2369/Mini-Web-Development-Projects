function updateClock() {
    const now = new Date();
    
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    document.getElementById('ampm').textContent = ampm;
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', options);
    
    const secondDegrees = ((seconds / 60) * 360);
    const minuteDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6);
    const hourDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30);
    
    document.querySelector('.second-hand').style.transform = 
        `translateX(-50%) rotate(${secondDegrees}deg)`;
    document.querySelector('.minute-hand').style.transform = 
        `translateX(-50%) rotate(${minuteDegrees}deg)`;
    document.querySelector('.hour-hand').style.transform = 
        `translateX(-50%) rotate(${hourDegrees}deg)`;
}

updateClock();

setInterval(updateClock, 1000);

setTimeout(() => {
    document.querySelectorAll('.hand').forEach(hand => {
        hand.style.transition = 'all 0.05s cubic-bezier(0.4, 2.08, 0.55, 0.44)';
    });
}, 1000);