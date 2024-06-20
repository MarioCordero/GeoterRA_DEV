package com.inii.geoterra.development.Components

import com.google.gson.annotations.SerializedName
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

data class Credentials(
  @SerializedName("email") val email: String,
  @SerializedName("password") val password: String
)


data class LoginErrorResponse(
  @SerializedName("empty_input") val emptyInput: String,
  @SerializedName("invalid_cred") val invalidCred: String,
)

data class RegisterErrorResponse(
  @SerializedName("empty_input") val emptyInput : String,
  @SerializedName("email_used") val emailUsed : String
)


interface APIService {
  @Headers("Content-Type: application/json")
  @POST("login.inc.php") // Request to see if the given credentials match with some user.
  fun login(@Body credentials: Credentials) : Call<List<LoginErrorResponse>>

  @Headers("Content-Type: application/json")
  @POST("register.inc.php") // Request to create and register a new user.
  fun signUp(@Body credentials : Credentials) : Call<List<RegisterErrorResponse>>
}