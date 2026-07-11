package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.responses.CantonResponse

interface CantonRepositoryInterface {
  suspend fun getCantons(): Result<List<CantonResponse>>
}