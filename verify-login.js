const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:8000/login.html');
  await page.fill('#userId', 'ADMIN001');
  await page.fill('#password', 'Admin@123');
  await page.selectOption('#role', 'Admin');
  await page.click('#loginForm button[type="submit"]');

  await page.waitForTimeout(2000);

  const result = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    message: document.getElementById('loginMessage')?.textContent || '',
    current: localStorage.getItem('geneguard_current_user')
  }));

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
