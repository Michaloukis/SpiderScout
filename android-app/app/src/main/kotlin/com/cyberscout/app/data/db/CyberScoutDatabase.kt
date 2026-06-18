package com.cyberscout.app.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [ScanHistoryEntity::class],
    version = 1,
    exportSchema = false
)
abstract class CyberScoutDatabase : RoomDatabase() {
    abstract fun scanHistoryDao(): ScanHistoryDao
    
    companion object {
        @Volatile
        private var INSTANCE: CyberScoutDatabase? = null
        
        fun getDatabase(context: Context): CyberScoutDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    CyberScoutDatabase::class.java,
                    "cyberscout_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
