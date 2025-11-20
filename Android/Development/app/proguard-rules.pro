# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Conserva todas las clases y miembros públicos de las APIs de Google Play Services
-keep class com.google.android.gms.** { *; }

# Conserva todas las clases internas necesarias para Firebase
-keep class com.google.firebase.** { *; }

# Conserva clases y miembros relacionados con AdvertisingIdClient
-keep class com.google.android.gms.ads.identifier.** { *; }

# Conserva objetos dinámicos usados por Play Services
-keep class com.google.android.gms.dynamic.** { *; }

# Previene eliminación de clases relacionadas a common.api
-keep class com.google.android.gms.common.api.** { *; }

# Evita problemas con DynamiteModule
-keep class com.google.android.gms.dynamite.** { *; }

# Oculta advertencias (ya incluidas en tu archivo)
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**


# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile