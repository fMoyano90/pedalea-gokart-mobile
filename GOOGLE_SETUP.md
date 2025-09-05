# Instrucciones para configurar Google Sign-In

## 1. Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ o Google Sign-In
4. Ve a "Credenciales" y crea credenciales OAuth 2.0

## 2. Para Android
1. Crear Client ID para aplicación Android
2. Package name: `com.fmoyano.pedaleamobile`
3. Generar SHA-1 fingerprint:
   ```bash
   cd android
   ./gradlew signingReport
   ```
4. Descargar el archivo `google-services.json` y colocarlo en esta carpeta

## 3. Para iOS  
1. Crear Client ID para aplicación iOS
2. Bundle ID: `com.fmoyano.pedaleamobile`
3. Descargar el archivo `GoogleService-Info.plist` y colocarlo en esta carpeta

## 4. Para Web (necesario para el backend)
1. Crear Client ID para aplicación web
2. Agregar el dominio autorizado de tu backend

## 5. Variables de entorno
Actualiza tu archivo `.env` con los Client IDs:
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu_web_client_id.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=tu_android_client_id.googleusercontent.com  
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=tu_ios_client_id.googleusercontent.com
```

## 6. Rebuild
Después de agregar los archivos de configuración, ejecuta:
```bash
npx expo run:android
# o
npx expo run:ios
```
