const API_URL = 'http://localhost:3001/api';

class ApiClient {
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  static loginWithGoogle(token, refreshToken) {
    return this.request('/auth/login-google', {
      method: 'POST',
      body: JSON.stringify({ token, refreshToken }),
    });
  }

  static testLogin(email, name) {
    return this.request('/auth/test-login', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  static verifyToken() {
    return this.request('/auth/verify', {
      method: 'POST',
    });
  }

  static logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  static getSubscription(userId) {
    return this.request(`/subscriptions/${userId}`);
  }

  static upgradePlan(userId) {
    return this.request(`/subscriptions/${userId}/upgrade`, {
      method: 'POST',
    });
  }

  static createPaymentIntent(userId, planType, paymentMethod) {
    return this.request('/payments/intent', {
      method: 'POST',
      body: JSON.stringify({ userId, planType, paymentMethod }),
    });
  }

  static getTransactionHistory(userId) {
    return this.request(`/payments/history/${userId}`);
  }
}
