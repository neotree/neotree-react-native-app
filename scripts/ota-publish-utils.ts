import { spawnSync } from 'node:child_process';

import { getArg, hasArg } from './release-utils';

export const otaPublishTargets = {
  demo: { buildType: 'demo', channel: 'demo' },
  stage: { buildType: 'stage', channel: 'stage' },
  prod: { buildType: 'production', channel: 'prod' },
} as const;

export type OtaPublishTarget = keyof typeof otaPublishTargets;

const scriptControlArgs = new Set(['--dry-run', '--target']);

const isScriptControlArg = (arg: string) => {
  if (scriptControlArgs.has(arg)) return true;
  return Array.from(scriptControlArgs).some((name) => arg.startsWith(`${name}=`));
};

export const collectEasArgs = () => {
  const forwardedArgs: string[] = [];
  const message = getArg('--message');
  const auto = hasArg('--auto');

  for (let index = 0; index < process.argv.slice(2).length; index += 1) {
    const arg = process.argv.slice(2)[index];
    if (isScriptControlArg(arg)) continue;
    if (arg === '--message') {
      index += 1;
      continue;
    }
    if (arg.startsWith('--message=')) continue;
    forwardedArgs.push(arg);
  }

  if (message) {
    forwardedArgs.push(`--message=${message}`);
  }

  if (auto && !forwardedArgs.includes('--auto')) {
    forwardedArgs.push('--auto');
  }

  const hasForwardedArg = (name: string) => {
    return forwardedArgs.some((arg) => arg === name || arg.startsWith(`${name}=`));
  };

  if (!hasForwardedArg('--non-interactive')) {
    forwardedArgs.push('--non-interactive');
  }

  if (!message && !hasForwardedArg('--auto')) {
    throw new Error('OTA publish requires --message "..." or --auto. This prevents interactive EAS prompts.');
  }

  return forwardedArgs;
};

const quoteArg = (value: string) => {
  if (!value) return '""';
  if (!/[\s"&|<>^]/.test(value)) return value;
  return `"${value.replace(/"/g, '\\"')}"`;
};

export const formatOtaPublishCommand = (buildType: string, args: string[]) => {
  return `NEOTREE_BUILD_TYPE=${buildType} npx ${args.map(quoteArg).join(' ')}`;
};

export const publishOta = (target: OtaPublishTarget, forwardedArgs: string[], dryRun = hasArg('--dry-run')) => {
  const environment = otaPublishTargets[target];
  const args = [
    'eas-cli@latest',
    'update',
    '--channel',
    environment.channel,
    '--platform',
    'android',
    ...forwardedArgs,
  ];

  console.log('');
  console.log(`Publishing OTA to ${environment.channel}`);
  console.log(formatOtaPublishCommand(environment.buildType, args));

  if (dryRun) return;

  const isWindows = process.platform === 'win32';
  const command = isWindows ? `npx ${args.map(quoteArg).join(' ')}` : 'npx';
  const result = spawnSync(command, isWindows ? [] : args, {
    env: {
      ...process.env,
      NEOTREE_BUILD_TYPE: environment.buildType,
    },
    shell: isWindows,
    stdio: 'inherit',
  });

  if (result.error) {
    throw new Error(`OTA publish failed for ${environment.channel}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`OTA publish failed for ${environment.channel} with exit code ${result.status ?? "unknown"}.`);
  }
};
