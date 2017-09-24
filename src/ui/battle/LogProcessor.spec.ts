/// <reference path="../TestGame.ts"/>
/// <reference path="../../core/events/BaseBattleEvent.ts"/>

module TK.SpaceTac.UI.Specs {
    class FakeEvent extends BaseBattleEvent {
        diff: number

        constructor(diff = 1) {
            super("fake");

            this.diff = diff;
        }

        apply(battle: Battle) {
            battle.turn += this.diff;
        }

        getReverse(): BaseBattleEvent {
            return new FakeEvent(-this.diff);
        }
    }

    describe("LogProcessor", function () {
        let testgame = setupBattleview();

        it("steps forward and backward in time", function () {
            let battle = testgame.battleview.battle;
            battle.log.clear();
            let processor = new LogProcessor(testgame.battleview);
            processor.register(event => {
                event.apply(battle);
                return 0;
            });
            expect(battle.turn).toBe(1);
            expect(processor.atStart()).toBe(true);
            expect(processor.atEnd()).toBe(true);

            processor.stepForward();
            expect(battle.turn).toBe(1);
            expect(processor.atStart()).toBe(true);
            expect(processor.atEnd()).toBe(true);

            battle.log.add(new FakeEvent());
            expect(battle.turn).toBe(1);
            expect(processor.atStart()).toBe(true);
            expect(processor.atEnd()).toBe(false);

            processor.stepForward();
            expect(battle.turn).toBe(2);
            expect(processor.atStart()).toBe(false);
            expect(processor.atEnd()).toBe(true);

            processor.stepForward();
            expect(battle.turn).toBe(2);
            expect(processor.atStart()).toBe(false);
            expect(processor.atEnd()).toBe(true);

            processor.stepBackward();
            expect(battle.turn).toBe(1);
            expect(processor.atStart()).toBe(true);
            expect(processor.atEnd()).toBe(false);

            processor.stepBackward();
            expect(battle.turn).toBe(1);
            expect(processor.atStart()).toBe(true);
            expect(processor.atEnd()).toBe(false);

            processor.stepForward();
            expect(battle.turn).toBe(2);
            expect(processor.atStart()).toBe(false);
            expect(processor.atEnd()).toBe(true);
        })
    })
}