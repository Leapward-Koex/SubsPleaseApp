package com.yorha; // replace com.your-app-name with your app’s name
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;

public class TorrentModule extends ReactContextBaseJavaModule {
    TorrentModule(ReactApplicationContext context) {
       super(context);
   }

   @Override
    public String getName() {
        return "TorrentDownloader";
    }

    @ReactMethod
    public void createCalendarEvent(String name, String location) {
        Toast.makeText(this.getReactApplicationContext(),"Hello Javatpoint",Toast.LENGTH_SHORT).show();
    }
}

