package ucr.ac.cr.inii.geoterra.data.model.remote

import kotlinx.serialization.Serializable

@Serializable
data class InsituTestRemote(
	val insitu_test_id: String,
	val temperature: Double?,
	val conductivity: Double?,
	val ph: Double?,
	val description: String?,
	val created_at: String
)