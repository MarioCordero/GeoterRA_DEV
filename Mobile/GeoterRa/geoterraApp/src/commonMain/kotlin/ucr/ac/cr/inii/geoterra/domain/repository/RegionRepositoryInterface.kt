package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.RegionRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.UserRemote
import ucr.ac.cr.inii.geoterra.data.model.remote.UserUpdateRequest

interface RegionRepositoryInterface {
  suspend fun getRegions(): Result<List<RegionRemote>>
}