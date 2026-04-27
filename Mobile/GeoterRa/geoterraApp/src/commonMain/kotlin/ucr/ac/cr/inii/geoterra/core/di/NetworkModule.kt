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
<<<<<<< Updated upstream
=======
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
>>>>>>> Stashed changes
import kotlinx.serialization.json.Json
import org.koin.dsl.module
import ucr.ac.cr.inii.geoterra.core.network.ApiResponseModel
import ucr.ac.cr.inii.geoterra.core.network.ErrorMapper
import ucr.ac.cr.inii.geoterra.core.network.NetworkConfig
import ucr.ac.cr.inii.geoterra.core.network.TokenManager
import ucr.ac.cr.inii.geoterra.data.model.remote.RefreshAccessTokenRequest
import ucr.ac.cr.inii.geoterra.data.model.remote.RefreshAccessTokenResponse
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEvent
import ucr.ac.cr.inii.geoterra.domain.auth.AuthEventBus

@OptIn(InternalAPI::class)
val networkModule = module {
  single { AuthEventBus() }
  single { TokenManager(get()) }
  
  single<HttpClient> {
<<<<<<< Updated upstream
    fun HttpClient.invalidateAuthTokens() {
      authProvider<BearerAuthProvider>()?.clearToken()
    }
    
    val authEventBus = get<AuthEventBus>()
    HttpClient(CIO) {
=======

//    fun HttpClient.invalidateAuthTokens() {
//      authProvider<BearerAuthProvider>()?.clearToken()
//    }

    val networkScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    val authEventBus = get<AuthEventBus>()
    val client = HttpClient(CIO) {
>>>>>>> Stashed changes
      install(HttpTimeout) {
        requestTimeoutMillis = 30_000
        connectTimeoutMillis = 30_000
        socketTimeoutMillis = 30_000
      }
<<<<<<< Updated upstream
      
=======

>>>>>>> Stashed changes
      install(ContentNegotiation) {
        json(Json {
          ignoreUnknownKeys = true
          coerceInputValues = true
        })
      }
<<<<<<< Updated upstream
      
=======

>>>>>>> Stashed changes
      install(Logging) {
        logger = object : Logger {
          override fun log(message: String) {
            // "KtorClient" es el tag que buscarás en el Logcat
            println("KtorClient: $message")
          }
        }
<<<<<<< Updated upstream
        
        level = LogLevel.ALL
        
      }
      
      install(Auth) {
        
=======

        level = LogLevel.ALL

      }

      install(Auth) {

>>>>>>> Stashed changes
        bearer {
          sendWithoutRequest { request ->
            val path = request.url.encodedPath
            val isPublic = path.contains("/auth/login") ||
              path.contains("/auth/register") ||
              path.contains("/auth/refresh")
<<<<<<< Updated upstream
            
            !isPublic
          }
          
=======

            !isPublic
          }

>>>>>>> Stashed changes
          loadTokens {
            val tokenManager = get<TokenManager>()
            val access = tokenManager.getAccessToken()
            val refresh = tokenManager.getRefreshToken()
<<<<<<< Updated upstream
            
=======

>>>>>>> Stashed changes
            if (access != null && refresh != null) {
              println("Cargando tokens: $access, $refresh")
              BearerTokens(access, refresh)
            } else {
              null
            }
          }
<<<<<<< Updated upstream
          
          refreshTokens {
            val tm = get<TokenManager>()
            val refreshToken = tm.getRefreshToken() ?: return@refreshTokens null
            
=======

          refreshTokens {
            val tm = get<TokenManager>()
            val refreshToken = tm.getRefreshToken() ?: return@refreshTokens null

>>>>>>> Stashed changes
            try {
              // Client for refreshing tokens
              val response = client.post("auth/refresh") {
                markAsRefreshTokenRequest()
                contentType(ContentType.Application.Json)
                setBody(RefreshAccessTokenRequest(refreshToken))
              }.body<ApiResponseModel<RefreshAccessTokenResponse>>()
<<<<<<< Updated upstream
              
=======

>>>>>>> Stashed changes
              val data = response.data
              val errors = response.errors

              val hasRefreshTokenError = errors.any { error ->
                error.code == ErrorMapper.INVALID_REFRESH_TOKEN || ErrorMapper.isAuthError(error.code)
              }

              if (hasRefreshTokenError || data == null) {
                tm.clearTokens()
                authEventBus.emit(AuthEvent.Unauthorized)
                return@refreshTokens null
              }
<<<<<<< Updated upstream
              
=======

>>>>>>> Stashed changes
              // Save new tokens
              tm.saveTokens(data.access_token, data.refresh_token)
              println("Refrescando tokens: ${data.access_token}, ${data.refresh_token}")
              BearerTokens(data.access_token, data.refresh_token)
<<<<<<< Updated upstream
              
=======

>>>>>>> Stashed changes
            } catch (e: Exception) {
              tm.clearTokens()
              authEventBus.emit(AuthEvent.Unauthorized)
              null
            }
          }
        }
      }
<<<<<<< Updated upstream
      
=======

>>>>>>> Stashed changes
      defaultRequest {
        url(NetworkConfig.API_URL)
        header(HttpHeaders.ContentType, ContentType.Application.Json)
        header("x-api-key", NetworkConfig.API_KEY)
      }
    }
<<<<<<< Updated upstream
=======

    networkScope.launch {
      authEventBus.events.collect { event ->
        if (event is AuthEvent.LoginSuccess) {
          client.authProvider<BearerAuthProvider>()?.clearToken()
        }
      }
    }

    client
>>>>>>> Stashed changes
  }
}