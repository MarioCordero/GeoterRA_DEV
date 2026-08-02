package ucr.ac.cr.inii.geoterra.data.model.responses

import cafe.adriel.voyager.core.lifecycle.JavaSerializable
import kotlinx.serialization.Serializable

@Serializable
data class InvestigationRequestResponse(
  val request_id: String,
  val request_name: String,
  val owner_name: String?,
  val owner_phone_number: String?,
  val owner_email: String?,
  val current_usage: String,
  val temperature_sensation: String,
  val bubbles: Boolean,
  val details: String,
  val exact_address: String,
  val relation_with_owner: String,
  val created_at: String,
  val location: LocationResponse,
  val current_state: StateResponse
) : JavaSerializable {
	companion object
	@Serializable
	data class StateResponse(
		val value: String,
		val description: String,
		val created_at: String
	) : JavaSerializable
}
