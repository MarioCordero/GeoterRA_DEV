package ucr.ac.cr.inii.geoterra

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform