#!/bin/bash
# Test merchant OTP login for all accounts

SERVER="http://localhost:3000"

echo "Testing merchant OTP logins..."
echo "================================"

# Array of merchant phone numbers from MERCHANT_TEST_CREDENTIALS.md
declare -a phones=(
  "+919000000206"  # Shah Interiors
  "+919876501234"  # Anil AC
  "+919000000214"  # Leela Fitness
  "+919000000304"  # Venkat Grocery
  "+919000000312"  # Achar's Laundry
  "+919988776655"  # Sunita Home Maid
  "+919000000306"  # Gowda Pest Control
  "+919000000313"  # Shankar Photography
  "+919000000204"  # Pawar Plumbing
  "+919000000106"  # Kavita's Beauty (salon)
  "+919654321098"  # Deepa Tiffin
)

for phone in "${phones[@]}"; do
  echo ""
  echo "Testing: $phone"
  echo "---"
  
  # Step 1: Send OTP
  response=$(curl -s -X POST "$SERVER/api/web/otp/send" \
    -H "Content-Type: application/json" \
    -d "{\"phone\":\"$phone\"}")
  
  echo "Send OTP response: $response"
  
  # Check if OTP was sent successfully
  if echo "$response" | grep -q '"sent":true'; then
    # Extract transactionId
    transactionId=$(echo "$response" | grep -o '"transactionId":"[^"]*"' | cut -d'"' -f4)
    echo "✓ OTP sent (transactionId: $transactionId)"
    
    # Step 2: Verify OTP (using dev mode OTP: 123456)
    verify_response=$(curl -s -X POST "$SERVER/api/web/otp/verify" \
      -H "Content-Type: application/json" \
      -d "{\"transactionId\":\"$transactionId\",\"code\":\"123456\",\"phone\":\"$phone\"}")
    
    echo "Verify OTP response: $verify_response"
    
    if echo "$verify_response" | grep -q '"verified":true'; then
      echo "✓ OTP verified"
      
      # Step 3: Login (with OTP code)
      login_response=$(curl -s -X POST "$SERVER/api/merchant/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"phone\":\"$phone\",\"otp\":\"123456\"}")
      
      echo "Login response: $login_response"
      
      if echo "$login_response" | grep -q '"success":true'; then
        echo "✅ LOGIN SUCCESSFUL for $phone"
      else
        echo "❌ Login failed for $phone"
      fi
    else
      echo "❌ OTP verification failed for $phone"
    fi
  else
    echo "❌ Failed to send OTP for $phone"
    echo "    (might be rate limited - wait 60s before retry)"
  fi
  
  # Rate limit delay: wait 2 seconds between attempts
  sleep 2
done

echo ""
echo "================================"
echo "Test complete!"
