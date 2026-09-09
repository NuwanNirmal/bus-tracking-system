class FareCalculator {
    constructor() {
        // Base fare per kilometer
        this.baseFarePerKm = 5.00; // LKR
        this.minimumFare = 20.00; // LKR
        
        // Discount rates
        this.discountRates = {
            student: 0.50, // 50% discount
            senior: 0.35,  // 35% discount
            regular: 0.00  // No discount
        };

        // Zone-based pricing
        this.zones = {
            'zone1': { name: 'Kandy City', multiplier: 1.0 },
            'zone2': { name: 'Suburban', multiplier: 0.9 },
            'zone3': { name: 'Rural', multiplier: 0.8 }
        };

        // Time-based pricing
        this.peakHours = {
            morning: { start: '07:00', end: '09:00', multiplier: 1.2 },
            evening: { start: '16:00', end: '19:00', multiplier: 1.2 }
        };

        // Special routes
        this.specialRoutes = {
            'express': { multiplier: 1.5, description: 'Express Service' },
            'night': { multiplier: 1.3, description: 'Night Service' }
        };
    }

    // Calculate fare between two stops
    calculateFare(fromStop, toStop, options = {}) {
        const {
            passengerType = 'regular',
            routeType = 'regular',
            time = new Date().toTimeString().slice(0, 5)
        } = options;

        // Calculate distance
        const distance = this.calculateDistance(fromStop, toStop);
        
        // Calculate base fare
        let fare = Math.max(this.baseFarePerKm * distance, this.minimumFare);

        // Apply zone multiplier
        const zoneMultiplier = this.getZoneMultiplier(fromStop.zone, toStop.zone);
        fare *= zoneMultiplier;

        // Apply time-based multiplier
        const timeMultiplier = this.getTimeMultiplier(time);
        fare *= timeMultiplier;

        // Apply route type multiplier
        if (this.specialRoutes[routeType]) {
            fare *= this.specialRoutes[routeType].multiplier;
        }

        // Apply passenger type discount
        const discountRate = this.discountRates[passengerType] || 0;
        fare *= (1 - discountRate);

        // Round to nearest rupee
        return Math.ceil(fare);
    }

    // Calculate distance between two stops using Haversine formula
    calculateDistance(fromStop, toStop) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(toStop.lat - fromStop.lat);
        const dLon = this.toRad(toStop.lng - fromStop.lng);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRad(fromStop.lat)) * Math.cos(this.toRad(toStop.lat)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Convert degrees to radians
    toRad(degrees) {
        return degrees * Math.PI / 180;
    }

    // Get zone-based multiplier
    getZoneMultiplier(fromZone, toZone) {
        if (fromZone === toZone) {
            return this.zones[fromZone].multiplier;
        }
        // If crossing zones, use average of both zone multipliers
        return (this.zones[fromZone].multiplier + this.zones[toZone].multiplier) / 2;
    }

    // Check if time is within peak hours
    getTimeMultiplier(time) {
        const timeNum = parseInt(time.replace(':', ''));
        
        for (const period of Object.values(this.peakHours)) {
            const startNum = parseInt(period.start.replace(':', ''));
            const endNum = parseInt(period.end.replace(':', ''));
            
            if (timeNum >= startNum && timeNum <= endNum) {
                return period.multiplier;
            }
        }
        
        return 1.0;
    }

    // Get fare estimate for a route
    getFareEstimate(route, options = {}) {
        const estimates = [];
        for (let i = 0; i < route.stops.length - 1; i++) {
            const fromStop = route.stops[i];
            const toStop = route.stops[i + 1];
            
            const fare = this.calculateFare(fromStop, toStop, options);
            estimates.push({
                from: fromStop.name,
                to: toStop.name,
                distance: this.calculateDistance(fromStop, toStop).toFixed(2),
                fare: fare
            });
        }
        return estimates;
    }

    // Create fare display UI
    createFareDisplayUI(containerId, route) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="fare-calculator">
                <h3>Fare Calculator</h3>
                <div class="fare-inputs">
                    <div class="form-group">
                        <label>From:</label>
                        <select id="fromStop">
                            ${route.stops.map(stop => `
                                <option value="${stop.id}">${stop.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>To:</label>
                        <select id="toStop">
                            ${route.stops.map(stop => `
                                <option value="${stop.id}">${stop.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Passenger Type:</label>
                        <select id="passengerType">
                            <option value="regular">Regular</option>
                            <option value="student">Student</option>
                            <option value="senior">Senior Citizen</option>
                        </select>
                    </div>
                    <button onclick="calculateFareForRoute()">Calculate Fare</button>
                </div>
                <div id="fareResult" class="fare-result"></div>
                <div class="fare-info">
                    <h4>Fare Information</h4>
                    <ul>
                        <li>Base fare: LKR ${this.baseFarePerKm}/km</li>
                        <li>Minimum fare: LKR ${this.minimumFare}</li>
                        <li>Student discount: ${this.discountRates.student * 100}%</li>
                        <li>Senior citizen discount: ${this.discountRates.senior * 100}%</li>
                        <li>Peak hours: ${this.peakHours.morning.start}-${this.peakHours.morning.end}, 
                            ${this.peakHours.evening.start}-${this.peakHours.evening.end}</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// Create global instance
const fareCalculator = new FareCalculator();

// Add CSS styles
const styles = `
    .fare-calculator {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .fare-inputs {
        display: grid;
        gap: 15px;
        margin: 20px 0;
    }

    .form-group {
        display: grid;
        gap: 5px;
    }

    .form-group select {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .fare-result {
        margin: 20px 0;
        padding: 15px;
        background: #f5f5f5;
        border-radius: 5px;
        font-size: 18px;
        font-weight: bold;
    }

    .fare-info {
        background: #f5f5f5;
        padding: 15px;
        border-radius: 5px;
        margin-top: 20px;
    }

    .fare-info ul {
        list-style: none;
        padding: 0;
    }

    .fare-info li {
        margin: 5px 0;
    }
`; 