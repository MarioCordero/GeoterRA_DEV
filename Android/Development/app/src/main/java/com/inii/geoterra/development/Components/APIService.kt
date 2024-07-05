package com.inii.geoterra.development.Components

import com.google.gson.annotations.SerializedName
import retrofit2.Call
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

data class SignInCredentials(
  @Field("email") val email: String,
  @Field("password") val password: String
)

data class SingUpCredentials(
  @Field("email") val email: String,
  @Field("password") val password: String,
  @Field("first_name") val firstName : String,
  @Field("last_name") val lastName : String,
  @Field("phone_num") val phoneNumber : String
)


data class SignInErrorResponse(
  @SerializedName("empty_input") val emptyInput: String,
  @SerializedName("invalid_cred") val invalidCred: String,
)

data class SignUpErrorResponse(
  @SerializedName("empty_input") val emptyInput : String,
  @SerializedName("email_used") val emailUsed : String
)

interface APIService {
  @FormUrlEncoded
  @POST("login.inc.php")
  fun signIn(
    @Field("email") email: String,
    @Field("password") password: String
  ): Call<List<SignInErrorResponse>>

  @FormUrlEncoded
  @POST("register.inc.php")
  fun signUp(
    @Field("email") email: String,
    @Field("password") password: String,
    @Field("first_name") firstName : String,
    @Field("last_name") lastName : String,
    @Field("phone_num") phoneNumber : String
  ): Call<List<SignUpErrorResponse>> // Cambiar String a List<LoginErrorResponse>
}