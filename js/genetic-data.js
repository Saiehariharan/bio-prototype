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

  renderRecords();
})();

function renderRecords() {
  const records = getPatientRecords();
  const container = document.getElementById('recordsGrid');
  if (!container) return;

  container.innerHTML = records
    .map(
      (record, index) => {
        const canView = canUserViewRecord(record.patientId);
        const sequence = canView ? record.dna : '****************';
        const encryptedState = canView ? '' : 'encrypted';
        const accessText = canView ? 'View Genetic Data' : 'Access Denied';
        const alertMessage = canView ? 'Protected Genetic Data' : 'Unauthorized access attempt logged';

        return `
          <article class="record-card glass">
            <div class="record-top">
              <div class="record-id">${record.patientId}</div>
              <span class="access-badge ${canView ? 'public' : 'restricted'}">${canView ? 'Authorized' : 'Restricted'}</span>
            </div>
            <div class="info-row"><span>Sample ID</span><strong>${record.sampleId}</strong></div>
            <div class="info-row"><span>Patient</span><strong>${record.name}</strong></div>
            <div class="sequence-box ${encryptedState}">${sequence}</div>
            <small>${alertMessage}</small>
            <div class="record-actions">
              <button class="btn btn-primary" data-record-index="${index}">${accessText}</button>
            </div>
          </article>
        `;
      }
    )
    .join('');

  document.querySelectorAll('[data-record-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.getAttribute('data-record-index'));
      handleRecordAccess(index);
    });
  });
}

function canUserViewRecord(patientId) {
  const user = getCurrentUser();
  if (!user) return false;

  if (user.role === 'Admin') return true;
  if (user.role === 'Doctor') return true;
  if (user.role === 'Researcher') return false;
  if (user.role === 'Patient') return user.userId === 'PAT001' && patientId === 'P001';

  return false;
}

function handleRecordAccess(index) {
  const records = getPatientRecords();
  const record = records[index];
  const currentUser = getCurrentUser();

  if (!record || !currentUser) return;

  if (currentUser.role === 'Researcher') {
    addAuditEntry({
      user: currentUser.userId,
      role: currentUser.role,
      action: 'Genetic Data Access Denied',
      resource: record.patientId,
      status: 'Blocked'
    });
    generateAlert({
      user: currentUser.userId,
      event: 'Unauthorized Genetic Data Request',
      severity: '⚠',
      actionTaken: 'Access Denied',
      status: 'New'
    });
    alert('Access Denied');
    return;
  }

  if (currentUser.role === 'Patient' && currentUser.userId !== 'PAT001') {
    addAuditEntry({
      user: currentUser.userId,
      role: currentUser.role,
      action: 'Genetic Data Access Denied',
      resource: record.patientId,
      status: 'Blocked'
    });
    alert('Access Denied');
    return;
  }

  // Demonstrates a protected genetic record being revealed only after access is allowed.
  const accessEvents = getAccessEvents();
  accessEvents.unshift({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    user: currentUser.userId,
    role: currentUser.role,
    action: `Viewed ${record.patientId}`,
    status: 'Normal'
  });
  saveAccessEvents(accessEvents.slice(0, 20));

  addAuditEntry({
    user: currentUser.userId,
    role: currentUser.role,
    action: 'Genetic Data Viewed',
    resource: record.patientId,
    status: 'Normal'
  });

  alert(`Access Granted\nPatient ID: ${record.patientId}\nDNA Sequence: ${record.dna}`);
  renderRecords();
}
