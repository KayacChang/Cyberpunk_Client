import {BitmapText} from 'pixi.js';

export function Text({x, y}, config) {
    let {text, ...options} = config;

    text = text || '';

    const it = new BitmapText(text, options);

    it.position.set(x, y);

    it.anchor.set(0.5);

    return it;
}
