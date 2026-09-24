// Shared storage helpers for the GeneGuard demo.
// This keeps the experience local-only and easy to understand for a prototype.

const STORAGE_KEYS = {
  users: 'geneguard_users',
  currentUser: 'geneguard_current_user',
  alerts: 'geneguard_alerts',
  auditLogs: 'geneguard_audit_logs',
  consent: 'geneguard_consent',
  failedAttempts: 'geneguard_failed_attempts',
  accessEvents: 'geneguard_access_events',
  suspiciousEvents: 'geneguard_suspicious_events'
};

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function getUsers() {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEYS.users), null);
  if (parsed) {
    return parsed;
  }

  const defaultUsers = [
    {
      userId: 'ADMIN001',
      name: 'Admin Demo',
      password: 'Admin@123',
      role: 'Admin',
      status: 'Active',
      lastActivity: 'Just now',
      blocked: false
    },
    {
      userId: 'DOC001',
      name: 'Dr. Demo',
      password: 'Doctor@123',
      role: 'Doctor',
      status: 'Active',
      lastActivity: 'Just now',
      blocked: false
    },
    {
      userId: 'RES001',
      name: 'Research Demo',
      password: 'Research@123',
      role: 'Researcher',
      status: 'Active',
      lastActivity: 'Just now',
      blocked: false
    },
    {
      userId: 'PAT001',
      name: 'Patient Demo',
      password: 'Patient@123',
      role: 'Patient',
      status: 'Active',
      lastActivity: 'Just now',
      blocked: false
    }
  ];

  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getCurrentUser() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.currentUser), null);
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

function getAlerts() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.alerts), [
    {
      id: 1,
      severity: '🚨',
      user: 'DOC001',
      time: '10:37 AM',
      event: 'Suspicious Data Access',
      actionTaken: 'Access Restricted',
      status: 'New'
    },
    {
      id: 2,
      severity: '⚠',
      user: 'UNKNOWN',
      time: '09:40 AM',
      event: 'Multiple Failed Login Attempts',
      actionTaken: 'Temporary Block',
      status: 'Investigating'
    },
    {
      id: 3,
      severity: '🚨',
      user: 'RES001',
      time: '08:20 AM',
      event: 'Unusual Download Activity',
      actionTaken: 'Download Restricted',
      status: 'Resolved'
    },
    {
      id: 4,
      severity: '⚠',
      user: 'PAT001',
      time: '07:55 AM',
      event: 'Unauthorized Genetic Data Request',
      actionTaken: 'Access Denied',
      status: 'New'
    }
  ]);
}

function saveAlerts(alerts) {
  localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(alerts));
}

function getAuditLogs() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.auditLogs), [
    {
      timestamp: '2026-09-24 10:30 AM',
      user: 'DOC001',
      role: 'Doctor',
      action: 'User Login',
      resource: 'Portal',
      status: 'Normal'
    },
    {
      timestamp: '2026-09-24 10:35 AM',
      user: 'DOC001',
      role: 'Doctor',
      action: 'Genetic Data Viewed',
      resource: 'P001',
      status: 'Normal'
    },
    {
      timestamp: '2026-09-24 10:37 AM',
      user: 'DOC001',
      role: 'Doctor',
      action: 'Suspicious Access',
      resource: '150 Records',
      status: 'Threat'
    },
    {
      timestamp: '2026-09-24 10:37 AM',
      user: 'DOC001',
      role: 'Doctor',
      action: 'Access Restricted',
      resource: 'P001',
      status: 'Blocked'
    }
  ]);
}

function saveAuditLog(entries) {
  localStorage.setItem(STORAGE_KEYS.auditLogs, JSON.stringify(entries));
}

function addAuditEntry({ user, role, action, resource, status }) {
  const logs = getAuditLogs();
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  logs.unshift({
    timestamp,
    user,
    role,
    action,
    resource,
    status
  });

  saveAuditLog(logs);
}

function getConsentSettings() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.consent), {
    doctor: true,
    researcher: true,
    thirdParty: false
  });
}

function saveConsentSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.consent, JSON.stringify(settings));
}

function getFailedAttempts() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.failedAttempts), {});
}

function saveFailedAttempts(data) {
  localStorage.setItem(STORAGE_KEYS.failedAttempts, JSON.stringify(data));
}

function getAccessEvents() {
  return safeParse(localStorage.getItem(STORAGE_KEYS.accessEvents), [
    {
      time: '10:30 AM',
      user: 'DOC001',
      role: 'Doctor',
      action: 'Viewed P001',
      status: 'Normal'
    },
    {
      time: '10:35 AM',
      user: 'DOC001',
      role: 'Doctor',
      action: 'Viewed P002',
      status: 'Normal'
    },
    {
      time: '10:37 AM',
      user: 'DOC001',
      role: 'Doctor',
      action: 'Accessed 150 records',
      status: 'Threat'
    },
    {
      time: '10:37 AM',
      user: 'DOC001',
      role: 'Doctor',
      action: 'Access restricted',
      status: 'Blocked'
    }
  ]);
}

function saveAccessEvents(events) {
  localStorage.setItem(STORAGE_KEYS.accessEvents, JSON.stringify(events));
}

function ensureDemoData() {
  getUsers();
  getAlerts();
  getAuditLogs();
  getConsentSettings();
  getFailedAttempts();
  getAccessEvents();
}

function isValidDemoUser(userId, password, role) {
  const users = getUsers();
  const match = users.find((user) => user.userId === userId && user.password === password && user.role === role);
  return Boolean(match && !match.blocked);
}

function updateUserStatus(userId, status) {
  const users = getUsers();
  const match = users.find((user) => user.userId === userId);
  if (!match) return;
  match.status = status;
  match.lastActivity = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  saveUsers(users);
}

function generateAlert({ user, event, severity = '⚠', actionTaken = 'Action Taken', status = 'New' }) {
  const alerts = getAlerts();
  alerts.unshift({
    id: Date.now(),
    severity,
    user,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    event,
    actionTaken,
    status
  });
  saveAlerts(alerts.slice(0, 20));
}

function isRoleAllowed(role, patientId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  if (currentUser.role === 'Admin') return true;
  if (currentUser.role === 'Doctor') return role === 'Doctor' && currentUser.userId !== 'UNKNOWN';
  if (currentUser.role === 'Researcher') return role === 'Researcher';
  if (currentUser.role === 'Patient') return currentUser.userId === patientId;
  return false;
}

function getPatientRecords() {
  return [
    {
      patientId: 'P001',
      sampleId: 'SAMPLE001',
      dna: 'ATGCGTACGTTAGCCTA',
      name: 'Aster Bloom',
      access: 'Authorized'
    },
    {
      patientId: 'P002',
      sampleId: 'SAMPLE002',
      dna: 'CGTATGCAACGTAGT',
      name: 'Nova Finch',
      access: 'Authorized'
    },
    {
      patientId: 'P003',
      sampleId: 'SAMPLE003',
      dna: 'GCTAACGTAGCTTAC',
      name: 'Kite Rowan',
      access: 'Authorized'
    }
  ];
}

function generateSuspiciousAlert(userId, role, recordCount) {
  generateAlert({
    user: userId,
    event: 'Abnormally high data access detected',
    severity: '🚨',
    actionTaken: 'Access Restricted',
    status: 'New'
  });

  addAuditEntry({
    user: userId,
    role,
    action: 'Suspicious Access',
    resource: `${recordCount} Records`,
    status: 'Threat'
  });

  const events = getAccessEvents();
  events.unshift({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    user: userId,
    role,
    action: `Accessed ${recordCount} records`,
    status: 'Threat'
  });
  saveAccessEvents(events.slice(0, 20));
}

function simulateFailedLoginAttack() {
  const attempts = 5;
  generateAlert({
    user: 'UNKNOWN',
    event: 'Multiple Failed Login Attempts',
    severity: '⚠',
    actionTaken: 'Account Blocked',
    status: 'Investigating'
  });

  addAuditEntry({
    user: 'UNKNOWN',
    role: 'Unknown',
    action: 'Failed Login',
    resource: 'Authentication',
    status: 'Blocked'
  });

  const message = `🚨 MULTIPLE FAILED LOGIN ATTEMPTS\nUser: UNKNOWN\nAttempts: ${attempts}\nStatus: BLOCKED`;
  return message;
}

function ensureInitialStorage() {
  ensureDemoData();
}

ensureInitialStorage();
