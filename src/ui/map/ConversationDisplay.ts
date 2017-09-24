module TK.SpaceTac.UI {
    /**
     * Display of an active conversation
     */
    export class ConversationDisplay extends UIComponent {
        dialog: MissionPartConversation | null = null
        player: Player
        on_end: Function | null = null

        constructor(parent: BaseView, player: Player) {
            super(parent, parent.getWidth(), parent.getHeight());

            this.player = player;

            this.drawBackground(0x404450, undefined, undefined, 0.7, () => this.nextPiece());
            this.setVisible(false);
        }

        /**
         * Update from currently active missions
         */
        updateFromMissions(missions: ActiveMissions, on_end: Function | null = null) {
            let parts = missions.getCurrent().map(mission => mission.current_part);
            this.dialog = <MissionPartConversation | null>first(parts, part => part instanceof MissionPartConversation);

            if (this.dialog) {
                this.on_end = on_end;
            } else {
                this.on_end = null;
            }

            this.refresh();
        }

        /**
         * Go to the next dialog piece
         */
        nextPiece(): void {
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
                    if (this.on_end) {
                        this.on_end();
                        this.on_end = null;
                    }
                    this.setVisible(false, 700);
                } else {
                    let piece = this.dialog.getCurrent();

                    let style = new ProgressiveMessageStyle();
                    if (piece.interlocutor) {
                        style.image = `ship-${piece.interlocutor.model.code}-portrait`;
                        style.image_caption = piece.interlocutor.name;
                        style.image_size = 256;
                    }

                    let message = new ProgressiveMessage(this, 900, 300, piece.message, style);
                    message.addButton(840, 240, () => this.nextPiece(), "common-arrow");

                    if (piece.interlocutor && piece.interlocutor.getPlayer() === this.player) {
                        message.setPositionInsideParent(0.1, 0.2);
                    } else {
                        message.setPositionInsideParent(0.9, 0.8);
                    }

                    this.setVisible(true, 700);
                }
            } else {
                this.setVisible(false);
            }
        }
    }
}