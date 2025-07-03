package com.inii.geoterra.development.api

import com.google.gson.annotations.SerializedName
import retrofit2.Call
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.GET
import retrofit2.http.POST
import java.io.Serializable

/* ==================== AUTHENTICATION MODELS ==================== */
/**
 * @brief Credentials payload for user authentication
 * @property email User's email address
 * @property password Account password (min 8 chars)
 */
data class SignInCredentials(
  @Field("email") val email: String,
  @Field("password") val password: String
)

/**
 * @brief Registration payload for new user accounts
 * @property email Valid email address
 * @property password Minimum 8 character password
 * @property firstName Legal first name
 * @property lastName Legal last name
 * @property phoneNumber E.164 formatted phone number
 */
data class SingUpCredentials(
  val email: String = "",
  val password: String = "",
  val firstName : String = "",
  val lastName : String = "",
  val phoneNumber : String = ""
)

/* ==================== GEOSPATIAL MODELS ==================== */
/**
 * @brief Thermal point data model with water analysis metrics
 * @property pointID Unique geological identifier
 * @property latitude WGS84 decimal coordinate
 * @property longitude WGS84 decimal coordinate
 * @property temperature Ground temperature in Celsius
 * @property fieldPh pH measurement at collection site
 * @property labPh Laboratory-verified pH value
 * @property chlorine Cl concentration (mg/L)
 * @property calcium Ca+ concentration (mg/L)
 * @property mgBicarbonate Mg(HCO3)- concentration (mg/L)
 * @property sulfate Sulfate concentration (mg/L)
 * @property iron Iron concentration (mg/L)
 * @property silicon Si concentration (mg/L)
 * @property boron B concentration (mg/L)
 * @property lithium Li concentration (mg/L)
 * @property fluorine F concentration (mg/L)
 * @property sodium Na+ concentration (mg/L)
 * @property potassium K+ concentration (mg/L)
 * @property magnesiumIon Mg+ concentration (mg/L)*/
data class ThermalPoint(
  @SerializedName("id") val pointID : String,
  @SerializedName("coord_y") val latitude : Double,
  @SerializedName("coord_x") val longitude : Double,

  @SerializedName("temp") val temperature : Double,
  @SerializedName("pH_campo") val fieldPh : Double,
  @SerializedName("cond_campo") val fieldCond : Int,
  @SerializedName("pH_lab") val labPh : Double,
  @SerializedName("cond_lab") val labCond : Int,
  @SerializedName("Cl") val chlorine : Double,
  @SerializedName("Ca+") val calcium : Double,
  @SerializedName("HCO3") val mgBicarbonate : Double,
  @SerializedName("SO4") val sulfate : Double,
  @SerializedName("Fe") val iron : String,
  @SerializedName("Si") val silicon : Int,
  @SerializedName("B") val boron : String,
  @SerializedName("Li") val lithium : String,
  @SerializedName("F") val fluorine : String,
  @SerializedName("Na") val sodium : Double,
  @SerializedName("K") val potassium : Double,
  @SerializedName("MG+") val magnesiumIon : Double
) : Serializable

/* ==================== REQUEST MODELS ==================== */
/**
 * @brief Service request submission payload
 * @property id Unique identifier
 * @property region Region name
 * @property date Request date
 * @property email User email
 * @property owner Owner name
 * @property currentUsage Current usage
 * @property address Address
 * @property ownerContact Phone number
 * @property coordinates WGS84 formatted coordinates
 * @property thermalSensation Thermal sensation rating
 * @property bubbles Bubbles rating
 * @property latitude Latitude
 * @property longitude Longitude
 */
data class AnalysisRequestPayload(
  var id : String = "",
  var region : String = "",
  var date : String = "",
  var email : String = "",
  var owner : String = "",
  var currentUsage : String = "",
  var details : String = "",
  var ownerContact : String = "",
  var coordinates : String = "",
  var thermalSensation : Int = -1,
  var bubbles : Int = -1,
  var latitude : String = "",
  var longitude : String = "",
)

/**
 * @brief API response for submitted service requests
 * @property status Status of the operation (success or error)
 * @property data List of processed requests
 * @property errors Validation errors if any
 */
data class RequestsSubmittedResponse(
  @SerializedName("response") val status : String,
  @SerializedName("data") val data : List<AnalysisRequest>,
  @SerializedName("errors") val errors : List<Error>
)

data class AnalysisRequest(
  @SerializedName("email") val email : String,
  @SerializedName("region") val region : String,
  @SerializedName("fecha") val date : String,
  @SerializedName("propietario") val owner : String,
  @SerializedName("num_telefono") val contactNumber : String,
  @SerializedName("coord_x") val latitude : Double,
  @SerializedName("coord_y") val longitude : Double,
  @SerializedName("direccion") val address : String,
  @SerializedName("uso_actual") val currentUsage : String,
  @SerializedName("sens_termica") val thermalSensation : Int,
  @SerializedName("burbujeo") val bubbles : Int,
  @SerializedName("ph_campo") val fieldPh : Double,
  @SerializedName("cond_campo") val fieldCond : Int,
)

/**
 * Sign in response
 *
 * @property response Status of the operation (success or error)
 * @property errors Validation errors if any
 * @constructor Create empty Sign in response
 */
data class SignInResponse(
  @SerializedName("response") val response : String,
  @SerializedName("errors") val errors : List<Error>
)

/**
 * Logged out response
 *
 * @property response Status of the operation (success or error)
 * @property errors Validation errors if any
 * @constructor Create empty Logged out response
 */
data class LoggedOutResponse(
  @SerializedName("response") val response : String,
  @SerializedName("errors") val errors : List<Error>
)

/**
 * Data class used to format the response of the server in the SignUp request.
 *
 * @property emptyInput Error message for empty fields.
 * @property emailUsed Error message for used email.
 * @constructor Create empty Sign up error response
 */
data class SignUpResponse(
  @SerializedName("response") val response : String,
  @SerializedName("errors") val errors : List<Error>
)

/**
 * Data class used to format the response of the server in the CheckSession request.
 *
 * @property status Status of the session (logged in or not)
 * @property userName User name
 * @constructor Create empty Check session response
 */
data class CheckSessionResponse(
  @SerializedName("status") val status : String,
  @SerializedName("user") val userName : String
)

/**
 * Data class used to format the response of the server in the Request request.
 *
 * @property response Status of the operation (success or error)
 * @property errors Validation errors if any
 * @constructor Create empty Request response
 */
data class RequestResponse(
  @SerializedName("response") val response : String,
  @SerializedName("errors") val errors : List<Error>
)

/**
 * Data class used to format the response of the server in the SignIn request.
 *
 * @property type Error message for empty fields.
 * @property message Error message for invalid credentials.
 * @constructor Create empty Sign in error response
 */
data class Error(
  @SerializedName("type") val type : String,
  @SerializedName("message") val message: String,
)

data class UserInfoResponse(
  @SerializedName("response") var response : String,
  @SerializedName("data") var data : UserInformation
)

/**
 * @brief User profile information
 * @property response Status of the operation (success or error)
 * @property name User full name
 * @property email User email
 * @property phone User phone number
 */
data class UserInformation(
  @SerializedName("name") var name : String,
  @SerializedName("email") var email : String,
  @SerializedName("phone") var phone : String
)

data class ThermalPointResponse(
  @SerializedName("response") val response : String,
  @SerializedName("data") val points : List<ThermalPoint>,
  @SerializedName("errors") val errors : List<Error>
)

/* ==================== API SERVICE ==================== */
/**
 * @brief Retrofit service definition for GeoTerra API
\ */
interface APIService {
  /* ==================== AUTHENTICATION ENDPOINTS ==================== */

  /**
   * @brief Authenticates user credentials
   * @param email Registered account email
   * @param password Account password
   * @return Callback with auth status and errors
   */
  @FormUrlEncoded
  @POST("login.inc.php")
  fun signIn(
    @Field("email") email: String,
    @Field("password") password: String
  ): Call<SignInResponse>

  /**
   * @brief Registers a new user account
   * @param email Registered account email
   * @param password Account password
   * @param firstName Legal first name
   * @param lastName Legal last name
   * @param phoneNumber E.164 formatted phone number
   * @return [SignUpResponse] with validation errors
   */
  @FormUrlEncoded
  @POST("register.inc.php")
  fun signUp(
    @Field("email") email: String,
    @Field("password") password: String,
    @Field("first_name") firstName : String,
    @Field("last_name") lastName : String,
    @Field("phone_num") phoneNumber : String
  ): Call<SignUpResponse>

  /**
   * @brief Validates current session status
   * @return [CheckSessionResponse] with session state
   * @error
   */
  @GET("check_session.php")
  fun checkSession(
  ): Call<CheckSessionResponse>

  /**
   * @brief Terminates current session
   * @return [LoggedOutResponse] confirmation
   */
  @GET("logout.php")
  fun logout(
  ): Call<LoggedOutResponse>

  /* ==================== USER DATA ENDPOINTS ==================== */

  /**
   * @brief Retrieves user profile information
   * @param email Account email address
   * @return [UserInformation] with profile data
   * @error
   */
  @FormUrlEncoded
  @POST("user_info.php")
  fun getUserInfo(
    @Field("email") email: String
  ): Call<UserInfoResponse>

  /* ==================== GEOSPATIAL DATA ENDPOINTS ==================== */

  /**
   * @brief Fetches thermal points for specified region
   * @param region Administrative region code
   * @return List of [ThermalPoint] with water analysis data
   * @error
   */
  @FormUrlEncoded
  @POST("map_data.inc.php")
  fun getMapPoints(
    @Field("region") region: String
  ): Call<ThermalPointResponse>

  /* ==================== SERVICE REQUEST ENDPOINTS ==================== */

  /**
   * @brief Retrieves user's submitted requests
   * @param email Account email address
   * @return [RequestsSubmittedResponse] with request history
   * @error
   */
  @FormUrlEncoded
  @POST("get_request.inc.php")
  fun getSubmittedRequests(
    @Field("email") email : String
  ): Call<RequestsSubmittedResponse>

  /**
   * @brief Submits new geothermal service request
   * @param region Administrative region code
   * @param coordinates WGS84 formatted "lat,lng"
   * @param thermalSensation Field rating (1-5 scale)
   * @param bubbles Observed bubbling intensity (1-5)
   * @return [RequestResponse] with submission status
   * @error
   * @error
   */
  @FormUrlEncoded
  @POST("request.inc.php")
  fun newRequest(
    @Field("pointId") id : String,
    @Field("region") region : String,
    @Field("fecha") date : String,

    @Field ("email") email : String,

    @Field("propietario") owner : String,
    @Field("usoActual") currentUsage : String,
    @Field("direccion") address : String,
    @Field("contactNumber") contactNumber : String,

    @Field("gps") coordinates : String,

    @Field("sensTermica") thermalSensation : Int,
    @Field("burbujeo") bubbles : Int,
    @Field ("lat") latitude : String,
    @Field ("lng") longitude : String,
  ): Call<RequestResponse>

}