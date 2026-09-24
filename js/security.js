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

  renderAlerts();
})();

function renderAlerts() {
  const tableBody = document.getElementById('alertsTableBody');
  if (!tableBody) return;

  const alerts = getAlerts();
  tableBody.innerHTML = alerts
    .map(
      (alert) => `
        <tr>
          <td>${alert.severity}</td>
          <td>${alert.user}</td>
          <td>${alert.time}</td>
          <td>${alert.event}</td>
          <td>${alert.actionTaken}</td>
          <td>
            <select data-alert-id="${alert.id}" class="alert-status-select">
              <option value="New" ${alert.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Investigating" ${alert.status === 'Investigating' ? 'selected' : ''}>Investigating</option>
              <option value="Resolved" ${alert.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            </select>
          </td>
        </tr>
      `
    )
    .join('');

  document.querySelectorAll('.alert-status-select').forEach((select) => {
    select.addEventListener('change', () => {
      const alertId = Number(select.getAttribute('data-alert-id'));
      updateAlertStatus(alertId, select.value);
    });
  });
}

function updateAlertStatus(alertId, newStatus) {
  const alerts = getAlerts();
  const target = alerts.find((alert) => alert.id === alertId);
  if (!target) return;

  target.status = newStatus;
  saveAlerts(alerts);
  renderAlerts();
}
