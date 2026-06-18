# CyberScout Android Companion App

A native Android companion app for the CyberScout AI threat analysis platform. Provides mobile access to phishing detection, URL analysis, email forensics, and breach assistance tools.

## Features

- **Phishing Scanner** – Analyze suspicious texts and messages for phishing/fraud indicators
- **URL Analyzer** – Scan URLs for domain threats, SSL issues, and reputation risks
- **Email Header Forensics** – Parse email headers to detect spoofing and authentication failures (SPF/DKIM/DMARC)
- **Breach Assist** – Get personalized recovery protocols for compromised accounts
- **Screenshot OCR** – Extract text from screenshots using ML Kit vision
- **Scan History** – Local database with 50 most recent scans

## Tech Stack

- **Language:** Kotlin
- **UI Framework:** Jetpack Compose
- **Networking:** Retrofit + OkHttp
- **Local Storage:** Room Database
- **OCR:** ML Kit Text Recognition
- **Camera:** CameraX
- **Min SDK:** 26 (Android 8.0+)
- **Target SDK:** 34 (Android 14)

## Setup

### Prerequisites
- Android Studio Flamingo or newer
- JDK 17+
- Android SDK 34
- Gradle 8.2+

### Installation

1. Clone the repository
```bash
cd android-app
```

2. Open in Android Studio
```bash
# Or open the android-app folder directly in Android Studio
```

3. Configure the API endpoint in `app/src/main/kotlin/com/cyberscout/app/data/api/ApiClient.kt`:
```kotlin
private const val BASE_URL = "http://YOUR_SERVER_IP:3000/"
```

4. Sync Gradle dependencies:
```
File > Sync Now
```

5. Build and run:
```bash
./gradlew assembleDebug
# Or: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

## Project Structure

```
app/
├── src/main/
│   ├── AndroidManifest.xml
│   ├── kotlin/com/cyberscout/app/
│   │   ├── MainActivity.kt           # Entry point
│   │   ├── ui/
│   │   │   ├── screens/
│   │   │   │   └── MainScreen.kt    # Main UI layout
│   │   │   ├── components/
│   │   │   │   └── TabComponents.kt # Tab UI elements
│   │   │   └── theme/
│   │   │       ├── Color.kt         # Cyberpunk color scheme
│   │   │       └── Theme.kt         # Compose theme
│   │   └── data/
│   │       ├── api/
│   │       │   ├── ApiClient.kt     # Retrofit setup
│   │       │   └── CyberScoutApiService.kt  # API endpoints
│   │       └── db/
│   │           ├── CyberScoutDatabase.kt   # Room database
│   │           ├── ScanHistoryEntity.kt    # Data model
│   │           └── ScanHistoryDao.kt       # DAO
│   └── res/
│       └── values/
│           └── strings.xml
├── build.gradle.kts
├── proguard-rules.pro
└── AndroidManifest.xml
```

## API Configuration

The app communicates with the backend at `http://192.168.1.100:3000/` by default.

### Required Backend Endpoints

- `POST /api/chat` – Phishing/breach analysis
- `POST /api/analyze-url` – URL threat analysis
- `POST /api/analyze-email` – Email header forensics

See the backend README for full API documentation.

## Building for Release

### Generate Keystore
```bash
keytool -genkey -v -keystore cyberscout.jks -keyalg RSA -keysize 2048 -validity 10000 -alias cyberscout
```

### Configure Release Build
Add to `app/build.gradle.kts`:
```kotlin
signingConfigs {
    create("release") {
        storeFile = file("../cyberscout.jks")
        storePassword = "your_password"
        keyAlias = "cyberscout"
        keyPassword = "your_password"
    }
}

buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
        isMinifyEnabled = true
        proguardFiles(...)
    }
}
```

### Build Release APK
```bash
./gradlew assembleRelease
```

## Permissions

- `INTERNET` – API communication
- `CAMERA` – Screenshot OCR
- `READ_EXTERNAL_STORAGE` – Image upload
- `ACCESS_NETWORK_STATE` – Connection status

## Dependencies

Key dependencies:
- Jetpack Compose 1.6.1
- Retrofit 2.10.0
- OkHttp 4.11.0
- Room 2.6.1
- ML Kit Text Recognition 16.0.0
- CameraX 1.3.0

## Development

### Hot Reload
Compose supports live preview and fast recomposition during development in Android Studio.

### Testing
```bash
./gradlew test              # Unit tests
./gradlew connectedAndroidTest  # Instrumentation tests
```

### Logging
Enable verbose logging:
```bash
./gradlew assembleDebug -P org.gradle.logging.level=debug
```

## Future Enhancements

- [ ] Biometric authentication (fingerprint/face)
- [ ] Dark/light theme toggle
- [ ] Offline mode with local ML Kit processing
- [ ] Real-time threat notifications
- [ ] Cloud sync across devices
- [ ] Advanced filtering and search
- [ ] Export scan reports

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue in the main CyberScout repository.
