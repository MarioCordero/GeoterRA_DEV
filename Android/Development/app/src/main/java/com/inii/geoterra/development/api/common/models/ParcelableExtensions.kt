package com.inii.geoterra.development.api.common

import android.os.Parcel
import android.os.Parcelable

/**
 * Extension functions for Parcelable operations
 */
fun Parcel.writeNullableString(value: String?) {
    writeInt(if (value != null) 1 else 0)
    value?.let { writeString(it) }
}

fun Parcel.readNullableString(): String? {
    return if (readInt() != 0) readString() else null
}

fun Parcel.writeNullableDouble(value: Double?) {
    writeInt(if (value != null) 1 else 0)
    value?.let { writeDouble(it) }
}

fun Parcel.readNullableDouble(): Double? {
    return if (readInt() != 0) readDouble() else null
}

fun Parcel.writeNullableInt(value: Int?) {
    writeInt(if (value != null) 1 else 0)
    value?.let { writeInt(it) }
}

fun Parcel.readNullableInt(): Int? {
    return if (readInt() != 0) readInt() else null
}