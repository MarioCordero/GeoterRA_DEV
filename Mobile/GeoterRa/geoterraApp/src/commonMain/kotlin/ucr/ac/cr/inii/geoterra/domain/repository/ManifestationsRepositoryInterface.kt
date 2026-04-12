package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.ManifestationRemote

interface ManifestationsRepositoryInterface {
  suspend fun getManifestations(regionId : UInt?): Result<List<ManifestationRemote>>
  
}