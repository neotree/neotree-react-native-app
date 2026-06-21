const fs = require("fs");
const path = require("path");
const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const { registerAndroidReactPackage } = require("./registerAndroidReactPackage");

const MODULE = `package org.neotree

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.hmdm.HeadwindMDM

class HeadwindMdmIdentityModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "HeadwindMdmIdentity"

  @ReactMethod
  fun getIdentity(options: ReadableMap, promise: Promise) {
    try {
      val mdm = HeadwindMDM.getInstance()
      if (mdm.isConnected()) {
        resolveIdentity(mdm, options, promise)
        return
      }

      val completed = booleanArrayOf(false)
      val handler = object : HeadwindMDM.EventHandler {
        override fun onHeadwindMDMConnected() {
          if (completed[0]) return
          completed[0] = true
          resolveIdentity(mdm, options, promise)
        }

        override fun onHeadwindMDMDisconnected() {}

        override fun onHeadwindMDMConfigChanged() {}
      }

      val started = mdm.connect(reactContext.applicationContext, handler)
      if (!started) {
        promise.resolve(unavailable("HEADWIND_NOT_RUNNING", "Headwind MDM is not running on this device"))
        return
      }

      Handler(Looper.getMainLooper()).postDelayed({
        if (completed[0]) return@postDelayed
        completed[0] = true
        if (mdm.isConnected()) {
          resolveIdentity(mdm, options, promise)
        } else {
          promise.resolve(unavailable("HEADWIND_CONNECT_TIMEOUT", "Timed out while connecting to Headwind MDM"))
        }
      }, 3000)
    } catch (e: Exception) {
      promise.resolve(unavailable("HEADWIND_IDENTITY_ERROR", e.message ?: "Unable to read Headwind MDM identity"))
    }
  }

  private fun resolveIdentity(mdm: HeadwindMDM, options: ReadableMap, promise: Promise) {
    try {
      val neoTreeHash = readString(options, "neotreeDeviceHash")
      val neoTreeDeviceId = readString(options, "neotreeDeviceId")

      setCustomIfSafe(mdm, 1, prefix("nt_hash", neoTreeHash))
      setCustomIfSafe(mdm, 2, prefix("nt_device", neoTreeDeviceId))

      val result = Arguments.createMap()
      result.putString("provider", "headwind")
      result.putBoolean("available", true)
      result.putBoolean("managed", mdm.isManaged())
      result.putBoolean("kiosk", mdm.isKiosk())
      putNullable(result, "deviceId", mdm.getDeviceId())
      putNullable(result, "deviceNumber", mdm.getDeviceId())
      putNullable(result, "headwindNumber", mdm.getDeviceId())
      putNullable(result, "serverUrl", mdm.getServerUrl())
      putNullable(result, "custom1", readCustom(mdm, 1))
      putNullable(result, "custom2", readCustom(mdm, 2))

      promise.resolve(result)
    } catch (e: Exception) {
      promise.resolve(unavailable("HEADWIND_IDENTITY_ERROR", e.message ?: "Unable to read Headwind MDM identity"))
    }
  }

  private fun unavailable(code: String, message: String): WritableMap {
    val result = Arguments.createMap()
    result.putString("provider", "headwind")
    result.putBoolean("available", false)
    result.putString("errorCode", code)
    result.putString("errorMessage", message)
    return result
  }

  private fun readString(options: ReadableMap, key: String): String? {
    if (!options.hasKey(key) || options.isNull(key)) return null
    return options.getString(key)?.trim()?.takeIf { it.isNotEmpty() }
  }

  private fun prefix(prefix: String, value: String?): String? {
    val clean = value?.trim()?.takeIf { it.isNotEmpty() } ?: return null
    return "$prefix:$clean"
  }

  private fun readCustom(mdm: HeadwindMDM, number: Int): String? {
    return runCatching { mdm.getCustom(number) }.getOrNull()?.trim()?.takeIf { it.isNotEmpty() }
  }

  private fun setCustomIfSafe(mdm: HeadwindMDM, number: Int, value: String?) {
    val next = value?.trim()?.takeIf { it.isNotEmpty() } ?: return
    val current = readCustom(mdm, number)
    if (current.isNullOrBlank() || current.startsWith("nt_hash:") || current.startsWith("nt_device:")) {
      runCatching { mdm.setCustom(number, next) }
    }
  }

  private fun putNullable(map: WritableMap, key: String, value: String?) {
    val clean = value?.trim()?.takeIf { it.isNotEmpty() }
    if (clean == null) map.putNull(key) else map.putString(key, clean)
  }
}
`;

const PACKAGE = `package org.neotree

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class HeadwindMdmIdentityPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(HeadwindMdmIdentityModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
`;

function ensureHeadwindQuery(manifest) {
  manifest.manifest.queries = manifest.manifest.queries || [{}];
  const queries = manifest.manifest.queries[0];
  queries.package = queries.package || [];
  const exists = queries.package.some((item) => item.$?.["android:name"] === "com.hmdm.launcher");
  if (!exists) queries.package.push({ $: { "android:name": "com.hmdm.launcher" } });
}

function findHeadwindAar(projectRoot, platformProjectRoot) {
  const candidates = [
    path.join(projectRoot, "plugins", "headwind"),
    path.join(projectRoot, "android", "app", "libs"),
    path.join(platformProjectRoot, "app", "libs"),
  ];

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    const match = fs.readdirSync(dir).find((file) => /^hmdm.*\.aar$/i.test(file));
    if (match) return path.join(dir, match);
  }

  return null;
}

function ensureGradleWiring(buildGradlePath, aarName) {
  if (!fs.existsSync(buildGradlePath)) return;
  let source = fs.readFileSync(buildGradlePath, "utf8");

  if (!source.includes("NeoTree Headwind MDM API")) {
    source = source.replace(
      /dependencies\s*\{/,
      `dependencies {\n    // NeoTree Headwind MDM API\n    implementation files('libs/${aarName}')`,
    );
  }

  fs.writeFileSync(buildGradlePath, source);
}

module.exports = function withAndroidHeadwindMdmIdentityModule(config) {
  config = withAndroidManifest(config, (config) => {
    ensureHeadwindQuery(config.modResults);
    return config;
  });

  return withDangerousMod(config, [
    "android",
    (config) => {
      const root = config.modRequest.platformProjectRoot;
      const projectRoot = config.modRequest.projectRoot;
      const aarPath = findHeadwindAar(projectRoot, root);

      if (!aarPath) {
        throw new Error(
          "withAndroidHeadwindMdmIdentityModule: missing plugins/headwind/hmdm*.aar; refusing to build without Headwind identity support",
        );
      }

      const libsDir = path.join(root, "app", "libs");
      fs.mkdirSync(libsDir, { recursive: true });
      const aarName = path.basename(aarPath);
      const destination = path.join(libsDir, aarName);
      if (path.resolve(aarPath) !== path.resolve(destination)) fs.copyFileSync(aarPath, destination);

      ensureGradleWiring(path.join(root, "app", "build.gradle"), aarName);

      const packageDir = path.join(root, "app", "src", "main", "java", "org", "neotree");
      fs.mkdirSync(packageDir, { recursive: true });
      fs.writeFileSync(path.join(packageDir, "HeadwindMdmIdentityModule.kt"), MODULE);
      fs.writeFileSync(path.join(packageDir, "HeadwindMdmIdentityPackage.kt"), PACKAGE);
      registerAndroidReactPackage(path.join(packageDir, "MainApplication.kt"), "HeadwindMdmIdentityPackage");

      return config;
    },
  ]);
};
