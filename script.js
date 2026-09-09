// Initialize all systems
document.addEventListener('DOMContentLoaded', () => {
    // Handle role selection
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const role = document.getElementById('role').value;
        
        if (role === 'driver') {
            window.location.href = 'driver.html';
        } else if (role === 'passenger') {
            window.location.href = 'passenger.html';
        } else {
            alert('Please select a role.');
        }
    });

    // Initialize the map if present
    if (document.getElementById('map')) {
        const map = L.map('map').setView([7.2906, 80.6337], 13); // Centered on Kandy
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
});

// Initialize route visualizer when map is present
if (document.getElementById('map')) {
    const routeVisualizer = new RouteVisualizer('map');
    routeVisualizer.addRoute('KD001', sampleRoute);
}

// Initialize notification system
const updateNotificationBadge = () => {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        const count = notificationSystem.getUnreadCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
};

// Initialize feedback system
const initializeFeedback = (busId, routeId) => {
    const container = document.getElementById('feedbackContainer');
    if (container) {
        feedbackSystem.createFeedbackUI('feedbackContainer', busId, routeId);
    }
};

// Initialize fare calculator
const initializeFareCalculator = (route) => {
    const container = document.getElementById('fareCalculatorContainer');
    if (container) {
        fareCalculator.createFareDisplayUI('fareCalculatorContainer', route);
    }
};

// Calculate fare for selected route
function calculateFareForRoute() {
    const fromStopId = document.getElementById('fromStop').value;
    const toStopId = document.getElementById('toStop').value;
    const passengerType = document.getElementById('passengerType').value;

    const fromStop = sampleRoute.stops.find(stop => stop.id === fromStopId);
    const toStop = sampleRoute.stops.find(stop => stop.id === toStopId);

    if (fromStop && toStop) {
        const fare = fareCalculator.calculateFare(fromStop, toStop, { passengerType });
        document.getElementById('fareResult').innerHTML = `
            <p>Estimated fare: LKR ${fare}</p>
            <p>Distance: ${fareCalculator.calculateDistance(fromStop, toStop).toFixed(2)} km</p>
        `;
    }
}

// Submit feedback for a route
function submitFeedback(busId, routeId) {
    const rating = document.querySelector('.star.active')?.dataset.rating;
    const comment = document.getElementById('feedbackText').value;
    const categories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(cb => cb.value);

    if (!rating) {
        alert('Please select a rating');
        return;
    }

    feedbackSystem.addFeedback({
        busId,
        routeId,
        rating: parseInt(rating),
        comment,
        categories
    });

    alert('Thank you for your feedback!');
    document.getElementById('feedbackText').value = '';
    document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
}

// Update bus locations periodically
setInterval(() => {
    if (window.location.pathname.includes('track-bus.html')) {
        // Simulate bus movement (in a real app, this would get data from the backend)
        buses.forEach(bus => {
            bus.location[0] += (Math.random() - 0.5) * 0.001;
            bus.location[1] += (Math.random() - 0.5) * 0.001;
            
            const marker = busMarkers[bus.id];
            if (marker) {
                marker.setLatLng(bus.location);
            }
        });
    }
}, 2000);

  