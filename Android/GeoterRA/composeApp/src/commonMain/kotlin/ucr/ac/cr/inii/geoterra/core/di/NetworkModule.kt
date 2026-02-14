// core/di/NetworkModule.kt
package ucr.ac.cr.inii.geoterra.core.di

import io.ktor.client.*
import io.ktor.client.call.body
import io.ktor.client.plugins.*
import io.ktor.client.plugins.auth.*
import io.ktor.client.plugins.auth.providers.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.client.engine.cio.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.core.network.ApiEnvelope
import ucr.ac.cr.inii.geoterra.core.network.NetworkConfig
import ucr.ac.cr.inii.geoterra.core.network.TokenManager
import ucr.ac.cr.inii.geoterra.data.model.remote.LoginResponse
import ucr.ac.cr.inii.geoterra.data.model.remote.RefreshAccessTokenRequest
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthEventBus

val networkModule = module {
    single { AuthEventBus() }
    single { TokenManager(get()) }

    // Especifica el tipo <HttpClient> explícitamente
    single<HttpClient> {
        val authEventBus = get<AuthEventBus>()
        // Usamos get() directamente en la configuración para evitar confusiones de scope
        HttpClient {
            install(HttpTimeout) {
                requestTimeoutMillis = 30_000
                connectTimeoutMillis = 30_000
                socketTimeoutMillis = 30_000
            }

            install(ContentNegotiation) {
                json(Json {
                    ignoreUnknownKeys = true
                    coerceInputValues = true
                })
            }

            install(Logging) {
                logger = object : Logger {
                    override fun log(message: String) {
                        // "KtorClient" es el tag que buscarás en el Logcat
                        println("KtorClient: $message")
                    }
                }

                // 2. Mantén el nivel en ALL para ver headers y cuerpos
                level = LogLevel.ALL

            }

            install(Auth) {
                bearer {
                    loadTokens {
                        // Accedemos a TokenManager pidiéndolo a Koin
                        val tokenManager = get<TokenManager>()
                        val access = tokenManager.getAccessToken()
                        val refresh = tokenManager.getRefreshToken()
                        if (access != null && refresh != null) BearerTokens(access, refresh) else null
                    }

                    refreshTokens {
                        val tokenManager = get<TokenManager>()
                        val refreshToken = tokenManager.getRefreshToken() ?: return@refreshTokens null

                        try {
                            // IMPORTANTE: Para el refresh usa un cliente nuevo o el "this"
                            // para evitar loops infinitos si falla el refresh.
                            val response = this.client.post("auth/refresh") {
                                markAsRefreshTokenRequest()
                                contentType(ContentType.Application.Json)
                                setBody(RefreshAccessTokenRequest(refreshToken))
                            }.body<ApiEnvelope<LoginResponse>>()

                            val data = response.data ?: return@refreshTokens null

                            tokenManager.saveTokens(
                                data.access_token,
                                data.refresh_token
                            )

                            BearerTokens(
                                data.access_token,
                                data.refresh_token
                            )

                        } catch (e: Exception) {
                            tokenManager.clearTokens()
                            authEventBus.emitUnauthorized()
                            null
                        }
                    }
                }
            }

            defaultRequest {
                url(NetworkConfig.BASE_URL)
                header(HttpHeaders.ContentType, ContentType.Application.Json)
            }
        }
    }
}