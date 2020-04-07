import {move} from '../../../effect';
import {NavButton} from './NavButton';

const {assign} = Object;

export function Nav(app, it) {
    const background = Background(it.getChildByName('background'));

    const buttons = it.children
        .filter(({name}) => ['back', 'setting', 'information', 'home'].includes(name))
        .map(NavButton);

    const [backButton, settingButton, infoButton, homeButton] = buttons;

    settingButton.on('pointerup', () => it.emit('open', 'setting'));
    infoButton.on('pointerup', () => it.emit('open', 'information'));

    homeButton.on('pointerup', async () => {
        app.alert.leave();
    });

    async function open() {
        app.sound.play('spin');

        it.isOpen = true;

        await background.open();

        await Promise.all(buttons.map((btn) => btn.open()));

        backButton.once('pointerup', () => it.emit('close'));
    }

    async function close() {
        app.sound.play('spin');

        await Promise.all(buttons.map((btn) => btn.close()));

        await background.close();

        it.isOpen = false;
    }

    function Background(it) {
        const config = {
            targets: it,
            duration: 500,
            easing: 'easeInOutExpo',
        };

        async function moveTo(options) {
            await move({...config, ...options}).finished;
        }

        const width = it.width;

        async function open() {
            if (it.interactive) return;

            await moveTo({x: `-= ${width}`});

            it.interactive = true;
        }

        async function close() {
            if (!it.interactive) return;

            await moveTo({x: `+= ${width}`});

            it.interactive = false;
        }

        return Object.assign(it, {open, close});
    }

    return assign(it, {
        open,
        close,
        isOpen: false,
    });
}
