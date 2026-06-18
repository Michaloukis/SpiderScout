package com.cyberscout.app.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

val CyberGreen = Color(0xFF00FF66)
val CyberWarm = Color(0xFFFF8F00)
val CyberAmber = Color(0xFFFFC107)
val CyberBlack = Color(0xFF000000)
val CyberDarkGray = Color(0xFF1A1A1A)
val CyberLightGray = Color(0xFF333333)

val DarkColorScheme = darkColorScheme(
    primary = CyberWarm,
    secondary = CyberAmber,
    tertiary = CyberAmber,
    background = CyberBlack,
    surface = CyberDarkGray,
    onBackground = CyberWarm,
    onSurface = CyberWarm
)

val LightColorScheme = lightColorScheme(
    primary = CyberWarm,
    secondary = CyberAmber,
    tertiary = CyberAmber,
    background = CyberBlack,
    surface = CyberDarkGray,
    onBackground = CyberWarm,
    onSurface = CyberWarm
)
