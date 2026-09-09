class RouteVisualizer {
    constructor(mapId) {
        this.map = L.map(mapId);
        this.routes = new Map();
        this.busMarkers = new Map();
        this.stops = new Map();
        
        // Initialize the map with OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Center on Kandy by default
        this.map.setView([7.2906, 80.6337], 13);
    }

    // Add a new route to the map
    addRoute(routeId, routeData) {
        const { stops, color = '#1e4d50' } = routeData;
        
        // Create a polyline for the route
        const coordinates = stops.map(stop => [stop.lat, stop.lng]);
        const routeLine = L.polyline(coordinates, {
            color,
            weight: 4,
            opacity: 0.8
        }).addTo(this.map);

        // Add stops as markers
        const stopMarkers = stops.map(stop => {
            const marker = L.circleMarker([stop.lat, stop.lng], {
                radius: 8,
                fillColor: '#fff',
                color: color,
                weight: 2,
                opacity: 1,
                fillOpacity: 1
            })
            .bindPopup(`
                <strong>${stop.name}</strong><br>
                Arrival: ${stop.arrivalTime}<br>
                <button onclick="showStopDetails('${stop.id}')">View Details</button>
            `)
            .addTo(this.map);

            return marker;
        });

        this.routes.set(routeId, {
            line: routeLine,
            stops: stopMarkers,
            data: routeData
        });

        // Fit map to show the entire route
        this.map.fitBounds(routeLine.getBounds());
    }

    // Update bus position on the route
    updateBusPosition(busId, position, rotation = 0) {
        let marker = this.busMarkers.get(busId);
        
        if (!marker) {
            // Create new bus marker if it doesn't exist
            const busIcon = L.divIcon({
                html: '🚌',
                className: 'bus-icon',
                iconSize: [25, 25]
            });

            marker = L.marker(position, {
                icon: busIcon,
                rotationAngle: rotation
            }).addTo(this.map);

            this.busMarkers.set(busId, marker);
        } else {
            // Update existing marker position
            marker.setLatLng(position);
            marker.setRotationAngle(rotation);
        }
    }

    // Highlight a specific stop
    highlightStop(stopId) {
        this.stops.forEach((marker, id) => {
            if (id === stopId) {
                marker.setStyle({ fillColor: '#ff9800' });
                marker.openPopup();
            } else {
                marker.setStyle({ fillColor: '#fff' });
            }
        });
    }

    // Show route details panel
    showRouteDetails(routeId) {
        const route = this.routes.get(routeId);
        if (!route) return;

        const { data } = route;
        const detailsPanel = document.createElement('div');
        detailsPanel.className = 'route-details-panel';
        detailsPanel.innerHTML = `
            <h3>${data.name}</h3>
            <p><strong>Route ID:</strong> ${routeId}</p>
            <p><strong>Frequency:</strong> ${data.frequency}</p>
            <p><strong>First Bus:</strong> ${data.firstBus}</p>
            <p><strong>Last Bus:</strong> ${data.lastBus}</p>
            <h4>Stops:</h4>
            <ul>
                ${data.stops.map(stop => `
                    <li>
                        ${stop.name} - ${stop.arrivalTime}
                        <small>(${stop.lat}, ${stop.lng})</small>
                    </li>
                `).join('')}
            </ul>
        `;

        // Add to the map container
        this.map.getContainer().appendChild(detailsPanel);
    }

    // Calculate and display route statistics
    showRouteStats(routeId) {
        const route = this.routes.get(routeId);
        if (!route) return;

        const { data } = route;
        const stops = data.stops;
        
        // Calculate total distance
        let totalDistance = 0;
        for (let i = 0; i < stops.length - 1; i++) {
            const start = L.latLng(stops[i].lat, stops[i].lng);
            const end = L.latLng(stops[i + 1].lat, stops[i + 1].lng);
            totalDistance += start.distanceTo(end);
        }

        // Calculate average time between stops
        const firstStop = stops[0];
        const lastStop = stops[stops.length - 1];
        const totalTime = this.calculateTimeDifference(firstStop.arrivalTime, lastStop.arrivalTime);
        const avgTime = totalTime / (stops.length - 1);

        return {
            totalDistance: (totalDistance / 1000).toFixed(2), // in kilometers
            totalStops: stops.length,
            averageTimeBetweenStops: Math.round(avgTime),
            totalDuration: totalTime
        };
    }

    // Helper function to calculate time difference in minutes
    calculateTimeDifference(time1, time2) {
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);
        return (h2 * 60 + m2) - (h1 * 60 + m1);
    }

    // Clear all routes from the map
    clearRoutes() {
        this.routes.forEach(route => {
            route.line.remove();
            route.stops.forEach(marker => marker.remove());
        });
        this.routes.clear();
    }
}

// Example route data
const sampleRoute = {
    name: 'Kandy - Dambawela Route',
    frequency: 'Every 30 minutes',
    firstBus: '05:45',
    lastBus: '19:30',
    stops: [
        { id: 'KAN', name: 'Kandy', lat: 7.2906, lng: 80.6337, arrivalTime: '06:00' },
        { id: 'MAH', name: 'Mahayyawa', lat: 7.2850, lng: 80.6400, arrivalTime: '06:15' },
        { id: 'THA', name: 'Thannekumbura', lat: 7.2800, lng: 80.6450, arrivalTime: '06:30' },
        { id: 'PIC', name: 'Pichchamalwaththa Junction', lat: 7.2750, lng: 80.6500, arrivalTime: '06:45' },
        { id: 'DAM', name: 'Dambawela', lat: 7.2700, lng: 80.6550, arrivalTime: '07:00' }
    ]
}; 