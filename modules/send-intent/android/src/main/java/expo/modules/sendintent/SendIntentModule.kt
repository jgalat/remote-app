package expo.modules.sendintent

import android.net.Uri
import android.provider.OpenableColumns
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

class SendIntentModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SendIntent")

    Function("getDisplayName") { uriString: String ->
      val uri = Uri.parse(uriString)

      when (uri.scheme) {
        "content" -> {
          val context = appContext.reactContext ?: return@Function null
          context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) cursor.getString(0) else null
          }
        }
        "file" -> uri.lastPathSegment
        else -> null
      }
    }

    Function("cleanupSharedFile") { uriString: String ->
      val context = appContext.reactContext ?: return@Function false
      val file = File(Uri.parse(uriString).path ?: return@Function false)
      val root = File(context.cacheDir, "shared-intents").canonicalFile
      val candidate = file.canonicalFile
      if (!candidate.path.startsWith(root.path + File.separator)) {
        return@Function false
      }
      candidate.parentFile?.deleteRecursively() ?: false
    }
  }
}
