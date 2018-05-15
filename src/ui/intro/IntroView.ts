/// <reference path="../BaseView.ts"/>

module TK.SpaceTac.UI {
    /**
     * View introducing the campaign story.
     */
    export class IntroView extends BaseView {
        create() {
            super.create();

            let steps = new IntroSteps(this);
            steps.setupDefaultSteps();
            steps.startPlayback();

            let nextStep = () => {
                if (!steps.nextStep()) {
                    this.session.introduced = true;
                    this.backToRouter();
                    return false;
                } else {
                    return true;
                }
            };

            this.input.on("pointerup", nextStep);

            this.inputs.bind("Home", "Rewind", () => steps.rewind());
            this.inputs.bind("Space", "Next step", nextStep);
            this.inputs.bind("Enter", "Next step", nextStep);
            this.inputs.bind("Escape", "Skip all", () => {
                while (nextStep()) {
                }
            });

            this.audio.startMusic("division");
        }
    }
}
