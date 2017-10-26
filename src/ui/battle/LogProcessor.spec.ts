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
            battle.cycle += this.diff;
        }

        getReverse(): BaseBattleEvent {
            return new FakeEvent(-this.diff);
        }
    }

    testing("LogProcessor", test => {
        let testgame = setupBattleview();

        test.case("steps forward and backward in time", check => {
            let battle = testgame.view.battle;
            battle.log.clear();
            let processor = new LogProcessor(testgame.view);
            processor.register(event => {
                event.apply(battle);
                return 0;
            });
            check.equals(battle.cycle, 1);
            check.equals(processor.atStart(), true);
            check.equals(processor.atEnd(), true);

            processor.stepForward();
            check.equals(battle.cycle, 1);
            check.equals(processor.atStart(), true);
            check.equals(processor.atEnd(), true);

            battle.log.add(new FakeEvent());
            check.equals(battle.cycle, 1);
            check.equals(processor.atStart(), true);
            check.equals(processor.atEnd(), false);

            processor.stepForward();
            check.equals(battle.cycle, 2);
            check.equals(processor.atStart(), false);
            check.equals(processor.atEnd(), true);

            processor.stepForward();
            check.equals(battle.cycle, 2);
            check.equals(processor.atStart(), false);
            check.equals(processor.atEnd(), true);

            processor.stepBackward();
            check.equals(battle.cycle, 1);
            check.equals(processor.atStart(), true);
            check.equals(processor.atEnd(), false);

            processor.stepBackward();
            check.equals(battle.cycle, 1);
            check.equals(processor.atStart(), true);
            check.equals(processor.atEnd(), false);

            processor.stepForward();
            check.equals(battle.cycle, 2);
            check.equals(processor.atStart(), false);
            check.equals(processor.atEnd(), true);
        })
    })
}