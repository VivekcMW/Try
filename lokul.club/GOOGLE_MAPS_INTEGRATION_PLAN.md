# Google Maps Integration - Implementation Plan

## 📋 Overview

Integrate Google Maps APIs to provide seamless location and address search functionality, making it easy for users to add accurate addresses.

---

## 🎯 Required Google Maps APIs

### 1. **Places API (Autocomplete)**
**Purpose**: Autocomplete address suggestions as user types

**Features**:
- Autocomplete predictions
- Place details
- Photo references
- Opening hours

**Pricing**:
- Autocomplete: $2.83 per 1,000 requests
- Place Details: $17 per 1,000 requests
- **Free**: $200 credit/month (~70 autocomplete + details combos)

---

### 2. **Geocoding API**
**Purpose**: Convert addresses to lat/lng coordinates

**Features**:
- Address → Coordinates
- Coordinates → Address (Reverse geocoding)
- Component filtering (city, postal code)

**Pricing**:
- $5 per 1,000 requests
- **Free**: Included in $200 credit

---

### 3. **Maps JavaScript API** (Optional for Web)
**Purpose**: Display interactive maps

**Features**:
- Interactive map display
- Custom markers
- Info windows
- Clustering

**Pricing**:
- $7 per 1,000 loads
- **Free**: Included in $200 credit

---

### 4. **Places SDK for iOS** (Mobile)
**Purpose**: Native autocomplete on mobile

**Pricing**: Same as Places API

---

## 🚀 Step-by-Step Implementation

### **Step 1: Google Cloud Setup** (30 minutes)

#### 1.1 Create Google Cloud Project
```bash
1. Go to: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name: "Lokul"
4. Click "Create"
```

#### 1.2 Enable Required APIs
```bash
1. Go to "APIs & Services" → "Library"
2. Search and enable:
   - Places API
   - Geocoding API
   - Maps JavaScript API
   - Places SDK for iOS
```

#### 1.3 Create API Keys

**For Web (with restrictions)**:
```bash
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Click "Restrict Key"
4. Application restrictions:
   - HTTP referrers (web sites)
   - Add: https://lokul.club/*
5. API restrictions:
   - Restrict key
   - Select: Places API, Geocoding API, Maps JavaScript API
6. Save key as: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

**For Mobile (with restrictions)**:
```bash
1. Create another API key
2. Application restrictions:
   - iOS apps
   - Add bundle ID: com.vivekanandchoudhari.lokul
3. API restrictions:
   - Select: Places SDK for iOS, Geocoding API
4. Save key as: GOOGLE_MAPS_IOS_API_KEY
```

**For Server (Backend)**:
```bash
1. Create API key for server-side calls
2. No application restrictions (will restrict by IP)
3. API restrictions:
   - Geocoding API
   - Places API
4. Save as: GOOGLE_MAPS_SERVER_API_KEY
```

---

### **Step 2: Environment Setup** (15 minutes)

#### 2.1 Add to `.env`
```env
# Google Maps - Web (Public)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXX

# Google Maps - Server (Secret)
GOOGLE_MAPS_SERVER_API_KEY=AIzaSyYYYYYYYYYYYYYYYYYYYYYYY

# Google Maps - iOS (Public in app.json)
GOOGLE_MAPS_IOS_API_KEY=AIzaSyZZZZZZZZZZZZZZZZZZZZZZZ
```

#### 2.2 Install Dependencies

**Web**:
```bash
npm install @googlemaps/js-api-loader
npm install @react-google-maps/api
```

**Mobile**:
```bash
cd apps/mobile
npm install react-native-google-places-autocomplete
npm install react-native-maps
```

---

### **Step 3: Web Implementation** (2-3 hours)

#### 3.1 Create Google Maps Hook

```typescript
// src/hooks/useGoogleMaps.ts

import { useLoadScript } from '@react-google-maps/api';

const libraries: ("places" | "geometry")[] = ['places'];

export function useGoogleMaps() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  return { isLoaded, loadError };
}
```

#### 3.2 Create Address Autocomplete Component

```typescript
// src/components/AddressAutocomplete.tsx

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';

interface AddressAutocompleteProps {
  onSelect: (place: PlaceResult) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
}

interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  placeId: string;
}

export function AddressAutocomplete({
  onSelect,
  initialValue = '',
  placeholder = 'Search for your address...',
  className = ''
}: AddressAutocompleteProps) {
  const [input, setInput] = useState(initialValue);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof google !== 'undefined') {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      
      if (mapDiv.current) {
        const map = new google.maps.Map(mapDiv.current);
        placesService.current = new google.maps.places.PlacesService(map);
      }
    }
  }, []);

  const fetchPredictions = useCallback((value: string) => {
    if (!autocompleteService.current || value.length < 3) {
      setPredictions([]);
      return;
    }

    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'in' }, // Restrict to India
        types: ['address'] // Only addresses, not businesses
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setIsOpen(true);
        } else {
          setPredictions([]);
        }
      }
    );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    fetchPredictions(value);
  };

  const handleSelectPrediction = (placeId: string, description: string) => {
    if (!placesService.current) return;

    setLoading(true);
    
    placesService.current.getDetails(
      { placeId, fields: ['geometry', 'address_components', 'formatted_address'] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          // Extract address components
          const components = place.address_components || [];
          
          const getComponent = (type: string): string => {
            const component = components.find(c => c.types.includes(type));
            return component?.long_name || '';
          };

          const result: PlaceResult = {
            address: place.formatted_address || description,
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
            city: getComponent('locality') || getComponent('administrative_area_level_2'),
            state: getComponent('administrative_area_level_1'),
            pinCode: getComponent('postal_code'),
            country: getComponent('country'),
            placeId
          };

          setInput(result.address);
          setIsOpen(false);
          setPredictions([]);
          onSelect(result);
        }
        setLoading(false);
      }
    );
  };

  const handleClear = () => {
    setInput('');
    setPredictions([]);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden map div for PlacesService */}
      <div ref={mapDiv} style={{ display: 'none' }} />

      {/* Input */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {input && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Predictions Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handleSelectPrediction(prediction.place_id, prediction.description)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
          Loading location details...
        </div>
      )}
    </div>
  );
}
```

#### 3.3 Use in Onboarding/Settings

```typescript
// src/app/web/settings/address/page.tsx

'use client';

import { useState } from 'react';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

export default function AddressPage() {
  const { isLoaded, loadError } = useGoogleMaps();
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const handleAddressSelect = async (place: any) => {
    setSelectedAddress(place);
    
    // Save to database
    const res = await fetch('/api/user/address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: place.address,
        latitude: place.lat,
        longitude: place.lng,
        city: place.city,
        state: place.state,
        pinCode: place.pinCode,
        placeId: place.placeId
      })
    });

    if (res.ok) {
      // Show success
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add Your Address</h1>
      
      <AddressAutocomplete
        onSelect={handleAddressSelect}
        placeholder="Search for your address..."
      />

      {selectedAddress && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Selected Address:</h3>
          <p className="text-sm">{selectedAddress.address}</p>
          <p className="text-xs text-gray-500 mt-2">
            {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pinCode}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Coordinates: {selectedAddress.lat.toFixed(6)}, {selectedAddress.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

### **Step 4: Mobile Implementation** (3-4 hours)

#### 4.1 Configure iOS

```json
// apps/mobile/app.json

{
  "expo": {
    // ... existing config
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSyZZZZZZZZZZZZZZZZZZZZZZZ"
      }
    },
    "plugins": [
      [
        "react-native-google-places-autocomplete",
        {
          "ios": {
            "googlePlacesApiKey": "AIzaSyZZZZZZZZZZZZZZZZZZZZZZZ"
          }
        }
      ]
    ]
  }
}
```

#### 4.2 Create Mobile Address Autocomplete

```typescript
// apps/mobile/src/components/AddressAutocomplete.tsx

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@lokul/ui-tokens';

interface AddressAutocompleteProps {
  onSelect: (place: PlaceResult) => void;
  placeholder?: string;
}

interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  pinCode: string;
  placeId: string;
}

export function AddressAutocomplete({ 
  onSelect, 
  placeholder = 'Search for your address...' 
}: AddressAutocompleteProps) {
  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (details) {
            const components = details.address_components || [];
            
            const getComponent = (type: string): string => {
              const component = components.find(c => c.types.includes(type));
              return component?.long_name || '';
            };

            const result: PlaceResult = {
              address: details.formatted_address || data.description,
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
              city: getComponent('locality') || getComponent('administrative_area_level_2'),
              state: getComponent('administrative_area_level_1'),
              pinCode: getComponent('postal_code'),
              placeId: data.place_id
            };

            onSelect(result);
          }
        }}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          language: 'en',
          components: 'country:in',
          types: 'address'
        }}
        styles={{
          container: styles.autocompleteContainer,
          textInput: styles.textInput,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
          predefinedPlacesDescription: styles.predefinedPlacesDescription
        }}
        enablePoweredByContainer={false}
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={300}
        minLength={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  autocompleteContainer: {
    flex: 0,
  },
  textInput: {
    height: 48,
    fontSize: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    color: colors.gray[900],
  },
  listView: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: colors.gray[200],
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  description: {
    fontSize: 14,
    color: colors.gray[900],
  },
  predefinedPlacesDescription: {
    fontSize: 14,
    color: colors.gray[600],
  },
});
```

#### 4.3 Use in Onboarding Screen

```typescript
// apps/mobile/src/app/(onboarding)/address.tsx

import { useState } from 'react';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { Screen, Text, Button, VStack } from '@/components/ui';

export default function AddressOnboardingScreen() {
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const handleAddressSelect = (place: any) => {
    setSelectedAddress(place);
  };

  const handleSave = async () => {
    if (!selectedAddress) return;
    
    setSaving(true);
    
    const res = await fetch(`${API_BASE}/api/user/address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: selectedAddress.address,
        latitude: selectedAddress.lat,
        longitude: selectedAddress.lng,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pinCode: selectedAddress.pinCode,
        placeId: selectedAddress.placeId
      })
    });

    setSaving(false);
    
    if (res.ok) {
      router.push('/(tabs)');
    }
  };

  return (
    <Screen>
      <VStack gap={6} style={{ padding: 20 }}>
        <Text variant="h1">Where do you live?</Text>
        <Text variant="body">
          Search and select your address. This helps us connect you with your neighbors.
        </Text>

        <AddressAutocomplete
          onSelect={handleAddressSelect}
          placeholder="Search for your address..."
        />

        {selectedAddress && (
          <VStack gap={2} style={styles.selectedCard}>
            <Text variant="h3">Selected Address:</Text>
            <Text>{selectedAddress.address}</Text>
            <Text variant="caption">
              {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pinCode}
            </Text>
          </VStack>
        )}

        <Button
          onPress={handleSave}
          disabled={!selectedAddress || saving}
        >
          {saving ? 'Saving...' : 'Continue'}
        </Button>
      </VStack>
    </Screen>
  );
}
```

---

### **Step 5: Backend API** (1 hour)

```typescript
// src/app/api/user/address/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      address,
      latitude,
      longitude,
      city,
      state,
      pinCode,
      placeId,
      apartmentNumber,
      landmark
    } = await req.json();

    // Validate required fields
    if (!address || !latitude || !longitude || !pinCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update or create user address
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        address,
        latitude,
        longitude,
        city,
        state,
        pinCode,
        placeId,
        apartmentNumber,
        landmark,
        addressVerified: false, // Needs verification
        updatedAt: new Date()
      }
    });

    // Log address update
    await prisma.verificationLog.create({
      data: {
        userId: session.user.id,
        type: 'address_updated',
        status: 'success',
        metadata: {
          address,
          city,
          pinCode,
          placeId
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      user: {
        address: user.address,
        city: user.city,
        pinCode: user.pinCode
      }
    });

  } catch (error) {
    console.error('Address update error:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// GET current user address
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        address: true,
        latitude: true,
        longitude: true,
        city: true,
        state: true,
        pinCode: true,
        apartmentNumber: true,
        landmark: true,
        addressVerified: true
      }
    });

    return NextResponse.json({ user });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch address' },
      { status: 500 }
    );
  }
}
```

---

### **Step 6: Reverse Geocoding** (Optional)

For getting address from GPS coordinates:

```typescript
// src/lib/geocoding.ts

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_SERVER_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

// Usage in mobile app
const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;
  
  const location = await Location.getCurrentPositionAsync({});
  const address = await reverseGeocode(location.coords.latitude, location.coords.longitude);
  
  // Use address
};
```

---

## 📊 Database Schema Updates

```prisma
// prisma/schema.prisma

model User {
  // ... existing fields
  
  // Address fields
  address         String?
  latitude        Float?
  longitude       Float?
  city            String?
  state           String?
  pinCode         String?
  placeId         String?    // Google Place ID
  apartmentNumber String?
  landmark        String?
  addressVerified Boolean    @default(false)
}
```

Run migration:
```bash
npx prisma migrate dev --name add_address_fields
```

---

## 🎨 UI/UX Best Practices

1. **Show "Powered by Google"**: Required by Google Terms
2. **Debounce Input**: Wait 300ms before searching (reduce API calls)
3. **Minimum 3 Characters**: Before triggering autocomplete
4. **Country Restriction**: Restrict to India (`country:in`)
5. **GPS Fallback**: Allow "Use Current Location" button
6. **Edit After Selection**: Allow manual edits to selected address
7. **Save Frequently Used**: Cache recent addresses
8. **Clear Button**: Easy to clear and re-search

---

## 💰 Cost Optimization

### Free Tier Management ($200/month credit)

**Breakdown**:
- Autocomplete: $2.83 per 1K = ~70 requests free
- Place Details: $17 per 1K = ~11 requests free
- Combined: ~11 full address selections per month

**Optimization Strategies**:

1. **Session Tokens** (85% cost reduction)
```typescript
// Group autocomplete + details into session
const sessionToken = new google.maps.places.AutocompleteSessionToken();

// Use same token for autocomplete and getDetails
autocompleteService.getPlacePredictions({
  input: value,
  sessionToken
}, ...);

placesService.getDetails({
  placeId,
  sessionToken // Reuse token = single charge
}, ...);
```

2. **Client-Side Only**: Use NEXT_PUBLIC_ key for web = no backend charges

3. **Cache Results**: Store recent searches in localStorage

4. **Limit Fields**: Only request needed fields in Place Details
```typescript
placesService.getDetails({
  placeId,
  fields: ['geometry', 'address_components'] // Only these, not all
}, ...);
```

5. **Debounce Aggressively**: 500ms debounce = fewer API calls

**With Optimizations**:
- Session tokens: $200 credit = ~1,400 address selections/month
- That's ~50 users adding addresses per day = plenty for growth phase

---

## 🔒 Security Best Practices

1. **Restrict API Keys**: Always add domain/bundle restrictions
2. **Different Keys**: Separate keys for web, mobile, server
3. **Environment Variables**: Never commit keys to git
4. **Rate Limiting**: Prevent abuse on your API endpoints
5. **Validate Server-Side**: Always validate selected addresses on backend
6. **Monitor Usage**: Set up billing alerts in Google Cloud Console

---

## ✅ Implementation Checklist

### Setup
- [ ] Create Google Cloud project
- [ ] Enable Places API, Geocoding API, Maps JavaScript API
- [ ] Create 3 API keys (web, mobile, server) with restrictions
- [ ] Add keys to environment variables
- [ ] Install dependencies (web & mobile)

### Web
- [ ] Create useGoogleMaps hook
- [ ] Build AddressAutocomplete component
- [ ] Add to onboarding flow
- [ ] Add to settings page
- [ ] Test autocomplete predictions
- [ ] Test place details fetching
- [ ] Test address saving

### Mobile
- [ ] Configure app.json with iOS API key
- [ ] Install react-native-google-places-autocomplete
- [ ] Build mobile AddressAutocomplete component
- [ ] Add to onboarding screen
- [ ] Test on real device
- [ ] Add GPS "Use Current Location" button

### Backend
- [ ] Create /api/user/address endpoint
- [ ] Add address fields to User model
- [ ] Run database migration
- [ ] Add validation
- [ ] Add error handling
- [ ] Create verification log entries

### Testing
- [ ] Test with various address formats
- [ ] Test with incomplete addresses
- [ ] Test with non-Indian addresses (should fail)
- [ ] Test network errors
- [ ] Test on slow connections
- [ ] Monitor API usage in Google Cloud Console

---

## 📅 Timeline

- **Day 1**: Google Cloud setup + API keys (1 hour)
- **Day 2**: Web implementation (3 hours)
- **Day 3**: Mobile implementation (4 hours)
- **Day 4**: Backend API + testing (3 hours)
- **Day 5**: Optimization + polish (2 hours)

**Total**: ~5 days (13 hours) for complete implementation

---

## 🎯 Success Criteria

- [ ] Users can search addresses with 3+ character input
- [ ] Autocomplete shows relevant Indian addresses
- [ ] Selected address populates all fields (city, state, pin code, coordinates)
- [ ] Address saved to database correctly
- [ ] Mobile autocomplete works smoothly
- [ ] API costs stay within free tier ($200/month credit)
- [ ] No exposed API keys in client code
- [ ] Address validation working server-side

---

## 📚 Additional Resources

- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [Places Autocomplete Guide](https://developers.google.com/maps/documentation/javascript/place-autocomplete)
- [Cost Optimization](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)
- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)
- [React Native Places Autocomplete](https://github.com/FaridSafi/react-native-google-places-autocomplete)
