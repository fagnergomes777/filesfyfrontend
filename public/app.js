/**
 * Aplicação Web Filesfy
 * Frontend responsivo para recuperação de dados
 */

// ==================== ESTADO GLOBAL ====================
let cachedPlans = [];
let selectedPaymentPlanId = 'pro';
let selectedAccessPlan = 'free';

// ==================== TEMA ====================
function loadTheme() {
  const savedTheme = localStorage.getItem('app-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  applyTheme(theme);

  // Escutar mudanças de tema do sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('app-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
  } else if (theme === 'dark') {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
  }

  const btnTheme = document.getElementById('btn-theme-toggle');
  if (btnTheme) {
    btnTheme.textContent = theme === 'light' ? '🌙' : '☀️';
    btnTheme.title = theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro';
  }
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  localStorage.setItem('app-theme', newTheme);
  applyTheme(newTheme);
}

// ==================== MENU RESPONSIVO ====================
function setupResponsiveMenu() {
  const toggle = document.getElementById('navbar-toggle');
  const menu = document.getElementById('navbar-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', menu.classList.contains('active'));
    });

    // Fechar menu ao clicar em um link
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const sectionId = href.substring(1); // Remove o #
        const section = document.getElementById(sectionId);
        
        if (section) {
          // Atualizar links ativos
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          // Scroll para a seção
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Fechar menu mobile
          menu.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
  
  // Atualizar link ativo ao scroll
  window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = [
    { id: 'recupera', link: document.querySelector('a[href="#recupera"]') },
    { id: 'dispositivos', link: document.querySelector('a[href="#dispositivos"]') },
    { id: 'como-funciona', link: document.querySelector('a[href="#como-funciona"]') },
    { id: 'usuarios', link: document.querySelector('a[href="#usuarios"]') },
    { id: 'planos', link: document.querySelector('a[href="#planos"]') },
    { id: 'suporte', link: document.querySelector('a[href="#suporte"]') }
  ];
  
  let currentSection = null;
  
  for (let section of sections) {
    const element = document.getElementById(section.id);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= 150) {
        currentSection = section;
      } else {
        break;
      }
    }
  }
  
  // Remover active de todos os links
  navLinks.forEach(link => link.classList.remove('active'));
  
  // Adicionar active ao link atual
  if (currentSection && currentSection.link) {
    currentSection.link.classList.add('active');
  }
}

// ==================== ACESSIBILIDADE ====================
function setupAccessibility() {
  const toggle = document.getElementById('access-menu-toggle');
  const panel = document.getElementById('access-menu-panel');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnContrast = document.getElementById('btn-contrast');
  const btnHoverRead = document.getElementById('btn-hover-read');
  const status = document.getElementById('access-status');

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isOpen = !panel.hidden;
    panel.hidden = isOpen;
    toggle.setAttribute('aria-expanded', !isOpen);
  });

  let currentZoom = 100;
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      currentZoom = Math.min(currentZoom + 20, 200);
      document.documentElement.style.fontSize = (currentZoom / 100) * 16 + 'px';
      if (status) status.textContent = `Zoom: ${currentZoom}%`;
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      currentZoom = Math.max(currentZoom - 20, 80);
      document.documentElement.style.fontSize = (currentZoom / 100) * 16 + 'px';
      if (status) status.textContent = `Zoom: ${currentZoom}%`;
    });
  }

  if (btnContrast) {
    btnContrast.addEventListener('click', () => {
      document.body.classList.toggle('high-contrast');
      if (status) {
        const isActive = document.body.classList.contains('high-contrast');
        status.textContent = isActive ? 'Alto contraste: ativado' : 'Alto contraste: desativado';
      }
    });
  }

  if (btnHoverRead) {
    btnHoverRead.addEventListener('click', () => {
      document.body.classList.toggle('hover-read');
      if (status) {
        const isActive = document.body.classList.contains('hover-read');
        status.textContent = isActive ? 'Leitura ao passar: ativada' : 'Leitura ao passar: desativada';
      }
    });
  }
}

// ==================== WIZARD / ROTEAMENTO ====================
function renderWizard(page) {
  const wizard = document.getElementById('wizard');
  if (!wizard) return;

  wizard.innerHTML = '';

  if (!isAuthenticated) {
    if (page === 'payment') {
      renderLoginPageNew(wizard);
      return;
    }

    // Mostrar tela de login quando solicitado
    if (page === 'login') {
      renderLoginPageNew(wizard);
      return;
    }

    // Mostrar tela de registro quando solicitado
    if (page === 'register') {
      renderRegisterPage(wizard);
      return;
    }

    // Para outros casos, mostrar subscription
    if (page === 'home') {
      renderHomePage(wizard);
      return;
    }
  }

  switch (page) {
    case 'login':
      renderLoginPageNew(wizard);
      break;
    case 'google-auth':
      renderGoogleAuthPage(wizard);
      break;
    case 'register':
      renderRegisterPage(wizard);
      break;
    case 'home':
      renderHomePage(wizard);
      break;
    case 'subscription':
      renderSubscriptionPage(wizard);
      break;
    case 'payment':
      showPaymentPage();
      break;
    default:
      renderHomePage(wizard);
  }
}

function renderHomePage(container) {
  container.innerHTML = `
    <div class="home-container">
      <div class="hero-section">
        <div class="hero-content">
          <h2>Recupere seus dados com segurança</h2>
          <p>Filesfy é a solução profissional mais confiável para recuperação de arquivos deletados</p>
          <div class="hero-buttons">
            <button class="btn-primary btn-large" onclick="downloadDesktopApp()">
              📥 Baixar Versão Desktop
            </button>
            <button class="btn-secondary btn-large" onclick="renderWizard('subscription')">
              Ver Planos
            </button>
          </div>
        </div>
      </div>

      <div class="use-cases-section" id="recupera">
        <h3>Recupere seus dados em qualquer situação</h3>
        <div class="use-cases-grid">
          <div class="use-case-card">
            <div class="use-case-icon"><img src="https://img.icons8.com/fluency/96/trash.png" alt="Trash"></div>
            <h4>Arquivos Deletados</h4>
            <p>Recupere arquivos excluídos pelo comando Shift+Del ou esvaziamento da Lixeira</p>
          </div>
          <div class="use-case-card">
            <div class="use-case-icon"><img src="https://img.icons8.com/fluency/96/database-restore.png" alt="Format Disk"></div>
            <h4>Formatação Acidental</h4>
            <p>Recupere dados de discos formatados rápido ou completamente</p>
          </div>
          <div class="use-case-card">
            <div class="use-case-icon"><img src="https://img.icons8.com/fluency/96/error.png" alt="Error"></div>
            <h4>Partição Corrompida</h4>
            <p>Recupere dados de partições apagadas, corrompidas ou inacessíveis</p>
          </div>
          <div class="use-case-card">
            <div class="use-case-icon"><img src="https://img.icons8.com/fluency/96/virus.png" alt="Virus"></div>
            <h4>Ataque de Vírus</h4>
            <p>Recupere arquivos criptografados ou comprometidos por ransomware</p>
          </div>
          <div class="use-case-card">
            <div class="use-case-icon"><img src="https://img.icons8.com/fluency/96/usb-2.png" alt="USB"></div>
            <h4>Dispositivo USB</h4>
            <p>Recupere dados de pen drives, cartões SD e unidades removíveis</p>
          </div>
          <div class="use-case-card">
            <div class="use-case-icon"><img src="https://img.icons8.com/fluency/96/warning-shield.png" alt="System Error"></div>
            <h4>Erro do Sistema</h4>
            <p>Recupere dados após falhas do sistema ou reinstalação do SO</p>
          </div>
        </div>
      </div>

      <div class="how-it-works-section" id="como-funciona">
        <h3>Como Funciona - 3 Passos Simples</h3>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h4>Selecione o Dispositivo</h4>
            <p>Escolha o disco rígido, pen drive ou cartão de memória onde os dados foram perdidos</p>
            <div class="step-icon"><img src="https://img.icons8.com/fluency/96/folder-invoices.png" alt="Select"></div>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h4>Digitalize</h4>
            <p>Filesfy escaneia profundamente seu dispositivo para encontrar todos os arquivos recuperáveis</p>
            <div class="step-icon"><img src="https://img.icons8.com/fluency/96/search.png" alt="Scan"></div>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h4>Recupere</h4>
            <p>Selecione os arquivos desejados e recupere-os com um clique</p>
            <div class="step-icon"><img src="https://img.icons8.com/fluency/96/checkmark.png" alt="Recover"></div>
          </div>
        </div>
      </div>

      <div class="devices-section" id="dispositivos">
        <h3>Dispositivos de armazenamento suportados para recuperar:</h3>
        <div class="devices-grid">
          <div class="device-card">
            <div class="device-icon"><img src="https://img.icons8.com/fluency/96/hdd.png" alt="HDD"></div>
            <h4>Discos Rígidos</h4>
            <p>Suporte para recuperar unidades de disco rígido de até 16 TB</p>
          </div>
          <div class="device-card">
            <div class="device-icon"><img src="https://img.icons8.com/fluency/96/ssd.png" alt="SSD"></div>
            <h4>Unidades Removíveis</h4>
            <p>Discos rígidos externos e SSD para desktop/portáteis</p>
          </div>
          <div class="device-card">
            <div class="device-icon"><img src="https://img.icons8.com/fluency/96/laptop.png" alt="Laptop"></div>
            <h4>Notebooks e PCs</h4>
            <p>Lixeira, unidades internas, partições</p>
          </div>
          <div class="device-card">
            <div class="device-icon"><img src="https://img.icons8.com/fluency/96/usb-on.png" alt="USB"></div>
            <h4>Unidades Flash</h4>
            <p>Unidades USB, Jump Drives, Pen Drives, Thumb Drives...</p>
          </div>
          <div class="device-card">
            <div class="device-icon"><img src="https://img.icons8.com/fluency/96/sd.png" alt="SD Card"></div>
            <h4>Cartões de Memória</h4>
            <p>Cartão SD/CF, microSD, miniSD, Sandisk, cartão de memória...</p>
          </div>
          <div class="device-card">
            <div class="device-icon"><img src="https://img.icons8.com/fluency/96/camera.png" alt="Camera"></div>
            <h4>Outras Mídias de Armazenamento</h4>
            <p>Câmera, leitor de música/vídeo, unidade de disquete, unidade zip, etc.</p>
          </div>
        </div>
      </div>

      <div class="testimonials-section" id="usuarios">
        <h3>O que nossos usuários dizem</h3>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="stars">⭐⭐⭐⭐⭐</div>
            <p class="testimonial-text">"Perdi 2GB de fotos importantes no meu cartão SD e este programa recuperou tudo! Recomendo demais!"</p>
            <p class="testimonial-author">— Gabriel Brito</p>
          </div>
          <div class="testimonial-card">
            <div class="stars">⭐⭐⭐⭐⭐</div>
            <p class="testimonial-text">"Excelente programa, cumpre o que promete. Rápido e fácil para recuperação. Muito bom mesmo!"</p>
            <p class="testimonial-author">— João Henrique</p>
          </div>
          <div class="testimonial-card">
            <div class="stars">⭐⭐⭐⭐⭐</div>
            <p class="testimonial-text">"Achei surpreendente! Recuperou ficheiros que já nem lembrava que tive no disco. Simplesmente fantástico!"</p>
            <p class="testimonial-author">— Joaquim Fernandes</p>
          </div>
        </div>
      </div>

      <div class="trust-section" id="planos">
        <h3>Você está em boas mãos</h3>
        <div class="trust-stats">
          <div class="stat-item">
            <div class="stat-number">10M+</div>
            <div class="stat-label">Usuários Globais</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">15+</div>
            <div class="stat-label">Anos de Experiência</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">99%</div>
            <div class="stat-label">Taxa de Sucesso</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">10/10</div>
            <div class="stat-label">Suporte Técnico</div>
          </div>
        </div>
      </div>

      <div class="cta-section">
        <h3>Pronto para recuperar seus dados?</h3>
        <p>Escolha seu plano e comece hoje mesmo</p>
        <button class="btn-primary btn-large" onclick="renderWizard('subscription')">Ver Planos Disponíveis</button>
      </div>

      <div class="support-section" id="suporte">
        <h3>Suporte Técnico</h3>
        <div class="support-grid">
          <div class="support-card">
            <div class="support-icon"><img src="https://img.icons8.com/fluency/96/chat.png" alt="Chat em Tempo Real"></div>
            <h4>Chat em Tempo Real</h4>
            <p>Fale com nossos especialistas agora mesmo</p>
            <button class="btn-secondary">Iniciar Chat</button>
          </div>
          <div class="support-card">
            <div class="support-icon"><img src="https://img.icons8.com/fluency/96/email.png" alt="Email"></div>
            <h4>Email</h4>
            <p>suporte@filesfy.com - Respondemos em até 2 horas</p>
            <button class="btn-secondary">Enviar Email</button>
          </div>
          <div class="support-card">
            <div class="support-icon"><img src="https://img.icons8.com/fluency/96/phone.png" alt="Telefone"></div>
            <h4>Telefone</h4>
            <p>+55 (84) 9999-9999 - Disponível</p>
            <button class="btn-secondary">Ligar Agora</button>
          </div>
          <div class="support-card">
            <div class="support-icon"><img src="https://img.icons8.com/fluency/96/help.png" alt="FAQ"></div>
            <h4>FAQ</h4>
            <p>Respostas para as perguntas mais comuns</p>
            <button class="btn-secondary">Ver FAQ</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderScanPage(container) {
  // Redirecionar para home na versão web
  renderHomePage(container);
}

function downloadDesktopApp() {
  const downloadUrl = 'https://github.com/filesfy/filesfy-desktop/releases/latest/download/Filesfy-Setup.exe';
  showSuccess('Download iniciado! Verifique seus downloads.');
  
  // Criar link temporário para download
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'Filesfy-Setup.exe';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function loadDevices() {
  // Funcionalidade de recuperação disponível apenas na versão desktop
  console.log('Recuperação de arquivos disponível apenas no aplicativo desktop');
}

function showFileTypeSelection(deviceId, deviceName) {
  // Redirecionar para download do desktop
  downloadDesktopApp();
}

async function startScan(deviceId, fileType) {
  // Redirecionar para download do desktop
  downloadDesktopApp();
}

function renderScanProgress(deviceId) {
  // Não utilizado na versão web
}

async function recoverFiles() {
  // Redirecionar para download do desktop
  downloadDesktopApp();
}

function renderRecoveryProgress(filesCount) {
  // Não utilizado na versão web
}

function renderRecoveryPage(container) {
  // Redirecionar para home na versão web
  renderHomePage(container);
}

function getFileIcon(type) {
  const icons = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    document: '📄',
    archive: '📦'
  };
  return icons[type] || '📁';
}

function renderSubscriptionPage(container) {
  container.innerHTML = `
    <div class="subscription-container">
      <div class="plans-header">
        <h1>Escolha seu Plano</h1>
        <p>Selecione FREE para começar ou upgrade para PRO</p>
      </div>
      
      <div class="plans-grid" id="plans-grid">
        <p>Carregando planos...</p>
      </div>
    </div>
  `;

  loadSubscriptionPlans();
}

async function loadSubscriptionPlans() {
  try {
    const plans = await subscriptions.getPlans();
    const grid = document.getElementById('plans-grid');
    cachedPlans = Array.isArray(plans) ? plans : [];
    
    grid.innerHTML = plans.map(plan => `
      <div class="plan-card ${plan.id === 'pro' ? 'plan-card-pro' : 'plan-card-free'}">
        ${plan.id === 'pro' ? '<div class="plan-badge">Mais Popular</div>' : '<div class="plan-badge-basic">Plano Básico</div>'}
        
        <h3>${plan.name}</h3>
        
        <div class="plan-pricing">
          ${plan.originalPrice ? `<span class="original-price">De R$ ${(plan.originalPrice / 100).toFixed(2)}</span>` : ''}
          <span class="price">${plan.price === 0 ? 'Grátis' : 'R$ ' + (plan.price / 100).toFixed(2)}</span>
          ${plan.discount ? `<span class="discount">${plan.discount} OFF</span>` : ''}
          <span class="duration">/${plan.interval}</span>
        </div>

        <button class="btn-primary ${plan.id === 'pro' ? 'btn-pro' : 'btn-free'}" onclick="${plan.id === 'pro' ? "selectProPlan(); return false;" : "selectFreePlan(); return false;"}">
          ${plan.button}
        </button>

        <div class="plan-features">
          ${plan.features.map(f => `
            <div class="feature-item ${f.included ? 'included' : 'excluded'}">
              <span class="feature-icon">${f.included ? '✓' : '✗'}</span>
              <span class="feature-name">${f.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch (error) {
    showError('Erro ao carregar planos: ' + error.message);
  }
}

function selectFreePlan() {
  console.log('FREE Plan Selected');
  selectedAccessPlan = 'free';
  renderFreePlanInfo();
}

function selectProPlan() {
  console.log('PRO Plan Selected');
  selectedPaymentPlanId = 'pro';
  // Vai para tela de upgrade
  renderUpgradePage();
}

function renderUpgradePage() {
  const wizard = document.getElementById('wizard');
  wizard.innerHTML = `
    <div class="upgrade-container">
      <div class="upgrade-card">
        <h2 class="upgrade-title">Upgrade para PRO</h2>
        <p class="upgrade-price">Filesfy PRO - R$ 15,99</p>
        
        <div class="upgrade-features">
          <h3 class="features-title">Seu plano inclui:</h3>
          
          <div class="features-grid">
            <div class="features-column">
              <div class="feature-item-upgrade">
                <svg class="feature-check" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#0ea5e9" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Limite 128GB por varredura</span>
              </div>
              
              <div class="feature-item-upgrade">
                <svg class="feature-check" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#0ea5e9" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Recuperação avançada</span>
              </div>
              
              <div class="feature-item-upgrade">
                <svg class="feature-check" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#0ea5e9" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Histórico 90 dias</span>
              </div>
              
              <div class="feature-item-upgrade">
                <svg class="feature-check" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#0ea5e9" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Sem anúncios</span>
              </div>
            </div>
            
            <div class="features-column">
              <div class="feature-item-upgrade">
                <svg class="feature-check" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#0ea5e9" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Armazenamento 5GB</span>
              </div>
              
              <div class="feature-item-upgrade">
                <svg class="feature-check" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#0ea5e9" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Varreduras ilimitadas</span>
              </div>
              
              <div class="feature-item-upgrade">
                <svg class="feature-check" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#0ea5e9" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Sem limite de arquivos</span>
              </div>
              
              <div class="feature-item-upgrade">
                <svg class="feature-check" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#0ea5e9" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Suporte por email</span>
              </div>
              
              <div class="feature-item-upgrade">
                <svg class="feature-check" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#0ea5e9" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Atualizações Automáticas</span>
              </div>
            </div>
          </div>
        </div>
        
        <button class="btn-primary btn-full" style="margin-top: 30px;" onclick="renderWizard('login')">Fazer Upgrade PRO</button>
        <button class="btn-voltar" style="margin-top: 15px;" onclick="renderWizard('subscription')">Voltar</button>
      </div>
    </div>
  `;
}

function startProPayment() {
  if (!requireAuth()) return;
  selectedPaymentPlanId = 'pro';
  showPaymentPage();
}

function showPaymentPage() {
  if (!requireAuth()) return;

  const wizard = document.getElementById('wizard');
  const plan = cachedPlans.find(p => p.id === selectedPaymentPlanId) || {
    id: 'pro',
    name: 'Filesfy PRO',
    price: 1599,
    interval: 'mês'
  };

  wizard.innerHTML = `
    <div class="payment-container">
      <div class="payment-header">
        <h2>Escolha a Forma de Pagamento</h2>
        <p>Clique em uma opção para continuar</p>
        <div class="payment-amount">
          <span>Total:</span>
          <strong>R$ ${(plan.price / 100).toFixed(2)}</strong>
          <span class="payment-period">/${plan.interval}</span>
        </div>
      </div>

      <div class="payment-methods">
        <div class="payment-option" data-method="pix">
          <svg class="payment-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
          <div>
            <h3>PIX</h3>
            <p>Transferência instantânea</p>
          </div>
        </div>

        <div class="payment-option" data-method="credit_card">
          <svg class="payment-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 8H4V6h16m0 10H4v-6h16m0-4H4c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
          </svg>
          <div>
            <h3>Cartão de Crédito</h3>
            <p>Parcelado em até 12x</p>
          </div>
        </div>

        <div class="payment-option" data-method="debit_card">
          <svg class="payment-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 8H4V6h16m0 10H4v-6h16m0-4H4c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
          </svg>
          <div>
            <h3>Cartão de Débito</h3>
            <p>Débito em conta corrente</p>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: center; margin-top: 20px;">
        <button class="btn-secondary" id="btn-back-payment">Voltar</button>
      </div>
    </div>
  `;

  document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', () => {
      const method = option.dataset.method;
      processPayment(method);
    });
  });

  const backBtn = document.getElementById('btn-back-payment');
  if (backBtn) {
    backBtn.addEventListener('click', () => renderWizard('subscription'));
  }
}

function renderFreePlanInfo() {
  const wizard = document.getElementById('wizard');
  const plan = cachedPlans.find(p => p.id === 'free') || {
    name: 'Filesfy FREE',
    price: 0,
    interval: 'mês',
    features: []
  };

  wizard.innerHTML = `
    <div class="subscription-container">
      <div class="plans-header">
        <h1>${plan.name}</h1>
        <p>Você já pode começar a recuperar seus arquivos</p>
      </div>

      <div class="plan-card plan-card-free" style="max-width: 720px; margin: 0 auto;">
        <div class="plan-badge-basic">Plano Básico</div>
        <h3>O que está liberado no FREE</h3>
        <div class="plan-features">
          ${plan.features.map(f => `
            <div class="feature-item ${f.included ? 'included' : 'excluded'}">
              <span class="feature-icon">${f.included ? '✓' : '✗'}</span>
              <span class="feature-name">${f.name}</span>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn-primary btn-free" onclick="renderWizard('scan')">Iniciar Recuperação</button>
          <button class="btn-secondary" onclick="renderWizard('subscription')">Ver Planos</button>
        </div>
      </div>
    </div>
  `;
}

async function processPayment(method) {
  const wizard = document.getElementById('wizard');
  wizard.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <h2>Processando pagamento...</h2>
      <p>Método: ${method === 'pix' ? 'PIX' : method === 'credit_card' ? 'Cartão de Crédito' : 'Cartão de Débito'}</p>
    </div>
  `;

  try {
    if (!currentUser || !currentUser.id) {
      throw new Error('Usuário não autenticado. Faça login novamente.');
    }

    const result = await payments.createPaymentIntent(currentUser.id, 'PRO', method);

    if (result?.token) {
      localStorage.setItem('token', result.token);
    }

    if (result?.subscription) {
      localStorage.setItem('subscription', JSON.stringify(result.subscription));
      const user = JSON.parse(localStorage.getItem('user'));
      user.subscription = result.subscription;
      localStorage.setItem('user', JSON.stringify(user));
      currentUser = user;
    }

    showPaymentSuccess();
  } catch (error) {
    wizard.innerHTML = `
      <div class="error-container">
        <h2>Erro no Pagamento</h2>
        <p>${error?.message || 'Não foi possível processar o pagamento'}</p>
        <button class="btn-primary" id="btn-retry-payment">Tentar Novamente</button>
        <button class="btn-secondary" id="btn-back-home-error">Voltar ao Início</button>
      </div>
    `;

    const retryBtn = document.getElementById('btn-retry-payment');
    if (retryBtn) retryBtn.addEventListener('click', () => showPaymentPage());

    const backBtn = document.getElementById('btn-back-home-error');
    if (backBtn) backBtn.addEventListener('click', () => renderWizard('home'));
  }
}

function showPaymentSuccess() {
  const wizard = document.getElementById('wizard');
  wizard.innerHTML = `
    <div class="success-container">
      <svg class="success-icon" viewBox="0 0 24 24">
        <path fill="#22c55e" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <h2>Pagamento Realizado!</h2>
      <p>Sua assinatura PRO está ativa</p>
      <p class="success-details">Você agora tem acesso a todas as funcionalidades premium:</p>
      <ul style="text-align: left; margin: 20px auto; max-width: 400px; color: var(--color-text-secondary);">
        <li>✓ Recuperar até 50 arquivos por varredura</li>
        <li>✓ Limite de 5GB por scan</li>
        <li>✓ Todos os tipos de arquivo</li>
        <li>✓ Suporte prioritário</li>
      </ul>
      <button class="btn-primary" id="btn-start-recovery-pro">Iniciar Recuperação Agora</button>
    </div>
  `;

  const startBtn = document.getElementById('btn-start-recovery-pro');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      renderWizard('scan');
    });
  }
}

async function subscribeToPlan(planId) {
  if (!requireAuth()) return;

  try {
    const result = await subscriptions.subscribeToPlan(planId);
    
    // Atualizar token e subscription no localStorage
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    
    if (result.subscription) {
      localStorage.setItem('subscription', JSON.stringify(result.subscription));
      
      // Atualizar currentUser
      const user = JSON.parse(localStorage.getItem('user'));
      user.subscription = result.subscription;
      localStorage.setItem('user', JSON.stringify(user));
      currentUser = user;
    }
    
    showSuccess(`Plano ${planId.toUpperCase()} ativado com sucesso!`);
    
    // Recarregar página para aplicar mudanças
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (error) {
    showError('Erro ao assinar plano: ' + error.message);
  }
}

// ==================== MODAIS E NOTIFICAÇÕES ====================
function showSuccess(message) {
  showNotification(message, 'success');
}

function showError(message) {
  showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

function showPrivacyPolicy(e) {
  e.preventDefault();
  const modal = document.getElementById('modal-dialog');
  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <h2>Política de Privacidade</h2>
    <p>A Filesfy respeita sua privacidade e se compromete a proteger seus dados pessoais...</p>
  `;
  modal.showModal();
}

function showProductPolicy(e) {
  e.preventDefault();
  const modal = document.getElementById('modal-dialog');
  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <h2>Política de Produtos</h2>
    <p>Todos os produtos Filesfy são desenvolvidos com os mais altos padrões de qualidade...</p>
  `;
  modal.showModal();
}

function showLicenseAgreement(e) {
  e.preventDefault();
  const modal = document.getElementById('modal-dialog');
  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <h2>Termos de Serviço</h2>
    <p>Ao usar os serviços Filesfy, você concorda com os seguintes termos...</p>
  `;
  modal.showModal();
}

function showSupport() {
  const modal = document.getElementById('modal-dialog');
  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <h2>Central de Suporte</h2>
    <div style="text-align: left;">
      <h3>Como podemos ajudar?</h3>
      <p><strong>Email:</strong> suporte@filesfy.com</p>
      <p><strong>Telefone:</strong> 0800-123-4567</p>
      <p><strong>Horário:</strong> Segunda a Sexta, 9h às 18h</p>
      <hr>
      <h3>Perguntas Frequentes</h3>
      <p><strong>Como recuperar arquivos deletados?</strong><br>
      Acesse "Recuperação" no menu, selecione o dispositivo e inicie a varredura.</p>
      <p><strong>Qual a diferença entre planos FREE e PRO?</strong><br>
      Plano FREE: 5 arquivos, 300MB | Plano PRO: 50 arquivos, 5GB por varredura.</p>
    </div>
  `;
  modal.showModal();
}

function showDocumentation() {
  const modal = document.getElementById('modal-dialog');
  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <h2>Documentação</h2>
    <div style="text-align: left;">
      <h3>Guia de Uso</h3>
      <ol>
        <li><strong>Criar Conta:</strong> Clique em "Entrar" e depois "Cadastre-se"</li>
        <li><strong>Escolher Plano:</strong> Acesse "Preços" e selecione FREE ou PRO</li>
        <li><strong>Iniciar Recuperação:</strong> Clique em "Recuperação" no menu</li>
        <li><strong>Selecionar Dispositivo:</strong> Escolha o disco ou dispositivo</li>
        <li><strong>Varrer Arquivos:</strong> Aguarde a análise completar</li>
        <li><strong>Recuperar:</strong> Selecione os arquivos e clique em "Recuperar"</li>
      </ol>
      <h3>Recursos Técnicos</h3>
      <p>Acesse nossa documentação completa em: <a href="https://docs.filesfy.com" target="_blank">docs.filesfy.com</a></p>
    </div>
  `;
  modal.showModal();
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  setupResponsiveMenu();
  setupAccessibility();

  const btnTheme = document.getElementById('btn-theme-toggle');
  if (btnTheme) {
    btnTheme.addEventListener('click', toggleTheme);
  }

  // Setup modal close button
  const modal = document.getElementById('modal-dialog');
  if (modal) {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.close();
      });
    }
    
    // Fechar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.open) {
        modal.close();
      }
    });

    // Acompanhar scroll do wizard-container
    const wizardContainer = document.getElementById('wizard');
    if (wizardContainer) {
      wizardContainer.addEventListener('scroll', () => {
        if (modal.open) {
          const scrollTop = wizardContainer.scrollTop;
          modal.style.top = `calc(50% + ${scrollTop}px)`;
        }
      });
    }
  }

  // Inicializar página
  if (loadAuthState()) {
    renderWizard('home');
  } else {
    renderWizard('subscription');
  }
});
// ==================== MODALS ====================
function openSupportModal(section) {
  const modal = document.getElementById('modal-dialog');
  const modalBody = document.getElementById('modal-body');
  const wizardContainer = document.getElementById('wizard');
  
  // Posicionar modal no topo visível do wizard-container
  if (wizardContainer) {
    const scrollTop = wizardContainer.scrollTop;
    modal.style.top = `${scrollTop + 50}px`;
  }
  
  let content = '';
  
  if (section === 'help') {
    content = `
      <h2>Central de Ajuda</h2>
      <p>Bem-vindo à Central de Ajuda do Filesfy. Aqui você encontra tudo o que precisa para recuperar seus dados com segurança.</p>
      
      <h3>Primeiros Passos</h3>
      <ul>
        <li>Conecte o dispositivo do qual deseja recuperar dados</li>
        <li>Escolha o tipo de arquivo que deseja recuperar (imagens, documentos, vídeos, etc.)</li>
        <li>Aguarde a conclusão do scan</li>
        <li>Selecione os arquivos encontrados e clique em "Recuperar"</li>
      </ul>
      
      <h3>Tutoriais Disponíveis</h3>
      <ul>
        <li>Como recuperar fotos deletadas do celular</li>
        <li>Recuperação de documentos do pen drive</li>
        <li>Restaurar vídeos de cartão SD formatado</li>
        <li>Recuperar arquivos de HD externo danificado</li>
      </ul>
      
      <h3>Melhores Práticas</h3>
      <ul>
        <li>Pare de usar o dispositivo imediatamente após perder os dados</li>
        <li>Não formate o dispositivo antes de tentar recuperar</li>
        <li>Use o Filesfy o quanto antes para aumentar as chances de sucesso</li>
        <li>Mantenha backups regulares para prevenir perdas futuras</li>
      </ul>
    `;
  } else if (section === 'faq') {
    content = `
      <h2>FAQ - Perguntas Frequentes</h2>
      <p>Respostas para as perguntas mais comuns sobre o Filesfy.</p>
      
      <h3>Quanto tempo demora a recuperação?</h3>
      <p>Depende do tamanho do dispositivo, geralmente entre 5 minutos a 2 horas.</p>
      
      <h3>É seguro recuperar meus dados?</h3>
      <p>Sim, usamos criptografia de ponta a ponta e nunca armazenamos seus dados.</p>
      
      <h3>Qual é a taxa de sucesso?</h3>
      <p>Nossa taxa de sucesso é superior a 85% para dispositivos com danos lógicos.</p>
      
      <h3>Posso recuperar dados de múltiplos dispositivos?</h3>
      <p>Sim, o plano PRO permite até 50 arquivos por scan.</p>
      
      <h3>Meus dados são privados?</h3>
      <p>Todos os dados são processados localmente e nunca são enviados para servidores.</p>
      
      <h3>Quais tipos de arquivo posso recuperar?</h3>
      <p>Suportamos imagens (JPG, PNG, GIF), documentos (PDF, DOC, XLS), vídeos (MP4, AVI, MOV), áudios (MP3, WAV) e muitos outros formatos.</p>
      
      <h3>O que acontece se eu cancelar minha assinatura?</h3>
      <p>Você manterá acesso aos recursos PRO até o final do período pago, depois voltará ao plano FREE.</p>
      
      <h3>Posso usar o Filesfy offline?</h3>
      <p>Sim, a recuperação de dados funciona completamente offline. Apenas o login e pagamento requerem conexão.</p>
    `;
  } else if (section === 'contact') {
    content = `
      <h2>Contato</h2>
      <p>Entre em contato com nossa equipe de suporte. Estamos aqui para ajudar!</p>
      
      <h3>Informações de Contato</h3>
      <p><strong>Email:</strong> <a href="mailto:suporte@filesfy.com">suporte@filesfy.com</a></p>
      <p><strong>Email Comercial:</strong> <a href="mailto:comercial@filesfy.com">comercial@filesfy.com</a></p>
      <p><strong>Email Técnico:</strong> <a href="mailto:tech@filesfy.com">tech@filesfy.com</a></p>
      
      <h3>Horário de Atendimento</h3>
      <p><strong>Segunda a Sexta:</strong> 9h às 18h (Horário de Brasília)</p>
      <p><strong>Sábados:</strong> 9h às 13h (Horário de Brasília)</p>
      <p><strong>Domingos e Feriados:</strong> Fechado</p>
      
      <h3>Tempo de Resposta</h3>
      <p><strong>Plano FREE:</strong> Até 48 horas úteis</p>
      <p><strong>Plano PRO:</strong> Até 24 horas (suporte prioritário)</p>
      
      <h3>Redes Sociais</h3>
      <p>Siga-nos para novidades e dicas:</p>
      <ul>
        <li>Twitter: @filesfy</li>
        <li>Instagram: @filesfy_oficial</li>
        <li>LinkedIn: Filesfy Inc.</li>
        <li>YouTube: Filesfy Tutoriais</li>
      </ul>
    `;
  }
  
  modalBody.innerHTML = content;
  modal.showModal();
}

function openLegalModal(section) {
  const modal = document.getElementById('modal-dialog');
  const modalBody = document.getElementById('modal-body');
  
  let content = '';
  
  if (section === 'privacy') {
    content = `
      <h2>Política de Privacidade</h2>
      <p><strong>Última atualização: 08 de fevereiro de 2026</strong></p>
      
      <h3>1. Introdução</h3>
      <p>A Filesfy Inc. ("nós", "nosso" ou "Filesfy") respeita sua privacidade e está comprometida em proteger seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD). Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações.</p>
      
      <h3>2. Base Legal e Finalidade do Tratamento</h3>
      <p>Coletamos e tratamos seus dados pessoais com base nas seguintes hipóteses legais:</p>
      <ul>
        <li><strong>Consentimento:</strong> Para envio de comunicações de marketing e newsletters</li>
        <li><strong>Execução de Contrato:</strong> Para fornecimento dos serviços de recuperação de dados</li>
        <li><strong>Obrigação Legal:</strong> Para cumprimento de obrigações fiscais e regulatórias</li>
        <li><strong>Legítimo Interesse:</strong> Para melhoria dos serviços e segurança da plataforma</li>
      </ul>
      
      <h3>3. Dados Pessoais Coletados</h3>
      <ul>
        <li><strong>Dados de Identificação:</strong> Nome completo, endereço de e-mail, telefone</li>
        <li><strong>Dados de Autenticação:</strong> Credenciais de login, senha criptografada (hash SHA-256)</li>
        <li><strong>Dados de Pagamento:</strong> Informações de cartão de crédito (processadas via Stripe - não armazenamos dados de cartão)</li>
        <li><strong>Dados de Navegação:</strong> Endereço IP, tipo de navegador, sistema operacional, cookies</li>
        <li><strong>Dados de Uso:</strong> Histórico de scans, tipos de arquivos recuperados, plano contratado</li>
        <li><strong>Dados de Dispositivo:</strong> Identificadores de dispositivo, modelo, versão do sistema</li>
      </ul>
      
      <h3>4. Finalidades do Tratamento</h3>
      <p>Utilizamos seus dados pessoais para:</p>
      <ul>
        <li>Criar e gerenciar sua conta de usuário</li>
        <li>Fornecer os serviços de recuperação de dados contratados</li>
        <li>Processar pagamentos e emitir notas fiscais</li>
        <li>Enviar comunicações sobre atualizações, novos recursos e ofertas (com consentimento)</li>
        <li>Prestar suporte técnico e atendimento ao cliente</li>
        <li>Melhorar nossos serviços através de análises e estatísticas</li>
        <li>Garantir a segurança e prevenir fraudes</li>
        <li>Cumprir obrigações legais e regulatórias</li>
      </ul>
      
      <h3>5. Compartilhamento de Dados</h3>
      <p>Seus dados pessoais podem ser compartilhados com:</p>
      <ul>
        <li><strong>Processadores de Pagamento:</strong> Stripe (para processamento de transações)</li>
        <li><strong>Provedores de Infraestrutura:</strong> Serviços de hospedagem e armazenamento em nuvem</li>
        <li><strong>Ferramentas de Análise:</strong> Google Analytics (dados anonimizados)</li>
        <li><strong>Autoridades Competentes:</strong> Quando exigido por lei ou ordem judicial</li>
      </ul>
      <p>Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros.</p>
      
      <h3>6. Segurança e Armazenamento</h3>
      <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
      <ul>
        <li>Criptografia SSL/TLS para transmissão de dados</li>
        <li>Criptografia AES-256 para dados em repouso</li>
        <li>Controles de acesso baseados em função (RBAC)</li>
        <li>Monitoramento contínuo de segurança</li>
        <li>Backups regulares e redundância de dados</li>
      </ul>
      <p><strong>Retenção:</strong> Mantemos seus dados pelo período necessário para cumprir as finalidades descritas ou conforme exigido por lei (mínimo de 5 anos para dados fiscais).</p>
      
      <h3>7. Seus Direitos (Art. 18 da LGPD)</h3>
      <p>Você possui os seguintes direitos sobre seus dados pessoais:</p>
      <ul>
        <li><strong>Confirmação e Acesso:</strong> Confirmar a existência de tratamento e acessar seus dados</li>
        <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
        <li><strong>Anonimização ou Bloqueio:</strong> Solicitar anonimização ou bloqueio de dados desnecessários</li>
        <li><strong>Eliminação:</strong> Solicitar exclusão de dados tratados com consentimento</li>
        <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado e interoperável</li>
        <li><strong>Informação sobre Compartilhamento:</strong> Saber com quem compartilhamos seus dados</li>
        <li><strong>Revogação do Consentimento:</strong> Revogar consentimento a qualquer momento</li>
        <li><strong>Oposição:</strong> Opor-se ao tratamento em determinadas situações</li>
      </ul>
      <p>Para exercer seus direitos, entre em contato através de <strong>privacidade@filesfy.com</strong> ou <strong>dpo@filesfy.com</strong>.</p>
      
      <h3>8. Cookies e Tecnologias Similares</h3>
      <p>Utilizamos cookies essenciais, funcionais e analíticos. Você pode gerenciar suas preferências nas configurações do navegador. Consulte nossa Política de Cookies para mais detalhes.</p>
      
      <h3>9. Transferência Internacional de Dados</h3>
      <p>Alguns de nossos provedores de serviços podem estar localizados fora do Brasil. Garantimos que tais transferências ocorram apenas com salvaguardas adequadas conforme exigido pela LGPD.</p>
      
      <h3>10. Alterações nesta Política</h3>
      <p>Podemos atualizar esta Política periodicamente. Notificaremos sobre mudanças significativas por e-mail ou através da plataforma.</p>
      
      <h3>11. Encarregado de Proteção de Dados (DPO)</h3>
      <p><strong>Nome:</strong> Departamento de Privacidade Filesfy<br>
      <strong>E-mail:</strong> dpo@filesfy.com<br>
      <strong>Endereço:</strong> Av. Paulista, 1000 - São Paulo/SP</p>
      
      <h3>12. Autoridade Nacional de Proteção de Dados (ANPD)</h3>
      <p>Você pode apresentar reclamações à ANPD em <a href="https://www.gov.br/anpd" target="_blank">www.gov.br/anpd</a></p>
    `;
  } else if (section === 'license') {
    content = `
      <h2>Contrato de Licença de Uso</h2>
      <p><strong>Última atualização: 08 de fevereiro de 2026</strong></p>
      
      <h3>1. Outorga de Licença</h3>
      <p>A Filesfy Inc. ("Licenciante") concede a você ("Licenciado") uma licença pessoal, intransferível, não exclusiva e revogável para utilizar o software Filesfy ("Software") conforme os termos deste contrato.</p>
      
      <h3>2. Escopo da Licença</h3>
      <p><strong>Plano FREE:</strong></p>
      <ul>
        <li>Recuperação de até 5 arquivos por sessão</li>
        <li>Limite de 300MB por scan</li>
        <li>Uso em 1 dispositivo</li>
        <li>Funcionalidades básicas de recuperação</li>
      </ul>
      <p><strong>Plano PRO (Licença Paga):</strong></p>
      <ul>
        <li>Recuperação ilimitada de arquivos</li>
        <li>Limite de 128GB por scan</li>
        <li>Uso em até 3 dispositivos</li>
        <li>Suporte prioritário</li>
        <li>Atualizações gratuitas durante vigência da licença</li>
      </ul>
      
      <h3>3. Restrições de Uso</h3>
      <p>O Licenciado NÃO está autorizado a:</p>
      <ul>
        <li>Fazer engenharia reversa, descompilar ou desmontar o Software</li>
        <li>Remover, alterar ou ocultar avisos de direitos autorais</li>
        <li>Redistribuir, sublicenciar, vender ou alugar o Software</li>
        <li>Usar o Software para fins ilegais ou não autorizados</li>
        <li>Compartilhar credenciais de acesso com terceiros</li>
        <li>Usar o Software em mais dispositivos que o permitido pela licença</li>
      </ul>
      
      <h3>4. Propriedade Intelectual</h3>
      <p>O Software e todos os direitos de propriedade intelectual associados permanecem propriedade exclusiva da Filesfy Inc. Esta licença não transfere qualquer direito de propriedade sobre o Software.</p>
      
      <h3>5. Vigência e Renovação</h3>
      <ul>
        <li><strong>Plano FREE:</strong> Vigência indeterminada, podendo ser revogada a qualquer momento</li>
        <li><strong>Plano PRO:</strong> Vigência de 12 meses, com renovação automática salvo cancelamento prévio de 7 dias</li>
      </ul>
      
      <h3>6. Garantia e Limitação de Responsabilidade</h3>
      <p><strong>Isenção de Garantias:</strong> O Software é fornecido "no estado em que se encontra" (AS IS), sem garantias expressas ou implícitas. A Filesfy não garante que:</p>
      <ul>
        <li>O Software recuperará 100% dos arquivos em todos os casos</li>
        <li>O Software será livre de erros ou interrupções</li>
        <li>Os resultados atenderão a requisitos específicos do Licenciado</li>
      </ul>
      <p><strong>Limitação de Responsabilidade:</strong> Em nenhuma hipótese a Filesfy será responsável por danos indiretos, incidentais, especiais ou consequentes, incluindo perda de dados, lucros cessantes ou interrupção de negócios, mesmo que advertida sobre a possibilidade de tais danos. A responsabilidade total da Filesfy está limitada ao valor pago pelo Licenciado nos últimos 12 meses.</p>
      
      <h3>7. Rescisão</h3>
      <p>A licença pode ser rescindida:</p>
      <ul>
        <li>Pelo Licenciado a qualquer momento, mediante cancelamento da conta</li>
        <li>Pela Filesfy em caso de violação deste contrato</li>
        <li>Automaticamente em caso de inadimplência por mais de 30 dias</li>
      </ul>
      <p>Após rescisão, o Licenciado deve cessar todo uso do Software e pode solicitar exclusão de seus dados.</p>
      
      <h3>8. Atualizações e Suporte</h3>
      <ul>
        <li>Atualizações de segurança e correções de bugs: gratuitas para todos os usuários</li>
        <li>Novas funcionalidades: podem requerer upgrade de plano</li>
        <li>Suporte técnico: via e-mail para FREE, prioritário para PRO</li>
      </ul>
      
      <h3>9. Lei Aplicável e Foro</h3>
      <p>Este contrato é regido pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias.</p>
      
      <h3>10. Contato</h3>
      <p><strong>E-mail:</strong> licenca@filesfy.com<br>
      <strong>Suporte:</strong> suporte@filesfy.com</p>
    `;
  } else if (section === 'terms') {
    content = `
      <h2>Termos e Condições de Uso</h2>
      <p><strong>Última atualização: 08 de fevereiro de 2026</strong></p>
      
      <h3>1. Aceitação dos Termos</h3>
      <p>Ao acessar e utilizar a plataforma Filesfy, você concorda integralmente com estes Termos e Condições. Se não concordar, não utilize nossos serviços.</p>
      
      <h3>2. Descrição do Serviço</h3>
      <p>A Filesfy oferece soluções de recuperação de dados para arquivos deletados, corrompidos ou perdidos em dispositivos de armazenamento. O serviço está disponível em versões web e desktop.</p>
      
      <h3>3. Cadastro e Conta de Usuário</h3>
      <ul>
        <li>Você deve fornecer informações verdadeiras e atualizadas</li>
        <li>É responsável pela confidencialidade de suas credenciais</li>
        <li>Deve ter pelo menos 18 anos ou consentimento dos pais/responsáveis</li>
        <li>Uma conta por pessoa/empresa (exceto planos corporativos)</li>
        <li>Notifique-nos imediatamente sobre uso não autorizado</li>
      </ul>
      
      <h3>4. Planos e Pagamentos</h3>
      <p><strong>Plano FREE:</strong> Gratuito, com funcionalidades limitadas<br>
      <strong>Plano PRO:</strong> R$ 99,90/ano - acesso completo</p>
      <ul>
        <li>Pagamentos via cartão de crédito ou PIX</li>
        <li>Cobrança antecipada no início de cada período</li>
        <li>Renovação automática salvo cancelamento</li>
        <li>Impostos inclusos no preço exibido</li>
        <li>Reembolso disponível em até 7 dias da compra inicial (sujeito a análise)</li>
      </ul>
      
      <h3>5. Uso Aceitável</h3>
      <p><strong>Você concorda em NÃO:</strong></p>
      <ul>
        <li>Usar o serviço para fins ilegais ou não autorizados</li>
        <li>Tentar obter acesso não autorizado aos sistemas</li>
        <li>Interferir ou interromper o funcionamento do serviço</li>
        <li>Fazer engenharia reversa do software</li>
        <li>Coletar dados de outros usuários sem consentimento</li>
        <li>Transmitir malware, vírus ou código malicioso</li>
        <li>Criar múltiplas contas para burlar limites</li>
      </ul>
      
      <h3>6. Limitações do Serviço</h3>
      <ul>
        <li>A recuperação de dados depende de fatores técnicos e pode não ser bem-sucedida em todos os casos</li>
        <li>Não garantimos recuperação de 100% dos arquivos</li>
        <li>Sobrescritas de dados podem impossibilitar a recuperação</li>
        <li>Requisitos mínimos de sistema devem ser atendidos</li>
      </ul>
      
      <h3>7. Cancelamento e Reembolso</h3>
      <ul>
        <li>Você pode cancelar sua assinatura a qualquer momento pelo painel de controle</li>
        <li>Cancelamentos terão efeito ao final do período pago</li>
        <li>Reembolsos: disponíveis em até 7 dias da primeira compra, proporcional ao uso</li>
        <li>Não há reembolso para renovações automáticas não canceladas</li>
      </ul>
      
      <h3>8. Suspensão e Encerramento</h3>
      <p>Podemos suspender ou encerrar sua conta imediatamente em caso de:</p>
      <ul>
        <li>Violação destes Termos</li>
        <li>Atividade fraudulenta ou ilegal</li>
        <li>Inadimplência por mais de 15 dias</li>
        <li>Solicitação sua de exclusão de conta</li>
      </ul>
      
      <h3>9. Propriedade Intelectual</h3>
      <p>Todo conteúdo da Filesfy (logotipos, textos, gráficos, software) é protegido por direitos autorais e marcas registradas. Uso não autorizado é proibido.</p>
      
      <h3>10. Privacidade e Proteção de Dados</h3>
      <p>Coletamos e processamos dados conforme nossa Política de Privacidade, em conformidade com a LGPD (Lei nº 13.709/2018).</p>
      
      <h3>11. Modificações nos Termos</h3>
      <p>Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas com 30 dias de antecedência. O uso continuado após alterações constitui aceitação.</p>
      
      <h3>12. Isenção de Responsabilidade</h3>
      <p>O serviço é fornecido "no estado em que se encontra". Não nos responsabilizamos por:</p>
      <ul>
        <li>Perda de dados durante o processo de recuperação</li>
        <li>Incompatibilidade com hardware/software específicos</li>
        <li>Interrupções de serviço por manutenção ou causas externas</li>
        <li>Danos indiretos ou consequentes do uso do serviço</li>
      </ul>
      
      <h3>13. Lei Aplicável e Resolução de Disputas</h3>
      <p>Estes Termos são regidos pelas leis brasileiras. Tentativas de resolução amigável devem preceder ações judiciais. Foro: Comarca de São Paulo/SP.</p>
      
      <h3>14. Contato</h3>
      <p><strong>Suporte:</strong> suporte@filesfy.com<br>
      <strong>Jurídico:</strong> legal@filesfy.com<br>
      <strong>DPO:</strong> dpo@filesfy.com</p>
    `;
  }
  
  modalBody.innerHTML = content;
  modal.showModal();
}

function openAboutModal() {
  const modal = document.getElementById('modal-dialog');
  const modalBody = document.getElementById('modal-body');
  
  let content = `
    <h2>Sobre Filesfy</h2>
    <p><strong>Versão:</strong> 1.0.0</p>
    
    <h3>Quem Somos</h3>
    <p>A Filesfy Inc. é uma empresa especializada em soluções de recuperação de dados para o mercado brasileiro. Nosso objetivo é fornecer ferramentas seguras e confiáveis para recuperar arquivos deletados ou perdidos.</p>
    
    <h3>Nossa Missão</h3>
    <p>Recuperar dados com segurança, privacidade e eficiência, mantendo os mais altos padrões de conformidade com a LGPD.</p>
    
    <h3>Funcionalidades</h3>
    <ul>
      <li>Recuperação de múltiplos tipos de arquivo</li>
      <li>Suporte a múltiplos dispositivos de armazenamento</li>
      <li>Planos FREE e PRO com diferentes funcionalidades</li>
      <li>Autenticação segura com Google OAuth</li>
      <li>Sistema de pagamento integrado via Stripe</li>
      <li>Suporte técnico especializado</li>
    </ul>
    
    <h3>Contato</h3>
    <p><strong>E-mail:</strong> contato@filesfy.com<br>
    <strong>Suporte:</strong> suporte@filesfy.com<br>
    <strong>DPO:</strong> dpo@filesfy.com</p>
    
    <p><strong>© 2026 Filesfy Inc. Todos os direitos reservados.</strong></p>
  `;
  
  modalBody.innerHTML = content;
  modal.showModal();
}

// ==================== AUTENTICAÇÃO GOOGLE ====================
function renderGoogleAuthPage(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Entrar com Google</h2>
        <p style="color: #666; margin-bottom: 25px;">Escolha como deseja continuar:</p>
        
        <button class="btn-primary" style="width: 100%; margin-bottom: 15px; padding: 12px;" onclick="handleGoogleLogin()">
          <span style="font-size: 18px; margin-right: 8px;">🔐</span> Entrar com Conta Google
        </button>
        
        <div style="text-align: center; margin: 20px 0;">
          <p style="color: #999;">ou</p>
        </div>
        
        <button class="btn-secondary" style="width: 100%; padding: 12px;" onclick="createTestUser()">
          <span style="font-size: 18px; margin-right: 8px;">👤</span> Usuário de Teste
        </button>
        
        <button class="btn-secondary" style="width: 100%; margin-top: 15px; padding: 12px;" onclick="renderWizard('subscription')">
          Voltar aos Planos
        </button>
      </div>
    </div>
  `;
}

function handleGoogleLogin() {
  currentUser = {
    id: 'google-' + Math.random().toString(36).substring(7),
    name: 'Usuário Google',
    email: 'user@gmail.com',
    createdAt: new Date().toISOString(),
    paymentConfirmed: false
  };
  
  localStorage.setItem('filesfy-user', JSON.stringify(currentUser));
  showPaymentPage();
}

function createTestUser() {
  currentUser = {
    id: 'test-' + Date.now(),
    name: 'Usuário Teste',
    email: `test-${Date.now()}@filesfy.dev`,
    createdAt: new Date().toISOString(),
    paymentConfirmed: false
  };
  
  localStorage.setItem('filesfy-user', JSON.stringify(currentUser));
  showPaymentPage();
}

// ==================== NOVA TELA DE LOGIN COM GOOGLE ====================
function renderLoginPageNew(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: var(--color-text-primary); font-weight: 600; margin-bottom: 10px; font-size: 28px;">Bem-vindo ao Filesfy</h2>
          <p style="color: var(--color-text-secondary); margin: 0; font-size: 15px;">Faça login para continuar</p>
        </div>
        
        <div id="g_id_onload"
          data-client_id="USE_YOUR_GOOGLE_CLIENT_ID_FROM_CONSOLE.apps.googleusercontent.com"
          data-context="signin"
          data-ux_mode="popup"
          data-callback="handleGoogleCallback"
          data-auto_prompt="false">
        </div>

        <button class="google-signin-btn" id="google-signin-custom">
          <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continuar com o Google</span>
        </button>

        <div style="text-align: center; margin: 20px 0;">
          <span style="color: var(--color-text-tertiary); font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">ou</span>
        </div>

        <button class="btn-test-login" id="test-login-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Entrar como Usuário Teste</span>
        </button>
        
        <button class="btn-voltar" onclick="renderWizard('subscription'); return false;">Voltar</button>
      </div>
    </div>
  `;

  // Inicializar Google Sign-In após renderizar
  setTimeout(() => {
    initializeGoogleSignIn();
    initializeTestLogin();
  }, 100);
}

/**
 * Inicializa o botão de login de teste
 */
function initializeTestLogin() {
  const button = document.getElementById('test-login-btn');
  if (button) {
    button.addEventListener('click', async () => {
      try {
        const result = await auth.testLogin('teste@filesfy.com', 'Usuário Teste');
        
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        if (result.subscription) {
          localStorage.setItem('subscription', JSON.stringify(result.subscription));
        }
        
        currentUser = result.user;
        currentUser.subscription = result.subscription;
        isAuthenticated = true;
        
        updateAuthUI();
        
        // Redireciona para pagamento do plano PRO
        selectedPaymentPlanId = 'pro';
        showPaymentPage();
        showSuccess('Login de teste realizado com sucesso!');
      } catch (error) {
        console.error('Erro no login de teste:', error);
        showError('Erro ao fazer login de teste: ' + error.message);
      }
    });
  }
}

/**
 * Inicializa o botão do Google Sign-In
 */
function initializeGoogleSignIn() {
  const button = document.getElementById('google-signin-custom');
  if (button) {
    button.addEventListener('click', () => {
      // Trigger Google Sign-In
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: 'USE_YOUR_GOOGLE_CLIENT_ID_FROM_CONSOLE.apps.googleusercontent.com',
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.prompt();
      } else {
        console.error('Google Sign-In API não carregada');
        showError('Erro ao carregar Google Sign-In. Tente novamente.');
      }
    });
  }
}

/**
 * Callback do Google Sign-In (chamado globalmente)
 */
window.handleGoogleCallback = async function(response) {
  if (response.credential) {
    try {
      const result = await auth.googleLogin(response.credential);
      
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      if (result.subscription) {
        localStorage.setItem('subscription', JSON.stringify(result.subscription));
      }
      
      currentUser = result.user;
      currentUser.subscription = result.subscription;
      isAuthenticated = true;
      
      updateAuthUI();
      renderWizard('home');
      showSuccess('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro no Google Login:', error);
      showError('Erro ao fazer login com Google: ' + error.message);
    }
  }
};
