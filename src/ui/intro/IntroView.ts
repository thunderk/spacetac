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

            this.input.onTap.add(() => {
                if (!steps.nextStep()) {
                    // For now, we create a random fleet
                    this.gameui.session.setCampaignFleet();
                    this.backToRouter();
                }
            });

            this.inputs.bind("Home", "Rewind", () => steps.rewind());
        }
    }
}
