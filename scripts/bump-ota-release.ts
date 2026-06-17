import {
  getArg,
  hasArg,
  logWriteMode,
  parseNonNegativeIntegerArg,
  readAppJson,
  readReleaseInfo,
  writeReleaseInfo,
} from './release-utils';

const run = () => {
  const dryRun = hasArg('--dry-run');
  const appJson = readAppJson();
  const appVersion = appJson?.expo?.version;

  if (!appVersion) {
    throw new Error('Could not read expo.version from app.json.');
  }

  const currentRelease = readReleaseInfo();
  const explicitSequence = parseNonNegativeIntegerArg('--sequence')
    ?? (process.argv[2] && /^\d+$/.test(process.argv[2]) ? Number(process.argv[2]) : undefined);
  const nextSequence = explicitSequence ?? currentRelease.sequence + 1;
  const nextLabel = `${appVersion}-${nextSequence}`;

  logWriteMode(dryRun);
  writeReleaseInfo(appVersion, nextSequence, dryRun);

  console.log(`NeoTree OTA release ${dryRun ? 'would be bumped' : 'bumped'} to ${nextLabel}`);
  console.log('');
  console.log('Publish example (Linux/macOS):');
  console.log(`  NEOTREE_BUILD_TYPE=demo npx eas-cli@latest update --channel demo --message "OTA ${nextLabel}" --platform android`);
  console.log('');
  console.log('PowerShell equivalent:');
  console.log('  $env:NEOTREE_BUILD_TYPE="demo"');
  console.log(`  npx eas-cli@latest update --channel demo --message "OTA ${nextLabel}" --platform android`);

  const channel = getArg('--channel');
  if (channel) {
    const buildType = channel === 'prod' ? 'production' : channel;
    console.log('');
    console.log('Requested channel publish command (Linux/macOS):');
    console.log(`  NEOTREE_BUILD_TYPE=${buildType} npx eas-cli@latest update --channel ${channel} --message "OTA ${nextLabel}" --platform android`);
    console.log('');
    console.log('PowerShell equivalent:');
    console.log(`  $env:NEOTREE_BUILD_TYPE="${buildType}"`);
    console.log(`  npx eas-cli@latest update --channel ${channel} --message "OTA ${nextLabel}" --platform android`);
  }
};

try {
  run();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
