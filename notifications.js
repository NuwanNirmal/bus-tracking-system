class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.subscribers = [];
        this.loadNotifications();
    }

    // Load notifications from localStorage
    loadNotifications() {
        const stored = localStorage.getItem('notifications');
        this.notifications = stored ? JSON.parse(stored) : [];
    }

    // Save notifications to localStorage
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    // Add a new notification
    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };
        this.notifications.unshift(newNotification);
        this.saveNotifications();
        this.notifySubscribers();
    }

    // Mark a notification as read
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.notifySubscribers();
        }
    }

    // Get unread notifications count
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    // Subscribe to notifications updates
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    // Notify all subscribers
    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.notifications));
    }

    // Get notifications for a specific route
    getRouteNotifications(routeId) {
        return this.notifications.filter(n => n.routeId === routeId);
    }

    // Create a route delay notification
    createRouteDelayNotification(routeId, busId, delay, reason) {
        this.addNotification({
            type: 'delay',
            routeId,
            busId,
            delay,
            reason,
            message: `Bus ${busId} on route ${routeId} is delayed by ${delay} minutes. Reason: ${reason}`
        });
    }

    // Create a bus arrival notification
    createBusArrivalNotification(routeId, busId, stop) {
        this.addNotification({
            type: 'arrival',
            routeId,
            busId,
            stop,
            message: `Bus ${busId} has arrived at ${stop}`
        });
    }

    // Create a service disruption notification
    createServiceDisruptionNotification(routeId, message) {
        this.addNotification({
            type: 'disruption',
            routeId,
            message: `Service Disruption on route ${routeId}: ${message}`
        });
    }

    // Set up route alerts for a user
    setupRouteAlert(userId, routeId, stopId, arrivalTime) {
        const alert = {
            userId,
            routeId,
            stopId,
            arrivalTime,
            active: true
        };
        
        // In a real application, this would be stored in a backend database
        // For demo purposes, we'll store it in localStorage
        const alerts = JSON.parse(localStorage.getItem('routeAlerts') || '[]');
        alerts.push(alert);
        localStorage.setItem('routeAlerts', JSON.stringify(alerts));
    }
}

// Create a global instance
const notificationSystem = new NotificationSystem();

// Example usage:
// notificationSystem.createRouteDelayNotification('KD001', 'CTB-001', 15, 'Heavy traffic');
// notificationSystem.createBusArrivalNotification('KD001', 'CTB-001', 'Kandy Station');
// notificationSystem.setupRouteAlert('user123', 'KD001', 'STOP001', '08:30'); 