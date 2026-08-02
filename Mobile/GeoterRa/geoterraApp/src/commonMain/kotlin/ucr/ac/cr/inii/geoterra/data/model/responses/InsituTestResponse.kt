package ucr.ac.cr.inii.geoterra.data.model.responses

import cafe.adriel.voyager.core.lifecycle.JavaSerializable
import kotlinx.serialization.Serializable

@Serializable
data class InsituTestResponse(
	val insitu_test_id: String,
	val temperature: Double?,
	val conductivity: Double?,
	val ph: Double?,
	val description: String?,
	val created_at: String
) : JavaSerializable {}