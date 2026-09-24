(function () {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const userBadge = document.getElementById('userBadge');
  if (userBadge) {
    userBadge.textContent = `${currentUser.name || currentUser.userId} · ${currentUser.role}`;
  }

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (mobileMenuBtn && sidebarNav) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebarNav.classList.toggle('open');
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      clearCurrentUser();
      window.location.href = 'login.html';
    });
  }

  renderConsentPanel();
})();

function renderConsentPanel() {
  const consentPanel = document.getElementById('consentPanel');
  if (!consentPanel) return;

  const settings = getConsentSettings();
  consentPanel.innerHTML = `
    <div class="panel-header">
      <h3>My Genetic Data Access</h3>
    </div>
    <div class="consent-list">
      <div class="consent-item">
        <div>
          <strong>Doctor</strong>
          <p>Allowed to access patient records with consent.</p>
        </div>
        <button class="toggle ${settings.doctor ? 'on' : ''}" data-key="doctor" aria-label="Toggle Doctor Access"></button>
      </div>
      <div class="consent-item">
        <div>
          <strong>Researcher</strong>
          <p>Allowed for anonymized research only.</p>
        </div>
        <button class="toggle ${settings.researcher ? 'on' : ''}" data-key="researcher" aria-label="Toggle Research Access"></button>
      </div>
      <div class="consent-item">
        <div>
          <strong>Third-Party Access</strong>
          <p>Denied by default for external requests.</p>
        </div>
        <button class="toggle ${settings.thirdParty ? 'on' : ''}" data-key="thirdParty" aria-label="Toggle Third-Party Access"></button>
      </div>
    </div>
  `;

  document.querySelectorAll('.toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const key = toggle.getAttribute('data-key');
      const settings = getConsentSettings();
      settings[key] = !settings[key];
      saveConsentSettings(settings);
      addAuditEntry({
        user: getCurrentUser()?.userId || 'PAT001',
        role: getCurrentUser()?.role || 'Patient',
        action: 'Consent Updated',
        resource: key,
        status: settings[key] ? 'Normal' : 'Blocked'
      });
      renderConsentPanel();
    });
  });
}
