package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.responses.ProvinceResponse

interface ProvinceRepositoryInterface {
  suspend fun getProvinces(): Result<List<ProvinceResponse>>
}