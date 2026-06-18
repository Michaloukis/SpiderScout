package com.cyberscout.app.data.api

import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // Using localhost with 'adb reverse tcp:3000 tcp:3000' for stable USB testing
    private const val BASE_URL = "http://localhost:3000/"
    
    private val gson = GsonBuilder()
        .setLenient()
        .create()
    
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create(gson))
        .build()
    
    val apiService: CyberScoutApiService = retrofit.create(CyberScoutApiService::class.java)
}
