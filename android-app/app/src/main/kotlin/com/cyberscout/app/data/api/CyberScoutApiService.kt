package com.cyberscout.app.data.api

import retrofit2.http.Body
import retrofit2.http.POST

interface CyberScoutApiService {
    
    @POST("/api/chat")
    suspend fun analyzeScan(@Body request: ScanRequest): ScanResponse
    
    @POST("/api/analyze-url")
    suspend fun analyzeUrl(@Body request: UrlAnalysisRequest): String
    
    @POST("/api/analyze-email")
    suspend fun analyzeEmail(@Body request: EmailAnalysisRequest): String
}

data class ScanRequest(
    val messages: List<ChatMessage>
)

data class ChatMessage(
    val role: String,
    val content: String
)

data class UrlAnalysisRequest(
    val url: String
)

data class EmailAnalysisRequest(
    val headers: String
)

data class ScanResponse(
    val text: String? = null
)
