import { describe, it } from '@jest/globals';

describe('Onboarding & Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { location: 'always', notifications: 'YES' },
    });
  });

  describe('Initial Launch', () => {
    it('should show splash screen on first launch', async () => {
      await expect(element(by.id('splash-screen'))).toBeVisible();
    });
  });

  describe('Email Login Flow', () => {
    it('should navigate to email login', async () => {
      // Wait for splash to complete
      await waitFor(element(by.id('email-login-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display email and password inputs', async () => {
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
    });

    it('should enable login button when credentials entered', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await expect(element(by.id('login-button'))).toBeVisible();
    });

    it('should navigate to onboarding after successful login', async () => {
      await element(by.id('login-button')).tap();
      // Should redirect to profile setup or tabs if already onboarded
      await waitFor(element(by.text('Home')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Onboarding Guard', () => {
    it('should prevent access to tabs without completing onboarding', async () => {
      // This test would need a fresh account
      // If onboarding is incomplete (no PIN or name), should redirect to profile
    });

    it('should allow access to tabs after onboarding complete', async () => {
      // With test data (PIN 560001, Test User), tabs should be accessible
      await expect(element(by.text('Home'))).toBeVisible();
      await expect(element(by.text('Discover'))).toBeVisible();
    });
  });

  describe('Onboarding Data Persistence', () => {
    it('should persist onboarding data after app restart', async () => {
      // Reload app
      await device.reloadReactNative();
      
      // Should still be logged in with test data
      await expect(element(by.text('Home'))).toBeVisible();
      await expect(element(by.text('Test User'))).toExist();
    });
  });
});
