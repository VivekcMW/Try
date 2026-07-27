# Lokul — Neighbourhood Safety Features

> A comprehensive roadmap of safety and emergency features to protect residents, women, children, and senior citizens.

---

## 1. Emergency Response

| Feature | Description |
|---|---|
| **SOS Panic Button** | Single tap triggers phone vibration + loud alarm + sends live GPS to trusted contacts |
| **Auto-call nearest police station** | Detects PIN code, dials the local PCR number automatically |
| **Auto-call ambulance (108 / 112)** | One-tap with location pre-filled in voice message |
| **Fire brigade quick-dial** | Same pattern, detects nearest fire station by PIN code |
| **Fake call trigger** | Shake phone to simulate an incoming call (escape unsafe situations discreetly) |

---

## 2. Video & Evidence

| Feature | Description |
|---|---|
| **Auto-record on SOS** | Front/rear camera starts recording the moment SOS is pressed |
| **Live stream to trusted contacts** | Streams video over WebRTC to up to 3 pre-set contacts |
| **Silent evidence mode** | Records video/audio with screen off (no visible indicator to aggressor) |
| **Auto-upload to cloud** | Video saved to server instantly so it cannot be deleted from device |
| **Time-stamped clip share** | Share a 30-sec clip with location metadata to WhatsApp / email |

---

## 3. Neighbourhood Watch

| Feature | Description |
|---|---|
| **Incident reporting** | Photo + location + category (theft, harassment, suspicious vehicle) posted to locality feed |
| **Verified alert propagation** | Moderator-approved alerts push-notified to everyone within 500 m |
| **Suspicious vehicle / person log** | Crowd-sourced database searchable by description or plate number |
| **Safe route map** | Community-marked "unsafe zones" overlaid on locality map |
| **Late-night check-in** | Set expected return time; if missed, auto-alert trusted contacts |

---

## 4. Community Safety Network

| Feature | Description |
|---|---|
| **Trusted contact circle** | Up to 5 people who receive all SOS signals |
| **Volunteer first-responder network** | Opt-in residents (CPR-trained, etc.) alerted when nearby SOS triggers |
| **Safety buddy for walks** | Share live location for duration of a walk; auto-SOS if movement stops |
| **Night patrol coordination** | Watchmen log rounds digitally and flag anomalies |
| **Emergency broadcast** | Society admin sends push notification to all residents (flood, fire, power cut) |

---

## 5. Women & Child Safety

| Feature | Description |
|---|---|
| **Women's Journey Guardian** | Extend existing feature with destination-miss auto-SOS |
| **Child safe zone geofence** | Alert parents if child leaves a defined boundary |
| **Safe word via voice** | Say a keyword to silently trigger SOS without touching the screen |
| **Sticker QR scan** | QR sticker on child's bag shows emergency contact + blood group when scanned |
| **Solo commuter check-in** | Recurring check-in reminder; missed check-in escalates to guardian |

---

## 6. Medical & Health

| Feature | Description |
|---|---|
| **Medical ID card** | Blood group, allergies, and conditions shown on lock screen for first responders |
| **Fall / cardiac detection** | Accelerometer detects sudden fall; auto-SOS after 10-second countdown |
| **Nearby AED locator** | Crowd-sourced defibrillator locations on the locality map |
| **Ambulance ETA tracker** | Real-time map of ambulance movement after 108 is called |
| **Caregiver medicine alert** | Missed dose escalates to a designated caregiver |

---

## 7. Smart Home / IoT Integration

| Feature | Description |
|---|---|
| **Smart doorbell panic** | Long-press on doorbell triggers Lokul SOS |
| **Gas / smoke sensor alert** | IoT device sends alert to all flat neighbours instantly |
| **CCTV footage request** | Resident requests clip from society CCTV via app (admin approval required) |
| **Gate access log** | Digital visitor log; anomalies flagged automatically |

---

## 8. Infrastructure & Offline

| Feature | Description |
|---|---|
| **Offline SOS** | SOS sends via SMS fallback when internet is unavailable |
| **Mesh alert (Bluetooth)** | Alert broadcast to nearby Lokul devices without internet (similar to Apple FindMy) |
| **Two-way police chat** | Text channel with local beat officer registered to the locality |
| **ICE contacts import** | Auto-import "In Case of Emergency" contacts from phone |

---

## Priority Build Order

| Priority | Feature | Impact |
|---|---|---|
| 1 | SOS + auto-record + auto-upload | Core panic feature |
| 2 | Trusted contact circle + live location | Immediate safety net |
| 3 | Incident reporting to locality feed | Community awareness |
| 4 | Volunteer first-responder network | Faster on-ground response |
| 5 | Offline SMS SOS fallback | Works without internet |
| 6 | Fall / cardiac detection | Senior citizen safety |
| 7 | Child safe zone geofence | Family safety |
| 8 | Medical ID card on lock screen | First-responder aid |
