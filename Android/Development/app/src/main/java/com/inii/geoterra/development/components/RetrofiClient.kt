package com.inii.geoterra.development.components

import com.google.gson.GsonBuilder
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.ResponseBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/**
 * Object that provides a Retrofit client for making HTTP requests.
 */
object RetrofitClient {

  /**
   * Base URL for the API.
   */
  private const val BASE_URL = "http://10.0.2.2:80/API/"

  /**
   * Interceptor for logging HTTP request and response data.
   */
  private val loggingInterceptor = HttpLoggingInterceptor().apply {
    level = HttpLoggingInterceptor.Level.BODY
  }

  private val debuggingInterceptor = Interceptor { chain ->
    val request = chain.request()
    val response = chain.proceed(request)
    val responseBody = response.body?.string()

    println("JSON Response: $responseBody")

    response.newBuilder()
      .body(ResponseBody.create(response.body?.contentType(), responseBody ?: ""))
      .build()
  }

  /**
   * OkHttpClient instance with logging interceptor added.
   */
  private val client = OkHttpClient.Builder()
    .addInterceptor(loggingInterceptor)
    .addInterceptor(debuggingInterceptor)
    .build()

  private val gson = GsonBuilder()
    .setLenient()
    .create()

  /**
   * Retrofit instance configured with base URL, OkHttpClient, and Gson converter.
   */
  private val retrofit = Retrofit.Builder()
    .baseUrl(BASE_URL)
    .client(client)
    .addConverterFactory(GsonConverterFactory.create(gson))
    .build()

  /**
   * Provides the API service for making network calls.
   *
   * @return The API service implementation.
   */
  fun getAPIService(): APIService = retrofit.create(APIService::class.java)
}