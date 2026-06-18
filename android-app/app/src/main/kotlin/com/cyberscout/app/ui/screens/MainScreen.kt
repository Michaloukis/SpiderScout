package com.cyberscout.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.cyberscout.app.data.db.CyberScoutDatabase
import com.cyberscout.app.ui.MainViewModel
import com.cyberscout.app.ui.MainViewModelFactory
import com.cyberscout.app.ui.components.*

@Composable
fun MainScreen() {
    val context = LocalContext.current
    val database = remember { CyberScoutDatabase.getDatabase(context) }
    val viewModel: MainViewModel = viewModel(
        factory = MainViewModelFactory(database.scanHistoryDao())
    )

    var activeTab by remember { mutableStateOf("phishing") }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(8.dp)
    ) {
        // Header
        CyberHeader()
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Tab Navigation
        TabNavigation(
            activeTab = activeTab,
            onTabChange = { activeTab = it; viewModel.clearTerminal() }
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Content Area
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .gap(8.dp)
        ) {
            val context = LocalContext.current
            // Tab Content
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .border(1.dp, MaterialTheme.colorScheme.primary)
                    .background(Color(0xFF0A0A0A))
                    .padding(12.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                when (activeTab) {
                    "phishing" -> PhishingScannerTab(
                        onScan = { input -> viewModel.analyzePhishing(input) },
                        onOcrRequest = { uri, onResult -> 
                            viewModel.performOcr(context, uri, onResult)
                        },
                        isOcrProcessing = viewModel.isOcrProcessing
                    )
                    "url" -> UrlAnalyzerTab(
                        onScan = { input -> viewModel.analyzeUrl(input) },
                        onOutputChange = { }
                    )
                    "email" -> EmailHeadersTab(
                        onScan = { input -> viewModel.analyzeEmail(input) },
                        onOutputChange = { }
                    )
                    "breach" -> BreachAssistTab(
                        onScan = { input -> viewModel.analyzeBreach(input) },
                        onOutputChange = { }
                    )
                    "history" -> {
                        val history by viewModel.scanHistory.collectAsState()
                        ScanHistoryTab(
                            history = history,
                            onSelectEntry = { _, output -> 
                                viewModel.terminalOutput = output
                            },
                            onClearHistory = { viewModel.clearHistory() }
                        )
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Terminal Output
        TerminalOutput(output = viewModel.terminalOutput)
    }
}

@Composable
fun RowScope.gap(space: Dp) {
    Spacer(modifier = Modifier.width(space))
}

@Composable
fun CyberHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .border(1.dp, MaterialTheme.colorScheme.primary)
            .padding(12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "▶ CYBERSCOUT_AI // v1.0",
            color = Color.White,
            fontSize = 18.sp,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.weight(1f)
        )
        Box(
            modifier = Modifier
                .border(1.dp, MaterialTheme.colorScheme.primary / 0.5f)
                .padding(4.dp, 2.dp)
        ) {
            Text(
                text = "● ONLINE",
                color = MaterialTheme.colorScheme.primary,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}

@Composable
fun TabNavigation(activeTab: String, onTabChange: (String) -> Unit) {
    val tabs = listOf("phishing", "url", "email", "breach", "history")
    val labels = listOf("PHISH_SCAN", "URL_CHECK", "EMAIL_FIX", "BREACH_AID", "HISTORY")
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .gap(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        tabs.forEachIndexed { index, tab ->
            Button(
                onClick = { onTabChange(tab) },
                modifier = Modifier
                    .border(
                        1.dp,
                        if (activeTab == tab) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.primary / 0.3f
                    )
                    .background(
                        if (activeTab == tab) MaterialTheme.colorScheme.primary else Color.Transparent
                    ),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (activeTab == tab) MaterialTheme.colorScheme.primary else Color.Transparent,
                    contentColor = if (activeTab == tab) Color.Black else MaterialTheme.colorScheme.primary
                ),
                shape = RectangleShape,
                contentPadding = PaddingValues(8.dp, 4.dp)
            ) {
                Text(
                    text = labels[index],
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

@Composable
fun TerminalOutput(output: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp)
            .border(1.dp, MaterialTheme.colorScheme.primary)
            .background(Color.Black)
            .padding(8.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = output.ifEmpty { "> AWAITING_INPUT..." },
            color = MaterialTheme.colorScheme.primary,
            fontSize = 10.sp,
            fontFamily = FontFamily.Monospace,
            lineHeight = 14.sp
        )
    }
}
