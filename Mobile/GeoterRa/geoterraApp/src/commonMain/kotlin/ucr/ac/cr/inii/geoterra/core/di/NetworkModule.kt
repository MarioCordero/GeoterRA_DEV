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
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
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
    val networkScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

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
            println("KtorClient: $message")
          }
        }

        level = LogLevel.ALL
      }

      install(Auth) {
        bearer {
          sendWithoutRequest { request ->
            val path = request.url.encodedPath
            val publicPaths = listOf("/auth/login", "/auth/register", "/auth/refresh", "geomanifestations/")

						val isPublicPath = publicPaths.any { publicPath ->
              path.startsWith(publicPath)
            }

            !isPublicPath
          }

					// Loads tokens from the token manager
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
              // Client for refreshing tokens
              val response = client.post("auth/refresh") {
                markAsRefreshTokenRequest()
                contentType(ContentType.Application.Json)
                setBody(RefreshAccessTokenRequest(refreshToken))
              }.body<ApiResponseModel<RefreshAccessTokenResponse>>()

              val data = response.data
              val errors = response.errors

              val expiredRefreshToken = errors.any { error ->
                error.isAuthError()
              }

              if (expiredRefreshToken || data == null) {
                tm.clearTokens()
                authEventBus.emit(AuthEvent.Logout)
                return@refreshTokens null
              }

              // Save new tokens
              tm.saveTokens(data.access_token, data.refresh_token)
							authEventBus.emit(AuthEvent.Authorized)
              BearerTokens(data.access_token, data.refresh_token)

            } catch (e: Exception) {
              tm.clearTokens()
              authEventBus.emit(AuthEvent.Logout)
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

    networkScope.launch {
      authEventBus.events.collect { event ->
        if (event is AuthEvent.LoginSuccess) {
          client.authProvider<BearerAuthProvider>()?.clearToken()
        }
      }
    }

    client
  }
}