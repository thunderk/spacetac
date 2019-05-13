module TK.SpaceTac.UI {
    /**
     * UI component to show a loader animation while waiting for something
     */
    export class UIAwaiter extends UIContainer {
        constructor(view: BaseView, x: number, y: number, visible: boolean) {
            super(view, x, y);
            this.setName("awaiter");
            this.setVisible(visible);

            let manager = new UIParticles(view).createManager("common-awaiter", this);
            let circle = new Phaser.Geom.Circle(0, 0, 60);
            manager.createEmitter({
                angle: { start: 0, end: 360, steps: 6 },
                alpha: { start: 1, end: 0, ease: "Quad.easeIn" },
                lifespan: 1200,
                speed: 5,
                quantity: 1,
                scale: { start: 0.9, end: 1, ease: "Quad.easeOut" },
                frequency: 200,
                particleClass: <any>FacingAlwaysParticle,
                emitZone: { type: 'edge', source: circle, quantity: 6 }
            });
        }
    }
}
