package com.cyberscout.app.ui.components

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun PhishingScannerTab(
    onScan: (String) -> Unit,
    onOcrRequest: (Uri, (String) -> Unit) -> Unit,
    isOcrProcessing: Boolean
) {
    var input by remember { mutableStateOf("") }
    val context = LocalContext.current
    
    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            onOcrRequest(it) { extractedText ->
                input = extractedText
            }
        }
    }
    
    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            text = "> PHISHING_INTEL_SCAN",
            color = Color.White,
            fontSize = 14.sp,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        TextField(
            value = input,
            onValueChange = { input = it },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .background(Color.Black)
                .border(1.dp, MaterialTheme.colorScheme.primary / 0.5f),
            textStyle = androidx.compose.material3.LocalTextStyle.current.copy(
                color = MaterialTheme.colorScheme.primary,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            ),
            placeholder = {
                Text(
                    "Paste suspicious SMS, URLs, or headers...",
                    color = Color.Gray,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            },
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Black,
                unfocusedContainerColor = Color.Black,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                cursorColor = MaterialTheme.colorScheme.primary
            )
        )
        
        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = { launcher.launch("image/*") },
            modifier = Modifier
                .fillMaxWidth()
                .height(36.dp)
                .border(1.dp, MaterialTheme.colorScheme.primary / 0.5f)
                .background(Color.Transparent),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Transparent,
                contentColor = MaterialTheme.colorScheme.primary
            ),
            shape = RectangleShape,
            enabled = !isOcrProcessing
        ) {
            Text(
                if (isOcrProcessing) "PROCESSING_IMAGE..." else "UPLOAD_SCREENSHOT_OCR",
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            )
        }

        Spacer(modifier = Modifier.height(8.dp))
        
        Button(
            onClick = { onScan(input) },
            modifier = Modifier
                .fillMaxWidth()
                .height(36.dp)
                .border(1.dp, MaterialTheme.colorScheme.primary)
                .background(Color.Transparent),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Transparent,
                contentColor = MaterialTheme.colorScheme.primary
            ),
            shape = RectangleShape
        ) {
            Text("EXECUTE_SCAN", fontFamily = FontFamily.Monospace, fontSize = 11.sp)
        }
    }
}

@Composable
fun UrlAnalyzerTab(
    onScan: (String) -> Unit,
    onOutputChange: (String) -> Unit
) {
    var input by remember { mutableStateOf("") }
    
    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            text = "> URL_THREAT_ANALYZER",
            color = Color.White,
            fontSize = 14.sp,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        TextField(
            value = input,
            onValueChange = { input = it },
            modifier = Modifier
                .fillMaxWidth()
                .height(60.dp)
                .background(Color.Black)
                .border(1.dp, MaterialTheme.colorScheme.primary / 0.5f),
            textStyle = androidx.compose.material3.LocalTextStyle.current.copy(
                color = MaterialTheme.colorScheme.primary,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            ),
            placeholder = {
                Text(
                    "https://example.com/verify-account",
                    color = Color.Gray,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            },
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Black,
                unfocusedContainerColor = Color.Black,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                cursorColor = MaterialTheme.colorScheme.primary
            )
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Button(
            onClick = { onScan(input) },
            modifier = Modifier
                .fillMaxWidth()
                .height(36.dp)
                .border(1.dp, MaterialTheme.colorScheme.primary)
                .background(Color.Transparent),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Transparent,
                contentColor = MaterialTheme.colorScheme.primary
            ),
            shape = RectangleShape
        ) {
            Text("SCAN_URL", fontFamily = FontFamily.Monospace, fontSize = 11.sp)
        }
    }
}

@Composable
fun EmailHeadersTab(
    onScan: (String) -> Unit,
    onOutputChange: (String) -> Unit
) {
    var input by remember { mutableStateOf("") }
    
    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            text = "> EMAIL_HEADER_FORENSICS",
            color = Color.White,
            fontSize = 14.sp,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        TextField(
            value = input,
            onValueChange = { input = it },
            modifier = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .background(Color.Black)
                .border(1.dp, MaterialTheme.colorScheme.primary / 0.5f),
            textStyle = androidx.compose.material3.LocalTextStyle.current.copy(
                color = MaterialTheme.colorScheme.primary,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            ),
            placeholder = {
                Text(
                    "Paste complete email headers...",
                    color = Color.Gray,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            },
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Black,
                unfocusedContainerColor = Color.Black,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                cursorColor = MaterialTheme.colorScheme.primary
            )
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Button(
            onClick = { onScan(input) },
            modifier = Modifier
                .fillMaxWidth()
                .height(36.dp)
                .border(1.dp, MaterialTheme.colorScheme.primary)
                .background(Color.Transparent),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Transparent,
                contentColor = MaterialTheme.colorScheme.primary
            ),
            shape = RectangleShape
        ) {
            Text("SCAN_HEADERS", fontFamily = FontFamily.Monospace, fontSize = 11.sp)
        }
    }
}

@Composable
fun BreachAssistTab(
    onScan: (String) -> Unit,
    onOutputChange: (String) -> Unit
) {
    var input by remember { mutableStateOf("") }
    
    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            text = "> BREACH_TARGET_AUDIT",
            color = Color.White,
            fontSize = 14.sp,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        TextField(
            value = input,
            onValueChange = { input = it },
            modifier = Modifier
                .fillMaxWidth()
                .height(60.dp)
                .background(Color.Black)
                .border(1.dp, MaterialTheme.colorScheme.primary / 0.5f),
            textStyle = androidx.compose.material3.LocalTextStyle.current.copy(
                color = MaterialTheme.colorScheme.primary,
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp
            ),
            placeholder = {
                Text(
                    "your@email.com",
                    color = Color.Gray,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            },
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Black,
                unfocusedContainerColor = Color.Black,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                cursorColor = MaterialTheme.colorScheme.primary
            )
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Button(
            onClick = { onScan(input) },
            modifier = Modifier
                .fillMaxWidth()
                .height(36.dp)
                .border(1.dp, MaterialTheme.colorScheme.primary)
                .background(Color.Transparent),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Transparent,
                contentColor = MaterialTheme.colorScheme.primary
            ),
            shape = RectangleShape
        ) {
            Text("AUDIT_BREACH", fontFamily = FontFamily.Monospace, fontSize = 11.sp)
        }
    }
}

import androidx.compose.foundation.clickable
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import com.cyberscout.app.data.db.ScanHistoryEntity

@Composable
fun ScanHistoryTab(
    history: List<ScanHistoryEntity>,
    onSelectEntry: (String, String) -> Unit,
    onClearHistory: () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "> SCAN_HISTORY_LOG",
                color = Color.White,
                fontSize = 14.sp,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            if (history.isNotEmpty()) {
                Text(
                    text = "[CLEAR_ALL]",
                    color = Color.Red,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier
                        .clickable { onClearHistory() }
                        .padding(bottom = 8.dp)
                )
            }
        }
        
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .background(Color.Black)
                .border(1.dp, MaterialTheme.colorScheme.primary / 0.5f)
                .padding(8.dp)
        ) {
            if (history.isEmpty()) {
                Text(
                    text = "[NO_DATA] No scans yet. Run analyses to populate history.",
                    color = Color.DarkGray,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                )
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(history) { entry ->
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.dp, MaterialTheme.colorScheme.primary / 0.3f)
                                .clickable { onSelectEntry(entry.input, entry.output) }
                                .padding(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = entry.type.uppercase(),
                                    color = MaterialTheme.colorScheme.primary,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = androidx.compose.ui.text.font.FontWeight.Bold
                                )
                                Text(
                                    text = java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.getDefault())
                                        .format(java.util.Date(entry.timestamp)),
                                    color = Color.Gray,
                                    fontSize = 8.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                            Text(
                                text = entry.input.take(50) + if (entry.input.length > 50) "..." else "",
                                color = Color.LightGray,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                maxLines = 1
                            )
                        }
                    }
                }
            }
        }
    }
}
