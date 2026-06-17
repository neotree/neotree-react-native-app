import { collectEasArgs, otaPublishTargets, publishOta, type OtaPublishTarget } from './ota-publish-utils';
import { getArg, hasArg } from './release-utils';

const run = () => {
  const target = getArg('--target') as OtaPublishTarget | undefined;

  if (!target || !(target in otaPublishTargets)) {
    throw new Error('Missing or invalid --target. Use demo, stage, or prod.');
  }

  const dryRun = hasArg('--dry-run');
  publishOta(target, collectEasArgs(), dryRun);

  if (dryRun) {
    console.log('');
    console.log('Dry run only. No OTA update was published.');
  }
};

try {
  run();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
