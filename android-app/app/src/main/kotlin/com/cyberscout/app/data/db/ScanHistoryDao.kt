package com.cyberscout.app.data.db

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface ScanHistoryDao {
    
    @Query("SELECT * FROM scan_history ORDER BY timestamp DESC LIMIT 50")
    fun getAllScans(): Flow<List<ScanHistoryEntity>>
    
    @Insert
    suspend fun insertScan(scan: ScanHistoryEntity)
    
    @Delete
    suspend fun deleteScan(scan: ScanHistoryEntity)
    
    @Query("DELETE FROM scan_history")
    suspend fun clearAll()
}
