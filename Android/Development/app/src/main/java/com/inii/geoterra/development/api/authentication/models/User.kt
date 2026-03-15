package com.inii.geoterra.development.api.authentication.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

/**
 * Complete user profile information
 * @property name User's full name
 * @property email User's email address
 * @property phone User's phone number
 */
@Parcelize
data class UserProfile(
    @SerializedName("name") val name: String = "",
    @SerializedName("email") val email: String = "",
    @SerializedName("phone") val phone: String = ""
) : Parcelable

/**
 * User session status information
 * @property status Current session state (logged_in/logged_out)
 * @property userName Authenticated user's name
 */
@Parcelize
data class SessionStatus(
    @SerializedName("status") val status: String = "",
    @SerializedName("user") val userName: String = ""
) : Parcelable