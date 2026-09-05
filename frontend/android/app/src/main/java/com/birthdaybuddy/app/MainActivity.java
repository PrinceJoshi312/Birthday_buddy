package com.birthdaybuddy.app;

import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Force the native window to fit system bars so WebView starts cleanly below the status bar & notch
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, windowInsets) -> {
                Insets statusInsets = windowInsets.getInsets(
                    WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout()
                );

                // Verify whether the content view is already positioned below the status bar.
                // If the system decor already shifted content down, do NOT double-apply padding.
                int[] location = new int[2];
                v.getLocationOnScreen(location);
                if (location[1] >= statusInsets.top) {
                    v.setPadding(0, 0, 0, 0);
                } else {
                    v.setPadding(0, statusInsets.top, 0, 0);
                }
                return windowInsets;
            });
            contentView.addOnLayoutChangeListener((v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) -> {
                ViewCompat.requestApplyInsets(v);
            });
        }
    }
}
