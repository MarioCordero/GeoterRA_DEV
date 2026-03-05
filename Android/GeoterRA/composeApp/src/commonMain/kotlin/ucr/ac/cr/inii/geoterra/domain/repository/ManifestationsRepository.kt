package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote

interface ManifestationsRepository {
  suspend fun getManifestations(region_id : UInt): Result<List<ManifestationRemote>>
  
}