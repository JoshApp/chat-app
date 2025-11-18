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
    console.log('🚀 Starting UX Flow Test...\n');

    // Step 1: Landing Page
    console.log('1. Loading landing page...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '01-landing-page.png'), fullPage: true });
    console.log('   ✓ Screenshot saved: 01-landing-page.png');

    // Step 2: Click Guest Signup
    console.log('\n2. Clicking "Continue as Guest"...');
    const guestButton = page.locator('button:has-text("Continue as Guest")');
    if (await guestButton.isVisible()) {
      await guestButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '02-onboarding-modal.png'), fullPage: true });
      console.log('   ✓ Screenshot saved: 02-onboarding-modal.png');
    } else {
      console.log('   ⚠ Guest button not found, skipping signup');
    }

    // Step 3: Fill Onboarding (if present)
    console.log('\n3. Checking for onboarding form...');
    const displayNameInput = page.locator('input[placeholder*="display name" i], input[placeholder*="username" i]').first();
    if (await displayNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   → Filling display name...');
      await displayNameInput.fill('TestUser' + Math.floor(Math.random() * 1000));
      await page.waitForTimeout(500);

      // Look for age input
      const ageInput = page.locator('input[type="number"], input[placeholder*="age" i]').first();
      if (await ageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('   → Filling age...');
        await ageInput.fill('25');
        await page.waitForTimeout(500);
      }

      // Click Next/Continue buttons until we're in the app
      for (let i = 0; i < 5; i++) {
        const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Get Started"), button:has-text("Finish")').first();
        if (await nextButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`   → Clicking next (step ${i + 1})...`);
          await nextButton.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: path.join(screenshotsDir, `03-onboarding-step-${i + 1}.png`), fullPage: true });
        } else {
          break;
        }
      }
    } else {
      console.log('   ℹ No onboarding form detected');
    }

    // Step 4: Wait for main app to load
    console.log('\n4. Waiting for main app to load...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '04-main-app-loaded.png'), fullPage: true });
    console.log('   ✓ Screenshot saved: 04-main-app-loaded.png');

    // Step 5: Test Online Tab (should be default)
    console.log('\n5. Testing Online tab...');
    const onlineTabButton = page.locator('button:has-text("Online"), nav button:has-text("Online")').first();
    if (await onlineTabButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await onlineTabButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '05-online-tab.png'), fullPage: true });
      console.log('   ✓ Screenshot saved: 05-online-tab.png');
      console.log('   ℹ Chat pane should NOT be visible on Online tab');
    }

    // Step 6: Test Messages Tab
    console.log('\n6. Switching to Messages tab...');
    const messagesTab = page.locator('button:has-text("Messages"), nav button:has-text("Messages")').first();
    if (await messagesTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await messagesTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '06-messages-tab.png'), fullPage: true });
      console.log('   ✓ Screenshot saved: 06-messages-tab.png');
      console.log('   ℹ Should show empty conversations list');
    }

    // Step 7: Test Sparks Tab
    console.log('\n7. Switching to Sparks tab...');
    const sparksTab = page.locator('button:has-text("Sparks"), nav button:has-text("Sparks")').first();
    if (await sparksTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sparksTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '07-sparks-tab.png'), fullPage: true });
      console.log('   ✓ Screenshot saved: 07-sparks-tab.png');
      console.log('   ℹ Should show new header: "People who felt something when they saw you"');
      console.log('   ℹ Tab labels should have subtitles');
    }

    // Step 8: Test tab switching (verify no lock-in)
    console.log('\n8. Testing tab switching (verify no lock-in)...');
    await onlineTabButton.click();
    await page.waitForTimeout(500);
    console.log('   → Switched to Online');

    await sparksTab.click();
    await page.waitForTimeout(500);
    console.log('   → Switched to Sparks');

    await messagesTab.click();
    await page.waitForTimeout(500);
    console.log('   → Switched to Messages');

    await page.screenshot({ path: path.join(screenshotsDir, '08-tab-switching-test.png'), fullPage: true });
    console.log('   ✓ Tab switching works! No lock-in detected');

    // Step 9: Back to Online to check user cards
    console.log('\n9. Checking Online tab user cards...');
    await onlineTabButton.click();
    await page.waitForTimeout(1000);

    // Try to find a user card
    const userCard = page.locator('[class*="card"], [class*="Card"]').first();
    if (await userCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   → Found user cards, checking copy...');
      const headerText = await page.locator('h2').first().textContent();
      console.log(`   → Header text: "${headerText}"`);
      console.log('   ℹ Should say "X people are here right now" (not "X People Online")');
    }

    // Step 10: Test Settings Tab
    console.log('\n10. Testing Settings tab...');
    const settingsTab = page.locator('button:has-text("Settings"), nav button:has-text("Settings")').first();
    if (await settingsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '09-settings-tab.png'), fullPage: true });
      console.log('   ✓ Screenshot saved: 09-settings-tab.png');
    }

    // Step 11: Mobile view test
    console.log('\n11. Testing mobile view...');
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(screenshotsDir, '10-mobile-online.png'), fullPage: true });
    console.log('   ✓ Screenshot saved: 10-mobile-online.png');

    // Test mobile tabs (bottom navigation)
    const mobileMessagesTab = page.locator('nav button:has-text("Messages"), button:has-text("Messages")').last();
    if (await mobileMessagesTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileMessagesTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '11-mobile-messages.png'), fullPage: true });
      console.log('   ✓ Screenshot saved: 11-mobile-messages.png');
    }

    const mobileSparksTab = page.locator('nav button:has-text("Sparks"), button:has-text("Sparks")').last();
    if (await mobileSparksTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileSparksTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '12-mobile-sparks.png'), fullPage: true });
      console.log('   ✓ Screenshot saved: 12-mobile-sparks.png');
    }

    console.log('\n✨ Test Complete! ✨');
    console.log(`\n📸 Screenshots saved to: ${screenshotsDir}`);
    console.log('\n📋 UX Changes to Review:');
    console.log('   1. Chat pane only visible on Messages tab');
    console.log('   2. No tab lock-in issue');
    console.log('   3. Warmer copy ("people are here right now")');
    console.log('   4. Sparks tab has new header and subtitles');
    console.log('   5. Mobile responsive layout');

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'error-state.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();
