package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationFilters
import ucr.ac.cr.inii.geoterra.data.model.responses.GeomanifestationResponse
import ucr.ac.cr.inii.geoterra.data.model.responses.PaginatedManifestationsRemote

interface GeomanifestationsRepositoryInterface {
  suspend fun getManifestations(
    filters: GeomanifestationFilters = GeomanifestationFilters()
  ): Result<PaginatedManifestationsRemote>

  suspend fun getManifestationById(id: String): Result<GeomanifestationResponse>
}