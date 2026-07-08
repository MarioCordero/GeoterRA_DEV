package ucr.ac.cr.inii.geoterra.core.di

import io.ktor.client.engine.HttpClientEngine
import io.ktor.client.engine.cio.CIO

actual fun getHttpClientEngine(): HttpClientEngine = CIO.create()