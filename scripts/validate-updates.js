const fs = require('fs');
const path = require('path');

const root = process.cwd();

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const errors = [];

const appJson = readJson('app.json');
const expo = appJson.expo || {};

if (!expo.version) {
  errors.push('app.json: expo.version is missing');
}

if (expo.runtimeVersion === undefined) {
  errors.push('app.json: expo.runtimeVersion is missing');
} else if (typeof expo.runtimeVersion === 'object') {
  if (!expo.runtimeVersion.policy) {
    errors.push('app.json: expo.runtimeVersion policy is missing');
  }
} else if (typeof expo.runtimeVersion !== 'string') {
  errors.push('app.json: expo.runtimeVersion must be a string or policy object');
}

const easJson = readJson('eas.json');
const build = easJson.build || {};
['demo', 'stage', 'production'].forEach((profile) => {
  const p = build[profile];
  if (!p) {
    errors.push(`eas.json: build.${profile} profile is missing`);
    return;
  }
  if (!p.channel) {
    errors.push(`eas.json: build.${profile}.channel is missing`);
  }
});

if (errors.length) {
  console.error('Update validation failed:');
  errors.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log('Update validation passed.');
