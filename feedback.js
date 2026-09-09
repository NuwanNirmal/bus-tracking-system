class FeedbackSystem {
    constructor() {
        this.feedback = [];
        this.loadFeedback();
    }

    // Load feedback from localStorage
    loadFeedback() {
        const stored = localStorage.getItem('feedback');
        this.feedback = stored ? JSON.parse(stored) : [];
    }

    // Save feedback to localStorage
    saveFeedback() {
        localStorage.setItem('feedback', JSON.stringify(this.feedback));
    }

    // Add new feedback
    addFeedback(feedbackData) {
        const newFeedback = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...feedbackData
        };
        this.feedback.unshift(newFeedback);
        this.saveFeedback();
        return newFeedback;
    }

    // Get feedback for a specific bus
    getBusFeedback(busId) {
        return this.feedback.filter(f => f.busId === busId);
    }

    // Get feedback for a specific route
    getRouteFeedback(routeId) {
        return this.feedback.filter(f => f.routeId === routeId);
    }

    // Calculate average rating for a bus
    getBusRating(busId) {
        const busFeedback = this.getBusFeedback(busId);
        if (busFeedback.length === 0) return 0;
        
        const totalRating = busFeedback.reduce((sum, f) => sum + f.rating, 0);
        return totalRating / busFeedback.length;
    }

    // Calculate average rating for a route
    getRouteRating(routeId) {
        const routeFeedback = this.getRouteFeedback(routeId);
        if (routeFeedback.length === 0) return 0;
        
        const totalRating = routeFeedback.reduce((sum, f) => sum + f.rating, 0);
        return totalRating / routeFeedback.length;
    }

    // Get recent feedback
    getRecentFeedback(limit = 10) {
        return this.feedback.slice(0, limit);
    }

    // Create feedback UI
    createFeedbackUI(containerId, busId, routeId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="feedback-form">
                <h3>Rate Your Journey</h3>
                <div class="rating-stars">
                    ${this.createStarRating()}
                </div>
                <textarea id="feedbackText" placeholder="Share your experience (optional)"></textarea>
                <div class="feedback-categories">
                    <label><input type="checkbox" name="category" value="punctuality"> Punctuality</label>
                    <label><input type="checkbox" name="category" value="cleanliness"> Cleanliness</label>
                    <label><input type="checkbox" name="category" value="service"> Service</label>
                    <label><input type="checkbox" name="category" value="comfort"> Comfort</label>
                </div>
                <button onclick="submitFeedback('${busId}', '${routeId}')">Submit Feedback</button>
            </div>
            <div class="recent-feedback">
                <h3>Recent Feedback</h3>
                ${this.renderRecentFeedback(busId, routeId)}
            </div>
        `;

        this.initializeStarRating();
    }

    // Create star rating HTML
    createStarRating() {
        return `
            <div class="stars">
                ${Array(5).fill(0).map((_, i) => `
                    <span class="star" data-rating="${i + 1}">★</span>
                `).join('')}
            </div>
        `;
    }

    // Initialize star rating functionality
    initializeStarRating() {
        const stars = document.querySelectorAll('.star');
        let selectedRating = 0;

        stars.forEach(star => {
            star.addEventListener('mouseover', function() {
                const rating = this.dataset.rating;
                highlightStars(rating);
            });

            star.addEventListener('click', function() {
                selectedRating = this.dataset.rating;
                highlightStars(selectedRating);
            });
        });

        function highlightStars(rating) {
            stars.forEach(star => {
                const starRating = star.dataset.rating;
                star.classList.toggle('active', starRating <= rating);
            });
        }
    }

    // Render recent feedback
    renderRecentFeedback(busId, routeId) {
        const feedback = this.feedback
            .filter(f => f.busId === busId && f.routeId === routeId)
            .slice(0, 5);

        if (feedback.length === 0) {
            return '<p>No feedback yet</p>';
        }

        return feedback.map(f => `
            <div class="feedback-item">
                <div class="rating">
                    ${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}
                </div>
                <p>${f.comment}</p>
                <div class="categories">
                    ${f.categories.map(c => `<span class="category">${c}</span>`).join('')}
                </div>
                <small>${new Date(f.timestamp).toLocaleDateString()}</small>
            </div>
        `).join('');
    }

    // Submit feedback handler
    submitFeedback(busId, routeId) {
        const rating = document.querySelector('.star.active')?.dataset.rating || 0;
        const comment = document.getElementById('feedbackText').value;
        const categories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
            .map(cb => cb.value);

        const feedbackData = {
            busId,
            routeId,
            rating: parseInt(rating),
            comment,
            categories
        };

        this.addFeedback(feedbackData);
        this.createFeedbackUI(containerId, busId, routeId); // Refresh the UI
    }
}

// Create global instance
const feedbackSystem = new FeedbackSystem();

// Add CSS styles
const styles = `
    .feedback-form {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 20px;
    }

    .rating-stars {
        font-size: 24px;
        color: #ffd700;
        margin: 10px 0;
    }

    .star {
        cursor: pointer;
    }

    .star.active {
        color: #ffd700;
    }

    textarea {
        width: 100%;
        min-height: 100px;
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .feedback-categories {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
        margin: 10px 0;
    }

    .feedback-item {
        background: #f5f5f5;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 10px;
    }

    .category {
        background: #1e4d50;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        margin-right: 5px;
    }
`; 