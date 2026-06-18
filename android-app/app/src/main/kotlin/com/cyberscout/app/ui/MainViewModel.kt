package com.cyberscout.app.ui

import android.content.Context
import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cyberscout.app.data.api.*
import com.cyberscout.app.data.db.ScanHistoryDao
import com.cyberscout.app.data.db.ScanHistoryEntity
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MainViewModel(private val scanHistoryDao: ScanHistoryDao) : ViewModel() {
    var terminalOutput by mutableStateOf("")
    var isLoading by mutableStateOf(false)
    var isOcrProcessing by mutableStateOf(false)

    val scanHistory: StateFlow<List<ScanHistoryEntity>> = scanHistoryDao.getAllScans()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    private fun saveToHistory(type: String, input: String, output: String) {
        viewModelScope.launch {
            scanHistoryDao.insertScan(
                ScanHistoryEntity(
                    type = type,
                    input = input,
                    output = output
                )
            )
        }
    }

    fun clearHistory() {
        viewModelScope.launch {
            scanHistoryDao.clearAll()
            terminalOutput = "[SUCCESS] SCAN_HISTORY_CLEARED"
        }
    }

    fun analyzePhishing(input: String) {
        if (input.isBlank()) return
        
        viewModelScope.launch {
            isLoading = true
            terminalOutput = "CONNECTING TO CYBERSCOUT CORAL INTELLIGENCE MATRIX...\n"
            try {
                val prompt = "Analyze the following suspicious message for phishing/fraud. Assess risk on a scale of 1-10. Provide a brief, cyberpunk/hacker-style executive summary with tactical indicators of why it is or isn't a threat. Content: \"$input\""
                val response = ApiClient.apiService.analyzeScan(ScanRequest(listOf(ChatMessage("user", prompt))))
                val output = response.text ?: "[WARN] SECURE CORE RETURNED AN EMPTY TELEMETRY ARRAY."
                terminalOutput = output
                saveToHistory("phishing", input, output)
            } catch (e: Exception) {
                terminalOutput = "\n[ERROR] UPLINK FAILURE: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun analyzeUrl(url: String) {
        if (url.isBlank()) return
        
        viewModelScope.launch {
            isLoading = true
            terminalOutput = "CONNECTING TO CYBERSCOUT CORAL INTELLIGENCE MATRIX...\n"
            try {
                val response = ApiClient.apiService.analyzeUrl(UrlAnalysisRequest(url))
                terminalOutput = response
                saveToHistory("url", url, response)
            } catch (e: Exception) {
                terminalOutput = "\n[ERROR] UPLINK FAILURE: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun analyzeEmail(headers: String) {
        if (headers.isBlank()) return
        
        viewModelScope.launch {
            isLoading = true
            terminalOutput = "CONNECTING TO CYBERSCOUT CORAL INTELLIGENCE MATRIX...\n"
            try {
                val response = ApiClient.apiService.analyzeEmail(EmailAnalysisRequest(headers))
                terminalOutput = response
                saveToHistory("email", headers.take(100), response)
            } catch (e: Exception) {
                terminalOutput = "\n[ERROR] UPLINK FAILURE: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    fun analyzeBreach(email: String) {
        if (email.isBlank()) return
        
        viewModelScope.launch {
            isLoading = true
            terminalOutput = "CONNECTING TO CYBERSCOUT CORAL INTELLIGENCE MATRIX...\n"
            try {
                val prompt = "Act as an elite cybersecurity response assistant. The user email \"$email\" was found in a generic mock data breach. Provide a highly customized, tactical, prioritized 4-step action plan to secure their digital footprint immediately. Keep it punchy and terminal-styled."
                val response = ApiClient.apiService.analyzeScan(ScanRequest(listOf(ChatMessage("user", prompt))))
                val output = response.text ?: "[WARN] SECURE CORE RETURNED AN EMPTY TELEMETRY ARRAY."
                terminalOutput = output
                saveToHistory("breach", email, output)
            } catch (e: Exception) {
                terminalOutput = "\n[ERROR] UPLINK FAILURE: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }
    
    fun clearTerminal() {
        terminalOutput = ""
    }

    fun performOcr(context: Context, uri: Uri, onTextExtracted: (String) -> Unit) {
        viewModelScope.launch {
            isOcrProcessing = true
            terminalOutput = "[STARTING_OCR_ENGINE...]"
            try {
                val image = InputImage.fromFilePath(context, uri)
                recognizer.process(image)
                    .addOnSuccessListener { visionText ->
                        val resultText = visionText.text
                        if (resultText.isNotBlank()) {
                            terminalOutput = "[SUCCESS] OCR COMPLETE: Extracted ${resultText.lines().size} lines.\n\n[TEXT_PREVIEW]: ${resultText.take(200)}..."
                            onTextExtracted(resultText)
                        } else {
                            terminalOutput = "[WARN] OCR extraction failed: No readable text detected in image."
                        }
                        isOcrProcessing = false
                    }
                    .addOnFailureListener { e ->
                        terminalOutput = "[ERROR] OCR FAILURE: ${e.message}"
                        isOcrProcessing = false
                    }
            } catch (e: Exception) {
                terminalOutput = "[ERROR] IMAGE_LOAD_FAILURE: ${e.message}"
                isOcrProcessing = false
            }
        }
    }
}
