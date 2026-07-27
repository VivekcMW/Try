# 📱 Lokul Mobile App — Production Deployment Guide

## Pre-flight Checklist

### ✅ App Configuration
- [x] Update `app.json` with production bundle IDs (`club.lokul.app`)
- [x] Set proper app name ("Lokul") and scheme
- [x] Configure iOS permissions (location, camera, microphone, contacts)
- [x] Configure Android permissions and intent filters
- [x] Add app links / universal links configuration
- [ ] Replace `YOUR_EAS_PROJECT_ID` in app.json with actual EAS project ID

### ✅ EAS Build Configuration  
- [x] Create `eas.json` with development/preview/production profiles
- [ ] Set up EAS project: `npx eas-cli init`
- [ ] Configure iOS credentials: `npx eas credentials`
- [ ] Configure Android keystore: `npx eas credentials`
- [ ] Add Apple Team ID and ASC App ID to eas.json
- [ ] Add Google service account for Play Store uploads

### ✅ Environment Variables
- [x] Create `.env.production` template
- [ ] Set production API base URL
- [ ] Add Google Maps API keys (restricted to bundle ID)
- [ ] Add translation service API keys
- [ ] Configure EAS Secrets for CI/CD: `npx eas secret:create`

### ✅ Error Handling
- [x] Add `ErrorBoundary` component for crash recovery
- [x] Configure error reporting endpoint
- [ ] Optional: Integrate Sentry for advanced crash reporting

### ✅ Performance Optimizations
- [x] React Compiler enabled (in experiments)
- [x] Offline queue for 2G/poor connectivity
- [x] Network status hooks for graceful degradation
- [ ] Review bundle size with `npx expo export --analyze`

### ✅ Security
- [x] Token-based auth for Ably (API key never leaves server)
- [x] No sensitive data in client-side state
- [ ] Enable certificate pinning (optional)
- [ ] Review all fetch calls for proper error handling

---

## Build Commands

### Development Build (Simulator)
```bash
cd apps/mobile
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

### Preview Build (Internal Testing)
```bash
npx eas build --profile preview --platform all
```

### Production Build
```bash
npx eas build --profile production --platform all
```

### Submit to Stores
```bash
# iOS App Store
npx eas submit --platform ios --profile production

# Google Play Store
npx eas submit --platform android --profile production
```

---

## Store Listing Requirements

### iOS App Store
- [ ] App screenshots (6.5" iPhone, 5.5" iPhone)
- [ ] App icon (1024x1024 PNG, no alpha)
- [ ] Privacy policy URL
- [ ] App description (max 4000 chars)
- [ ] Keywords (max 100 chars)
- [ ] Support URL
- [ ] Age rating questionnaire
- [ ] Data privacy questionnaire

### Google Play Store
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone + tablet)
- [ ] App icon (512x512 PNG)
- [ ] Short description (max 80 chars)
- [ ] Full description (max 4000 chars)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Data safety section

---

## Post-Launch

- [ ] Monitor crash reports
- [ ] Set up OTA updates via EAS Update
- [ ] Configure app analytics
- [ ] Enable push notification certificates
- [ ] Test deep linking in production
