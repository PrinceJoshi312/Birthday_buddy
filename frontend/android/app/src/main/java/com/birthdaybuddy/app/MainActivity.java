package com.birthdaybuddy.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Force the native window to fit system bars so WebView starts cleanly below the status bar & notch
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
