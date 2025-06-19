import java.util.Properties

plugins {
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.jetbrainsKotlinAndroid)
    alias(libs.plugins.googleAndroidLibrariesMapsplatformSecretsGradlePlugin)
    alias(libs.plugins.kotlinParcelize)
}

val localProperties = Properties().apply {
    val localFile = rootProject.file("local.properties")
    if (localFile.exists()) {
        load(localFile.inputStream())
    }
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

    signingConfigs {
        create("release") {
            storeFile = file(localProperties["RELEASE_STORE_FILE"] as String)
            storePassword = localProperties["RELEASE_STORE_PASSWORD"] as String
            keyAlias = localProperties["RELEASE_KEY_ALIAS"] as String
            keyPassword = localProperties["RELEASE_KEY_PASSWORD"] as String
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")

            isMinifyEnabled = true
            isShrinkResources = true

            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro")

            buildConfigField("String", "API_BASE_URL",
                             "\"${localProperties["API_BASE_URL"]}\"")
        }

        debug {
            buildConfigField("String", "API_BASE_URL",
                             "\"${localProperties["API_BASE_URL"]}\"")
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
    implementation(libs.material.v190)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.lifecycle.livedata.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.navigation.fragment.ktx)
    implementation(libs.androidx.navigation.ui.ktx)
    implementation(libs.play.services)
    implementation(libs.retrofit2.retrofit)
    implementation(libs.squareup.converter.gson)
    implementation(libs.okhttp.v4120)
    implementation(libs.json)
    implementation(libs.play.services.location)
    implementation(libs.androidx.preference.ktx)
    implementation(libs.osmdroid.android)
    implementation(libs.androidx.exifinterface.v137)
    implementation(libs.exifinterface)
    implementation(libs.logging.interceptor)
    implementation(libs.locationtech.proj4j)
    implementation(libs.firebase.firestore)
    implementation(libs.androidx.junit.ktx)

    testImplementation(libs.junit)
    testImplementation(libs.mockito.core)
    testImplementation(libs.mockito.kotlin)
    testImplementation(libs.mockwebserver)
    testImplementation(libs.retrofit2.retrofit)
    testImplementation(libs.squareup.converter.gson)

    androidTestImplementation(libs.androidx.core)
    androidTestImplementation(libs.androidx.junit.v115)
    androidTestImplementation(libs.androidx.espresso.core.v351)
    androidTestImplementation(libs.androidx.fragment.testing.v157)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.mockwebserver)
    androidTestImplementation(libs.mockito.core)
    androidTestImplementation(libs.mockito.kotlin)
    androidTestImplementation(libs.androidx.fragment.testing)
    androidTestImplementation("androidx.fragment:fragment-testing:1.6.0")
    androidTestImplementation(libs.androidx.espresso.core)

    implementation(libs.byte.buddy)
    testImplementation(libs.byte.buddy)
    androidTestImplementation(libs.byte.buddy)
}
