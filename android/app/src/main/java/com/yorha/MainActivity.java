package com.yorha;

import static android.os.Build.VERSION.SDK_INT;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;

import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.Nullable;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

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
    super.onCreate(savedInstanceState);
    if (SDK_INT >= Build.VERSION_CODES.R) {
      FilePathModule.manageFileLauncher = registerForActivityResult(
              new ActivityResultContracts.StartActivityForResult(),
              result -> FilePathModule.manageFileLauncherCallback.invoke(Environment.isExternalStorageManager()));
    }
  }
}
