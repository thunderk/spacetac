module TS.SpaceTac.View {
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

            if (event instanceof Game.ShipChangeEvent) {
                this.processShipChangeEvent(event);
            } else if (event instanceof Game.MoveEvent) {
                this.processMoveEvent(event);
            } else if (event instanceof Game.ValueChangeEvent) {
                this.processValueChangedEvent(event);
            } else if (event instanceof Game.DeathEvent) {
                this.processDeathEvent(event);
            } else if (event instanceof Game.FireEvent) {
                this.processFireEvent(event);
            } else if (event instanceof Game.DamageEvent) {
                this.processDamageEvent(event);
            } else if (event instanceof Game.EndBattleEvent) {
                this.processEndBattleEvent(event);
            } else if (event instanceof Game.DroneDeployedEvent) {
                this.processDroneDeployedEvent(event);
            } else if (event instanceof Game.DroneDestroyedEvent) {
                this.processDroneDestroyedEvent(event);
            } else if (event.code == "effectadd" || event.code == "effectduration" || event.code == "effectdel") {
                this.processEffectEvent(event);
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
            this.view.action_bar.setShip(event.target.ship);

            this.view.setInteractionEnabled(this.battle.canPlay(this.view.player));
        }

        // Damage to ship
        private processDamageEvent(event: Game.DamageEvent): void {
            var sprite = this.view.arena.findShipSprite(event.ship);
            if (sprite) {
                sprite.displayDamage(event.hull, event.shield);
            }
            var item = this.view.ship_list.findItem(event.ship);
            if (item) {
                item.setDamageHit();
            }
        }

        // Ship moved
        private processMoveEvent(event: Game.MoveEvent): void {
            var sprite = this.view.arena.findShipSprite(event.ship);
            if (sprite) {
                sprite.moveTo(event.target.x, event.target.y, event.facing_angle, true);
            }
        }

        // Ship value changed
        private processValueChangedEvent(event: Game.ValueChangeEvent): void {
            var item = this.view.ship_list.findItem(event.ship);
            if (item) {
                item.updateAttributes();
            }
            // TODO Update tooltip
        }

        // A ship died
        private processDeathEvent(event: Game.DeathEvent): void {
            if (this.view.ship_hovered === event.ship) {
                this.view.setShipHovered(null);
            }
            this.view.arena.markAsDead(event.ship);
            this.view.ship_list.markAsDead(event.ship);
        }

        // Weapon used
        private processFireEvent(event: Game.FireEvent): void {
            var source = Game.Target.newFromShip(event.ship);
            var destination = event.target;

            // Face the target
            var attacker = this.view.arena.findShipSprite(event.ship);
            var angle = source.getAngleTo(destination);
            attacker.moveTo(source.x, source.y, angle, true);

            var effect = new WeaponEffect(this.view.arena, source, destination, event.weapon.code);
            effect.start();
        }

        // Battle ended (victory or defeat)
        private processEndBattleEvent(event: Game.EndBattleEvent): void {
            this.view.setInteractionEnabled(false);

            if (event.outcome.winner.player === this.view.player) {
                // Victory !
                // TODO Loot screen
                this.view.player.exitBattle();
                this.view.game.state.start("router");
            } else {
                // TODO Game over ?
            }
        }

        // Sticky effect on ship added, changed or removed
        private processEffectEvent(event: Game.BaseLogEvent): void {
            var item = this.view.ship_list.findItem(event.ship);
            if (item) {
                item.updateEffects();
            }
        }

        // New drone deployed
        private processDroneDeployedEvent(event: Game.DroneDeployedEvent): void {
            this.view.arena.addDrone(event.drone);
        }

        // Drone destroyed
        private processDroneDestroyedEvent(event: Game.DroneDestroyedEvent): void {
            this.view.arena.removeDrone(event.drone);
        }
    }
}
