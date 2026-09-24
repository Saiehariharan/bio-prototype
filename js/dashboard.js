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
      addAuditEntry({
        user: currentUser.userId,
        role: currentUser.role,
        action: 'User Logout',
        resource: 'Portal',
        status: 'Normal'
      });
      window.location.href = 'login.html';
    });
  }

  renderStats();
  renderActivityTable();
  renderRoleDashboard();
  renderUsersTable();

  if (currentUser.role === 'Admin') {
    createAdminControls();
  }
})();

function renderStats() {
  const users = getUsers();
  const alerts = getAlerts();
  const accessEvents = getAccessEvents();

  const stats = [
    { label: 'Total Users', value: users.length },
    { label: 'Total Genetic Records', value: 3 },
    { label: 'Normal Access', value: accessEvents.filter((event) => event.status === 'Normal').length },
    { label: 'Suspicious Activities', value: alerts.filter((alert) => alert.event.toLowerCase().includes('suspicious') || alert.event.toLowerCase().includes('multiple') || alert.event.includes('Abnormally')).length },
    { label: 'Blocked Attempts', value: accessEvents.filter((event) => event.status === 'Blocked').length + alerts.filter((alert) => alert.actionTaken.toLowerCase().includes('blocked')).length }
  ];

  const statsGrid = document.getElementById('statsGrid');
  if (!statsGrid) return;

  statsGrid.innerHTML = stats
    .map(
      (item) => `
        <div class="stat-card glass">
          <div class="label">${item.label}</div>
          <div class="value">${item.value}</div>
        </div>
      `
    )
    .join('');
}

function renderActivityTable() {
  const activityTableBody = document.getElementById('activityTableBody');
  if (!activityTableBody) return;

  const events = getAccessEvents();
  activityTableBody.innerHTML = events
    .slice(0, 8)
    .map(
      (event) => `
        <tr>
          <td>${event.time}</td>
          <td>${event.user}</td>
          <td>${event.role}</td>
          <td>${event.action}</td>
          <td><span class="status-badge ${statusClass(event.status)}">${labelFromStatus(event.status)}</span></td>
        </tr>
      `
    )
    .join('');
}

function renderRoleDashboard() {
  const rolePanel = document.getElementById('rolePanel');
  if (!rolePanel) return;

  const currentUser = getCurrentUser();
  if (currentUser.role === 'Admin') {
    rolePanel.innerHTML = `
      <div class="panel-header">
        <h3>Admin Control Center</h3>
      </div>
      <div class="record-actions">
        <button class="btn btn-primary" id="simulateSuspiciousBtn">Simulate Suspicious Activity</button>
        <button class="btn btn-secondary" id="simulateFailedLoginBtn">Simulate Failed Login Attack</button>
      </div>
      <div id="simulatorMessage" class="alert-box warning" style="display:none"></div>
    `;
  } else if (currentUser.role === 'Doctor') {
    rolePanel.innerHTML = `
      <div class="panel-header">
        <h3>Doctor Access</h3>
      </div>
      <p class="card-copy">Authorized patient records are available for review. Clinical access is limited to assigned patient profiles.</p>
    `;
  } else if (currentUser.role === 'Researcher') {
    rolePanel.innerHTML = `
      <div class="panel-header">
        <h3>Research Access</h3>
      </div>
      <p class="card-copy">Only anonymized genetic research datasets are visible. Personally identifiable patient information is hidden.</p>
    `;
  } else {
    rolePanel.innerHTML = `
      <div class="panel-header">
        <h3>Patient Summary</h3>
      </div>
      <p class="card-copy">You can review your own genetic record and manage consent preferences. Data access is visible only to the active patient profile.</p>
    `;
  }

  const suspiciousBtn = document.getElementById('simulateSuspiciousBtn');
  if (suspiciousBtn) {
    suspiciousBtn.addEventListener('click', () => simulateSuspiciousAccess());
  }

  const failedLoginBtn = document.getElementById('simulateFailedLoginBtn');
  if (failedLoginBtn) {
    failedLoginBtn.addEventListener('click', () => {
      const message = simulateFailedLoginAttack();
      const simulatorMessage = document.getElementById('simulatorMessage');
      if (simulatorMessage) {
        simulatorMessage.style.display = 'block';
        simulatorMessage.textContent = message;
      }
    });
  }
}

function renderUsersTable() {
  const tableBody = document.getElementById('usersTableBody');
  if (!tableBody) return;

  const users = getUsers();
  tableBody.innerHTML = users
    .map(
      (user) => `
        <tr>
          <td>${user.userId}</td>
          <td>${user.name}</td>
          <td>${user.role}</td>
          <td><span class="status-badge ${user.blocked ? 'blocked' : 'normal'}">${user.blocked ? 'Blocked' : 'Active'}</span></td>
          <td>${user.lastActivity}</td>
          <td>
            <div class="record-actions">
              <button class="btn btn-secondary" data-action="toggle-user" data-user-id="${user.userId}">${user.blocked ? 'Unblock' : 'Block'}</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');

  const blockButtons = document.querySelectorAll('[data-action="toggle-user"]');
  blockButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetUserId = button.getAttribute('data-user-id');
      toggleUserStatus(targetUserId);
    });
  });
}

function toggleUserStatus(userId) {
  const users = getUsers();
  const match = users.find((user) => user.userId === userId);
  if (!match) return;

  match.blocked = !match.blocked;
  match.status = match.blocked ? 'Blocked' : 'Active';
  match.lastActivity = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  saveUsers(users);

  addAuditEntry({
    user: userId,
    role: match.role,
    action: match.blocked ? 'Account Blocked' : 'Account Unblocked',
    resource: 'User Management',
    status: match.blocked ? 'Blocked' : 'Normal'
  });

  renderUsersTable();
  renderStats();
}

function createAdminControls() {
  const page = document.querySelector('.main-panel');
  if (!page) return;

  const panel = document.getElementById('rolePanel');
  if (!panel) return;
}

function simulateSuspiciousAccess() {
  const currentUser = getCurrentUser();
  const alertBox = document.getElementById('simulatorMessage');
  const message = `🚨 SUSPICIOUS ACTIVITY DETECTED\nUser: DOC001\nRole: Doctor\nRecords Requested: 150\nNormal Average: 5–10\nReason: Abnormally high data access\nAction: Access Restricted`;

  if (alertBox) {
    alertBox.style.display = 'block';
    alertBox.textContent = message;
    alertBox.className = 'alert-box';
  }

  generateSuspiciousAlert('DOC001', 'Doctor', 150);
  addAuditEntry({
    user: 'DOC001',
    role: 'Doctor',
    action: 'Suspicious Access',
    resource: '150 Records',
    status: 'Threat'
  });

  renderStats();
  renderActivityTable();

  if (currentUser && currentUser.role === 'Admin') {
    setTimeout(() => {
      renderStats();
      renderActivityTable();
      if (alertBox) {
        alertBox.textContent = 'Admin alert generated and audit log updated.';
      }
    }, 1200);
  }
}

function labelFromStatus(status) {
  if (status === 'Normal') return 'Normal';
  if (status === 'Warning') return 'Warning';
  if (status === 'Threat') return 'Threat';
  if (status === 'Blocked') return 'Blocked';
  return status;
}

function statusClass(status) {
  if (status === 'Normal') return 'normal';
  if (status === 'Warning') return 'warning';
  if (status === 'Threat' || status === 'Blocked') return 'threat';
  return 'warning';
}
