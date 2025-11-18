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
    console.log('🚀 Starting Simple Navigation Test...\n');

    // Step 1: Go directly to the app page (skip auth for now)
    console.log('1. Loading /app page directly...');
    await page.goto('http://localhost:3000/app');
    await page.waitForTimeout(3000); // Wait for redirects/loading

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    // If we got redirected to login, try with a simple manual setup
    if (currentUrl.includes('localhost:3000/') && !currentUrl.includes('/app')) {
      console.log('   → Redirected to auth, will attempt onboarding...\n');

      // Click Continue as Guest
      const guestButton = page.locator('button:has-text("Continue as Guest")');
      if (await guestButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guestButton.click();
        await page.waitForTimeout(1000);
        console.log('   → Clicked Continue as Guest');
      }

      // Fill username
      const usernameInput = page.locator('input').first();
      if (await usernameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await usernameInput.fill('TestUser' + Math.floor(Math.random() * 10000));
        await page.waitForTimeout(500);
        console.log('   → Filled username');
      }

      // Handle age dropdown - click to open, then select an option
      const ageDropdown = page.locator('button:has-text("Select your age"), [role="combobox"]').first();
      if (await ageDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('   → Opening age dropdown...');
        await ageDropdown.click();
        await page.waitForTimeout(500);

        // Try to click the first age option
        const ageOption = page.locator('[role="option"]').first();
        if (await ageOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await ageOption.click();
          await page.waitForTimeout(500);
          console.log('   → Selected age');
        }
      }

      // Check the age confirmation checkbox
      const ageCheckbox = page.locator('input[type="checkbox"]').first();
      if (await ageCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await ageCheckbox.check();
        await page.waitForTimeout(300);
        console.log('   → Checked age confirmation');
      }

      // Check the terms checkbox
      const termsCheckbox = page.locator('input[type="checkbox"]').nth(1);
      if (await termsCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await termsCheckbox.check();
        await page.waitForTimeout(300);
        console.log('   → Checked terms');
      }

      // Click through onboarding (max 6 steps)
      for (let i = 0; i < 6; i++) {
        const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Get Started"), button:has-text("Finish"), button:has-text("Done")').first();
        if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`   → Clicking next button (attempt ${i + 1})...`);
          await nextBtn.click();
          await page.waitForTimeout(1500);
        } else {
          console.log(`   → No more next buttons found`);
          break;
        }
      }

      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: path.join(screenshotsDir, 'nav-01-current-state.png'), fullPage: true });
    console.log('   ✓ Screenshot saved: nav-01-current-state.png\n');

    // Now try to navigate tabs
    console.log('2. Testing tab navigation...\n');

    // Try Online tab
    const onlineTab = page.locator('button:has-text("Online"), nav button:has-text("Online")').first();
    if (await onlineTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await onlineTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'nav-02-online-tab.png'), fullPage: true });
      console.log('   ✓ Online tab clicked - nav-02-online-tab.png');
      console.log('   ℹ Check: Chat pane should NOT be visible');
    } else {
      console.log('   ⚠ Could not find Online tab');
    }

    // Try Messages tab
    const messagesTab = page.locator('button:has-text("Messages"), nav button:has-text("Messages")').first();
    if (await messagesTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await messagesTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'nav-03-messages-tab.png'), fullPage: true });
      console.log('   ✓ Messages tab clicked - nav-03-messages-tab.png');
    }

    // Try Sparks tab
    const sparksTab = page.locator('button:has-text("Sparks"), nav button:has-text("Sparks")').first();
    if (await sparksTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sparksTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'nav-04-sparks-tab.png'), fullPage: true });
      console.log('   ✓ Sparks tab clicked - nav-04-sparks-tab.png');
      console.log('   ℹ Check: Should show "People who felt something when they saw you"');
      console.log('   ℹ Check: Tab labels should have subtitles');
    }

    // Test tab switching multiple times
    console.log('\n3. Testing rapid tab switching (verify no lock-in)...');
    for (let i = 0; i < 3; i++) {
      await onlineTab.click();
      await page.waitForTimeout(500);
      await sparksTab.click();
      await page.waitForTimeout(500);
      await messagesTab.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(screenshotsDir, 'nav-05-tab-switching.png'), fullPage: true });
    console.log('   ✓ Tabs switched 3 times - no errors! - nav-05-tab-switching.png');

    // Check Settings tab
    const settingsTab = page.locator('button:has-text("Settings")').first();
    if (await settingsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'nav-06-settings-tab.png'), fullPage: true });
      console.log('   ✓ Settings tab clicked - nav-06-settings-tab.png\n');
    }

    // Mobile test
    console.log('4. Testing mobile layout...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);

    // Go back to Online
    const mobileOnlineTab = page.locator('button:has-text("Online"), nav button:has-text("Online")').last();
    if (await mobileOnlineTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileOnlineTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'nav-07-mobile-online.png'), fullPage: true });
      console.log('   ✓ Mobile Online - nav-07-mobile-online.png');
    }

    const mobileSparksTab = page.locator('button:has-text("Sparks"), nav button:has-text("Sparks")').last();
    if (await mobileSparksTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileSparksTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'nav-08-mobile-sparks.png'), fullPage: true });
      console.log('   ✓ Mobile Sparks - nav-08-mobile-sparks.png');
    }

    const mobileMessagesTab = page.locator('button:has-text("Messages"), nav button:has-text("Messages")').last();
    if (await mobileMessagesTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileMessagesTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'nav-09-mobile-messages.png'), fullPage: true });
      console.log('   ✓ Mobile Messages - nav-09-mobile-messages.png\n');
    }

    console.log('✨ Navigation Test Complete! ✨');
    console.log(`\n📸 Screenshots saved to: ${screenshotsDir}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'nav-error.png'), fullPage: true });
    console.log('Error screenshot saved: nav-error.png');
  } finally {
    await browser.close();
  }
})();
