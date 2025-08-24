import java.util.Properties

plugins {
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.jetbrainsKotlinAndroid)
    alias(libs.plugins.googleAndroidLibrariesMapsplatformSecretsGradlePlugin)
    alias(libs.plugins.kotlinParcelize)
    alias(libs.plugins.kotlinKapt)
    alias(libs.plugins.daggerHilt)
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

    buildTypes {
        release {
            isMinifyEnabled = false
            isShrinkResources = false

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

    kotlin {
        jvmToolchain(17)
    }

    hilt {
        enableAggregatingTask = false
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
    implementation(libs.androidx.junit.ktx)
    implementation(libs.androidx.preference.ktx)
    implementation(libs.androidx.exifinterface)
    implementation(libs.timber)

    implementation(
        libs.hilt.android
    )
    implementation(libs.androidx.lifecycle.process)
    implementation(libs.play.services.base.v1872)
    implementation(libs.play.services.ads.identifier.v1820)

    kapt(libs.hilt.compiler)

    implementation(libs.retrofit2.retrofit)
    implementation(libs.squareup.converter.gson)
    implementation(libs.okhttp)
    implementation(libs.json)
    implementation(libs.osmdroid.android)
    implementation(libs.logging.interceptor)
    implementation(libs.locationtech.proj4j)

    testImplementation(libs.junit)
    testImplementation(libs.retrofit2.retrofit)
    testImplementation(libs.squareup.converter.gson)

    androidTestImplementation(libs.androidx.core)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}
