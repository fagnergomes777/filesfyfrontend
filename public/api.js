// Configuração da API
// No navegador, não temos acesso a process.env
// Usar URL fixa ou ler de window.API_URL se disponível
const API_BASE_URL = (typeof window !== 'undefined' && window.API_URL) || 'http://localhost:3001/api';

/**
 * Faz uma requisição à API
 * @param {string} endpoint - Endpoint da API (sem /api)
 * @param {string} method - Método HTTP
 * @param {object} data - Dados a enviar
 * @returns {Promise}
 */
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
      const error = await response.json();
      throw new Error(error.error || `Erro HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro ao chamar ${endpoint}:`, error);
    throw error;
  }
}

// Funções de Autenticação
const auth = {
  async login(email, password) {
    return apiCall('/auth/login', 'POST', { email, password });
  },

  async register(name, email, password) {
    return apiCall('/auth/register', 'POST', { name, email, password });
  },

  async googleLogin(token) {
    return apiCall('/auth/google-login', 'POST', { token });
  },

  async testLogin(email, name) {
    return apiCall('/auth/test-login', 'POST', { email, name });
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getProfile() {
    return apiCall('/auth/profile');
  },

  async updateProfile(data) {
    return apiCall('/auth/profile', 'PUT', data);
  },

  async resetPassword(email) {
    return apiCall('/auth/reset-password', 'POST', { email });
  }
};

// Funções de Pagamento
const payments = {
  async createPaymentIntent(userId, planType, paymentMethod) {
    return apiCall('/payments/intent', 'POST', { userId, planType, paymentMethod });
  }
};

// Funções de Assinatura
const subscriptions = {
  async getCurrentSubscription() {
    return apiCall('/subscriptions/current');
  },

  async getPlans() {
    return apiCall('/subscriptions/plans');
  },

  async subscribeToPlan(planId) {
    return apiCall('/subscriptions/subscribe', 'POST', { planId });
  },

  async cancelSubscription() {
    return apiCall('/subscriptions/cancel', 'POST');
  },

  async updateSubscription(data) {
    return apiCall('/subscriptions/update', 'PUT', data);
  }
};

// Funções de Recuperação
const recovery = {
  async listDevices() {
    return apiCall('/recovery/devices');
  },

  async startScan(deviceId, fileType) {
    return apiCall('/recovery/scan', 'POST', { deviceId, fileType });
  },

  async getScanStatus(scanId) {
    return apiCall(`/recovery/scan/${scanId}`);
  },

  async recoverFiles(files, destination) {
    return apiCall('/recovery/recover', 'POST', { files, destination });
  }
};

// Health Check
async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
