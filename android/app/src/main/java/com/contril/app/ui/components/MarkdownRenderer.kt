package com.contril.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.contril.app.theme.*

@Composable
fun FormattedMarkdownText(
    markdown: String,
    modifier: Modifier = Modifier,
    primaryColor: Color = MaterialTheme.colorScheme.onSurface,
    mutedColor: Color = MaterialTheme.colorScheme.onSurfaceVariant,
    accentColor: Color = ContrilBlue
) {
    val lines = markdown.split("\n")

    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        for (line in lines) {
            val trimmed = line.trim()

            when {
                trimmed.isBlank() -> {
                    Spacer(modifier = Modifier.height(4.dp))
                }

                trimmed.startsWith(">") -> {
                    val quoteText = trimmed.removePrefix(">").trim()
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = primaryColor.copy(alpha = 0.04f),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.Top,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .width(3.dp)
                                    .height(20.dp)
                                    .background(accentColor, RoundedCornerShape(2.dp))
                            )
                            Text(
                                text = parseInlineMarkdown(quoteText, primaryColor, accentColor),
                                style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 22.sp),
                                color = primaryColor
                            )
                        }
                    }
                }

                trimmed.matches(Regex("^#{1,6}\\s*.*")) -> {
                    val cleanHeader = trimmed.replace(Regex("^#{1,6}\\s*"), "").trim()
                    Text(
                        text = parseInlineMarkdown(cleanHeader, primaryColor, accentColor),
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = (-0.2).sp
                        ),
                        color = primaryColor,
                        modifier = Modifier.padding(top = 6.dp, bottom = 2.dp)
                    )
                }

                trimmed.matches(Regex("^[\\*\\-_]{3,}$")) -> {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .padding(vertical = 4.dp),
                        color = primaryColor.copy(alpha = 0.10f)
                    ) {}
                }

                trimmed.startsWith("• ") || trimmed.startsWith("* ") || trimmed.startsWith("- ") -> {
                    val bulletContent = trimmed.replace(Regex("^[•\\*\\-]\\s+"), "").trim()
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(start = 4.dp, top = 2.dp, bottom = 2.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Text(
                            text = "•",
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                            color = accentColor
                        )
                        Text(
                            text = parseInlineMarkdown(bulletContent, primaryColor, accentColor),
                            style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 22.sp),
                            color = primaryColor,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                trimmed.matches(Regex("^\\d+\\.\\s+.*")) -> {
                    val numberMatch = Regex("^(\\d+\\.)\\s+(.*)").find(trimmed)
                    val num = numberMatch?.groupValues?.get(1) ?: "1."
                    val rest = numberMatch?.groupValues?.get(2) ?: trimmed
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(start = 4.dp, top = 2.dp, bottom = 2.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Text(
                            text = num,
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                            color = accentColor
                        )
                        Text(
                            text = parseInlineMarkdown(rest, primaryColor, accentColor),
                            style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 22.sp),
                            color = primaryColor,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                else -> {
                    Text(
                        text = parseInlineMarkdown(trimmed, primaryColor, accentColor),
                        style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 22.sp),
                        color = primaryColor
                    )
                }
            }
        }
    }
}

fun parseInlineMarkdown(rawText: String, primaryColor: Color, accentColor: Color): AnnotatedString {
    val text = rawText
        .replace(Regex("^#{1,6}\\s*"), "")
        .replace(Regex("^\\s*\\*{3,}\\s*"), "")
        .replace(Regex("^\\s*-{3,}\\s*"), "")
        .trim()

    return buildAnnotatedString {
        var cursor = 0
        val length = text.length

        while (cursor < length) {
            // Check for Bold (**text**)
            if (cursor + 1 < length && text[cursor] == '*' && text[cursor + 1] == '*') {
                val end = text.indexOf("**", cursor + 2)
                if (end != -1) {
                    val boldContent = text.substring(cursor + 2, end)
                    pushStyle(SpanStyle(fontWeight = FontWeight.Bold, color = primaryColor))
                    append(boldContent)
                    pop()
                    cursor = end + 2
                    continue
                }
            }

            // Check for Inline Code (`code`)
            if (text[cursor] == '`') {
                val end = text.indexOf('`', cursor + 1)
                if (end != -1) {
                    val codeContent = text.substring(cursor + 1, end)
                    pushStyle(
                        SpanStyle(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Medium,
                            color = accentColor,
                            background = accentColor.copy(alpha = 0.12f)
                        )
                    )
                    append(" $codeContent ")
                    pop()
                    cursor = end + 1
                    continue
                }
            }

            // Check for Italic (*text* or _text_)
            if ((text[cursor] == '*' && (cursor + 1 < length && text[cursor + 1] != '*')) || text[cursor] == '_') {
                val delimiter = text[cursor]
                val end = text.indexOf(delimiter, cursor + 1)
                if (end != -1) {
                    val italicContent = text.substring(cursor + 1, end)
                    pushStyle(SpanStyle(fontStyle = FontStyle.Italic))
                    append(italicContent)
                    pop()
                    cursor = end + 1
                    continue
                }
            }

            append(text[cursor])
            cursor++
        }
    }
}
