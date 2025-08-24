package com.inii.geoterra.development.interfaces

import android.app.Application
import com.inii.geoterra.development.Geoterra
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

  @Provides
  @Singleton
  fun provideGeoterra(application: Application): Geoterra {
    return application as Geoterra
  }
}
