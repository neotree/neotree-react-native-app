import { collectEasArgs, publishOta, type OtaPublishTarget } from './ota-publish-utils';
import { hasArg } from './release-utils';

const dryRun = hasArg('--dry-run');
const targets: OtaPublishTarget[] = ['demo', 'stage', 'prod'];
const forwardedArgs = collectEasArgs();

for (const target of targets) {
  try {
    publishOta(target, forwardedArgs, dryRun);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error('Stopping.');
    process.exit(1);
  }
}

if (dryRun) {
  console.log('');
  console.log('Dry run only. No OTA updates were published.');
}
