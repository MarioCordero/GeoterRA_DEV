package ucr.ac.cr.inii.geoterra.domain.model

data class RegionOption(
  val id: UInt,
  val name: String
)

val regionList = listOf(
  RegionOption(1u, "San José"),
  RegionOption(2u, "Alajuela"),
  RegionOption(3u, "Cartago"),
  RegionOption(4u, "Heredia"),
  RegionOption(5u, "Guanacaste"),
  RegionOption(6u, "Puntarenas"),
  RegionOption(7u, "Limón")
)