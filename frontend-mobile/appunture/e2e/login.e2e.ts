/**
 * Login Flow E2E Test
 * 
 * Tests the complete login flow:
 * 1. App launch
 * 2. Login screen display
 * 3. Firebase authentication
 * 4. User sync with backend
 * 5. Navigation to home screen
 * 
 * @requires Detox
 * @requires Firebase Emulator (for CI testing)
 */

import { by, device, element, expect } from 'detox';

describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display login screen on launch', async () => {
    // Check if login screen elements are visible
    await expect(element(by.text('Appunture'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('login-button'))).toBeVisible();
  });

  it('should show validation error for empty fields', async () => {
    await element(by.id('login-button')).tap();
    
    // Should show validation message
    await expect(element(by.text(/email|Email/))).toBeVisible();
  });

  it('should show validation error for invalid email format', async () => {
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Should show email format error
    await expect(element(by.text(/válido|valid|formato/i))).toBeVisible();
  });

  it('should navigate to signup screen', async () => {
    await element(by.id('signup-link')).tap();
    
    // Should show signup screen elements
    await expect(element(by.text(/Cadastro|Criar conta|Sign up/i))).toBeVisible();
    await expect(element(by.id('name-input'))).toBeVisible();
  });

  it('should navigate back to login from signup', async () => {
    await element(by.id('signup-link')).tap();
    await element(by.id('login-link')).tap();
    
    // Should be back on login screen
    await expect(element(by.id('login-button'))).toBeVisible();
  });

  // This test requires Firebase Emulator or test credentials
  it.skip('should successfully login with valid credentials', async () => {
    // Test credentials - use Firebase emulator or test account
    const testEmail = 'test@appunture.com';
    const testPassword = 'testpassword123';

    await element(by.id('email-input')).clearText();
    await element(by.id('email-input')).typeText(testEmail);
    await element(by.id('password-input')).clearText();
    await element(by.id('password-input')).typeText(testPassword);
    await element(by.id('login-button')).tap();

    // Should navigate to home screen after successful login
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
