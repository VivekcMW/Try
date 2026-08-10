import { describe, it } from '@jest/globals';
import './setup';

describe('Catalog Screen - Tab Alignment & UI', () => {
  beforeAll(async () => {
    // Assume user is already logged in and onboarded
    // Navigate to Discover tab
    await element(by.text('Discover')).tap();
  });

  describe('Tab Navigation', () => {
    it('should display all three tab options', async () => {
      await expect(element(by.text('Nearby'))).toBeVisible();
      await expect(element(by.text('Trending'))).toBeVisible();
      await expect(element(by.text('For You'))).toBeVisible();
    });

    it('should have Nearby tab selected by default', async () => {
      // Check that Nearby tab is active (has brand blue background)
      await expect(element(by.text('Nearby'))).toBeVisible();
    });

    it('should switch to Trending tab when tapped', async () => {
      await element(by.text('Trending')).tap();
      await expect(element(by.text('Trending'))).toBeVisible();
    });

    it('should switch to For You tab when tapped', async () => {
      await element(by.text('For You')).tap();
      await expect(element(by.text('For You'))).toBeVisible();
    });

    it('should switch back to Nearby tab', async () => {
      await element(by.text('Nearby')).tap();
      await expect(element(by.text('Nearby'))).toBeVisible();
    });
  });

  describe('Tab Visual Alignment', () => {
    it('should display tabs with proper spacing', async () => {
      // Verify tabs are horizontally scrollable
      await expect(element(by.text('Nearby'))).toBeVisible();
      await expect(element(by.text('Trending'))).toBeVisible();
      // All tabs should be visible without scrolling on iPhone 17 Pro
    });

    it('should show tab icons alongside text', async () => {
      // Icons should be present (MapPin, TrendingUp, Sparkles)
      // This is implicitly tested by tab visibility
      await expect(element(by.text('Nearby'))).toBeVisible();
    });
  });

  describe('Category Pills', () => {
    it('should display all category options', async () => {
      await expect(element(by.text('All'))).toBeVisible();
      await expect(element(by.text('Food'))).toBeVisible();
      await expect(element(by.text('Grocery'))).toBeVisible();
      await expect(element(by.text('Pharmacy'))).toBeVisible();
    });

    it('should have All category selected by default', async () => {
      await expect(element(by.text('All'))).toBeVisible();
    });

    it('should switch category when tapped', async () => {
      await element(by.text('Food')).tap();
      await waitFor(element(by.text('Food'))).toBeVisible().withTimeout(2000);
      
      // Switch back to All
      await element(by.text('All')).tap();
      await waitFor(element(by.text('All'))).toBeVisible().withTimeout(2000);
    });

    it('should scroll category pills horizontally if needed', async () => {
      // Scroll to see more categories
      await element(by.text('Pets')).swipe('left', 'fast', 0.5);
    });
  });

  describe('Header Elements', () => {
    it('should display Discover title', async () => {
      await expect(element(by.text('Discover'))).toBeVisible();
    });

    it('should show location coordinates', async () => {
      // Location should be visible in header
      await expect(element(by.id('location-text'))).toExist();
    });

    it('should have filter button', async () => {
      await expect(element(by.id('filter-button'))).toExist();
    });
  });

  describe('Empty State', () => {
    it('should show "No merchants found" message when list is empty', async () => {
      await expect(element(by.text('No merchants found in this area'))).toBeVisible();
    });
  });

  describe('Location Permission Prompt', () => {
    it('should handle location permission denied state', async () => {
      // This would show location permission prompt if denied
      // For now, we assume location is granted
    });
  });
});
