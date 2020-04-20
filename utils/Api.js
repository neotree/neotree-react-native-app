/* global XMLHttpRequest */
class Api {
  constructor(url, opts = {}) {
    this.url = url;
    this.opts = {
      ...opts,
      data: opts.data || {},
      headers: opts.headers || {},
      method: (opts.method || 'GET').toUpperCase(),
    };
    this.requestPayload = null;
    return new Promise((resolve, reject) => {
      this._initRequest();
      this._initListeners(resolve, reject);
      this._sendRequest();
    });
  }

  _initRequest = () => {
    const { method, data, headers } = this.opts;
    const xhr = new XMLHttpRequest();

    let query = '';
    if (method === 'GET') {
      query += `?payload=${JSON.stringify(data)}`;
    } else {
      this.requestPayload = data;
    }

    xhr.open(method, `${this.url}${query}`, true);

    Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));

    this.xhr = xhr;
  };

  _initListeners = (resolve, reject) => {
    const {
      onAbort,
      onError,
      onLoad,
      onLoadEnd,
      onLoadStart,
      onProgress,
      onReadyStateChange,
      onTimeout,
      onabort,
      onerror,
      onload,
      onloadend,
      onloadstart,
      onprogress,
      onreadystatechange,
      ontimeout,
    } = this.opts;

    this.xhr.addEventListener('onload', (onLoad || onload));
    this.xhr.addEventListener('onloadend', (onLoadEnd || onloadend));
    this.xhr.addEventListener('onloadstart', (onLoadStart || onloadstart));
    this.xhr.addEventListener('onprogress', (onProgress || onprogress));

    this.xhr.addEventListener('onabort', e => {
      const _onAbort = (_onAbort || onabort);
      if (_onAbort) _onAbort(e);
      reject({ msg: 'Request aborted.' });
    });

    this.xhr.addEventListener('timeout', e => {
      const _onTimeout = (_onTimeout || timeout);
      if (_onTimeout) _onTimeout(e);
      reject({ msg: 'Request timeout.' });
    });

    this.xhr.addEventListener('error', e => {
      const _onError = (_onError || error);
      if (_onError) _onError(e);
      reject(e);
    });

    this.xhr.addEventListener('onreadystatechange', e => {
      const _onReadyStateChange = (onReadyStateChange || onreadystatechange);
      if (_onReadyStateChange) _onReadyStateChange(e);

      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve({ status: xhr.status, statusText: xhr.statusText, body: xhr.response });
        } else {
          resolve({ status: xhr.status, statusText: xhr.statusText, body: xhr.response });
        }
      }
    });
  };

  _sendRequest = () => {
    this.xhr.send(this.requestPayload);
  }
}

export default (url, opts) => new Api(url, opts);
