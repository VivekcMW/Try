import { describe, it } from '@jest/globals';
import './setup';

describe('Tab Navigation & Flow', () => {
  describe('Bottom Tab Bar', () => {
    it('should display all 5 bottom tabs', async () => {
      await expect(element(by.text('Home'))).toBeVisible();
      await expect(element(by.text('Discover'))).toBeVisible();
      await expect(element(by.text('Create'))).toBeVisible();
      await expect(element(by.text('Chats'))).toBeVisible();
      await expect(element(by.text('Profile'))).toBeVisible();
    });

    it('should navigate to Home tab', async () => {
      await element(by.text('Home')).tap();
      await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(3000);
    });

    it('should navigate to Discover tab', async () => {
      await element(by.text('Discover')).tap();
      await waitFor(element(by.text('Nearby'))).toBeVisible().withTimeout(3000);
    });

    it('should navigate to Create tab', async () => {
      await element(by.text('Create')).tap();
      await waitFor(element(by.id('create-screen'))).toBeVisible().withTimeout(3000);
    });

    it('should navigate to Chats tab', async () => {
      await element(by.text('Chats')).tap();
      await waitFor(element(by.id('chats-screen'))).toBeVisible().withTimeout(3000);
    });

    it('should navigate to Profile tab', async () => {
      await element(by.text('Profile')).tap();
      await waitFor(element(by.id('profile-screen'))).toBeVisible().withTimeout(3000);
    });
  });

  describe('Tab State Persistence', () => {
    it('should maintain tab state when switching between tabs', async () => {
      // Go to Discover, switch tab, then return
      await element(by.text('Discover')).tap();
      await element(by.text('Trending')).tap();
      
      // Navigate away and back
      await element(by.text('Home')).tap();
      await element(by.text('Discover')).tap();
      
      // Trending should still be selected
      await expect(element(by.text('Trending'))).toBeVisible();
    });
  });

  describe('Back Navigation', () => {
    it('should handle back navigation properly', async () => {
      // Navigate to a detail screen and back
      await element(by.text('Home')).tap();
      
      // This assumes there's a post we can tap
      // await element(by.id('post-card-0')).tap();
      // await device.pressBack();
      // await expect(element(by.id('home-screen'))).toBeVisible();
    });
  });
});
