import xin from 'xin';

import './css/lazy-img.css';

const DEFAULT_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const loadMap = new Map();

class LazyImg extends xin.Component {
  static async setDefault (src) {
    if (await LazyImg.fetch(src)) {
      DEFAULT_SRC = src;
    }
  }

  static async fetch (src) {
    if (!src) {
      return false;
    }

    let href = new URL(src, location.href).href;

    if (!loadMap.has(href)) {
      return await new Promise(resolve => {
        let loader = {
          status: 0,
          resolvers: [ resolve ],
        };
        loadMap.set(href, loader);

        let img = document.createElement('img');
        img.onload = () => {
          loader.status = 1;
          loader.resolvers.forEach(resolve => resolve(true));
        };
        img.onerror = () => {
          loader.status = 2;
          loader.resolvers.forEach(resolve => resolve(false));
        };
        img.src = href;
      });
    } else {
      let loader = loadMap.get(href);
      if (loader.status === 0) {
        return await new Promise(resolve => {
          loader.resolvers.push(resolve);
        });
      } else if (loader.status === 1) {
        return true;
      } else {
        return false;
      }
    }
  }

  get props () {
    return Object.assign({}, super.props, {
      src: {
        type: String,
        observer: '_srcChanged',
      },

      fallbackSrc: {
        type: String,
      },
    });
  }

  attached () {
    super.attached();

    this._srcChanged(this.src);
  }

  async _srcChanged (src) {

    if (await LazyImg.fetch(src) === false) {
      src = await LazyImg.fetch(this.fallbackSrc) ? this.fallbackSrc : DEFAULT_SRC;
    }

    if (this.img) {
      this.removeChild(this.img);
    }

    this.img = document.createElement('img');
    this.img.src = src;
    this.img.style.width = '100%';
    this.appendChild(this.img);
  }
}

xin.define('lazy-img', LazyImg);

export default LazyImg;
