import xin from 'xin';

const loadMap = new Map();
let defaultSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

class LazyImg extends xin.Component {
  static async setDefault (src) {
    if (await LazyImg.fetch(src)) {
      defaultSrc = src;
    }
  }

  static async fetch (src) {
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

  async _srcChanged (src) {
    if (await LazyImg.fetch(src) === false) {
      src = await LazyImg.fetch(this.fallbackSrc) ? this.fallbackSrc : defaultSrc;
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
