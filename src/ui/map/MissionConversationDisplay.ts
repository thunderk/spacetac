/// <reference path="../common/UIConversation.ts" />

module TK.SpaceTac.UI {
    /**
     * Display of an active mission conversation
     */
    export class MissionConversationDisplay extends UIConversation {
        dialog: MissionPartConversation | null = null
        on_ended: Function | null = null

        constructor(parent: BaseView) {
            super(parent, () => true);
        }

        /**
         * Update from currently active missions
         */
        updateFromMissions(missions: ActiveMissions, on_ended: Function | null = null) {
            let parts = missions.getCurrent().map(mission => mission.current_part);
            this.dialog = <MissionPartConversation | null>first(parts, part => part instanceof MissionPartConversation);

            if (this.dialog) {
                this.on_ended = on_ended;
            } else {
                this.on_ended = null;
            }

            this.refresh();
        }

        /**
         * Go to the next dialog piece
         */
        forward(): void {
            if (this.dialog) {
                this.dialog.next();
                this.refresh();
            }
        }

        /**
         * Skip the conversation
         */
        skipConversation(): void {
            if (this.dialog) {
                this.dialog.skip();
                this.refresh();
            }
        }

        /**
         * Refresh the displayed dialog piece
         */
        refresh() {
            this.clearContent();

            if (this.dialog) {
                if (this.dialog.checkCompleted()) {
                    if (this.on_ended) {
                        this.on_ended();
                        this.on_ended = null;
                    }
                    this.setVisible(false, 700);
                } else {
                    let piece = this.dialog.getCurrent();
                    this.setCurrentShipMessage(piece.interlocutor || new Ship(), piece.message);
                    this.setVisible(true, 700);
                }
            } else {
                this.setVisible(false);
            }
        }
    }
}