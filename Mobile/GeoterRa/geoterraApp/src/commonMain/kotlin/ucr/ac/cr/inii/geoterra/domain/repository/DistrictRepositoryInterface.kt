package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.DistrictRemote

interface DistrictRepositoryInterface {
  suspend fun getDistricts(): Result<List<DistrictRemote>>
}