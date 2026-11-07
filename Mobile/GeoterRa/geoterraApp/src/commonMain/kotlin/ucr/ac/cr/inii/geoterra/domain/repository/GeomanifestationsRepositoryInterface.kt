package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.requests.GeomanifestationRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationFilters
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.PaginatedManifestationsRemote

interface GeomanifestationsRepositoryInterface {
  suspend fun getPublicGeomanifestations(
    filters: GeomanifestationFilters = GeomanifestationFilters()
  ): Result<PaginatedManifestationsRemote>

  suspend fun getPublicGeomanifestationById(id: String): Result<GeomanifestationResponse>

	suspend fun getGeomanifestations(filters: GeomanifestationFilters = GeomanifestationFilters()
	): Result<PaginatedManifestationsRemote>

	suspend fun getGeomanifestationById(id : String): Result<GeomanifestationResponse>

	suspend fun registerGeomanifestation(payload : GeomanifestationRequest): Result<GeomanifestationResponse>

	suspend fun updateGeomanifestation(id : String, payload : GeomanifestationRequest): Result<GeomanifestationResponse>

	suspend fun deleteGeomanifestation(id : String): Result<Unit>
}