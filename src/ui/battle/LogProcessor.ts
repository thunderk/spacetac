module TS.SpaceTac.UI {
    // Processor of battle log events
    //  This will process incoming battle events, and update the battleview accordingly
    export class LogProcessor {
        // Link to the battle view
        private view: BattleView;

        // Link to the battle
        private battle: Battle;

        // Link to the battle log
        private log: BattleLog;

        // Subscription identifier
        private subscription: any;

        // Create a log processor, linked to a battleview
        constructor(view: BattleView) {
            this.view = view;
            this.battle = view.battle;
            this.log = view.battle.log;

            this.subscription = this.log.subscribe((event: BaseLogEvent) => {
                this.processBattleEvent(event);
            });
            this.battle.injectInitialEvents();
        }

        // Process a BaseLogEvent
        processBattleEvent(event: BaseLogEvent) {
            console.log("Battle event", event);

            if (event instanceof ShipChangeEvent) {
                this.processShipChangeEvent(event);
            } else if (event instanceof MoveEvent) {
                this.processMoveEvent(event);
            } else if (event instanceof ValueChangeEvent) {
                this.processValueChangedEvent(event);
            } else if (event instanceof DeathEvent) {
                this.processDeathEvent(event);
            } else if (event instanceof FireEvent) {
                this.processFireEvent(event);
            } else if (event instanceof DamageEvent) {
                this.processDamageEvent(event);
            } else if (event instanceof EndBattleEvent) {
                this.processEndBattleEvent(event);
            } else if (event instanceof DroneDeployedEvent) {
                this.processDroneDeployedEvent(event);
            } else if (event instanceof DroneDestroyedEvent) {
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
        private processShipChangeEvent(event: ShipChangeEvent): void {
            this.view.arena.setShipPlaying(event.target.ship);
            this.view.ship_list.setPlaying(event.target.ship);
            this.view.action_bar.setShip(event.target.ship);

            this.view.setInteractionEnabled(this.battle.canPlay(this.view.player));
        }

        // Damage to ship
        private processDamageEvent(event: DamageEvent): void {
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
        private processMoveEvent(event: MoveEvent): void {
            var sprite = this.view.arena.findShipSprite(event.ship);
            if (sprite) {
                sprite.moveTo(event.target.x, event.target.y, event.facing_angle, true);
            }
        }

        // Ship value changed
        private processValueChangedEvent(event: ValueChangeEvent): void {
            var item = this.view.ship_list.findItem(event.ship);
            if (item) {
                item.updateAttributes();
            }
            // TODO Update tooltip
        }

        // A ship died
        private processDeathEvent(event: DeathEvent): void {
            if (this.view.ship_hovered === event.ship) {
                this.view.setShipHovered(null);
            }
            this.view.arena.markAsDead(event.ship);
            this.view.ship_list.markAsDead(event.ship);
        }

        // Weapon used
        private processFireEvent(event: FireEvent): void {
            var source = Target.newFromShip(event.ship);
            var destination = event.target;

            // Face the target
            var attacker = this.view.arena.findShipSprite(event.ship);
            var angle = source.getAngleTo(destination);
            attacker.moveTo(source.x, source.y, angle, true);

            var effect = new WeaponEffect(this.view.arena, source, destination, event.weapon.code);
            effect.start();
        }

        // Battle ended (victory or defeat)
        private processEndBattleEvent(event: EndBattleEvent): void {
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
        private processEffectEvent(event: BaseLogEvent): void {
            var item = this.view.ship_list.findItem(event.ship);
            if (item) {
                item.updateEffects();
            }
        }

        // New drone deployed
        private processDroneDeployedEvent(event: DroneDeployedEvent): void {
            this.view.arena.addDrone(event.drone);
        }

        // Drone destroyed
        private processDroneDestroyedEvent(event: DroneDestroyedEvent): void {
            this.view.arena.removeDrone(event.drone);
        }
    }
}
