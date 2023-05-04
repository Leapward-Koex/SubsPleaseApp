package com.yorha;

import static android.os.Build.VERSION.SDK_INT;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;

import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.Nullable;
import io.invertase.firebase.crashlytics.ReactNativeFirebaseCrashlyticsNativeHelper;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;

public class MainActivity extends ReactActivity {
  public static String PACKAGE_NAME;
  public static boolean CastingAvailable = false;

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "YoRHa";
  }

  // inside public class MainActivity extends ReactActivity
  @Override
  public void onConfigurationChanged(Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    Intent intent = new Intent("onConfigurationChanged");
    intent.putExtra("newConfig", newConfig);
    sendBroadcast(intent);
  }

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(null);
    PACKAGE_NAME = getApplicationContext().getPackageName();
    try {
      MainActivity.CastingAvailable = true;
    } catch (Exception exception) {
      ReactNativeFirebaseCrashlyticsNativeHelper.log("Failed to initialize cast context");
      ReactNativeFirebaseCrashlyticsNativeHelper.recordNativeException(exception);
    }
    if (SDK_INT >= Build.VERSION_CODES.R) {
      FilePathModule.manageFileLauncher = registerForActivityResult(
              new ActivityResultContracts.StartActivityForResult(),
              result -> FilePathModule.manageFileLauncherCallback.invoke(Environment.isExternalStorageManager()));
    }
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }

    @Override
    protected boolean isConcurrentRootEnabled() {
      // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
      // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
      return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    }
  }
}
