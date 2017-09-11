/// <reference path="../BaseView.ts"/>

module TS.SpaceTac.UI {
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
                    // For now, we create a random fleet
                    this.gameui.session.setCampaignFleet();
                    this.backToRouter();
                    return false;
                } else {
                    return true;
                }
            };

            this.input.onTap.add(nextStep);

            this.inputs.bind("Home", "Rewind", () => steps.rewind());
            this.inputs.bind("Space", "Next step", nextStep);
            this.inputs.bind("Enter", "Next step", nextStep);
            this.inputs.bind("Escape", "Skip all", () => {
                while (nextStep()) {
                }
            });

            this.gameui.audio.startMusic("division");
        }
    }
}
