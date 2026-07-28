# Lokul Mobile App - Troubleshooting Guide

## Current Status ✅

- **App Installed**: Yes (version 1.0.0, build 1)
- **Installation Location**: iPhone (UDID: 00008150-0019649E1EE0C01C)
- **Code Signing**: Valid ✅
  - Certificate: Apple Development (vivekanandrchoudhari@gmail.com)
  - Team ID: FX47Q4MQD6
- **Provisioning Profile**: Valid ✅
  - Created: July 27, 2026
  - Expires: August 3, 2026 (6 days remaining)
- **Backend Server**: Running on http://192.168.1.116:3010 ✅

---

## Why the App Won't Open

The most common issue with free Apple Developer accounts is **the app requires manual trust**. Apple's security requires you to explicitly trust apps from developers not in the App Store.

---

## 📱 SOLUTION: Trust the Developer Certificate

### Step-by-Step Instructions:

#### 1. **Unlock Your iPhone**
   - Make sure your iPhone is unlocked (this is required!)

#### 2. **Open Settings App**
   - Tap the gray Settings icon

#### 3. **Navigate to General**
   - Scroll down and tap **General**

#### 4. **Find Device Management**
   - Scroll down and look for one of these options:
     - **"VPN & Device Management"** (most common)
     - **"Device Management"**
     - **"Profiles & Device Management"**
   
   ⚠️ **If you DON'T see this option**, it means the app is not installed or there's a different issue (see "Alternative Solutions" below)

#### 5. **Tap on Developer App Section**
   - Under **"Developer App"**, you should see:
     ```
     vivekanandrchoudhari@gmail.com
     ```
   - **Tap on it**

#### 6. **Trust the Certificate**
   - You'll see a blue button that says:
     ```
     Trust "vivekanandrchoudhari@gmail.com"
     ```
   - **Tap this button**

#### 7. **Confirm Trust**
   - A popup will appear asking you to confirm
   - **Tap "Trust"** again in the popup

#### 8. **Test the App**
   - Go back to your home screen
   - **Tap the Lokul app icon**
   - The app should now open! 🎉

---

## 🔍 Alternative Solutions (If Trust Steps Don't Work)

### Issue 1: "VPN & Device Management" Not Visible

**Cause**: The app might not be properly installed or iOS restrictions are enabled

**Solution**:
1. Check if the Lokul app icon is on your home screen
2. If not, reinstall the app:
   ```bash
   cd /Users/vivekanandchoudhari/try/lokul.club/apps/mobile/ios
   xcrun devicectl device install app --device 00008150-0019649E1EE0C01C \
     /Users/vivekanandchoudhari/Library/Developer/Xcode/DerivedData/Lokul-gpuuocbnnkofoncjczqpkocxpvbo/Build/Products/Release-iphoneos/Lokul.app
   ```

### Issue 2: App Flashes/Crashes Immediately

**Cause**: Runtime error or missing backend connection

**Solution**:
1. Make sure your iPhone is on the **same WiFi network** as your Mac
2. Verify the backend server is running:
   ```bash
   lsof -ti:3010  # Should show a process ID
   ```
3. Test backend connectivity from iPhone:
   - Open Safari on iPhone
   - Go to: http://192.168.1.116:3010
   - You should see the Lokul website/API

### Issue 3: Certificate Already Trusted, But App Still Won't Open

**Cause**: Provisioning profile or code signature issue

**Solution**: Rebuild and reinstall the app:

```bash
# Navigate to the iOS project
cd /Users/vivekanandchoudhari/try/lokul.club/apps/mobile/ios

# Clean previous build
rm -rf ~/Library/Developer/Xcode/DerivedData/Lokul-*

# Reinstall pods
pod install

# Rebuild the app
xcodebuild -workspace Lokul.xcworkspace \
  -scheme Lokul \
  -configuration Release \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates \
  clean build

# Reinstall to device
xcrun devicectl device install app \
  --device 00008150-0019649E1EE0C01C \
  /Users/vivekanandchoudhari/Library/Developer/Xcode/DerivedData/Lokul-*/Build/Products/Release-iphoneos/Lokul.app
```

### Issue 4: "Provisioning Profile Expired"

**Cause**: Free provisioning profiles expire every 7 days

**Solution**: Rebuild with new provisioning (same commands as Issue 3 above)

**Current Expiration**: August 3, 2026

---

## 🔄 Weekly Rebuild Required

⚠️ **Important**: With a free Apple Developer account, you must rebuild and reinstall the app **every 7 days**.

**Next rebuild needed**: **August 3, 2026**

After this date, you'll see errors like:
- "The application could not be verified"
- "Untrusted Developer"

Simply rebuild using the commands in Issue 3 above.

---

## 💰 Upgrade to Paid Developer Account (Optional)

To avoid weekly rebuilds, consider upgrading to a paid Apple Developer account:

- **Cost**: $99/year
- **Benefits**:
  - Provisioning profiles valid for 1 year
  - No manual trust required on devices
  - Can distribute via TestFlight
  - Can publish to App Store

**Sign up**: https://developer.apple.com/programs/

---

## 🆘 Emergency Debug Commands

If the app is completely broken, use these commands to diagnose:

```bash
# Check if app is installed
xcrun devicectl device info apps --device 00008150-0019649E1EE0C01C | grep lokul

# Verify code signing
codesign -dvvv ~/Library/Developer/Xcode/DerivedData/Lokul-*/Build/Products/Release-iphoneos/Lokul.app

# Check provisioning profile expiration
security cms -D -i ~/Library/Developer/Xcode/DerivedData/Lokul-*/Build/Products/Release-iphoneos/Lokul.app/embedded.mobileprovision | grep ExpirationDate

# View device logs (requires iPhone to be connected)
log stream --device-id 00008150-0019649E1EE0C01C --predicate 'processImagePath contains "Lokul"'
```

---

## 📝 Summary Checklist

Before contacting support, verify:

- [ ] iPhone is **unlocked**
- [ ] iPhone is on **same WiFi** as Mac (192.168.1.x network)
- [ ] Backend server is **running** (port 3010)
- [ ] Developer certificate is **trusted** in Settings
- [ ] Provisioning profile **not expired** (check expiration date)
- [ ] App icon **visible** on home screen
- [ ] Tried **restarting the iPhone**

---

## 📞 Still Having Issues?

If you've tried everything above and the app still won't open:

1. **Restart your iPhone** (seriously, this fixes many iOS issues)
2. **Rebuild from scratch** (use commands in Issue 3)
3. **Check console logs** while tapping the app icon:
   ```bash
   xcrun devicectl device monitor --device 00008150-0019649E1EE0C01C
   ```

---

**Last Updated**: July 28, 2026  
**App Version**: 1.0.0 (Build 1)  
**iOS Device**: iPhone (UDID: 00008150-0019649E1EE0C01C)
