package com.cyberscout.app.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "scan_history")
data class ScanHistoryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val type: String, // "phishing", "url", "email", "breach"
    val input: String,
    val output: String,
    val timestamp: Long = System.currentTimeMillis()
)
