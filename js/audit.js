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

  renderAuditLogs();
})();

function renderAuditLogs() {
  const tableBody = document.getElementById('auditTableBody');
  if (!tableBody) return;

  const logs = getAuditLogs();
  tableBody.innerHTML = logs
    .map(
      (log) => `
        <tr>
          <td>${log.timestamp}</td>
          <td>${log.user}</td>
          <td>${log.role}</td>
          <td>${log.action}</td>
          <td>${log.resource}</td>
          <td><span class="status-badge ${statusClass(log.status)}">${labelFromStatus(log.status)}</span></td>
        </tr>
      `
    )
    .join('');
}
