package expo.modules.sendintent

import android.net.Uri
import android.provider.OpenableColumns
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

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
  }
}
