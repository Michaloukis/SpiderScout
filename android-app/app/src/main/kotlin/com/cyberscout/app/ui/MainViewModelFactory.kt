package com.cyberscout.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.cyberscout.app.data.db.ScanHistoryDao

class MainViewModelFactory(private val scanHistoryDao: ScanHistoryDao) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(scanHistoryDao) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
