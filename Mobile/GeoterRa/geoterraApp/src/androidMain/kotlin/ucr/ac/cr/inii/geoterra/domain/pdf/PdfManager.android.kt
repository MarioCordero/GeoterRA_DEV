package ucr.ac.cr.inii.geoterra.domain.pdf

import android.app.Activity
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.pdf.PdfDocument
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.annotation.RequiresApi
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.ComposeView
import androidx.core.content.FileProvider
import androidx.lifecycle.LifecycleOwner
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import org.koin.mp.KoinPlatform.getKoin
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import kotlin.math.ceil
import kotlin.math.min
import androidx.core.graphics.createBitmap
import androidx.core.graphics.withTranslation

actual class PDFManager actual constructor() {
	// ADDED FIX: Fetch the context from Koin safely
	private val mContext: Context = getKoin().get()
	private val activity: ComponentActivity = mContext as? ComponentActivity
		?: throw IllegalStateException("Context must be a ComponentActivity")

	private val lifecycleOwner: LifecycleOwner = activity as LifecycleOwner

	@RequiresApi(Build.VERSION_CODES.Q)
	actual suspend fun createPdfFromComposable(
		fileName: String,
		content: @Composable () -> Unit,
	): String? {
		return withContext(Dispatchers.Main) {
			suspendCancellableCoroutine { continuation ->

				if (activity.isFinishing || activity.isDestroyed) {
					continuation.resume(null) {}
					return@suspendCancellableCoroutine
				}

				val tempContainer = FrameLayout(activity)
				val rootView = activity.window.decorView.findViewById<ViewGroup>(android.R.id.content)

				rootView.addView(
					tempContainer,
					ViewGroup.LayoutParams(
						ViewGroup.LayoutParams.MATCH_PARENT,
						ViewGroup.LayoutParams.MATCH_PARENT
					)
				)

				val composeView = ComposeView(activity).apply {
					layoutParams = ViewGroup.LayoutParams(
						ViewGroup.LayoutParams.MATCH_PARENT,
						ViewGroup.LayoutParams.MATCH_PARENT
					)
				}
				tempContainer.addView(composeView)

				// Set the content with a dialog
				composeView.setContent {
					content()
				}

				// Delay to allow UI rendering before generating PDF
				Handler(Looper.getMainLooper()).postDelayed({
					try {
						val pdfPath = generatePdf(composeView, fileName)

						if (pdfPath != null) {
							copyFileToDownloads(activity, pdfPath, fileName)
						}

						continuation.resume(pdfPath) {}
					} catch (e: Exception) {
						Log.e("PdfGenerator", "PDF generation failed", e)
						continuation.resume(null) {}
					} finally {
						rootView.removeView(tempContainer)
						tempContainer.removeAllViews()
						Log.d("PdfGenerator", "Cleanup completed")
					}
				}, 1000)
			}
		}
	}


	@RequiresApi(Build.VERSION_CODES.Q)
	private fun generatePdf(composeView: ComposeView, fileName: String): String? {
		return try {
			// Measure the view
			// ADDED FIX : Use UNSPECIFIED to allow the view to determine its own natural dimensions
			val measureWidth = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
			val measureHeight = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
			composeView.measure(measureWidth, measureHeight)
			composeView.layout(0, 0, composeView.measuredWidth, composeView.measuredHeight)

			val pdfDocument = PdfDocument()
			// ADDED FIX: Dynamically assign the page width based on the measured content.
			// Fallback to 700 if measurement fails (returns 0).
			val pageWidth = if (composeView.measuredWidth > 0) composeView.measuredWidth else 700
			val pageHeight = 2500 // Standard page height
			val totalHeight = composeView.measuredHeight
			val pagesCount = ceil(totalHeight.toDouble() / pageHeight).toInt()

			Log.d("PdfGenerator", "Total view height: $totalHeight, Pages needed: $pagesCount")

			// Create each page and render a portion of the view
			for (pageNum in 0 until pagesCount) {
				val startY = pageNum * pageHeight
				val remainingHeight = totalHeight - startY
				val currentPageHeight = min(pageHeight, remainingHeight)

				Log.d(
					"PdfGenerator",
					"Processing page ${pageNum + 1}, height: $currentPageHeight, starting at Y: $startY"
				)

				val pageInfo =
					PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageNum + 1).create()
				val page = pdfDocument.startPage(pageInfo)
				val canvas = page.canvas

				// Create a bitmap for just this section of the view
				val sectionBitmap =
					createSectionBitmap(composeView, startY, currentPageHeight, pageWidth)

				if (sectionBitmap != null) {
					// Draw the bitmap at the top of the page
					canvas.drawBitmap(
						sectionBitmap,
						0f,
						0f,
						null
					)
					// Recycle bitmap to free memory
					sectionBitmap.recycle()
				} else {
					Log.e("PdfGenerator", "Failed to create bitmap for page ${pageNum + 1}")
				}

				pdfDocument.finishPage(page)
			}

			val file = File(mContext.filesDir, "$fileName.pdf")
			FileOutputStream(file).use { outputStream ->
				pdfDocument.writeTo(outputStream)
			}
			pdfDocument.close()
			file.absolutePath
		} catch (e: Exception) {
			Log.e("PdfGenerator", "Error generating PDF", e)
			e.printStackTrace()
			null
		}
	}

	@RequiresApi(Build.VERSION_CODES.Q)
	private fun createSectionBitmap(view: View, startY: Int, height: Int, width: Int): Bitmap? {
		return try {
			// Create a bitmap for this section
			val bitmap = createBitmap(width, height)
			val canvas = android.graphics.Canvas(bitmap)

			// Save the canvas state and translate it to draw the correct portion
			canvas.withTranslation(0f, -startY.toFloat()) {
				// Draw the view onto the canvas
				view.draw(this)

				// Restore the canvas state
			}

			bitmap
		} catch (e: Exception) {
			Log.e("PdfGenerator", "Error creating section bitmap", e)
			e.printStackTrace()
			null
		}
	}

	/**
	 * Opens the PDF using the system's default PDF viewer.
	 * @param filePath The absolute path to the PDF file.
	 * @param authority The FileProvider authority defined in AndroidManifest.
	 */
	actual fun openPdf(filePath: String, authority: String) {
		try {
			val file = File(filePath)
			if (!file.exists()) return

			val uri = FileProvider.getUriForFile(
				mContext,
				authority,
				file
			)

			val intent = Intent(Intent.ACTION_VIEW).apply {
				setDataAndType(uri, "application/pdf")
				addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
				addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
			}

			mContext.startActivity(Intent.createChooser(intent, "Open PDF"))
		} catch (e: Exception) {
			Log.e("PdfManager", "Error opening PDF: ${e.message}")
		}
	}
//
//  actual fun sharePdf(filePath: String,authority:String) {
//    try {
//      val file = File(filePath)
//
//      if (!file.exists()) {
//        Log.e("SharePDF", "File does not exist: $filePath")
//        return
//      }
//
//      val uri = FileProvider.getUriForFile(mContext, authority, file)
//
//      val intent = Intent(Intent.ACTION_SEND).apply {
//        type = "application/pdf"
//        putExtra(Intent.EXTRA_STREAM, uri)
//        flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or
//          Intent.FLAG_GRANT_WRITE_URI_PERMISSION
//      }
//
//      // Grant permission to all potential receivers
//      val resInfoList = mContext.packageManager.queryIntentActivities(
//        intent,
//        PackageManager.MATCH_DEFAULT_ONLY
//      )
//      for (resolveInfo in resInfoList) {
//        val packageName = resolveInfo.activityInfo.packageName
//        mContext.grantUriPermission(
//          packageName,
//          uri,
//          Intent.FLAG_GRANT_READ_URI_PERMISSION or
//            Intent.FLAG_GRANT_WRITE_URI_PERMISSION
//        )
//      }
//
//      val chooser = Intent.createChooser(intent, "Share PDF")
//      chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
//      try {
//        mContext.startActivity(chooser)
//      } catch (e: Exception) {
//        Log.e("SharePDF", "Error starting chooser activity", e)
//      }
//    } catch (e: Exception) {
//      Log.e("SharePDF", "Error sharing PDF", e)
//    }
//  }

	@RequiresApi(Build.VERSION_CODES.Q)
	private fun copyFileToDownloads(
		context: Activity,
		sourceFilePath: String,
		destinationFileName: String
	) {
		val sourceFile = File(sourceFilePath)
		if (!sourceFile.exists()) {
			Log.e("PdfGenerator", "Source file does not exist: $sourceFilePath")
			return
		}

		val resolver = context.contentResolver
		val contentValues = ContentValues().apply {
			put(MediaStore.Downloads.DISPLAY_NAME, destinationFileName)
			put(MediaStore.Downloads.MIME_TYPE, "application/pdf")
			put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
		}

		val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)

		uri?.let { fileUri ->
			resolver.openOutputStream(fileUri)?.use { outputStream ->
				FileInputStream(sourceFile).use { inputStream ->
					inputStream.copyTo(outputStream)
				}
			}
			Log.d("PdfGenerator", "PDF copied to Downloads: $fileUri")
		} ?: Log.e("PdfGenerator", "Failed to create file in Downloads")
	}
}