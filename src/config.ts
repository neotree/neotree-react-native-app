export default {
    "development": {
        "countries": [
            {
                "iso": "zw",
                "name": "Zimbabwe"
            },
            {
                "iso": "mwi",
                "name": "Malawi"
            },
            {
                "iso": "demo",
                "name": "Demo"
            }
        ],
        "zw": {
            "savePollingData": true,
            "webeditor": {
                "host":"https://zim-dev-webeditor.neotree.org",
                "api_endpoint":"https://zim-dev-webeditor.neotree.org/api",
                "api_key":"KWTXE8YYP8S3Z8SXD742PPH1ERDUQKN"
            },
            "nodeapi": {
                "host":"https://zim-dev-nodeapi.neotree.org",
                "api_endpoint":"https://zim-dev-nodeapi.neotree.org",
                "api_key":"DdCbe3cz0b6fuEqDIhuML7DuOburXlFr2RCDRkFA"
            }
        },
        "mwi": {
            "savePollingData": false,
            "webeditor": {
                "host":"https://webeditor-dev.neotree.org",
                "api_endpoint":"https://webeditor-dev.neotree.org/api",
                "api_key":"KWTXE8YYP8S3Z8SXD742PPH1ERDUQKN"
            },
            "nodeapi": {
                "host":"https://nodeapi-dev.neotree.org",
                "api_endpoint":"https://nodeapi-dev.neotree.org",
                "api_key":"DdCbe3cz0b6fuEqDIhuML7DuOburXlFr2RCDRkFA"
            }
        },
        "demo": {
            "savePollingData": false,
            "webeditor": {
                "host":"https://demo-webeditor.neotree.org",
                "api_endpoint":"https://demo-webeditor.neotree.org/api",
                "api_key":"N884OAXI9KNTJF0VT1Y15WUUKHAXCQK"
            },
            "nodeapi": {
                "host":"https://demo-nodeapi.neotree.org",
                "api_endpoint":"https://demo-nodeapi.neotree.org",
                "api_key":"DdCbe3cz0b6fuEqDIhuML7DuOburXlFr2RCDRkFA"
            }
        }        
    },

    "stage": {
        "countries": [
            {
                "iso": "zw",
                "name": "Zimbabwe"
            },
            {
                "iso": "mwi",
                "name": "Malawi"
            }
        ],
        "zw": {
            "savePollingData": true,
            "webeditor": {
                "host":"https://zim-dev-webeditor.neotree.org",
                "api_endpoint":"https://zim-dev-webeditor.neotree.org/api",
                "api_key":"KWTXE8YYP8S3Z8SXD742PPH1ERDUQKN"
            },
            "nodeapi": {
                "host":"https://zim-dev-nodeapi.neotree.org",
                "api_endpoint":"https://zim-dev-nodeapi.neotree.org",
                "api_key":"DdCbe3cz0b6fuEqDIhuML7DuOburXlFr2RCDRkFA"
            }
        },
        "mwi": {
            "savePollingData": false,
            "webeditor": {
                "host":"https://webeditor-dev.neotree.org",
                "api_endpoint":"https://webeditor-dev.neotree.org/api",
                "api_key":"KWTXE8YYP8S3Z8SXD742PPH1ERDUQKN"
            },
            "nodeapi": {
                "host":"https://nodeapi-dev.neotree.org",
                "api_endpoint":"https://nodeapi-dev.neotree.org",
                "api_key":"DdCbe3cz0b6fuEqDIhuML7DuOburXlFr2RCDRkFA"
            }
        }        
    },

    "production": {
        "countries": [
            {
                "iso": "zw",
                "name": "Zimbabwe"
            },
            {
                "iso": "mwi",
                "name": "Malawi"
            }
        ],
        "zw": {
            "savePollingData": true,
            "webeditor": {
                "host":"https://zim-webeditor.neotree.org:10243",
                "api_endpoint":"https://zim-webeditor.neotree.org:10243/api",
                "api_key":"N884OAXI9KNTJF0VT1Y15WUUKHAXCQK"
            },
            "nodeapi": {
                "host":"http://zim-nodeapi.neotree.org",
                "api_endpoint":"http://zim-nodeapi.neotree.org",
                "api_key":"DdCbe3cz0b6fuEqDIhuML7DuOburXlFr2RCDRkFA"
            }
        },
        "mwi": {
            "savePollingData": false,
            "webeditor": {
                "host":"https://webeditor.neotree.org",
                "api_endpoint":"https://webeditor.neotree.org/api",
                "api_key":"KWTXE8YYP8S3Z8SXD742PPH1ERDUQKN"
            },
            "nodeapi": {
                "host":"https://nodeapi.neotree.org",
                "api_endpoint":"https://nodeapi.neotree.org",
                "api_key":"DdCbe3cz0b6fuEqDIhuML7DuOburXlFr2RCDRkFA"
            }
        }
    },

    "demo": {
        "countries": [
            {
                "iso": "test",
                "name": "Test"
            }
        ],
        
        "test": {
            "savePollingData": false,
            "webeditor": {
                "host":"https://demo-webeditor.neotree.org",
                "api_endpoint":"https://demo-webeditor.neotree.org/api",
                "api_key":"N884OAXI9KNTJF0VT1Y15WUUKHAXCQK"
            },
            "nodeapi": {
                "host":"https://demo-nodeapi.neotree.org",
                "api_endpoint":"https://demo-nodeapi.neotree.org",
                "api_key":"DdCbe3cz0b6fuEqDIhuML7DuOburXlFr2RCDRkFA"
            }
        }
    }
}