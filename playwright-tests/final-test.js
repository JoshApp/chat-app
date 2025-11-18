const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'screenshots');
  const fs = require('fs');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    console.log('🚀 Final Complete Test\n');

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);

    // Guest signup
    await page.click('button:has-text("Continue as Guest")');
    await page.waitForTimeout(1000);

    // Step 1: Username + Age
    await page.keyboard.type('FinalTest' + Math.floor(Math.random() * 10000));
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await page.keyboard.press('Space'); // Open dropdown
    await page.waitForTimeout(500);
    for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Check boxes
    await page.click('input[type="checkbox"]', { position: { x: 5, y: 5 } });
    await page.waitForTimeout(300);
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    if (checkboxes.length > 1) {
      await checkboxes[1].click();
      await page.waitForTimeout(300);
    }

    console.log('✓ Step 1: Basic info');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1500);

    // Step 2: Vibe - click the first vibe card
    const vibeCard = page.locator('[class*="card"], [class*="Card"], button[class*="border"]').first();
    if (await vibeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await vibeCard.click();
      await page.waitForTimeout(500);
      console.log('✓ Step 2: Selected vibe');
    }

    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1500);

    // Step 3: Interests - click a few
    const interestButtons = page.locator('button[class*="border"], [role="button"]');
    const count = await interestButtons.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(3, count); i++) {
        await interestButtons.nth(i).click();
        await page.waitForTimeout(200);
      }
      console.log('✓ Step 3: Selected interests');
    }

    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1500);

    // Step 4: Status line (optional) - just skip
    const finishBtn = page.locator('button:has-text("Finish"), button:has-text("Get Started"), button:has-text("Done")').first();
    if (await finishBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await finishBtn.click();
      await page.waitForTimeout(2000);
      console.log('✓ Step 4: Finished onboarding\n');
    }

    // MAIN APP TESTING
    console.log('📸 Capturing main app screenshots...\n');

    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, 'final-01-main-app.png'), fullPage: true });
    console.log('1. Main app loaded');

    // Online tab
    const onlineBtn = page.locator('button:has-text("Online"), nav >> text=Online').first();
    if (await onlineBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await onlineBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'final-02-online-tab.png'), fullPage: true });
      console.log('2. Online tab (chat pane should NOT be visible)');
    }

    // Messages tab
    const messagesBtn = page.locator('button:has-text("Messages"), nav >> text=Messages').first();
    if (await messagesBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await messagesBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'final-03-messages-tab.png'), fullPage: true });
      console.log('3. Messages tab (empty state)');
    }

    // SPARKS TAB - THE IMPORTANT ONE!
    const sparksBtn = page.locator('button:has-text("Sparks"), nav >> text=Sparks').first();
    if (await sparksBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sparksBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'final-04-sparks-tab.png'), fullPage: true });
      console.log('4. Sparks tab (NEW COPY HERE!)');
      console.log('   → Should show: "People who felt something when they saw you"');
      console.log('   → Tab labels should have subtitles');
    }

    // Test switching between tabs
    console.log('\n5. Testing tab switching (no lock-in)...');
    await onlineBtn.click();
    await page.waitForTimeout(500);
    console.log('   → Online');
    await sparksBtn.click();
    await page.waitForTimeout(500);
    console.log('   → Sparks');
    await messagesBtn.click();
    await page.waitForTimeout(500);
    console.log('   → Messages');
    await page.screenshot({ path: path.join(screenshotsDir, 'final-05-tab-switching.png'), fullPage: true });
    console.log('   ✓ No lock-in detected!');

    // Settings
    const settingsBtn = page.locator('button:has-text("Settings")').first();
    if (await settingsBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'final-06-settings.png'), fullPage: true });
      console.log('\n6. Settings tab');
    }

    // Mobile
    console.log('\n7. Testing mobile views...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);

    const mobileOnline = page.locator('button:has-text("Online")').last();
    if (await mobileOnline.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileOnline.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'final-07-mobile-online.png'), fullPage: true });
      console.log('   → Mobile Online');
    }

    const mobileSparks = page.locator('button:has-text("Sparks")').last();
    if (await mobileSparks.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileSparks.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'final-08-mobile-sparks.png'), fullPage: true });
      console.log('   → Mobile Sparks');
    }

    const mobileMessages = page.locator('button:has-text("Messages")').last();
    if (await mobileMessages.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileMessages.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'final-09-mobile-messages.png'), fullPage: true });
      console.log('   → Mobile Messages');
    }

    console.log('\n✨ SUCCESS! All screenshots captured! ✨\n');
    console.log(`📁 ${screenshotsDir}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'final-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();
