module SpaceTac.View {
    "use strict";

    // Processor of battle log events
    //  This will process incoming battle events, and update the battleview accordingly
    export class LogProcessor {
        // Link to the battle view
        private view: BattleView;

        // Link to the battle
        private battle: Game.Battle;

        // Link to the battle log
        private log: Game.BattleLog;

        // Subscription identifier
        private subscription: any;

        // Create a log processor, linked to a battleview
        constructor(view: BattleView) {
            this.view = view;
            this.battle = view.battle;
            this.log = view.battle.log;

            this.subscription = this.log.subscribe((event: Game.BaseLogEvent) => {
                this.processBattleEvent(event);
            });
            this.battle.injectInitialEvents();
        }

        // Process a BaseLogEvent
        processBattleEvent(event: Game.BaseLogEvent) {
            console.log("Battle event", event);

            switch (event.code) {
                case "ship_change":
                    // Playing ship changed
                    this.view.card_playing.setShip(event.target.ship);
                    this.view.action_bar.setShip(event.target.ship);
                    break;
                case "move":
                    var sprite = this.view.arena.findShipSprite(event.ship);
                    if (sprite) {
                        var tween = this.view.game.tweens.create(sprite);
                        tween.to({x: event.target.x, y: event.target.y});
                        tween.start();
                    }
                    break;
            }
        }

        // Destroy the log processor
        destroy() {
            if (this.subscription) {
                this.log.unsubscribe(this.subscription);
                this.subscription = null;
            }
        }
    }
}
