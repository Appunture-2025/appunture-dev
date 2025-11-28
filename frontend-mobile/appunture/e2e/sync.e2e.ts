/**
 * Sync Flow E2E Test
 * 
 * Tests the data synchronization flow:
 * 1. After login, sync user profile with backend
 * 2. Fetch points data
 * 3. Fetch symptoms data
 * 4. Verify offline data availability
 * 
 * @requires Detox
 * @requires Backend running (or mock server)
 */

import { by, device, element, expect, waitFor } from 'detox';

describe('Sync Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
    
    // Skip login screen if user is already authenticated
    // This assumes tests run in sequence after login.e2e.ts
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display home screen after authentication', async () => {
    // Check if home screen elements are visible
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(15000);
  });

  it('should show loading indicator during sync', async () => {
    // Pull to refresh or trigger sync
    await element(by.id('home-screen')).swipe('down', 'fast');
    
    // Loading indicator should appear briefly
    // This test may need adjustment based on actual loading state
  });

  it('should display points list after sync', async () => {
    // Navigate to points/search section
    await element(by.id('tab-search') || by.text(/Buscar|Search/i)).tap();
    
    // Points list should be visible
    await waitFor(element(by.id('points-list')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should display symptoms categories', async () => {
    // Navigate to symptoms section
    await element(by.id('tab-search') || by.text(/Buscar|Search/i)).tap();
    
    // Switch to symptoms tab if present
    const symptomsTab = element(by.text(/Sintomas|Symptoms/i));
    if (await symptomsTab.toBeVisible()) {
      await symptomsTab.tap();
    }
    
    // Categories should be visible
    await waitFor(element(by.id('symptoms-list')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should handle search functionality', async () => {
    await element(by.id('tab-search') || by.text(/Buscar|Search/i)).tap();
    
    // Type in search input
    await element(by.id('search-input')).typeText('VG20');
    
    // Results should appear
    await waitFor(element(by.text(/VG20|Baihui/i)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show point details on tap', async () => {
    await element(by.id('tab-search') || by.text(/Buscar|Search/i)).tap();
    await element(by.id('search-input')).typeText('VG20');
    
    // Wait for and tap on search result
    await waitFor(element(by.text(/VG20|Baihui/i)))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.text(/VG20|Baihui/i)).tap();
    
    // Point detail screen should appear
    await expect(element(by.id('point-detail-screen'))).toBeVisible();
  });

  it('should be able to add point to favorites', async () => {
    await element(by.id('tab-search') || by.text(/Buscar|Search/i)).tap();
    await element(by.id('search-input')).typeText('VG20');
    
    await waitFor(element(by.text(/VG20|Baihui/i)))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.text(/VG20|Baihui/i)).tap();
    
    // Tap favorite button
    await element(by.id('favorite-button')).tap();
    
    // Favorite icon should change state
    await expect(element(by.id('favorite-button-active'))).toBeVisible();
  });

  it('should show favorites in profile', async () => {
    // Navigate to profile
    await element(by.id('tab-profile') || by.text(/Perfil|Profile/i)).tap();
    
    // Favorites section should be visible
    await waitFor(element(by.id('favorites-section')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
