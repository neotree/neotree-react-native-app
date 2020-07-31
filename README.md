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

### NODE API (for data exports)
`neotree-nodeapi-api.json`

```javascript
{
  "host": "nodeapi host url (eg. example.com)",
  "endpoint": "endpoint used by the app to post data(eg. example.com)",
  "api_key": "api key here",
}
```

### Firebase
`firebase.config.json`

https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk

**Place the config files into `neotree-react-native-app/config`**

```
  config/neotree-webeditor-api.json
  config/firebase.config.json
```

***

## Scripts

* `yarn install` - install dependencies
* `yarn android` - run android app
* `yarn ios` - run ios
