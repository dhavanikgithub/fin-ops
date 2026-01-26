
package com.example.fin_ops.utils
import java.util.Locale
import android.icu.text.DateFormat
import com.example.fin_ops.presentation.calculator.simple.SavedScenario
import java.util.Date
import java.util.concurrent.TimeUnit
import java.text.SimpleDateFormat


/**
 * Formats a timestamp (Long) into a smart Date/Time string using ICU (API 24+).
 * * @param skeleton A "skeleton" pattern. Examples:
 * - "yMMMd" -> "Jan 25, 2026" (US) or "25 Jan 2026" (UK)
 * - "jm"    -> "10:30 PM" (US) or "22:30" (Germany)
 * - "yMMMdjm" -> Combined Date and Time
 */
fun Long.toDateTimeString(
    skeleton: String = "yMMMd",
    locale: Locale = Locale.getDefault()
): String {
    // getInstanceForSkeleton is the "smart" formatter that adjusts order based on Locale
    val formatter = DateFormat.getInstanceForSkeleton(skeleton, locale)
    return formatter.format(Date(this))
}

/**
 * Formats milliseconds into a timer style string (e.g., "05:30" or "01:15:20").
 * Automatically handles hours if the duration is long enough.
 */
fun Long.toTimerString(): String {
    val hours = TimeUnit.MILLISECONDS.toHours(this)
    val minutes = TimeUnit.MILLISECONDS.toMinutes(this) % 60
    val seconds = TimeUnit.MILLISECONDS.toSeconds(this) % 60

    return if (hours > 0) {
        String.format(Locale.getDefault(),"%02d:%02d:%02d", hours, minutes, seconds)
    } else {
        String.format(Locale.getDefault(),"%02d:%02d", minutes, seconds)
    }
}

/**
 * Formats a timestamp into the specific format: "18 Jan 2026 • 02:27:54 PM"
 */
fun Long.toCustomDateTimeString(): String {
    // Pattern breakdown:
    // dd    = Day (18)
    // MMM   = Short Month (Jan)
    // yyyy  = Year (2026)
    // '•'   = Literal separator inside quotes
    // hh    = 12-hour format (02)
    // mm    = Minutes (27)
    // ss    = Seconds (54)
    // a     = AM/PM Marker
    val pattern = "dd MMM yyyy '•' hh:mm:ss a"

    // We use Locale.US to force "Jan" and "PM".
    // If you use Locale.getDefault(), a Spanish phone would output "ene" and "p. m."
    val formatter = SimpleDateFormat(pattern, Locale.US)

    return formatter.format(Date(this))
}

/**
 * Parses a String date and reformats it to: "18 Jan 2026 • 02:27:54 PM"
 * * @param inputPattern The format of the String you are PASSING IN.
 * Default is ISO 8601 ("yyyy-MM-dd'T'HH:mm:ss").
 * @return The formatted string, or the original string if parsing fails.
 */
fun String.toCustomDateTimeString(
    inputPattern: String = "yyyy-MM-dd'T'HH:mm:ss"
): String {
    return try {
        // 1. Define how to read the Input String
        val inputFormatter = SimpleDateFormat(inputPattern, Locale.US)
        // Optional: If your input string is UTC/Zulu time, set timezone here
        // inputFormatter.timeZone = TimeZone.getTimeZone("UTC")

        // 2. Parse string to Date object
        val date = inputFormatter.parse(this) ?: return this

        // 3. Define the Desired Output Format
        val outputFormatter = SimpleDateFormat("dd MMM yyyy '•' hh:mm:ss a", Locale.US)

        // 4. Return result
        outputFormatter.format(date)
    } catch (e: Exception) {
        // If parsing fails (wrong format), return the original string so the app doesn't crash
        this
    }
}

fun formatCurrency(value: Double): String {
    return "₹${"%.2f".format(value)}"
}

fun calculateReceivable(scenario: SavedScenario): Double {
    val ourDecimal = scenario.ourCharge / 100
    return scenario.amount - (scenario.amount * ourDecimal)
}


fun formatTimestamp(timestamp: Long): String {
    val date = Date(timestamp)
    val dateFormat = SimpleDateFormat("MMM dd, yyyy 'at' hh:mm a", Locale.getDefault())
    return "Saved: ${dateFormat.format(date)}"
}

fun formatPresetDate(timestamp: Long): String {
    val date = Date(timestamp)
    val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
    return "Added ${dateFormat.format(date)}"
}