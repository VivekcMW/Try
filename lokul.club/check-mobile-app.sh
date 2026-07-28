#!/bin/bash

# Lokul Mobile App - Quick Diagnostic Script
# Run this to check if everything is set up correctly

echo "🔍 Lokul Mobile App Diagnostics"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Device ID
DEVICE_ID="00008150-0019649E1EE0C01C"

# Check 1: Is app installed?
echo -n "1. Checking if app is installed... "
if xcrun devicectl device info apps --device $DEVICE_ID 2>/dev/null | grep -q "com.vivekanandchoudhari.lokul"; then
    echo -e "${GREEN}✅ INSTALLED${NC}"
    APP_VERSION=$(xcrun devicectl device info apps --device $DEVICE_ID 2>/dev/null | grep "com.vivekanandchoudhari.lokul" | awk '{print $3}')
    echo "   Version: $APP_VERSION"
else
    echo -e "${RED}❌ NOT INSTALLED${NC}"
    echo "   Run: xcrun devicectl device install app --device $DEVICE_ID <path-to-app>"
    exit 1
fi
echo ""

# Check 2: Is backend server running?
echo -n "2. Checking backend server... "
if lsof -ti:3010 >/dev/null 2>&1; then
    PID=$(lsof -ti:3010 | head -1)
    echo -e "${GREEN}✅ RUNNING${NC}"
    echo "   Port 3010 (PID: $PID)"
else
    echo -e "${RED}❌ NOT RUNNING${NC}"
    echo "   Start with: cd lokul.club && npm run dev"
fi
echo ""

# Check 3: Check code signing
echo -n "3. Checking code signing certificate... "
CERTS=$(security find-identity -v -p codesigning | grep "Apple Development" | wc -l | tr -d ' ')
if [ "$CERTS" -gt 0 ]; then
    echo -e "${GREEN}✅ VALID${NC}"
    echo "   Found $CERTS Apple Development certificate(s)"
else
    echo -e "${RED}❌ NO CERTIFICATES${NC}"
    echo "   Sign in to Xcode with your Apple ID"
fi
echo ""

# Check 4: Check provisioning profile expiration
echo "4. Checking provisioning profile..."
APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData/Lokul-*/Build/Products/Release-iphoneos/Lokul.app -maxdepth 0 2>/dev/null | head -1)
if [ -n "$APP_PATH" ] && [ -f "$APP_PATH/embedded.mobileprovision" ]; then
    EXPIRATION=$(security cms -D -i "$APP_PATH/embedded.mobileprovision" 2>/dev/null | grep -A 1 "ExpirationDate" | tail -1 | sed 's/<[^>]*>//g' | tr -d '\t ')
    echo "   Expires: $EXPIRATION"
    
    # Check if expired
    EXPIRATION_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$EXPIRATION" +%s 2>/dev/null)
    CURRENT_EPOCH=$(date +%s)
    
    if [ $EXPIRATION_EPOCH -gt $CURRENT_EPOCH ]; then
        DAYS_LEFT=$(( ($EXPIRATION_EPOCH - $CURRENT_EPOCH) / 86400 ))
        echo -e "   ${GREEN}✅ VALID${NC} ($DAYS_LEFT days remaining)"
    else
        echo -e "   ${RED}❌ EXPIRED${NC}"
        echo "   You need to rebuild the app!"
    fi
else
    echo -e "   ${YELLOW}⚠️  Cannot find app bundle${NC}"
fi
echo ""

# Check 5: Check app bundle integrity
echo "5. Checking app bundle integrity..."
if [ -n "$APP_PATH" ]; then
    if [ -f "$APP_PATH/Info.plist" ] && [ -f "$APP_PATH/main.jsbundle" ] && [ -f "$APP_PATH/Lokul" ]; then
        echo -e "   ${GREEN}✅ COMPLETE${NC}"
        
        BUNDLE_SIZE=$(du -sh "$APP_PATH/main.jsbundle" | awk '{print $1}')
        echo "   JavaScript bundle: $BUNDLE_SIZE"
    else
        echo -e "   ${RED}❌ INCOMPLETE${NC}"
        echo "   Missing required files. Rebuild needed."
    fi
else
    echo -e "   ${YELLOW}⚠️  App not built${NC}"
fi
echo ""

# Check 6: Network connectivity
echo "6. Checking network connectivity..."
MAC_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "   Mac IP address: $MAC_IP"

if [ -n "$MAC_IP" ]; then
    echo -e "   ${GREEN}✅ Mac is on network${NC}"
    echo "   Your iPhone should be on the same WiFi network"
else
    echo -e "   ${RED}❌ Mac not connected to WiFi${NC}"
fi
echo ""

# Summary
echo "================================"
echo "📋 SUMMARY & NEXT STEPS"
echo "================================"
echo ""
echo "If all checks above passed, but the app still won't open:"
echo ""
echo "1. ${YELLOW}UNLOCK YOUR IPHONE${NC} (required!)"
echo "2. Open Settings → General → VPN & Device Management"
echo "3. Under 'Developer App', tap 'vivekanandrchoudhari@gmail.com'"
echo "4. Tap 'Trust' and confirm"
echo "5. Return to home screen and tap the Lokul app"
echo ""
echo "For detailed troubleshooting, see:"
echo "   lokul.club/MOBILE_APP_TROUBLESHOOTING.md"
echo ""
