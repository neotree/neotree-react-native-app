import * as fs from 'node:fs';
import * as path from 'node:path';

export type AppJson = {
  expo?: {
    version?: string;
    runtimeVersion?: string;
    ios?: {
      buildNumber?: string;
    };
    android?: {
      versionCode?: number;
    };
  };
};

export type ReleaseInfo = {
  baseAppVersion: string;
  sequence: number;
  label: string;
};

export const root = path.resolve(__dirname, '..');
export const appJsonPath = path.join(root, 'app.json');
export const releaseInfoPath = path.join(root, 'src', 'update', 'releaseInfo.ts');

export const readText = (filePath: string) => fs.readFileSync(filePath, 'utf8');

export const writeText = (filePath: string, value: string) => {
  fs.writeFileSync(filePath, value);
};

export const readAppJson = (): AppJson => JSON.parse(readText(appJsonPath));

export const writeAppJson = (appJson: AppJson) => {
  writeText(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);
};

export const readReleaseInfoSource = () => readText(releaseInfoPath);

export const readReleaseInfo = (): ReleaseInfo => {
  const source = readReleaseInfoSource();
  return {
    baseAppVersion: (source.match(/baseAppVersion:\s*'([^']+)'/) || [])[1] || '',
    sequence: Number((source.match(/sequence:\s*(\d+)/) || [])[1] || 0),
    label: (source.match(/label:\s*'([^']+)'/) || [])[1] || '',
  };
};

export const writeReleaseInfo = (baseAppVersion: string, sequence: number, dryRun: boolean) => {
  const current = readReleaseInfoSource();
  const label = `${baseAppVersion}-${sequence}`;
  const next = current
    .replace(/baseAppVersion:\s*'[^']*'/, `baseAppVersion: '${baseAppVersion}'`)
    .replace(/sequence:\s*\d+/, `sequence: ${sequence}`)
    .replace(/label:\s*'[^']*'/, `label: '${label}'`);

  if (next === current) {
    throw new Error('Could not update src/update/releaseInfo.ts. Check the file format.');
  }

  if (!dryRun) {
    writeText(releaseInfoPath, next);
  }

  return label;
};

export const getArg = (name: string) => {
  const inlineArg = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inlineArg) return inlineArg.slice(name.length + 1);

  const index = process.argv.findIndex((arg) => arg === name);
  if (index >= 0) return process.argv[index + 1];

  const npmConfigName = `npm_config_${name.replace(/^--/, '').replace(/-/g, '_')}`;
  return process.env[npmConfigName];
};

export const hasArg = (name: string) => {
  if (process.argv.includes(name)) return true;
  const npmConfigName = `npm_config_${name.replace(/^--/, '').replace(/-/g, '_')}`;
  return process.env[npmConfigName] === 'true';
};

export const parsePositiveIntegerArg = (name: string) => {
  const value = getArg(name);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
};

export const parseNonNegativeIntegerArg = (name: string) => {
  const value = getArg(name);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a positive integer or zero.`);
  }
  return parsed;
};

export const assertSemver = (value: string, fieldName: string) => {
  if (!/^\d+\.\d+\.\d+$/.test(value)) {
    throw new Error(`${fieldName} must use major.minor.patch format. Received: ${value}`);
  }
};

export const incrementPatchVersion = (value: string) => {
  assertSemver(value, 'version');
  const [major, minor, patch] = value.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
};

export const versionCodeFromVersion = (value: string) => {
  assertSemver(value, 'version');
  const [major, minor, patch] = value.split('.').map(Number);
  return Number(`${major}${minor}${patch}`);
};

export const logWriteMode = (dryRun: boolean) => {
  if (dryRun) {
    console.log('Dry run only. No files were changed.');
    console.log('');
  }
};
