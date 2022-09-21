npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
cd android
Remove-Item './app/src/main/res/drawable-hdpi/node_modules*' -Recurse
Remove-Item './app/src/main/res/drawable-hdpi/resources*' -Recurse

Remove-Item './app/src/main/res/drawable-mdpi/node_modules*' -Recurse
Remove-Item './app/src/main/res/drawable-mdpi/resources*' -Recurse

Remove-Item './app/src/main/res/drawable-xhdpi/node_modules*' -Recurse
Remove-Item './app/src/main/res/drawable-xhdpi/resources*' -Recurse

Remove-Item './app/src/main/res/drawable-xxhdpi/node_modules*' -Recurse
Remove-Item './app/src/main/res/drawable-xxhdpi/resources*' -Recurse

Remove-Item './app/src/main/res/drawable-xxxhdpi/node_modules*' -Recurse
Remove-Item './app/src/main/res/drawable-xxxhdpi/resources*' -Recurse

./gradlew app:assembleRelease
cd ..