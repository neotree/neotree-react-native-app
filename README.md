# Neotree App

[![DOI](https://zenodo.org/badge/262277859.svg)](https://zenodo.org/badge/latestdoi/262277859)

App designed for managing neonatal patients in low resource settings, providing a digital admission form for real time data collection and a platform for neonatal training.

Note that this project is part of the overall [Neotree System](https://github.com/neotree/neotree), an open source technology platform for supporting health care workers provide neonatal care in low resource settings. For more information see the [main repo](https://github.com/neotree/neotree) .

## Enviroment Setup

https://reactnative.dev/docs/environment-setup


***

## App Setup

`git clone https://github.com/neotree/neotree-react-native-app.git`

***

## API config

### Web editor
`neotree-webeditor-api.json`

1. Log into the web editor
2. Go to settings
3. Generate API Key
4. Download API Key

### NODE API (for data exports)
`neotree-nodeapi-api.json`

```javascript
{
  "host": "nodeapi host url (eg. example.com)",
  "endpoint": "endpoint used by the app to post data(eg. example.com)",
  "api_key": "api key here",
}
```

**Place the config files into `<project folder>/config`**

```
  <project folder>/config/neotree-webeditor-api.json
  <project folder>/config/neotree-nodeapi-api.json
```

***

## Scripts

**DEV**
* `yarn install` - install dependencies
* `yarn android` - run android app
* `yarn ios` - run ios

## Disclaimer

PLEASE NOTE: In its compiled form, Neotree code may be a regulated medical device in some jurisdictions. Modification of the code and / or subsequently placing that modified code on the market may make that entity a legal manufacturer of a medical device and so subject to the requirements of the relevant legislation. Failure to comply with such legislation can often result in criminal and civil penalties. Neotree does not intend this code to be used for a medical purpose as a regulated medical device (or within a regulated medical device) where such requirements apply. Those deploying, implementing, or modifying this code should ensure that they meet all local regulatory requirements.

**Builds**
* `npm run build-dev-android` - Builds Neotree (DEV) apk - staging build
* `npm run build-dev-ios` - Neotree (DEV) ios build - staging build
* `npm run build-prod-android` - Builds Neotree apk - production build
* `npm run build-prod-ios` - Neotree ios build - production build
