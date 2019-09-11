import {log, table, divide, waitByFrameTime} from '@kayac/utils';

import {FreeGame, NormalGame} from './flow';

const BET_TO_BIGWIN = 10;

function isBigWin(scores) {
    return divide(scores, app.user.currentBet) > BET_TO_BIGWIN;
}

export function logic(args) {
    const {
        slot,
        grid, payLine, levels, multiple,
        showFreeGame, closeFreeGame, showRandomWild, showBigWin,
    } = args;

    app.on('GameResult', onGameResult);

    async function onGameResult(result) {
        log('onGameResult =============');
        table(result);

        const {
            cash,
            normalGame,
            freeGame,
        } = result;

        const diff = app.user.cash - cash;
        if (app.user.auto) app.user.totalWin += diff;

        if (normalGame.hasLink) {
            log('onNormalGame =============');
            table(normalGame);
        }

        const scores =
            await NormalGame({
                result: normalGame,
                reels: slot.reels,

                grid,
                payLine,
                showRandomWild,
            });

        if (isBigWin(scores)) await showBigWin(scores);

        clear(normalGame);

        if (scores > 0) await waitByFrameTime(60);

        if (freeGame) {
            await showFreeGame();

            let totalScores = 0;
            let currentLevel = 0;

            for (const result of freeGame) {
                const {scores, level} = await FreeGame({
                    result: result,
                    reels: slot.reels,

                    grid,
                    payLine,
                });

                totalScores += scores;

                if (level) {
                    //
                    while (currentLevel < level) {
                        await levels[currentLevel].show();

                        currentLevel++;
                    }

                    const match = {
                        '8': 'x2',
                        '10': 'x3',
                        '12': 'x5',
                        '14': 'x8',
                    }[currentLevel];

                    if (match) multiple.show(match);
                }
            }

            if (isBigWin(totalScores)) await showBigWin(totalScores);

            freeGame.forEach(clear);

            await closeFreeGame();
        }

        log('Round Complete...');

        app.emit('Idle');
    }

    function clear(result) {
        const {scores} = result;

        app.user.lastWin = scores;
        app.user.cash += scores;

        if (check(result)) {
            app.user.auto = 0;

            app.user.totalWin = 0;
        }
    }

    function check(result) {
        const {scores, results} = result;

        const condition = app.user.autoStopCondition;

        return [
            onAnyWin,
            onSingleWinOfAtLeast,
            ifCashIncreasesBy,
            ifCashDecreasesBy,
        ].some(isTrue);

        function isTrue(func) {
            return func() === true;
        }

        function onAnyWin() {
            if (condition['on_any_win']) return scores > 0;
        }

        function onSingleWinOfAtLeast() {
            const threshold = condition['on_single_win_of_at_least'];

            if (threshold) return scores > threshold;
        }

        function ifCashIncreasesBy() {
            const threshold = condition['if_cash_increases_by'];

            if (threshold) return results.some(biggerThanThreshold);

            function biggerThanThreshold() {
                return app.user.totalWin >= threshold;
            }
        }

        function ifCashDecreasesBy() {
            const threshold = condition['if_cash_decreases_by'];

            if (threshold) return results.some(smallerThanThreshold);

            function smallerThanThreshold() {
                return app.user.totalWin <= threshold;
            }
        }
    }
}