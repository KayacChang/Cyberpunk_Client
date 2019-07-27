import {sprites} from './sprites';
import {symbols, symbolConfig} from './symbols';

export function reserve() {
    return [
        ...(sprites),
        ...(symbols),
    ];
}


const stopPerSymbol = 1;

const MAYBE_BONUS_DURATION = 1000;
const SPIN_DURATION = [2500, 2000, 1500];
const SPIN_STOP_INTERVAL = 250;

export {
    stopPerSymbol,

    symbolConfig,

    SPIN_STOP_INTERVAL,
    MAYBE_BONUS_DURATION,
    SPIN_DURATION,
};

