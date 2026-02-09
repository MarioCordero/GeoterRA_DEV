import org.gradle.api.JavaVersion
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidLibrary)
}

kotlin {

    /**
     * Android target configuration for Kotlin Multiplatform
     */
    androidTarget {
        compilations.all {
            compileTaskProvider.configure {
                compilerOptions {
                    // JVM bytecode version for Android compilation
                    jvmTarget.set(JvmTarget.JVM_17)
                }
            }
        }
    }

    /**
     * iOS targets
     */
    iosX64()
    iosArm64()
    iosSimulatorArm64()

    targets.withType<org.jetbrains.kotlin.gradle.plugin.mpp.KotlinNativeTarget> {
        binaries.framework {
            baseName = "shared"
            isStatic = true
        }
    }

    sourceSets {
        commonMain.dependencies {
            implementation(libs.kotlinx.coroutines.core)

            // Multiplatform shared dependencies
        }
        commonTest.dependencies {
            implementation(libs.kotlin.test)
        }
    }
}

/**
 * Enforce Java toolchain for Android compilation
 */
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

android {
    namespace = "ucr.ac.cr.inii.geoterra"
    compileSdk = 35

    defaultConfig {
        minSdk = 24
    }

    /**
     * Java toolchain compatibility
     */
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

}
