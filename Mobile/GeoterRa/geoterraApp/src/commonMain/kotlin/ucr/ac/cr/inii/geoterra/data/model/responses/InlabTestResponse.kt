package ucr.ac.cr.inii.geoterra.data.model.responses

import kotlinx.serialization.Serializable

@Serializable
data class InlabTestResponse(
	val inlab_test_id: String,
	val ph: Double?,
	val conductivity: Double?,
	val cl: Double?,
	val ca: Double?,
	val hco3: Double?,
	val so4: Double?,
	val fe: Double?,
	val si: Double?,
	val b: Double?,
	val li: Double?,
	val f: Double?,
	val na: Double?,
	val k: Double?,
	val mg: Double?,
	val description: String?,
	val created_at: String
)