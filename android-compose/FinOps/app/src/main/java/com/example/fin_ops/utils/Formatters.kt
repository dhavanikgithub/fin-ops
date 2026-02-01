package com.example.fin_ops.utils

import java.util.Locale
import android.icu.text.DateFormat
import com.example.fin_ops.presentation.calculator.simple.SavedScenario
import java.util.Date
import java.util.concurrent.TimeUnit
import java.text.SimpleDateFormat
import kotlin.math.abs


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



// --- Currency Formatting (Adds Symbol & Handles Negative Sign) ---

fun formatCurrency(amount: Double): String {
    val isNegative = amount < 0
    // We format the absolute value to ensure we control the sign placement
    val formattedNumber = formatAmount(abs(amount))

    return if (isNegative) {
        "-₹$formattedNumber"
    } else {
        "₹$formattedNumber"
    }
}

fun formatCurrency(amount: Long): String {
    return formatCurrency(amount.toDouble())
}

fun formatCurrency(amount: String): String {
    val value = amount.toDoubleOrNull()
    return if (value != null) {
        formatCurrency(value)
    } else {
        "₹$amount" // Fallback
    }
}

// --- Amount Formatting (Trims .00 if whole number) ---

fun formatAmount(amount: Double): String {
    // 1. Format with 2 decimal places standard
    var formatted = String.format(Locale.getDefault(), "%,.2f", amount)

    // 2. Trim trailing ".00" or ",00" (depending on locale)
    if (formatted.endsWith(".00")) {
        formatted = formatted.dropLast(3)
    } else if (formatted.endsWith(",00")) {
        formatted = formatted.dropLast(3)
    }

    return formatted
}

fun formatAmount(amount: Long): String {
    return formatAmount(amount.toDouble())
}

fun formatAmount(amount: String): String {
    val value = amount.toDoubleOrNull() ?: return amount
    return formatAmount(value)
}

fun maskCardNumber(cardNumber: String): String {
    return if (cardNumber.length >= 4) {
        "**** ${cardNumber.takeLast(4)}"
    } else {
        cardNumber
    }
}
