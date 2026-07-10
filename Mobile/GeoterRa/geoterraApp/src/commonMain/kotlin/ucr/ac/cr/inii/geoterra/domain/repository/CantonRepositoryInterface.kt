package ucr.ac.cr.inii.geoterra.domain.repository

import ucr.ac.cr.inii.geoterra.data.model.remote.CantonRemote

interface CantonRepositoryInterface {
  suspend fun getCantons(): Result<List<CantonRemote>>
}