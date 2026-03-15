package com.inii.geoterra.development.api.authentication.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

/**
 * Credentials for user authentication
 * @property email Valid email address
 * @property password Account password (minimum 8 characters)
 */
@Parcelize
data class SignInCredentials(
    val email: String = "",
    val password: String = ""
) : Parcelable

/**
 * Registration data for new user accounts
 * @property email Valid email address
 * @property password Minimum 8 character password
 * @property firstName User's legal first name
 * @property lastName User's legal last name
 * @property phoneNumber E.164 formatted phone number
 */
@Parcelize
data class SignUpCredentials(
    val email: String = "",
    val password: String = "",
    val firstName: String = "",
    val lastName: String = "",
    val phoneNumber: String = ""
) : Parcelable