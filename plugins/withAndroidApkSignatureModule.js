const fs = require("fs");
const path = require("path");
const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");

const MODULE = `package org.neotree

import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import java.io.File
import java.security.MessageDigest

class ApkSignatureModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ApkSignature"

  @ReactMethod
  fun getApkSignatureSha256(fileUri: String, promise: Promise) {
    try {
      val path = resolvePath(fileUri)
      if (path.isBlank() || !File(path).exists()) {
        promise.reject("APK_NOT_FOUND", "APK file not found")
        return
      }

      val packageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        reactContext.packageManager.getPackageArchiveInfo(path, PackageManager.GET_SIGNING_CERTIFICATES)
      } else {
        @Suppress("DEPRECATION")
        reactContext.packageManager.getPackageArchiveInfo(path, PackageManager.GET_SIGNATURES)
      }

      if (packageInfo == null) {
        promise.reject("APK_PACKAGE_INFO_UNAVAILABLE", "Unable to inspect APK package info")
        return
      }

      val signatures = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        val signingInfo = packageInfo.signingInfo
        if (signingInfo?.hasMultipleSigners() == true) signingInfo.apkContentsSigners else signingInfo?.signingCertificateHistory
      } else {
        @Suppress("DEPRECATION")
        packageInfo.signatures
      }

      val signature = signatures?.firstOrNull()
      if (signature == null) {
        promise.reject("APK_SIGNATURE_UNAVAILABLE", "APK signature unavailable")
        return
      }

      val digest = MessageDigest.getInstance("SHA-256").digest(signature.toByteArray())
      promise.resolve(digest.joinToString("") { "%02x".format(it) })
    } catch (e: Exception) {
      promise.reject("APK_SIGNATURE_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun getInstalledApkPath(promise: Promise) {
    try {
      val sourceDir = reactContext.applicationInfo.sourceDir
      if (sourceDir.isNullOrBlank() || !File(sourceDir).exists()) {
        promise.reject("APK_PATH_UNAVAILABLE", "Installed APK path is not available")
        return
      }
      promise.resolve(sourceDir)
    } catch (e: Exception) {
      promise.reject("APK_PATH_ERROR", e.message, e)
    }
  }

  @ReactMethod
  fun getApkInfo(fileUri: String, promise: Promise) {
    try {
      val path = resolvePath(fileUri)
      if (path.isBlank() || !File(path).exists()) {
        promise.reject("APK_NOT_FOUND", "APK file not found")
        return
      }

      val packageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        reactContext.packageManager.getPackageArchiveInfo(path, PackageManager.GET_SIGNING_CERTIFICATES)
      } else {
        @Suppress("DEPRECATION")
        reactContext.packageManager.getPackageArchiveInfo(path, PackageManager.GET_SIGNATURES)
      }

      if (packageInfo == null) {
        promise.reject("APK_PACKAGE_INFO_UNAVAILABLE", "Unable to inspect APK package info")
        return
      }

      val result: WritableMap = Arguments.createMap()
      result.putString("packageName", packageInfo.packageName)
      result.putString("versionName", packageInfo.versionName)
      val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        packageInfo.longVersionCode
      } else {
        @Suppress("DEPRECATION")
        packageInfo.versionCode.toLong()
      }
      result.putDouble("versionCode", versionCode.toDouble())

      val signatures = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        val signingInfo = packageInfo.signingInfo
        if (signingInfo?.hasMultipleSigners() == true) signingInfo.apkContentsSigners else signingInfo?.signingCertificateHistory
      } else {
        @Suppress("DEPRECATION")
        packageInfo.signatures
      }
      val signature = signatures?.firstOrNull()
      if (signature != null) {
        val digest = MessageDigest.getInstance("SHA-256").digest(signature.toByteArray())
        result.putString("signatureSha256", digest.joinToString("") { "%02x".format(it) })
      } else {
        result.putNull("signatureSha256")
      }

      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("APK_INFO_ERROR", e.message, e)
    }
  }

  private fun resolvePath(fileUri: String): String {
    if (fileUri.startsWith("file://") || fileUri.startsWith("content://")) return Uri.parse(fileUri).path ?: ""
    return fileUri
  }
}
`;

const PACKAGE = `package org.neotree

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ApkSignaturePackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(ApkSignatureModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
`;

function ensurePermission(manifest, permission) {
  manifest.manifest["uses-permission"] = manifest.manifest["uses-permission"] || [];
  const exists = manifest.manifest["uses-permission"].some(
    (item) => item.$?.["android:name"] === permission,
  );
  if (!exists) manifest.manifest["uses-permission"].push({ $: { "android:name": permission } });
}

module.exports = function withAndroidApkSignatureModule(config) {
  config = withAndroidManifest(config, (config) => {
    ensurePermission(config.modResults, "android.permission.REQUEST_INSTALL_PACKAGES");
    const app = config.modResults.manifest.application?.[0];
    const updates = app?.["meta-data"]?.find(
      (item) => item.$?.["android:name"] === "expo.modules.updates.ENABLED",
    );
    if (updates) updates.$["android:value"] = "true";
    return config;
  });

  return withDangerousMod(config, [
    "android",
    (config) => {
      const root = config.modRequest.platformProjectRoot;
      const packageDir = path.join(root, "app", "src", "main", "java", "org", "neotree");
      fs.mkdirSync(packageDir, { recursive: true });
      fs.writeFileSync(path.join(packageDir, "ApkSignatureModule.kt"), MODULE);
      fs.writeFileSync(path.join(packageDir, "ApkSignaturePackage.kt"), PACKAGE);

      const mainApplicationPath = path.join(packageDir, "MainApplication.kt");
      if (fs.existsSync(mainApplicationPath)) {
        let source = fs.readFileSync(mainApplicationPath, "utf8");
        if (!source.includes("ApkSignaturePackage()")) {
          source = source.replace(
            "return PackageList(this).packages",
            [
              "val packages = PackageList(this).packages.toMutableList()",
              "            packages.add(ApkSignaturePackage())",
              "            return packages",
            ].join("\n"),
          );
          fs.writeFileSync(mainApplicationPath, source);
        }
      }

      return config;
    },
  ]);
};
