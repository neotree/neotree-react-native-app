const { withAndroidManifest } = require("@expo/config-plugins");

// Forces Play Services to download the ML Kit barcode-scanning model right
// after install, instead of lazily on first scan. Without this, devices that
// are offline (or on poor connectivity, common in the clinics this app is
// deployed in) can silently fail to detect any QR code until the model has
// finished downloading in the background.
function addMlkitBarcodeMetadata(androidManifest) {
  const { manifest } = androidManifest;

  if (!Array.isArray(manifest["application"])) {
    console.warn("withAndroidMlkitBarcodeModel: No application array in manifest?");
    return androidManifest;
  }

  const application = manifest["application"].find(
    (item) => item.$["android:name"] === ".MainApplication"
  );
  if (!application) {
    console.warn("withAndroidMlkitBarcodeModel: No .MainApplication?");
    return androidManifest;
  }

  if (!Array.isArray(application["meta-data"])) {
    application["meta-data"] = [];
  }

  const existing = application["meta-data"].find(
    (item) => item.$["android:name"] === "com.google.mlkit.vision.DEPENDENCIES"
  );
  if (existing) {
    existing.$["android:value"] = "barcode";
  } else {
    application["meta-data"].push({
      $: {
        "android:name": "com.google.mlkit.vision.DEPENDENCIES",
        
        "android:value": "barcode",
      },
    });
  }

  return androidManifest;
}

module.exports = function withAndroidMlkitBarcodeModel(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults = addMlkitBarcodeMetadata(config.modResults);
    return config;
  });
};
