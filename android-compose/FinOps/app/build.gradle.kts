import java.io.FileInputStream
import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp.android)
    alias(libs.plugins.hilt.android) // ✅ FIX 1: Use the alias from libs.versions.toml
}

// Load local.properties
val localProperties = Properties()
val localPropertiesFile = rootProject.file("local.properties")
if (localPropertiesFile.exists()) {
    localProperties.load(FileInputStream(localPropertiesFile))
}
android {
    namespace = "com.example.fin_ops"
    compileSdk = 36 // ✅ FIX 2: Simplified standard syntax

    defaultConfig {
        applicationId = "com.example.fin_ops"
        minSdk = 24
        targetSdk = 36
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
            // It's good practice to also define buildConfigFields for release,
            // even if they are empty or point to a production URL.
            buildConfigField("String", "BASE_URL", "\"\"")
        }
        debug {
            // Expose the BASE_URL as a build configuration field
            buildConfigField("String", "BASE_URL", localProperties.getProperty("BASE_URL") ?: "\"\"")
        }
    }
    compileOptions {
        // ✅ FIX 3: AGP 8+ runs on Java 17. Targeting 17 allows newer API usage.
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
        isCoreLibraryDesugaringEnabled = true
    }
    kotlinOptions {
        jvmTarget = "17" // ✅ FIX 4: Must match compileOptions
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    coreLibraryDesugaring(libs.desugar.jdk.libs)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)

    // Retrofit
    implementation(libs.retrofit)
    implementation(libs.converter.gson)
    implementation(libs.logging.interceptor)

    // Hilt dependencies
    implementation(libs.hilt.android)
    implementation(libs.androidx.hilt.navigation.compose)
    ksp(libs.hilt.compiler)
    implementation("androidx.datastore:datastore-preferences:1.0.0")
}