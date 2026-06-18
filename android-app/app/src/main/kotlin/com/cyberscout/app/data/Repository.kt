package com.cyberscout.app.data

import android.content.Context
import com.cyberscout.app.data.db.CyberScoutDatabase
import com.cyberscout.app.data.api.ApiClient

object Repository {
    private lateinit var db: CyberScoutDatabase
    
    fun init(context: Context) {
        db = CyberScoutDatabase.getDatabase(context)
    }
    
    val apiService = ApiClient.apiService
    val scanHistoryDao get() = db.scanHistoryDao()
}
