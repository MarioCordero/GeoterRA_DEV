package com.inii.geoterra.development.api.authentication

import com.inii.geoterra.development.api.authentication.models.*
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

/**
 * Authentication and user management service interface
 */
interface AuthService {

    /**
     * Authenticates user with provided credentials
     * @param credentials User email and password
     * @return Authentication result with session data
     */
    @FormUrlEncoded
    @POST("login.inc.php")
    fun authenticateUser(
        @Field("email") email: String,
        @Field("password") password: String
    ): Call<SignInResponse>

    /**
     * Registers a new user account
     * @param registrationData Complete user registration information
     * @return Registration result with validation status
     */
    @FormUrlEncoded
    @POST("register.inc.php")
    fun registerUser(
        @Field("email") email: String,
        @Field("password") password: String,
        @Field("first_name") firstName: String,
        @Field("last_name") lastName: String,
        @Field("phone_num") phoneNumber: String
    ): Call<SignUpResponse>

    /**
     * Validates current user session status
     * @return Current session information
     */
    @POST("check_session.php")
    fun validateSession(): Call<SessionStatus>

    /**
     * Terminates current user session
     * @return Logout confirmation
     */
    @POST("logout.php")
    fun terminateSession(): Call<LogoutResponse>

    /**
     * Retrieves complete user profile information
     * @param email User's email address
     * @return User profile data
     */
    @FormUrlEncoded
    @POST("user_info.php")
    fun fetchUserProfile(
        @Field("email") email: String
    ): Call<UserProfileResponse>
}