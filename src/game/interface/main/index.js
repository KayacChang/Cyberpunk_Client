import {SpinButton} from './SpinButton';
import {Status} from './Status';
import {Option} from './Option';
import {Button} from '../components';
import {changeColor, twink} from '../../effect';

const {assign} = Object;

export function Main(app, it) {
    const menuButton = Button(it.getChildByName('menu'));

    menuButton.on('pointerdown', onPointerDown);

    const optionButton = Button(it.getChildByName('option'));

    optionButton.once('pointerup', openOption);

    const option = Option(app, it.getChildByName('optionMenu'), it);

    option.on('OpenExchange', () => it.emit('OpenExchange'));

    const spin = SpinButton(app, it.getChildByName('spin'));

    spin.on('OpenExchange', () => it.emit('OpenExchange'));

    Status(app, it.getChildByName('status'));

    app.on('SpinStart', () => {
        optionButton.interactive = false;
        menuButton.interactive = false;
    });

    app.on('Idle', () => {
        optionButton.interactive = true;
        menuButton.interactive = true;
    });

    app.on('ChangeColor', (color) => {
        const menuBtn = it.getChildByName('menu@normal');

        changeColor({targets: [menuBtn, optionButton], color});
    });

    return assign(it, {
        menuButton,
        whenClickOutsideClose,
    });

    async function onPointerDown() {
        await twink({targets: menuButton, duration: 120, interval: 50, alpha: 0.5});

        it.getChildByName('menu@normal').alpha = 0;
    }

    function whenClickOutsideClose(target) {
        const block = it.getChildByName('block');

        block.interactive = true;

        block.once('pointerup', close);

        return () => block.off(close);

        async function close() {
            block.interactive = false;

            if (target.isOpen) await target.close();
        }
    }

    async function openOption() {
        await option.open();

        const off = whenClickOutsideClose(option);

        option.once('Closed', () => {
            off();

            optionButton.once('pointerup', openOption);
        });
    }
}
