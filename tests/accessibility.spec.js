// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility Tests', () => {
  test('index page should have a main landmark', async ({ page }) => {
    // Navigate to the index page
    await page.goto('http://localhost:8080/');
    
    // Check that a main element exists
    const mainElement = await page.locator('main');
    await expect(mainElement).toBeVisible();
    
    // Run axe accessibility scan specifically for landmark-one-main rule
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['landmark-one-main'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('index page should pass general accessibility scan', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
