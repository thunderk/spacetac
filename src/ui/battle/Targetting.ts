module TK.SpaceTac.UI {
    /**
     * Targetting system on the arena
     * 
     * This system handles choosing a target for currently selected action, and displays a visual aid.
     */
    export class Targetting {
        // Container group
        container: Phaser.Group

        // Current action
        ship: Ship | null = null
        action: BaseAction | null = null
        target: Target | null = null
        mode: ActionTargettingMode
        simulation = new MoveFireResult()

        // Move and fire lines
        drawn_info: Phaser.Graphics
        move_ghost: Phaser.Image
        fire_arrow: Phaser.Image

        // Impact area
        impact_area: Phaser.Graphics
        impact_indicators: Phaser.Group

        // Collaborators to update
        actionbar: ActionBar
        range_hint: RangeHint
        tactical_mode: ToggleClient

        // Access to the parent view
        view: BaseView

        constructor(view: BaseView, actionbar: ActionBar, tactical_mode: Toggle, range_hint: RangeHint) {
            this.view = view;
            this.actionbar = actionbar;
            this.tactical_mode = tactical_mode.manipulate("targetting");
            this.range_hint = range_hint;

            this.container = view.add.group();

            // Visual effects
            this.drawn_info = new Phaser.Graphics(view.game, 0, 0);
            this.drawn_info.visible = false;
            this.move_ghost = new Phaser.Image(view.game, 0, 0, "common-transparent");
            this.move_ghost.anchor.set(0.5, 0.5);
            this.move_ghost.alpha = 0.8;
            this.move_ghost.visible = false;
            this.fire_arrow = this.view.newImage("battle-hud-simulator-ok");
            this.fire_arrow.anchor.set(1, 0.5);
            this.fire_arrow.visible = false;
            this.impact_indicators = new Phaser.Group(view.game);
            this.impact_indicators.visible = false;
            this.impact_area = new Phaser.Graphics(view.game);
            this.impact_area.visible = false;

            this.container.add(this.impact_indicators);
            this.container.add(this.impact_area);
            this.container.add(this.drawn_info);
            this.container.add(this.move_ghost);
            this.container.add(this.fire_arrow);
        }

        /**
         * Move to a given view layer
         */
        moveToLayer(layer: Phaser.Group): void {
            layer.add(this.container);
        }

        /**
         * Indicator that the targetting is currently active
         */
        get active(): boolean {
            return bool(this.ship && this.action);
        }

        /**
         * Draw a vector, with line and gradation
         */
        drawVector(color: number, x1: number, y1: number, x2: number, y2: number, gradation = 0) {
            let line = this.drawn_info;
            line.lineStyle(6, color);
            line.moveTo(x1, y1);
            line.lineTo(x2, y2);
            line.visible = true;

            if (gradation) {
                let dx = x2 - x1;
                let dy = y2 - y1;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let angle = Math.atan2(dy, dx);
                dx = Math.cos(angle);
                dy = Math.sin(angle);
                line.lineStyle(3, color);
                for (let d = gradation; d <= dist; d += gradation) {
                    line.moveTo(x1 + dx * d + dy * 10, y1 + dy * d - dx * 10);
                    line.lineTo(x1 + dx * d - dy * 10, y1 + dy * d + dx * 10);
                }
            }
        }

        /**
         * Draw a part of the simulation
         */
        drawPart(part: MoveFirePart, enabled = true, previous: MoveFirePart | null = null): void {
            if (!this.ship) {
                return;
            }

            let move = part.action instanceof MoveAction;
            let color = (enabled && part.possible) ? (move ? 0xe09c47 : 0xdc6441) : 0x8e8e8e;
            let src = previous ? previous.target : this.ship.location;
            let gradation = (part.action instanceof MoveAction) ? part.action.getDistanceByActionPoint(this.ship) : 0;
            this.drawVector(color, src.x, src.y, part.target.x, part.target.y, gradation);
        }

        /**
         * Update impact indicators (highlighting impacted ships)
         */
        updateImpactIndicators(impacts: Phaser.Group, ship: Ship, action: BaseAction, target: Target, source: IArenaLocation = ship.location): void {
            let ships = action.getImpactedShips(ship, target, source);
            if (ships.length) {
                // TODO differential
                impacts.removeAll(true);
                ships.forEach(iship => {
                    let indicator = this.view.newImage("battle-hud-ship-impacted", iship.arena_x, iship.arena_y);
                    indicator.anchor.set(0.5);
                    impacts.add(indicator);
                });
                impacts.visible = true;
            } else {
                impacts.visible = false;
            }
        }

        /**
         * Update impact graphics (area display)
         */
        updateImpactArea(area: Phaser.Graphics, action: BaseAction): void {
            area.clear();

            let color = 0;
            let radius = 0;
            let angle = 0;
            if (action instanceof TriggerAction) {
                color = 0x90481e;
                if (action.angle) {
                    angle = (action.angle * 0.5) * Math.PI / 180;
                    radius = action.range;
                } else {
                    radius = action.blast;
                }
            } else if (action instanceof DeployDroneAction) {
                color = 0xe9f2f9;
                radius = action.effect_radius;
            } else if (action instanceof ToggleAction) {
                color = 0xd3e448;
                radius = action.radius;
            }

            if (radius) {
                area.lineStyle(2, color, 0.6);
                area.beginFill(color, 0.2);
                if (angle) {
                    area.arc(0, 0, radius, angle, -angle, true);
                } else {
                    area.drawCircle(0, 0, radius * 2);
                }
                area.endFill();
            }
        }

        /**
         * Update visual effects to show the simulation of current action/target
         */
        update(): void {
            this.simulate();
            if (this.ship && this.action && this.target) {
                let simulation = this.simulation;

                this.drawn_info.clear();
                this.fire_arrow.visible = false;
                this.move_ghost.visible = false;

                let from = (simulation.need_fire && this.mode != ActionTargettingMode.SURROUNDINGS) ? simulation.move_location : this.ship.location;
                let angle = Math.atan2(this.target.y - from.y, this.target.x - from.x);

                if (simulation.success) {
                    let previous: MoveFirePart | null = null;
                    simulation.parts.forEach(part => {
                        this.drawPart(part, simulation.complete, previous);
                        previous = part;
                    });

                    if (simulation.need_move) {
                        this.move_ghost.visible = true;
                        this.move_ghost.position.set(simulation.move_location.x, simulation.move_location.y);
                        this.move_ghost.rotation = angle;
                    } else {
                        this.move_ghost.visible = false;
                    }

                    if (simulation.need_fire) {
                        if (this.action instanceof TriggerAction && this.action.angle) {
                            this.impact_area.position.set(simulation.move_location.x, simulation.move_location.y);
                            this.impact_area.rotation = arenaAngle(simulation.move_location, simulation.fire_location);
                        } else {
                            this.impact_area.position.set(this.target.x, this.target.y);
                        }
                        this.impact_area.alpha = simulation.can_fire ? 1 : 0.5;
                        this.impact_area.visible = true;

                        this.updateImpactIndicators(this.impact_indicators, this.ship, this.action, this.target, this.simulation.move_location);

                        this.fire_arrow.position.set(this.target.x, this.target.y);
                        this.fire_arrow.rotation = angle;
                        this.view.changeImage(this.fire_arrow, simulation.complete ? "battle-hud-simulator-ok" : "battle-hud-simulator-power");
                        this.fire_arrow.visible = true;
                    } else {
                        this.impact_area.visible = false;
                        this.impact_indicators.visible = false;
                        this.fire_arrow.visible = false;
                    }
                } else {
                    this.drawVector(0x888888, this.ship.arena_x, this.ship.arena_y, this.target.x, this.target.y);
                    this.fire_arrow.position.set(this.target.x, this.target.y);
                    this.fire_arrow.rotation = angle;
                    this.view.changeImage(this.fire_arrow, "battle-hud-simulator-failed");
                    this.fire_arrow.visible = true;
                    this.impact_area.visible = false;
                }
                this.container.visible = true;
            } else {
                this.container.visible = false;
            }

            // Toggle tactical mode
            this.tactical_mode(bool(this.action));

            // Toggle range hint
            if (this.ship && this.action) {
                if (this.simulation.need_move) {
                    let move_action: MoveAction | null = null;
                    if (this.simulation.success) {
                        let last_move = first(acopy(this.simulation.parts).reverse(), part => part.action instanceof MoveAction);
                        if (last_move) {
                            move_action = <MoveAction>last_move.action;
                        }
                    } else {
                        let engine = new MoveFireSimulator(this.ship).findBestEngine();
                        if (engine && engine.action) {
                            move_action = <MoveAction>engine.action;
                        }
                    }
                    if (move_action) {
                        let power = this.ship.getValue("power");
                        if (this.action !== move_action) {
                            power = Math.max(power - this.action.getActionPointsUsage(this.ship, this.target), 0);
                        }
                        let radius = move_action.getRangeRadiusForPower(this.ship, power);
                        this.range_hint.update(this.ship, move_action, radius);
                    } else {
                        this.range_hint.clear();
                    }
                } else {
                    this.range_hint.update(this.ship, this.action);
                }
            } else {
                this.range_hint.clear();
            }
        }

        /**
         * Simulate current action
         */
        simulate(): void {
            if (this.ship && this.action && this.target) {
                let simulator = new MoveFireSimulator(this.ship);
                this.simulation = simulator.simulateAction(this.action, this.target, 1);
            } else {
                this.simulation = new MoveFireResult();
            }
        }

        /**
         * Set the current targetting action, or null to stop targetting
         */
        setAction(action: BaseAction | null, mode?: ActionTargettingMode): void {
            if (action && action.equipment && action.equipment.attached_to && action.equipment.attached_to.ship) {
                this.ship = action.equipment.attached_to.ship;
                this.action = action;
                this.mode = (typeof mode == "undefined") ? action.getTargettingMode(this.ship) : mode;

                this.view.changeImage(this.move_ghost, `ship-${this.ship.model.code}-sprite`);
                this.move_ghost.scale.set(0.4);

                this.updateImpactArea(this.impact_area, this.action);

                this.setTarget(action.getDefaultTarget(this.ship));
            } else {
                this.ship = null;
                this.action = null;

                this.setTarget(null);
            }
        }

        /**
         * Set the target according to a hovered arena location
         * 
         * This will apply the current targetting mode, to assist the player
         */
        setTargetFromLocation(location: ArenaLocation | null): void {
            if (location && this.ship) {
                let battle = this.ship.getBattle();
                if (this.mode == ActionTargettingMode.SHIP && battle) {
                    let targets = imaterialize(battle.iships(true));
                    let nearest = minBy(targets, ship => arenaDistance(ship.location, location));
                    this.setTarget(Target.newFromShip(nearest ? nearest : this.ship));
                } else if (this.mode == ActionTargettingMode.SPACE) {
                    this.setTarget(Target.newFromLocation(location.x, location.y));
                } else if (this.mode == ActionTargettingMode.SURROUNDINGS) {
                    if (arenaDistance(this.ship.location, location) < 50) {
                        this.setTarget(Target.newFromShip(this.ship));
                    } else {
                        this.setTarget(Target.newFromLocation(location.x, location.y));
                    }
                } else {
                    this.setTarget(Target.newFromShip(this.ship));
                }
            } else {
                this.setTarget(null);
            }
        }

        /**
         * Set the target for current action
         */
        setTarget(target: Target | null): void {
            this.target = target;
            this.update();
            if (this.action) {
                this.actionbar.updateFromSimulation(this.action, this.simulation);
            }
        }

        /**
         * Validate the current target.
         * 
         * This will make the needed approach and apply the action.
         */
        validate(applier: (action: BaseAction, target?: Target) => boolean): void {
            if (this.active) {
                this.simulate();

                if (this.ship && this.simulation.complete) {
                    let ship = this.ship;
                    this.simulation.parts.forEach(part => {
                        if (part.possible) {
                            applier(part.action, part.target);
                        }
                    });
                    this.actionbar.actionEnded();
                }
            }
        }
    }
}
