package com.quietmaterial

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

/** Place in setContent. Responsive to window constraints, including split-screen. */
@Composable
fun QuietExample() {
    var name by rememberSaveable { mutableStateOf("Personal workspace") }
    var notifications by rememberSaveable { mutableStateOf(false) }
    var showDetails by rememberSaveable { mutableStateOf(false) }
    QuietTheme {
        QuietScaffold { innerPadding ->
            BoxWithConstraints(
                modifier = Modifier.fillMaxSize().padding(innerPadding)
                    .consumeWindowInsets(innerPadding).imePadding(),
                contentAlignment = Alignment.TopCenter,
            ) {
                val pagePadding = if (maxWidth >= QuietTokens.breakpointMedium.dp)
                    QuietTokens.layoutPagePaddingMedium.dp else QuietTokens.layoutPagePaddingCompact.dp
                val expanded = maxWidth >= QuietTokens.breakpointExpanded.dp &&
                    LocalDensity.current.fontScale < 1.5f
                Column(
                    modifier = Modifier.widthIn(max = QuietTokens.sizeContent.dp)
                        .fillMaxWidth().verticalScroll(rememberScrollState()).padding(pagePadding),
                    verticalArrangement = Arrangement.spacedBy(QuietTokens.space6.dp),
                ) {
                    Text("Quiet Material", style = MaterialTheme.typography.labelLarge,
                        color = QuietTokens.colorTextMuted)
                    Text("A little more focus.", style = MaterialTheme.typography.headlineLarge,
                        modifier = Modifier.semantics { heading() })
                    Text("Only what you need, with space to think.",
                        color = QuietTokens.colorTextMuted)
                    val workspace: @Composable (Modifier) -> Unit = { modifier ->
                        QuietCard(modifier) {
                            Text("Your workspace", style = MaterialTheme.typography.titleLarge,
                                modifier = Modifier.semantics { heading() })
                            QuietTextField("Workspace name", name, { name = it })
                            QuietSwitch("Receive notifications", notifications, { notifications = it })
                            QuietButton("Review preferences", { showDetails = true })
                        }
                    }
                    val guidance: @Composable (Modifier) -> Unit = { modifier ->
                        QuietCard(modifier) {
                            Text("Room to breathe", style = MaterialTheme.typography.titleLarge,
                                modifier = Modifier.semantics { heading() })
                            Text("Cards stack on a phone and sit side by side when the window has enough space. Larger text returns to one column.")
                        }
                    }
                    if (expanded) {
                        Row(horizontalArrangement = Arrangement.spacedBy(QuietTokens.space6.dp)) {
                            workspace(Modifier.weight(1f))
                            guidance(Modifier.weight(1f))
                        }
                    } else {
                        workspace(Modifier.fillMaxWidth())
                        guidance(Modifier.fillMaxWidth())
                    }
                }
            }
        }
        if (showDetails) {
            AlertDialog(
                onDismissRequest = { showDetails = false },
                title = { Text("Your preferences") },
                text = { Text("$name\nNotifications are ${if (notifications) "on" else "off"}.") },
                confirmButton = { QuietButton("Done", { showDetails = false }) },
                containerColor = QuietTokens.colorSurface,
            )
        }
    }
}
