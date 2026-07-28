# Lokul Mobile App - Quick Start Guide

## ✅ Current Status (All Systems Operational)

- **App**: Installed ✅ (v1.0.0)
- **Backend**: Running ✅ (Port 3010)
- **Code Signing**: Valid ✅
- **Provisioning**: Valid ✅ (Expires Aug 3, 2026)
- **Network**: Connected ✅

---

## 🚀 To Open the App Right Now

### **THE ISSUE**: App needs to be trusted first (one-time setup)

### **THE FIX** (takes 30 seconds):

1. **Unlock your iPhone** 🔓
2. Open **Settings** app
3. Tap **General**
4. Tap **VPN & Device Management**
5. Under "Developer App", tap **vivekanandrchoudhari@gmail.com**
6. Tap **Trust "vivekanandrchoudhari@gmail.com"**
7. Tap **Trust** in the popup
8. Go to home screen and **tap Lokul app** 🎉

---

## ⚠️ If You Don't See "VPN & Device Management"

This means:
- App is not installed, OR
- iOS restrictions are blocking it

**Fix**: Reinstall the app:
```bash
cd /Users/vivekanandchoudhari/try/lokul.club/apps/mobile/ios
xcrun devicectl device install app \
  --device 00008150-0019649E1EE0C01C \
  ~/Library/Developer/Xcode/DerivedData/Lokul-*/Build/Products/Release-iphoneos/Lokul.app
```

---

## 🔄 Weekly Rebuild Required

**Next rebuild**: August 3, 2026

When provisioning expires, rebuild with:
```bash
cd /Users/vivekanandchoudhari/try/lokul.club/apps/mobile/ios
pod install
xcodebuild -workspace Lokul.xcworkspace -scheme Lokul -configuration Release \
  -sdk iphoneos -destination 'generic/platform=iOS' -allowProvisioningUpdates clean build
```

---

## 🛠️ Quick Diagnostic

Run this anytime to check system health:
```bash
/Users/vivekanandchoudhari/try/lokul.club/check-mobile-app.sh
```

---

## 📚 Full Troubleshooting

See: [MOBILE_APP_TROUBLESHOOTING.md](MOBILE_APP_TROUBLESHOOTING.md)

---

## 🆘 Emergency Commands

**Reinstall app**:
```bash
xcrun devicectl device install app --device 00008150-0019649E1EE0C01C \
  ~/Library/Developer/Xcode/DerivedData/Lokul-*/Build/Products/Release-iphoneos/Lokul.app
```

**Check if installed**:
```bash
xcrun devicectl device info apps --device 00008150-0019649E1EE0C01C | grep lokul
```

**Check backend**:
```bash
lsof -ti:3010  # Should show a PID
```

**Restart backend**:
```bash
cd /Users/vivekanandchoudhari/try/lokul.club && npm run dev
```

---

**Last Updated**: July 28, 2026  
**Device**: iPhone UDID 00008150-0019649E1EE0C01C  
**Backend**: http://192.168.1.116:3010
