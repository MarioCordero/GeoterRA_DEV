package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.responses.DistrictResponse

interface DistrictRepositoryInterface {
  suspend fun getDistricts(): Result<List<DistrictResponse>>
}