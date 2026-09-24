(function () {
  const loginForm = document.getElementById('loginForm');
  const messageBox = document.getElementById('loginMessage');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (!loginForm) return;

  // Demo credential rules: any incorrect login increments a failed-attempt counter.
  const failedAttempts = getFailedAttempts();

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      togglePassword.textContent = isHidden ? 'Hide' : 'Show';
    });
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;

    if (!userId || !password || !role) {
      showMessage('Please complete all fields before logging in.', 'error');
      return;
    }

    const users = getUsers();
    const user = users.find((item) => item.userId === userId && item.password === password && item.role === role);

    if (!user) {
      const attempts = failedAttempts[userId] || 0;
      const nextAttempt = attempts + 1;
      failedAttempts[userId] = nextAttempt;
      saveFailedAttempts(failedAttempts);

      addAuditEntry({
        user: userId || 'UNKNOWN',
        role: role || 'Unknown',
        action: 'Failed Login',
        resource: 'Authentication',
        status: 'Blocked'
      });

      if (nextAttempt >= 5) {
        generateAlert({
          user: userId || 'UNKNOWN',
          event: 'Multiple Failed Login Attempts',
          severity: '⚠',
          actionTaken: 'Account Blocked',
          status: 'Investigating'
        });

        showMessage('🚨 Multiple failed login attempts detected. Access blocked for this demo account.', 'warning');
        failedAttempts[userId] = 0;
        saveFailedAttempts(failedAttempts);
        return;
      }

      showMessage(`Invalid credentials. Failed attempt ${nextAttempt} of 5.`, 'error');
      return;
    }

    if (user.blocked) {
      showMessage('This demo account has been temporarily blocked by security policy.', 'warning');
      return;
    }

    // Successful login records the activity and redirects by role.
    user.lastActivity = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    saveUsers(users);
    setCurrentUser({ userId: user.userId, role: user.role, name: user.name });
    addAuditEntry({
      user: user.userId,
      role: user.role,
      action: 'User Login',
      resource: 'Portal',
      status: 'Normal'
    });

    showMessage('Access granted. Redirecting to the secure dashboard...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 700);
  });

  function showMessage(text, type) {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.className = `login-message ${type}`;
  }
})();
