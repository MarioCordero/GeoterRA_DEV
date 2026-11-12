package ucr.ac.cr.inii.geoterra.core.di

import io.ktor.client.*
import io.ktor.client.call.body
import io.ktor.client.engine.HttpClientEngine
import io.ktor.client.plugins.*
import io.ktor.client.plugins.auth.*
import io.ktor.client.plugins.auth.providers.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.utils.io.InternalAPI
import kotlinx.coroutines.CancellationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.Json.Default.encodeToString
import kotlinx.serialization.json.Json.Default.parseToJsonElement
import kotlinx.serialization.json.JsonElement
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.NetworkConfig
import ucr.ac.cr.inii.geoterra.core.network.TokenManager
import ucr.ac.cr.inii.geoterra.data.model.requests.RefreshAccessTokenRequest
import ucr.ac.cr.inii.geoterra.data.model.responses.RefreshAccessTokenResponse
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEventBus

expect fun getHttpClientEngine(): HttpClientEngine

@OptIn(InternalAPI::class)
val networkModule = module {
	single { AuthEventBus() }
	single { TokenManager(get()) }

	single<HttpClient> {
		val authEventBus = get<AuthEventBus>()
		val client = HttpClient(getHttpClientEngine()) {
			install(HttpTimeout) {
				requestTimeoutMillis = 30_000
				connectTimeoutMillis = 30_000
				socketTimeoutMillis = 30_000
			}

			install(ContentNegotiation) {
				json(Json {
					ignoreUnknownKeys = true
					coerceInputValues = true
					explicitNulls = true
					encodeDefaults = true
				})
			}

			install(Logging) {
				logger = object : Logger {
					override fun log(message: String) {
						val formattedMessage = try {
							encodeToString(
								JsonElement.serializer(),
								parseToJsonElement(message)
							)
						} catch (e: Exception) {
							message
						}

						println("KtorClient: $formattedMessage")
					}
				}

				level = LogLevel.ALL
			}

			install(Auth) {
				bearer {
					sendWithoutRequest { request ->
						val path = request.url.encodedPath
						val publicPaths =
							listOf("/auth/login", "/auth/register", "/auth/refresh", "geomanifestations/")

						val isPublicPath = publicPaths.any { publicPath ->
							path.startsWith(publicPath)
						}

						!isPublicPath
					}

					loadTokens {
						val tokenManager = get<TokenManager>()
						val access = tokenManager.getAccessToken()
						val refresh = tokenManager.getRefreshToken()

						if (access != null && refresh != null) {
							BearerTokens(access, refresh)
						} else {
							null
						}
					}

					refreshTokens {
						val tm = get<TokenManager>()
						val refreshToken = tm.getRefreshToken() ?: return@refreshTokens null

						try {
							val response = client.post("auth/refresh") {
								markAsRefreshTokenRequest()
								contentType(ContentType.Application.Json)
								setBody(RefreshAccessTokenRequest(refreshToken))
							}.body<ApiResponseModel<RefreshAccessTokenResponse, JsonElement>>()

							val data = response.data
							val expiredRefreshToken = response.errors.any { error ->
								error.isAuthError()
							}

							if (expiredRefreshToken) {
								if (tm.getRefreshToken() == refreshToken) {
									tm.clearTokens()
									authEventBus.emit(AuthEvent.Unauthorized)
								}
								return@refreshTokens null
							}

							if (data == null) {
								return@refreshTokens null
							}

							tm.saveTokens(data.access_token, data.refresh_token)
							authEventBus.emit(AuthEvent.Authorized)
							BearerTokens(data.access_token, data.refresh_token)
						} catch (e: CancellationException) {
							throw e
						} catch (e: Exception) {
							null
						}
					}
				}
			}

			defaultRequest {
				url(NetworkConfig.API_URL)
				header(HttpHeaders.ContentType, ContentType.Application.Json)
				header("x-api-key", NetworkConfig.API_KEY)
			}
		}

		authEventBus.onTokensInvalidated = {
			client.authProvider<BearerAuthProvider>()?.clearToken()
		}

		client
	}
}