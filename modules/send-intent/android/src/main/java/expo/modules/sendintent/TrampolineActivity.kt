package expo.modules.sendintent

import android.app.Activity
import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.OpenableColumns
import java.io.File
import java.util.UUID

class TrampolineActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val intent = intent
    if (intent != null) {
      routeIntent(intent)?.let { target ->
        target.component = ComponentName(packageName, "$packageName.MainActivity")
        target.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        startActivity(target)
      }
    }

    finish()
  }

  private fun routeIntent(intent: Intent): Intent? {
    return when (intent.action) {
      Intent.ACTION_SEND -> handleSend(intent)
      Intent.ACTION_VIEW -> handleView(intent)
      else -> null
    }
  }

  private fun handleSend(intent: Intent): Intent? {
    val uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
    } else {
      @Suppress("DEPRECATION")
      intent.getParcelableExtra(Intent.EXTRA_STREAM)
    } ?: return null

    val cacheUri = copyToCache(uri) ?: return null
    return Intent(Intent.ACTION_VIEW).apply { data = cacheUri }
  }

  private fun handleView(intent: Intent): Intent? {
    val data = intent.data ?: return null

    // content: URI permissions won't transfer to the main activity
    if (data.scheme == "content") {
      val cacheUri = copyToCache(data) ?: return null
      return Intent(Intent.ACTION_VIEW).apply { this.data = cacheUri }
    }

    return Intent(Intent.ACTION_VIEW).apply { this.data = data }
  }

  private fun copyToCache(uri: Uri): Uri? {
    val displayName = contentResolver.query(
      uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null
    )?.use { cursor ->
      if (cursor.moveToFirst()) cursor.getString(0) else null
    } ?: "shared.torrent"

    val parent = File(cacheDir, "shared-intents/${UUID.randomUUID()}")
    if (!parent.mkdirs()) return null
    val filename = File(displayName).name.ifBlank { "shared.torrent" }
    val cacheFile = File(parent, filename)
    if (!cacheFile.canonicalPath.startsWith(parent.canonicalPath + File.separator)) {
      parent.deleteRecursively()
      return null
    }

    try {
      val inputStream = contentResolver.openInputStream(uri)
      if (inputStream == null) {
        parent.deleteRecursively()
        return null
      }
      inputStream.use { input ->
        cacheFile.outputStream().use { output ->
          input.copyTo(output)
        }
      }
    } catch (_: Throwable) {
      parent.deleteRecursively()
      return null
    }

    return Uri.fromFile(cacheFile)
  }
}
