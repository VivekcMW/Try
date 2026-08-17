// Community feed as a pushed route — the commerce home links here
import { HomeScreenFeed } from '../(tabs)/index';
import { FeatureGate } from '@/components/FeatureGate';

export default function CommunityFeedScreen() {
  return (
    <FeatureGate featureKey="feed">
      <HomeScreenFeed />
    </FeatureGate>
  );
}
