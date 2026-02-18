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
import io.ktor.utils.io.InternalAPI
import kotlinx.serialization.json.Json
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.core.network.ApiEnvelope
import ucr.ac.cr.inii.geoterra.core.network.NetworkConfig
import ucr.ac.cr.inii.geoterra.core.network.TokenManager
import ucr.ac.cr.inii.geoterra.data.model.remote.LoginResponse
import ucr.ac.cr.inii.geoterra.data.model.remote.RefreshAccessTokenRequest
import ucr.ac.cr.inii.geoterra.data.model.remote.RefreshAccessTokenResponse
import ucr.ac.cr.inii.geoterra.presentation.auth.AuthEventBus

@OptIn(InternalAPI::class)
val networkModule = module {
    single { AuthEventBus() }
    single { TokenManager(get()) }

    // Especifica el tipo <HttpClient> explícitamente
    single<HttpClient> {
        fun HttpClient.invalidateAuthTokens() {
            authProvider<BearerAuthProvider>()?.clearToken()
        }

        val authEventBus = get<AuthEventBus>()
        // Usamos get() directamente en la configuración para evitar confusiones de scope
        HttpClient(CIO){
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
                    sendWithoutRequest { request ->
                        val path = request.url.encodedPath
                        // Usamos contains para ignorar si el prefijo es /api/public/ o no
                        val isPublic = path.contains("/auth/login") ||
                                path.contains("/auth/register") ||
                                path.contains("/auth/refresh")

                        !isPublic
                    }

                    loadTokens {
                        val tokenManager = get<TokenManager>()
                        val access = tokenManager.getAccessToken()
                        val refresh = tokenManager.getRefreshToken()

                        if (access != null && refresh != null) {
                            println("Cargando tokens: $access, $refresh")
                            BearerTokens(access, refresh)
                        } else {
                            null
                        }
                    }

                    refreshTokens {
                        val tm = get<TokenManager>()
                        val refreshToken = tm.getRefreshToken() ?: return@refreshTokens null

                        try {
                            // Client for refreshing tokens
                            val response = client.post("auth/refresh") {
                                markAsRefreshTokenRequest()
                                contentType(ContentType.Application.Json)
                                setBody(RefreshAccessTokenRequest(refreshToken))
                            }.body<ApiEnvelope<RefreshAccessTokenResponse>>()

                            val data = response.data
                            val errors = response.errors

                            // Check for errors and clear tokens
                            if (errors.isNotEmpty() || data == null) {
                                tm.clearTokens()
                                authEventBus.emitUnauthorized()
                                return@refreshTokens null
                            }

                            // Save new tokens
                            tm.saveTokens(data.access_token, data.refresh_token)
                            println("Refrescando tokens: ${data.access_token}, ${data.refresh_token}")
                            BearerTokens(data.access_token, data.refresh_token)

                        } catch (e: Exception) {
                            tm.clearTokens()
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