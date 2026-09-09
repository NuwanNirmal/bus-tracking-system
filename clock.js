// Function to update the clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    
    // Update all clock elements on the page
    const clockElements = document.querySelectorAll('.real-time-clock');
    clockElements.forEach(element => {
        element.innerHTML = `
            <div class="clock-time">${timeString}</div>
            <div class="clock-date">${dateString}</div>
        `;
    });
}

// Initialize clock and update every second
function initClock() {
    // Create clock container if it doesn't exist
    if (!document.querySelector('.real-time-clock')) {
        const clockContainer = document.createElement('div');
        clockContainer.className = 'real-time-clock';
        document.body.appendChild(clockContainer);
    }
    
    // Update immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
}

// Start the clock when the DOM is loaded
document.addEventListener('DOMContentLoaded', initClock); 