# NeoTree App

App designed for managing neonatal patients in low resource settings, providing a digital admission form for real time data collection and a platform for neonatal training.

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

### CONFIG FILES
`config.<build_type>.json`

```javascript
{
  "countries": [
    "zimbabwe",
    "malawi"
  ],
  "zimbabwe": {
    "webeditor": {
      "host":"<web editor host>",
      "api_endpoint":"<web editor api endpoint>",
      "api_key":"<web editor api key>"
    },
    "nodeapi": {
      "host":"<nodeapi host>",
      "api_endpoint":"<nodeapi api endpoint>",
      "api_key":"<nodeapi api key>"
    }
  },
  "malawi": {
    "webeditor": {
      "host":"<web editor host>",
      "api_endpoint":"<web editor api endpoint>",
      "api_key":"<web editor api key>"
    },
    "nodeapi": {
      "host":"<nodeapi host>",
      "api_endpoint":"<nodeapi api endpoint>",
      "api_key":"<nodeapi api key>"
    }
  }
}

```

### Firebase
`firebase.config.json`

https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk

**Place the config files into `<project folder>/config`**

```
  <project folder>/config/config.development.json
  <project folder>/config/firebase.development.json

  <project folder>/config/config.stage.json
  <project folder>/config/firebase.stage.json

  <project folder>/config/config.production.json
  <project folder>/config/firebase.production.json
```

***

## Scripts

**DEV**
* `yarn install` - install dependencies
* `yarn android` - run android app
* `yarn ios` - run ios

**Builds**
* `npm run build-stage-android` - Builds Neotree (DEV) apk - staging build
* `npm run build-stage-ios` - Neotree (DEV) ios build - staging build
* `npm run build-prod-android` - Builds Neotree apk - production build
* `npm run build-prod-ios` - Neotree ios build - production build
