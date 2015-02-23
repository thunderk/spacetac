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
                    this.processShipChangeEvent(<Game.ShipChangeEvent>event);
                    break;
                case "damage":
                    this.processDamageEvent(<Game.DamageEvent>event);
                    break;
                case "move":
                    this.processMoveEvent(<Game.MoveEvent>event);
                    break;
                case "attr":
                    this.processAttributeChangedEvent(<Game.AttributeChangeEvent>event);
                    break;
                case "death":
                    this.processDeathEvent(<Game.DeathEvent>event);
                    break;
                case "fire":
                    this.processFireEvent(<Game.FireEvent>event);
                    break;
                case "endbattle":
                    this.view.setInteractionEnabled(false);
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

        // Playing ship changed
        private processShipChangeEvent(event: Game.ShipChangeEvent): void {
            this.view.arena.setShipPlaying(event.target.ship);
            this.view.ship_list.setPlaying(event.target.ship);
            this.view.card_playing.setShip(event.target.ship);
            this.view.action_bar.setShip(event.target.ship);

            this.view.setInteractionEnabled(this.battle.canPlay(this.view.player));
        }

        // Damage to ship
        private processDamageEvent(event: Game.DamageEvent): void {
            var sprite = this.view.arena.findShipSprite(event.ship);
            if (sprite) {
                sprite.displayDamage(event.hull, event.shield);
            }
        }

        // Ship moved
        private processMoveEvent(event: Game.MoveEvent): void {
            var sprite = this.view.arena.findShipSprite(event.ship);
            if (sprite) {
                sprite.moveTo(event.target.x, event.target.y, event.facing_angle, true);
            }
        }

        // Ship attribute changed
        private processAttributeChangedEvent(event: Game.AttributeChangeEvent): void {
            var item = this.view.ship_list.findItem(event.ship);
            if (item) {
                item.attributeChanged(event.attribute);
            }
        }

        // A ship died
        private processDeathEvent(event: Game.DeathEvent): void {
            this.view.arena.removeShip(event.ship);
            this.view.ship_list.removeShip(event.ship);
        }

        // Weapon used
        private processFireEvent(event: Game.FireEvent): void {
            // TODO Handle in-space target
            var source = this.view.arena.findShipSprite(event.ship);
            var destination = this.view.arena.findShipSprite(event.target.ship);

            var dy = destination.y - source.y;
            var dx = destination.x - source.x;
            var angle = Math.atan2(dy, dx);

            source.moveTo(source.x, source.y, angle, true);

            var effect = new WeaponEffect(source, destination, event.weapon.code);
            effect.start();
        }
    }
}
