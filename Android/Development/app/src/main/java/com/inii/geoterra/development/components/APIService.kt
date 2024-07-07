package com.inii.geoterra.development.components

import com.google.gson.annotations.SerializedName
import retrofit2.Call
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

/**
 * Data class that holds the user data for SignIn request
 *
 * @property email
 * @property password
 * @constructor Create empty SignIn credentials
 */
data class SignInCredentials(
  @Field("email") val email: String,
  @Field("password") val password: String
)

/**
 * Data class that holds the user data for SignUp request.
 *
 * @property email
 * @property password
 * @property firstName
 * @property lastName
 * @property phoneNumber
 * @constructor Create empty SingUp credentials
 */
data class SingUpCredentials(
  @Field("email") val email: String,
  @Field("password") val password: String,
  @Field("first_name") val firstName : String,
  @Field("last_name") val lastName : String,
  @Field("phone_num") val phoneNumber : String
)

/**
 * Data class used to format the response of the server in the SignIn request.
 *
 * @property emptyInput Error message for empty fields.
 * @property invalidCred Error message for invalid credentials.
 * @constructor Create empty Sign in error response
 */
data class SignInErrorResponse(
  @SerializedName("empty_input") val emptyInput: String,
  @SerializedName("invalid_cred") val invalidCred: String,
)

/**
 * Data class used to format the response of the server in the SignUp request.
 *
 * @property emptyInput Error message for empty fields.
 * @property emailUsed Error message for used email.
 * @constructor Create empty Sign up error response
 */
data class SignUpErrorResponse(
  @SerializedName("empty_input") val emptyInput : String,
  @SerializedName("email_used") val emailUsed : String
)

/**
 * API interface that defines the services used in the application.
 *
 * @constructor Create empty API service.
 */
interface APIService {
  /**
   * POST function to sign in the user.
   *
   * @param email
   * @param password
   * @return Callback that holds the list of errors occurred in the request.
   */
  @FormUrlEncoded
  @POST("login.inc.php")
  fun signIn(
    @Field("email") email: String,
    @Field("password") password: String
  ): Call<List<SignInErrorResponse>>

  /**
   * POST function to register the user.
   *
   * @param email
   * @param password
   * @param firstName
   * @param lastName
   * @param phoneNumber
   * @return Callback that holds the list of errors occurred in the request.
   */
  @FormUrlEncoded
  @POST("register.inc.php")
  fun signUp(
    @Field("email") email: String,
    @Field("password") password: String,
    @Field("first_name") firstName : String,
    @Field("last_name") lastName : String,
    @Field("phone_num") phoneNumber : String
  ): Call<List<SignUpErrorResponse>>
}