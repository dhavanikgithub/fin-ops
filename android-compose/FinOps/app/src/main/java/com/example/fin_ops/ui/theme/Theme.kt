package com.example.fin_ops.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = PrimaryLight,
    onPrimary = OnPrimaryLight,
    primaryContainer = PrimaryContainerLight,
    onPrimaryContainer = OnPrimaryContainerLight,

    secondary = SecondaryLight,
    onSecondary = OnSecondaryLight,
    secondaryContainer = SecondaryContainerLight,
    onSecondaryContainer = OnSecondaryContainerLight,

    tertiary = TertiaryLight,
    onTertiary = OnTertiaryLight,
    tertiaryContainer = TertiaryContainerLight,
    onTertiaryContainer = OnTertiaryContainerLight,

    error = ErrorLight,
    onError = OnErrorLight,
    errorContainer = ErrorContainerLight,
    onErrorContainer = OnErrorContainerLight,

    background = BackgroundLight,
    onBackground = OnBackgroundLight,

    surface = SurfaceLight,
    onSurface = OnSurfaceLight,
    surfaceVariant = SurfaceVariantLight,
    onSurfaceVariant = OnSurfaceVariantLight,

    surfaceTint = PrimaryLight,

    outline = OutlineLight,
    outlineVariant = OutlineVariantLight,

    scrim = ScrimLight,

    inverseSurface = InverseSurfaceLight,
    inverseOnSurface = InverseOnSurfaceLight,
    inversePrimary = InversePrimaryLight,

    surfaceDim = SurfaceDimLight,
    surfaceBright = SurfaceBrightLight,
    surfaceContainerLowest = SurfaceContainerLowestLight,
    surfaceContainerLow = SurfaceContainerLowLight,
    surfaceContainer = SurfaceContainerLight,
    surfaceContainerHigh = SurfaceContainerHighLight,
    surfaceContainerHighest = SurfaceContainerHighestLight,
)

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryDark,
    onPrimary = OnPrimaryDark,
    primaryContainer = PrimaryContainerDark,
    onPrimaryContainer = OnPrimaryContainerDark,

    secondary = SecondaryDark,
    onSecondary = OnSecondaryDark,
    secondaryContainer = SecondaryContainerDark,
    onSecondaryContainer = OnSecondaryContainerDark,

    tertiary = TertiaryDark,
    onTertiary = OnTertiaryDark,
    tertiaryContainer = TertiaryContainerDark,
    onTertiaryContainer = OnTertiaryContainerDark,

    error = ErrorDark,
    onError = OnErrorDark,
    errorContainer = ErrorContainerDark,
    onErrorContainer = OnErrorContainerDark,

    background = BackgroundDark,
    onBackground = OnBackgroundDark,

    surface = SurfaceDark,
    onSurface = OnSurfaceDark,
    surfaceVariant = SurfaceVariantDark,
    onSurfaceVariant = OnSurfaceVariantDark,

    surfaceTint = PrimaryDark,

    outline = OutlineDark,
    outlineVariant = OutlineVariantDark,

    scrim = ScrimDark,

    inverseSurface = InverseSurfaceDark,
    inverseOnSurface = InverseOnSurfaceDark,
    inversePrimary = InversePrimaryDark,

    surfaceDim = SurfaceDimDark,
    surfaceBright = SurfaceBrightDark,
    surfaceContainerLowest = SurfaceContainerLowestDark,
    surfaceContainerLow = SurfaceContainerLowDark,
    surfaceContainer = SurfaceContainerDark,
    surfaceContainerHigh = SurfaceContainerHighDark,
    surfaceContainerHighest = SurfaceContainerHighestDark,
)

@Composable
fun FinOpsTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    // Set to false to use our custom blue theme consistently
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

// Extension properties for custom colors
val MaterialTheme.customColors: CustomColors
    @Composable
    get() = if (isSystemInDarkTheme()) {
        CustomColors(
            success = SuccessDark,
            successContainer = SuccessDarkContainer,
            onSuccess = OnSuccessDark,
            onSuccessContainer = OnSuccessDarkContainer,
            warning = WarningDark,
            warningContainer = WarningDarkContainer,
            onWarning = OnWarningDark,
            onWarningContainer = OnWarningDarkContainer,
            accentBlue = AccentBlue,
            accentBlueBg = AccentBlueBg,
            accentPurple = AccentPurple,
            accentPurpleBg = AccentPurpleBg,
            accentGreen = AccentGreen,
            accentGreenBg = AccentGreenBg,
            accentOrange = AccentOrange,
            accentOrangeBg = AccentOrangeBg,
            accentIndigo = AccentIndigo,
            accentIndigoBg = AccentIndigoBg,
            accentRed = AccentRed,
            accentRedBg = AccentRedBg,
            accentPink = AccentPink,
            accentPinkBg = AccentPinkBg
        )
    } else {
        CustomColors(
            success = SuccessLight,
            successContainer = SuccessLightContainer,
            onSuccess = OnSuccessLight,
            onSuccessContainer = OnSuccessLightContainer,
            warning = WarningLight,
            warningContainer = WarningLightContainer,
            onWarning = OnWarningLight,
            onWarningContainer = OnWarningLightContainer,
            accentBlue = AccentBlue,
            accentBlueBg = AccentBlueBg,
            accentPurple = AccentPurple,
            accentPurpleBg = AccentPurpleBg,
            accentGreen = AccentGreen,
            accentGreenBg = AccentGreenBg,
            accentOrange = AccentOrange,
            accentOrangeBg = AccentOrangeBg,
            accentIndigo = AccentIndigo,
            accentIndigoBg = AccentIndigoBg,
            accentRed = AccentRed,
            accentRedBg = AccentRedBg,
            accentPink = AccentPink,
            accentPinkBg = AccentPinkBg
        )
    }

data class CustomColors(
    val success: androidx.compose.ui.graphics.Color,
    val successContainer: androidx.compose.ui.graphics.Color,
    val onSuccess: androidx.compose.ui.graphics.Color,
    val onSuccessContainer: androidx.compose.ui.graphics.Color,
    val warning: androidx.compose.ui.graphics.Color,
    val warningContainer: androidx.compose.ui.graphics.Color,
    val onWarning: androidx.compose.ui.graphics.Color,
    val onWarningContainer: androidx.compose.ui.graphics.Color,
    val accentBlue: androidx.compose.ui.graphics.Color,
    val accentBlueBg: androidx.compose.ui.graphics.Color,
    val accentPurple: androidx.compose.ui.graphics.Color,
    val accentPurpleBg: androidx.compose.ui.graphics.Color,
    val accentGreen: androidx.compose.ui.graphics.Color,
    val accentGreenBg: androidx.compose.ui.graphics.Color,
    val accentOrange: androidx.compose.ui.graphics.Color,
    val accentOrangeBg: androidx.compose.ui.graphics.Color,
    val accentIndigo: androidx.compose.ui.graphics.Color,
    val accentIndigoBg: androidx.compose.ui.graphics.Color,
    val accentRed: androidx.compose.ui.graphics.Color,
    val accentRedBg: androidx.compose.ui.graphics.Color,
    val accentPink: androidx.compose.ui.graphics.Color,
    val accentPinkBg: androidx.compose.ui.graphics.Color
)