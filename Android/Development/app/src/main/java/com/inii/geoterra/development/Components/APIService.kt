package com.inii.geoterra.development.Components

import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

data class User (
  val id : Int,
  val name : String,
  val email : String
)

data class APIResponse<T>(
  val success  : Boolean,
  val message : String,
  val data    : T?
)


interface APIService {
  @FormUrlEncoded
  @POST("login.inc.php")
  fun login(
    @Field("email") email: String,
    @Field("password") password: String
  )
}