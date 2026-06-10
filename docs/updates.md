Xcode is open. Here's what to do to get it on your iPhone:

In Xcode:

Set your Team — click on App in the Project Navigator → select the App target → Signing & Capabilities tab → set Team to your Apple ID (you don't need a paid developer account; a free personal team works for sideloading your own device).

Trust the certificate on your iPhone — first time only: on iPhone go to Settings → General → VPN & Device Management → tap your Apple ID → tap Trust.

Plug in your iPhone (or use wireless pairing if already set up) → select it from the device dropdown at the top of Xcode.

Hit the ▶ Run button — Xcode will build and install Taskira directly on your iPhone.

For future updates — any time you change the code, run these two commands to push updates:

npm run build && npx cap sync ios
Then rebuild in Xcode (or npx cap run ios from the terminal if your device is trusted and connected).

The app is already working on Mac in your browser at http://localhost:5173/. The Capacitor setup is complete — Supabase data will sync in real-time between your Mac browser and the iPhone app since they share the same backend.
