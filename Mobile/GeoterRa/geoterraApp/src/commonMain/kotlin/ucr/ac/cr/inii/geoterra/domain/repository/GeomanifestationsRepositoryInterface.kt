package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.GeomanifestationFilters
import ucr.ac.cr.inii.geoterra.data.model.remote.GeomanifestationRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.PaginatedManifestationsRemote

interface GeomanifestationsRepositoryInterface {
  suspend fun getManifestations(
    filters: GeomanifestationFilters = GeomanifestationFilters()
  ): Result<PaginatedManifestationsRemote>

  suspend fun getManifestationById(id: String): Result<GeomanifestationRemote>
}