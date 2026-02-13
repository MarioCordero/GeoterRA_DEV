package ucr.ac.cr.inii.geoterra.core.network

// androidMain
actual object NetworkConfig {
    // 10.0.2.2 is the special alias for your computer's localhost in the Android Emulator
    actual val BASE_URL: String = "http://10.0.2.2:80/api/public/"
}