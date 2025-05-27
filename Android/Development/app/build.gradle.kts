plugins {
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.jetbrainsKotlinAndroid)
    alias(libs.plugins.googleAndroidLibrariesMapsplatformSecretsGradlePlugin)
    alias(libs.plugins.kotlinParcelize)
}

android {
    namespace = "com.inii.geoterra.development"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.inii.geoterra.development"
        minSdk = 28
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }



    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }

}

dependencies {
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.lifecycle.livedata.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.navigation.fragment.ktx)
    implementation(libs.androidx.navigation.ui.ktx)
    implementation(libs.play.services)
    //noinspection UseTomlInstead
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    //noinspection UseTomlInstead
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    //noinspection UseTomlInstead
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    //noinspection UseTomlInstead
    implementation("org.json:json:20240303")
    implementation(libs.material.v1110)
    implementation(libs.play.services.location)
    //noinspection UseTomlInstead
    implementation("androidx.preference:preference-ktx:1.2.1")
    //noinspection UseTomlInstead
    implementation("org.osmdroid:osmdroid-android:6.1.18")
    implementation("androidx.exifinterface:exifinterface:1.3.7")
    implementation("androidx.exifinterface:exifinterface:1.3.7")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("org.locationtech.proj4j:proj4j:1.1.0")
    // implementation("org.jetbrains.kotlin:kotlin-android-extensions-runtime:<kotlin_version>")
    implementation(libs.firebase.firestore)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}
