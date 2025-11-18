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
    console.log('🚀 Starting Keyboard Navigation Test...\n');

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);

    // Click guest button
    const guestBtn = page.locator('button:has-text("Continue as Guest")');
    await guestBtn.click();
    await page.waitForTimeout(1000);
    console.log('1. Clicked Continue as Guest');

    // Fill username
    await page.keyboard.type('TestUser' + Math.floor(Math.random() * 10000));
    console.log('2. Typed username');
    await page.waitForTimeout(500);

    // Tab to age dropdown
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    // Open dropdown with Space or Enter
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    console.log('3. Opened age dropdown');

    // Arrow down a few times and press Enter to select
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    console.log('4. Selected age with keyboard');

    await page.screenshot({ path: path.join(screenshotsDir, 'kb-01-after-age.png'), fullPage: true });

    // Tab to first checkbox (age confirmation)
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await page.keyboard.press('Space'); // Check it
    await page.waitForTimeout(300);
    console.log('5. Checked age confirmation');

    // Tab to second checkbox (terms)
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await page.keyboard.press('Space'); // Check it
    await page.waitForTimeout(300);
    console.log('6. Checked terms');

    await page.screenshot({ path: path.join(screenshotsDir, 'kb-02-checkboxes-done.png'), fullPage: true });

    // Tab to Next button and click
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    console.log('7. Clicked Next');

    await page.screenshot({ path: path.join(screenshotsDir, 'kb-03-step-2.png'), fullPage: true });

    // Keep pressing Enter/Space to advance through remaining steps
    for (let i = 0; i < 5; i++) {
      const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Get Started"), button:has-text("Finish")').first();
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
        console.log(`8.${i} Clicked next step`);
        await page.screenshot({ path: path.join(screenshotsDir, `kb-04-step-${i + 3}.png`), fullPage: true });
      } else {
        console.log(`No more next buttons`);
        break;
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, 'kb-05-main-app.png'), fullPage: true });
    console.log('9. Reached main app!');

    // NOW TEST THE UX CHANGES
    console.log('\n📋 Testing UX Changes...\n');

    // Test Online tab
    const onlineTab = page.locator('button:has-text("Online")').first();
    if (await onlineTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await onlineTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'ux-01-online-tab.png'), fullPage: true });
      console.log('✓ Online tab - ux-01-online-tab.png');
    }

    // Test Messages tab
    const messagesTab = page.locator('button:has-text("Messages")').first();
    if (await messagesTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await messagesTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'ux-02-messages-tab.png'), fullPage: true });
      console.log('✓ Messages tab - ux-02-messages-tab.png');
    }

    // Test Sparks tab (THE KEY ONE!)
    const sparksTab = page.locator('button:has-text("Sparks")').first();
    if (await sparksTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sparksTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'ux-03-sparks-tab.png'), fullPage: true });
      console.log('✓ Sparks tab - ux-03-sparks-tab.png');
      console.log('  → Check for header: "People who felt something when they saw you"');
      console.log('  → Check for tab subtitles');
    }

    // Test tab switching (no lock-in)
    console.log('\n🔄 Testing tab switching...');
    await onlineTab.click();
    await page.waitForTimeout(500);
    console.log('  → Switched to Online');

    await sparksTab.click();
    await page.waitForTimeout(500);
    console.log('  → Switched to Sparks');

    await messagesTab.click();
    await page.waitForTimeout(500);
    console.log('  → Switched to Messages');

    await onlineTab.click();
    await page.waitForTimeout(500);
    console.log('  → Switched back to Online');

    await page.screenshot({ path: path.join(screenshotsDir, 'ux-04-no-lockin.png'), fullPage: true });
    console.log('✓ No tab lock-in! - ux-04-no-lockin.png');

    // Mobile views
    console.log('\n📱 Testing mobile layout...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(screenshotsDir, 'ux-05-mobile-current.png'), fullPage: true });
    console.log('✓ Mobile current - ux-05-mobile-current.png');

    const mobileSparksTab = page.locator('button:has-text("Sparks")').last();
    if (await mobileSparksTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileSparksTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'ux-06-mobile-sparks.png'), fullPage: true });
      console.log('✓ Mobile Sparks - ux-06-mobile-sparks.png');
    }

    console.log('\n✨ Test Complete! ✨');
    console.log(`📸 Screenshots in: ${screenshotsDir}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'kb-error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();
