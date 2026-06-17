import {
  assertSemver,
  getArg,
  hasArg,
  incrementPatchVersion,
  logWriteMode,
  parseNonNegativeIntegerArg,
  parsePositiveIntegerArg,
  readAppJson,
  versionCodeFromVersion,
  writeAppJson,
  writeReleaseInfo,
} from './release-utils';

const run = () => {
  const dryRun = hasArg('--dry-run');
  const appJson = readAppJson();
  const currentVersion = appJson?.expo?.version;
  const currentRuntimeVersion = appJson?.expo?.runtimeVersion;

  if (!currentVersion) {
    throw new Error('Could not read expo.version from app.json.');
  }

  if (!currentRuntimeVersion) {
    throw new Error('Could not read expo.runtimeVersion from app.json.');
  }

  const nextVersion = getArg('--app-version') || getArg('--version') || incrementPatchVersion(currentVersion);
  const nextRuntimeVersion = getArg('--runtime') || incrementPatchVersion(currentRuntimeVersion);
  const explicitVersionCode = parsePositiveIntegerArg('--version-code');
  const nextVersionCode = explicitVersionCode ?? versionCodeFromVersion(nextVersion);
  const otaSequence = parseNonNegativeIntegerArg('--ota-sequence') ?? 0;
  const nextOtaLabel = `${nextVersion}-${otaSequence}`;

  assertSemver(nextVersion, 'version');
  assertSemver(nextRuntimeVersion, 'runtime');

  const nextAppJson = {
    ...appJson,
    expo: {
      ...appJson.expo,
      version: nextVersion,
      runtimeVersion: nextRuntimeVersion,
      ios: {
        ...appJson.expo?.ios,
        buildNumber: nextVersion,
      },
      android: {
        ...appJson.expo?.android,
        versionCode: nextVersionCode,
      },
    },
  };

  logWriteMode(dryRun);

  if (!dryRun) {
    writeAppJson(nextAppJson);
  }
  writeReleaseInfo(nextVersion, otaSequence, dryRun);

  console.log(`NeoTree APK release ${dryRun ? 'would be bumped' : 'bumped'}:`);
  console.log(`  app version:     ${currentVersion} -> ${nextVersion}`);
  console.log(`  runtime version: ${currentRuntimeVersion} -> ${nextRuntimeVersion}`);
  console.log(`  Android code:    ${appJson.expo?.android?.versionCode ?? 'not set'} -> ${nextVersionCode}`);
  console.log(`  iOS build:       ${appJson.expo?.ios?.buildNumber || 'not set'} -> ${nextVersion}`);
  console.log(`  OTA baseline:    ${nextOtaLabel}`);
  console.log('');
  console.log('Build example (Linux/macOS):');
  console.log('  NEOTREE_BUILD_TYPE=demo npx eas-cli@latest build --platform android --profile demo');
  console.log('');
  console.log('PowerShell equivalent:');
  console.log('  $env:NEOTREE_BUILD_TYPE="demo"');
  console.log('  npx eas-cli@latest build --platform android --profile demo');
  console.log('');
  console.log('After this APK ships, the next OTA-only update should use:');
  console.log('  npm run release:ota:bump');
};

try {
  run();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
