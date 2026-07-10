package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.ProvinceRemote

interface ProvinceRepositoryInterface {
  suspend fun getProvinces(): Result<List<ProvinceRemote>>
}