import { Texture } from '../lib/render-pipeline/index.js'

export const Textures = {
  marble: 'img/marble.png',
  earth: 'img/earth.png',
  flooring: 'img/flooring.png',
  sun: '/img/sun.png',
  moon: '/img/moon.png',

  preloadAll: () => {
    return Promise.allSettled([
      Texture.withURL('img/marble.png'),
      Texture.withURL('img/earth.png'),
      Texture.withURL('img/flooring.png'),
      Texture.withURL('img/sun.png'),
      Texture.withURL('img/moon.png')
    ])
  }
}
