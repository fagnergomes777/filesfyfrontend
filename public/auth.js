/**
 * Gerenciamento de Autenticação
 */

// Estado de autenticação
let currentUser = null;
let isAuthenticated = false;

/**
 * Carrega usuário do localStorage
 */
function loadAuthState() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const subscription = localStorage.getItem('subscription');

  if (token && user) {
    currentUser = JSON.parse(user);
    if (subscription) {
      currentUser.subscription = JSON.parse(subscription);
    }
    isAuthenticated = true;
    updateAuthUI();
    return true;
  }

  return false;
}

/**
 * Realiza login
 */
async function login(email, password) {
  try {
    const response = await auth.login(email, password);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('subscription', JSON.stringify(response.subscription));
    
    currentUser = response.user;
    currentUser.subscription = response.subscription;
    isAuthenticated = true;
    
    updateAuthUI();
    renderWizard('home');
    
    return true;
  } catch (error) {
    showError('Erro ao fazer login: ' + error.message);
    return false;
  }
}

/**
 * Realiza registro
 */
async function register(name, email, password) {
  try {
    const response = await auth.register(name, email, password);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('subscription', JSON.stringify(response.subscription));
    
    currentUser = response.user;
    currentUser.subscription = response.subscription;
    isAuthenticated = true;
    
    updateAuthUI();
    renderWizard('home');
    
    return true;
  } catch (error) {
    showError('Erro ao registrar: ' + error.message);
    return false;
  }
}

/**
 * Login com Google
 */
async function handleGoogleLogin(response) {
  try {
    const result = await auth.googleLogin(response.credential);
    
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    
    currentUser = result.user;
    isAuthenticated = true;
    
    updateAuthUI();
    if (window.pendingProPayment) {
      window.pendingProPayment = false;
      renderWizard('payment');
    } else {
      renderWizard('home');
    }
  } catch (error) {
    showError('Erro ao fazer login com Google: ' + error.message);
  }
}

/**
 * Realiza logout
 */
async function logout() {
  await auth.logout();
  
  currentUser = null;
  isAuthenticated = false;
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('subscription');
  
  updateAuthUI();
  renderWizard('subscription');
}

/**
 * Atualiza UI de autenticação
 */
function updateAuthUI() {
  const userInfo = document.getElementById('user-info');
  const logoutBtn = document.getElementById('logout-btn');
  const loginBtn = document.getElementById('login-btn');

  if (isAuthenticated && currentUser) {
    if (userInfo) {
      userInfo.innerHTML = `👤 ${currentUser.name || currentUser.email}`;
      userInfo.style.display = 'inline-block';
    }
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (loginBtn) loginBtn.style.display = 'none';
  } else {
    if (userInfo) userInfo.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline-block';
  }
}

/**
 * Verifica se está autenticado
 */
function requireAuth() {
  if (!isAuthenticated) {
    renderWizard('login');
    return false;
  }
  return true;
}

/**
 * Atribui listener ao botão de logout
 */
document.addEventListener('DOMContentLoaded', () => {
  loadAuthState();

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      renderWizard('login');
    });
  }
});
