package com.yorha; // replace com.your-app-name with your app’s name

import static android.os.Build.VERSION.SDK_INT;

import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Log;

import androidx.activity.result.ActivityResultLauncher;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.net.ServerSocket;

public class FilePathModule extends ReactContextBaseJavaModule {
    FilePathModule(ReactApplicationContext context) {
       super(context);
   }

    private Uri contentUri = null;
    public static ActivityResultLauncher<Intent> manageFileLauncher = null;
    public static Callback manageFileLauncherCallback = null;

    @Override
    public String getName() {
        return "FilePathModule";
    }

    @ReactMethod
    public void verifyManageFilesPermission(Callback callBack) {
        if (SDK_INT >= Build.VERSION_CODES.R) {
            if (!Environment.isExternalStorageManager()) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                Uri uri = Uri.fromParts("package", MainActivity.PACKAGE_NAME, null);
                intent.setData(uri);

                FilePathModule.manageFileLauncherCallback = callBack;
                FilePathModule.manageFileLauncher.launch(intent);
                // Callback is handled on the activity result callback in main activity.
            }
            else {
                callBack.invoke(true);
            }
        }
    }

    @ReactMethod
    public void openVideoIntent(final String filePath, Callback callBack) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(filePath));
        intent.setDataAndType(Uri.parse(filePath), "video/*");
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getReactApplicationContext().startActivity(intent);
        callBack.invoke(true);
    }

    @ReactMethod
    public void readTextFile(final String filePath, Callback callBack) {
        File file = new File(filePath);
        StringBuilder text = new StringBuilder();

        try {
            BufferedReader br = new BufferedReader(new FileReader(file));
            String line;

            while ((line = br.readLine()) != null) {
                text.append(line);
                text.append('\n');
            }
            br.close();
            callBack.invoke(text.toString());
        }
        catch (IOException e) {
            callBack.invoke("");
        }
    }

    @ReactMethod
    public void getOpenPort(Callback callBack) {
        int port = -1;
        try {
            ServerSocket socket = new ServerSocket(0);
            port = socket.getLocalPort();
            socket.close();
        }
        catch (IOException ioe) {}
        callBack.invoke(port);
    }

    @ReactMethod
    public void fileExists(final String filePath, Callback callBack) {
        File file = new File(filePath);
        callBack.invoke(file.exists());
    }

    @ReactMethod
    public void deleteFileIfExists(final String filePath, Callback callBack) {
        File file = new File(filePath);
        if (file.exists()) {
            callBack.invoke(file.delete());
        }
        else {
            callBack.invoke(true);
        }
    }

    // Adapted from https://github.com/saparkhid/AndroidFileNamePicker
    @ReactMethod
    public void getFolderPathFromUri(final String uriString, Callback callBack) {
        // check here to KITKAT or new version
        final boolean isKitKat = SDK_INT >= Build.VERSION_CODES.KITKAT;
        final Uri uri =  DocumentsContract.buildDocumentUriUsingTree(Uri.parse(uriString), DocumentsContract.getTreeDocumentId(Uri.parse(uriString)));

        String selection = null;
        String[] selectionArgs = null;
        // DocumentProvider
        if (isKitKat) {
            // ExternalStorageProvider

            if (isExternalStorageDocument(uri)) {
                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];

                String fullPath = getPathFromExtSD(split);
                if (fullPath != "") {
                    callBack.invoke(fullPath);
                } else {
                    callBack.invoke();
                }
                return;
            }


            // DownloadsProvider

            if (isDownloadsDocument(uri)) {

                if (SDK_INT >= Build.VERSION_CODES.M) {
                    final String id;
                    Cursor cursor = null;
                    try {
                        cursor = this.getReactApplicationContext().getContentResolver().query(uri, new String[]{MediaStore.MediaColumns.DISPLAY_NAME}, null, null, null);
                        if (cursor != null && cursor.moveToFirst()) {
                            String fileName = cursor.getString(0);
                            String path = Environment.getExternalStorageDirectory().toString() + "/Download/" + fileName;
                            if (!TextUtils.isEmpty(path)) {
                                callBack.invoke(path);
                                return;
                            }
                        }
                    }
                    finally {
                        if (cursor != null)
                            cursor.close();
                    }
                    id = DocumentsContract.getDocumentId(uri);
                    if (!TextUtils.isEmpty(id)) {
                        if (id.startsWith("raw:")) {
                            callBack.invoke(id.replaceFirst("raw:", ""));
                            return;
                        }
                        String[] contentUriPrefixesToTry = new String[]{
                                "content://downloads/public_downloads",
                                "content://downloads/my_downloads"
                        };
                        for (String contentUriPrefix : contentUriPrefixesToTry) {
                            try {
                                final Uri contentUri = ContentUris.withAppendedId(Uri.parse(contentUriPrefix), Long.valueOf(id));


                                callBack.invoke(getDataColumn(this.getReactApplicationContext(), contentUri, null, null));
                                return;
                            } catch (NumberFormatException e) {
                                //In Android 8 and Android P the id is not a number
                                callBack.invoke(uri.getPath().replaceFirst("^/document/raw:", "").replaceFirst("^raw:", ""));
                                return;
                            }
                        }


                    }
                }
                else {
                    final String id = DocumentsContract.getDocumentId(uri);

                    if (id.startsWith("raw:")) {
                        callBack.invoke(id.replaceFirst("raw:", ""));
                        return;
                    }
                    try {
                        contentUri = ContentUris.withAppendedId(
                                Uri.parse("content://downloads/public_downloads"), Long.valueOf(id));
                    }
                    catch (NumberFormatException e) {
                        e.printStackTrace();
                    }
                    if (contentUri != null) {
                         callBack.invoke(getDataColumn(this.getReactApplicationContext(), contentUri, null, null));
                         return;
                    }
                }
            }


            // MediaProvider
            if (isMediaDocument(uri)) {
                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];

                Uri contentUri = null;

                if ("image".equals(type)) {
                    contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                } else if ("video".equals(type)) {
                    contentUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
                } else if ("audio".equals(type)) {
                    contentUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                }
                selection = "_id=?";
                selectionArgs = new String[]{split[1]};


                callBack.invoke(getDataColumn(this.getReactApplicationContext(), contentUri, selection,
                        selectionArgs));
                return;
            }

            if (isGoogleDriveUri(uri)) {
                callBack.invoke(getDriveFilePath(uri));
                return;
            }

            if (isWhatsAppFile(uri)){
                callBack.invoke(getFilePathForWhatsApp(uri));
                return;
            }


            if ("content".equalsIgnoreCase(uri.getScheme())) {

                if (isGooglePhotosUri(uri)) {
                    callBack.invoke(uri.getLastPathSegment());
                    return;
                }
                if (isGoogleDriveUri(uri)) {
                    callBack.invoke(getDriveFilePath(uri));
                    return;
                }
                if (SDK_INT >= Build.VERSION_CODES.Q)
                {
                    // return getFilePathFromURI(context,uri);
                    callBack.invoke(copyFileToInternalStorage(uri,"userfiles"));
                    // return getRealPathFromURI(context,uri);
                    return;
                }
                else
                {
                    callBack.invoke(getDataColumn(this.getReactApplicationContext(), uri, null, null));
                    return;
                }

            }
            if ("file".equalsIgnoreCase(uri.getScheme())) {
                callBack.invoke(uri.getPath());
                return;
            }
        }
        else {

            if (isWhatsAppFile(uri)){
                callBack.invoke(getFilePathForWhatsApp(uri));
                return;
            }

            if ("content".equalsIgnoreCase(uri.getScheme())) {
                String[] projection = {
                        MediaStore.Images.Media.DATA
                };
                Cursor cursor = null;
                try {
                    cursor = this.getReactApplicationContext().getContentResolver()
                            .query(uri, projection, selection, selectionArgs, null);
                    int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
                    if (cursor.moveToFirst()) {
                        callBack.invoke(cursor.getString(column_index));
                        return;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        callBack.invoke();
    }

    private  boolean fileExists(String filePath) {
        File file = new File(filePath);

        return file.exists();
    }

    private String getPathFromExtSD(String[] pathData) {
        final String type = pathData[0];
        final String relativePath = "/" + pathData[1];
        String fullPath = "";

        // on my Sony devices (4.4.4 & 5.1.1), `type` is a dynamic string
        // something like "71F8-2C0A", some kind of unique id per storage
        // don't know any API that can get the root path of that storage based on its id.
        //
        // so no "primary" type, but let the check here for other devices
        if ("primary".equalsIgnoreCase(type)) {
            fullPath = Environment.getExternalStorageDirectory() + relativePath;
            if (fileExists(fullPath)) {
                return fullPath;
            }
        }

        // Environment.isExternalStorageRemovable() is `true` for external and internal storage
        // so we cannot relay on it.
        //
        // instead, for each possible path, check if file exists
        // we'll start with secondary storage as this could be our (physically) removable sd card
        fullPath = System.getenv("SECONDARY_STORAGE") + relativePath;
        if (fileExists(fullPath)) {
            return fullPath;
        }

        fullPath = System.getenv("EXTERNAL_STORAGE") + relativePath;
        if (fileExists(fullPath)) {
            return fullPath;
        }

        return fullPath;
    }

    private String getDriveFilePath(Uri uri) {
        Uri returnUri = uri;
        Cursor returnCursor = this.getReactApplicationContext().getContentResolver().query(returnUri, null, null, null, null);
        /*
         * Get the column indexes of the data in the Cursor,
         *     * move to the first row in the Cursor, get the data,
         *     * and display it.
         * */
        int nameIndex = returnCursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
        int sizeIndex = returnCursor.getColumnIndex(OpenableColumns.SIZE);
        returnCursor.moveToFirst();
        String name = (returnCursor.getString(nameIndex));
        String size = (Long.toString(returnCursor.getLong(sizeIndex)));
        File file = new File(this.getReactApplicationContext().getCacheDir(), name);
        try {
            InputStream inputStream = this.getReactApplicationContext().getContentResolver().openInputStream(uri);
            FileOutputStream outputStream = new FileOutputStream(file);
            int read = 0;
            int maxBufferSize = 1 * 1024 * 1024;
            int bytesAvailable = inputStream.available();

            //int bufferSize = 1024;
            int bufferSize = Math.min(bytesAvailable, maxBufferSize);

            final byte[] buffers = new byte[bufferSize];
            while ((read = inputStream.read(buffers)) != -1) {
                outputStream.write(buffers, 0, read);
            }
            Log.e("File Size", "Size " + file.length());
            inputStream.close();
            outputStream.close();
            Log.e("File Path", "Path " + file.getPath());
            Log.e("File Size", "Size " + file.length());
        } catch (Exception e) {
            Log.e("Exception", e.getMessage());
        }
        return file.getPath();
    }

    /***
     * Used for Android Q+
     * @param uri
     * @param newDirName if you want to create a directory, you can set this variable
     * @return
     */
    private String copyFileToInternalStorage(Uri uri,String newDirName) {
        Uri returnUri = uri;

        Cursor returnCursor = this.getReactApplicationContext().getContentResolver().query(returnUri, new String[]{
                OpenableColumns.DISPLAY_NAME,OpenableColumns.SIZE
        }, null, null, null);


        /*
         * Get the column indexes of the data in the Cursor,
         *     * move to the first row in the Cursor, get the data,
         *     * and display it.
         * */
        int nameIndex = returnCursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
        int sizeIndex = returnCursor.getColumnIndex(OpenableColumns.SIZE);
        returnCursor.moveToFirst();
        String name = (returnCursor.getString(nameIndex));
        String size = (Long.toString(returnCursor.getLong(sizeIndex)));

        File output;
        if(!newDirName.equals("")) {
            File dir = new File(this.getReactApplicationContext().getFilesDir() + "/" + newDirName);
            if (!dir.exists()) {
                dir.mkdir();
            }
            output = new File(this.getReactApplicationContext().getFilesDir() + "/" + newDirName + "/" + name);
        }
        else{
            output = new File(this.getReactApplicationContext().getFilesDir() + "/" + name);
        }
        try {
            InputStream inputStream = this.getReactApplicationContext().getContentResolver().openInputStream(uri);
            FileOutputStream outputStream = new FileOutputStream(output);
            int read = 0;
            int bufferSize = 1024;
            final byte[] buffers = new byte[bufferSize];
            while ((read = inputStream.read(buffers)) != -1) {
                outputStream.write(buffers, 0, read);
            }

            inputStream.close();
            outputStream.close();

        }
        catch (Exception e) {

            Log.e("Exception", e.getMessage());
        }

        return output.getPath();
    }

    private String getFilePathForWhatsApp(Uri uri){
        return  copyFileToInternalStorage(uri,"whatsapp");
    }

    private String getDataColumn(Context context, Uri uri, String selection, String[] selectionArgs) {
        Cursor cursor = null;
        final String column = "_data";
        final String[] projection = {column};

        try {
            cursor = context.getContentResolver().query(uri, projection,
                    selection, selectionArgs, null);

            if (cursor != null && cursor.moveToFirst()) {
                final int index = cursor.getColumnIndexOrThrow(column);
                return cursor.getString(index);
            }
        }
        finally {
            if (cursor != null)
                cursor.close();
        }

        return null;
    }

    private  boolean isExternalStorageDocument(Uri uri) {
        return "com.android.externalstorage.documents".equals(uri.getAuthority());
    }

    private  boolean isDownloadsDocument(Uri uri) {
        return "com.android.providers.downloads.documents".equals(uri.getAuthority());
    }

    private  boolean isMediaDocument(Uri uri) {
        return "com.android.providers.media.documents".equals(uri.getAuthority());
    }

    private  boolean isGooglePhotosUri(Uri uri) {
        return "com.google.android.apps.photos.content".equals(uri.getAuthority());
    }

    public boolean isWhatsAppFile(Uri uri){
        return "com.whatsapp.provider.media".equals(uri.getAuthority());
    }

    private  boolean isGoogleDriveUri(Uri uri) {
        return "com.google.android.apps.docs.storage".equals(uri.getAuthority()) || "com.google.android.apps.docs.storage.legacy".equals(uri.getAuthority());
    }
}

