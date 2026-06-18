-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# Retrofit
-dontnote retrofit2.Platform
-dontwarn retrofit2.Platform$Java8
-keepattributes Signature
-keepattributes Exceptions

# Gson
-keepclassmembers class * {
  @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.cyberscout.app.data.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**

# ML Kit
-dontwarn com.google.mlkit.**
