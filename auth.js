// Mock user database (in a real app, this would be in a backend database)
const users = {
    'driver1': { password: 'driver123', role: 'driver', name: 'John Driver', busId: 'CTB-001' },
    'driver2': { password: 'driver123', role: 'driver', name: 'Jane Driver', busId: 'PVT-001' },
    'passenger1': { password: 'pass123', role: 'passenger', name: 'Sam Passenger' }
};

// Session management (in a real app, this would use proper session tokens)
let currentUser = null;

class Auth {
    static login(username, password) {
        const user = users[username];
        if (user && user.password === password) {
            currentUser = { ...user, username };
            delete currentUser.password; // Don't store password in session
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            return { success: true, user: currentUser };
        }
        return { success: false, error: 'Invalid credentials' };
    }

    static logout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    static getCurrentUser() {
        if (!currentUser) {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
            }
        }
        return currentUser;
    }

    static isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    static checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
        }
        return this.getCurrentUser();
    }

    static requireRole(role) {
        const user = this.getCurrentUser();
        if (!user || user.role !== role) {
            window.location.href = 'index.html';
        }
        return user;
    }
} 