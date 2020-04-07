import {clone} from '@kayac/utils';

export function Service({serverURL, token}) {
    const accountBalance = {};

    let gametypeid = undefined;

    return {
        init,
        sendOneRound,

        get currencies() {
            return currencies;
        },

        get accountBalance() {
            return clone(accountBalance);
        },
    };

    async function init() {
        const res = await fetch(serverURL + '/game/init', {
            method: 'POST',
            headers: new Headers({
                Authorization: 'Bearer ' + token,
            }),
        });

        const {data, error} = await res.json();

        if (error.ErrorCode) {
            throw new Error(error.Msg);
        }

        gametypeid = data['player']['gametypeid'];

        return data;
    }

    async function sendOneRound({bet}) {
        const res = await fetch(serverURL + '/game/result', {
            method: 'POST',
            headers: new Headers({
                Authorization: 'Bearer ' + token,
            }),
            body: JSON.stringify({
                bet,
                gametypeid,
            }),
        });

        const {data, error} = await res.json();

        if (error.ErrorCode) {
            throw new Error(error.Msg);
        }

        return handle(data);
    }

    function handle(data) {
        const totalWin = data['totalwinscore'];
        const cash = data['playermoney'];

        const normalGame = Round(data['normalresult']);

        const hasFreeGame = Boolean(data['isfreegame']);

        const freeGame = hasFreeGame && data['freeresult'].map(Round);

        return {
            cash,
            totalWin,

            normalGame,

            freeGame,
        };
    }

    function Round(data) {
        const symbols = data['plate'];

        const results = data['gameresult'].map(Result);

        const hasLink = results.length > 0;

        const scores = results
            .map(({scores}) => scores)
            .reduce((a, b) => a + b, 0);

        const randomWild = RandomWild(data['randwild']);

        return {
            symbols,
            results,
            hasLink,
            scores,
            randomWild,
        };

        function RandomWild(data) {
            if (!data || data.length === 0) return;

            return data;
        }
    }

    function Result(data) {
        const symbols = data['LineSymbolNum'].reduce((arr, row) => {
            arr.push(row[0]);

            return arr;
        }, []);

        const positions = data['LineSymbolPoint'].reduce((arr, row) => {
            arr.push(row[0]);

            return arr;
        }, []);

        const rate = data['LineWinRate'];
        const scores = data['Score'];

        const line = data['LineWinIndex'];

        return {
            symbols,

            line,
            positions,

            rate,
            scores,
        };
    }
}
