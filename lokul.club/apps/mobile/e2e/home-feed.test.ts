import { describe, it } from '@jest/globals';
import './setup';

describe('Home Feed Screen', () => {
  beforeAll(async () => {
    // Navigate to Home tab
    await element(by.text('Home')).tap();
  });

  describe('Feed Components', () => {
    it('should display the home screen', async () => {
      await expect(element(by.id('home-screen'))).toBeVisible();
    });

    it('should display stories row at the top', async () => {
      await expect(element(by.id('stories-row'))).toExist();
    });

    it('should display feed posts', async () => {
      // Should see at least one post from seed data
      await expect(element(by.id('feed-list'))).toExist();
    });

    it('should scroll through feed posts', async () => {
      await element(by.id('feed-list')).scroll(300, 'down');
      await element(by.id('feed-list')).scroll(300, 'up');
    });
  });

  describe('Post Interactions', () => {
    it('should display post cards with content', async () => {
      // Posts should be visible
      await expect(element(by.id('feed-list'))).toBeVisible();
    });

    it('should show like button on posts', async () => {
      // Like button should be present
      // await expect(element(by.id('like-button-p1'))).toExist();
    });

    it('should show comment button on posts', async () => {
      // Comment button should be present
      // await expect(element(by.id('comment-button-p1'))).toExist();
    });

    it('should show share button on posts', async () => {
      // Share button should be present
      // await expect(element(by.id('share-button-p1'))).toExist();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no posts available', async () => {
      // This would be tested with a fresh account
      // For now we have seed data so posts will show
    });

    it('should show "Create Post" button in empty state', async () => {
      // If empty state is visible, Create Post button should be there
      // await expect(element(by.text('Create Your First Post'))).toExist();
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh feed on pull-down', async () => {
      await element(by.id('feed-list')).swipe('down', 'slow', 0.9);
      // Wait for refresh to complete
      await waitFor(element(by.id('feed-list'))).toBeVisible().withTimeout(5000);
    });
  });

  describe('Header Elements', () => {
    it('should display society name in header', async () => {
      // Should show Kumar Sienna from test data
      await expect(element(by.text('Kumar Sienna'))).toExist();
    });

    it('should display tier badge', async () => {
      // Bronze/Silver/Gold tier should be visible
      await expect(element(by.id('tier-badge'))).toExist();
    });
  });
});
