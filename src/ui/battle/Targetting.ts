module TS.SpaceTac.UI {
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
        simulation = new MoveFireResult()

        // Movement projector
        drawn_info: Phaser.Graphics
        move_ghost: Phaser.Image

        // Fire projector
        fire_arrow: Phaser.Image
        fire_blast: Phaser.Image
        fire_impact: Phaser.Group

        // Collaborators to update
        actionbar: ActionBar

        // Access to the parent view
        view: BaseView

        constructor(view: BaseView, actionbar: ActionBar) {
            this.view = view;
            this.actionbar = actionbar;

            this.container = view.add.group();

            // Visual effects
            this.drawn_info = new Phaser.Graphics(view.game, 0, 0);
            this.drawn_info.visible = false;
            this.move_ghost = new Phaser.Image(view.game, 0, 0, "common-transparent");
            this.move_ghost.anchor.set(0.5, 0.5);
            this.move_ghost.alpha = 0.8;
            this.move_ghost.visible = false;
            this.fire_arrow = new Phaser.Image(view.game, 0, 0, "battle-arena-indicators", 0);
            this.fire_arrow.anchor.set(1, 0.5);
            this.fire_arrow.visible = false;
            this.fire_impact = new Phaser.Group(view.game);
            this.fire_impact.visible = false;
            this.fire_blast = new Phaser.Image(view.game, 0, 0, "battle-arena-blast");
            this.fire_blast.anchor.set(0.5, 0.5);
            this.fire_blast.visible = false;

            this.container.add(this.fire_impact);
            this.container.add(this.fire_blast);
            this.container.add(this.drawn_info);
            this.container.add(this.fire_arrow);
            this.container.add(this.move_ghost);
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
            return (this.ship && this.action) ? true : false;
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
         * Update impact indicators
         */
        updateImpactIndicators(ship: Ship, target: Target, radius: number): void {
            let ships: Ship[];
            if (radius) {
                let battle = ship.getBattle();
                if (battle) {
                    ships = battle.collectShipsInCircle(target, radius, true);
                } else {
                    ships = [];
                }
            } else {
                ships = target.ship ? [target.ship] : [];
            }

            if (ships.length) {
                this.fire_impact.removeAll(true);
                ships.forEach(iship => {
                    let frame = this.view.add.image(iship.arena_x, iship.arena_y, "battle-arena-ship-frames", 5, this.fire_impact);
                    frame.anchor.set(0.5);
                });
                this.fire_impact.visible = true;
            } else {
                this.fire_impact.visible = false;
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

                if (simulation.success) {
                    let previous: MoveFirePart | null = null;
                    simulation.parts.forEach(part => {
                        this.drawPart(part, simulation.complete, previous);
                        previous = part;
                    });
                    this.fire_arrow.frame = simulation.complete ? 0 : 1;

                    let from = simulation.need_fire ? simulation.move_location : this.ship.location;
                    let angle = Math.atan2(this.target.y - from.y, this.target.x - from.x);

                    if (simulation.need_move) {
                        this.move_ghost.visible = true;
                        this.move_ghost.position.set(simulation.move_location.x, simulation.move_location.y);
                        this.move_ghost.rotation = angle;
                    } else {
                        this.move_ghost.visible = false;
                    }

                    if (simulation.need_fire) {
                        let blast = this.action.getBlastRadius(this.ship);
                        if (blast) {
                            this.fire_blast.position.set(this.target.x, this.target.y);
                            this.fire_blast.scale.set(blast * 2 / 365);
                            this.fire_blast.alpha = simulation.can_fire ? 1 : 0.5;
                            this.fire_blast.visible = true;
                        } else {
                            this.fire_blast.visible = false;
                        }
                        this.updateImpactIndicators(this.ship, this.target, blast);

                        this.fire_arrow.position.set(this.target.x, this.target.y);
                        this.fire_arrow.rotation = angle;
                        this.fire_arrow.frame = simulation.complete ? 0 : 1;
                        this.fire_arrow.visible = true;
                    } else {
                        this.fire_blast.visible = false;
                        this.fire_impact.visible = false;
                        this.fire_arrow.visible = false;
                    }

                    this.container.visible = true;
                } else {
                    // TODO Display error
                    this.container.visible = false;
                }
            } else {
                this.container.visible = false;
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
        setAction(action: BaseAction | null): void {
            if (action && action.equipment && action.equipment.attached_to && action.equipment.attached_to.ship) {
                this.ship = action.equipment.attached_to.ship;
                this.action = action;

                let info = this.view.getImageInfo(`ship-${this.ship.model.code}-sprite`);
                this.move_ghost.loadTexture(info.key);
                this.move_ghost.frame = info.frame;
                this.move_ghost.scale.set(0.25);
            } else {
                this.ship = null;
                this.action = null;
            }
            this.target = null;
            this.update();
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
        validate(): void {
            this.simulate();

            if (this.ship && this.simulation.complete) {
                let ship = this.ship;
                this.simulation.parts.forEach(part => {
                    if (part.possible) {
                        part.action.apply(ship, part.target);
                    }
                });
                this.actionbar.actionEnded();
            }
        }
    }
}
