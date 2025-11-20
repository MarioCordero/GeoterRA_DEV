// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.androidApplication) apply false
    alias(libs.plugins.jetbrainsKotlinAndroid) apply false
    alias(libs.plugins.googleAndroidLibrariesMapsplatformSecretsGradlePlugin) apply false
    alias(libs.plugins.kotlinParcelize) apply false
}

buildscript {
    dependencies {
        classpath(libs.kotlin.gradle.plugin) // ✅ Correcto: en buildscript
    }
}