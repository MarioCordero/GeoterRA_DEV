package ucr.ac.cr.inii.geoterra

import android.content.Context

object ActivityContext{
  lateinit var mContext: Context

  fun initializeActivityContext(ctx: Context){
    mContext = ctx
  }

}