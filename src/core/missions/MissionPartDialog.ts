/// <reference path="MissionPart.ts" />

module TS.SpaceTac {
    /**
     * A single dialog piece
     */
    interface DialogPiece {
        // Interlocutor (null for the player's fleet)
        interlocutor: Ship | null

        // Text message
        message: string
    }

    /**
     * A mission part that triggers a dialog
     */
    export class MissionPartDialog extends MissionPart {
        // Other ships with which the dialog will take place
        interlocutors: Ship[]

        // Pieces of dialog
        pieces: DialogPiece[] = []

        // Current piece
        current_piece = 0

        constructor(mission: Mission, interlocutors: Ship[], directive?: string) {
            super(mission, directive || `Speak with ${interlocutors[0].name}`);

            this.interlocutors = interlocutors;
        }

        checkCompleted(): boolean {
            return this.current_piece >= this.pieces.length;
        }

        forceComplete(): void {
            this.skip();
        }

        /**
         * Add a piece of dialog
         */
        addPiece(interlocutor: Ship | null, message: string): void {
            this.pieces.push({
                interlocutor: interlocutor,
                message: message
            });
        }

        /**
         * Go to the next dialog "screen"
         * 
         * Returns true if there is still dialog to display.
         */
        next(): boolean {
            this.current_piece += 1;
            return !this.checkCompleted();
        }

        /**
         * Skip to the end
         */
        skip() {
            while (this.next()) {
            }
        }

        /**
         * Get the current piece of dialog
         */
        getCurrent(): DialogPiece {
            if (this.checkCompleted()) {
                return {
                    interlocutor: null,
                    message: ""
                }
            } else {
                let piece = this.pieces[this.current_piece];
                return {
                    interlocutor: piece.interlocutor || this.getFleetInterlocutor(piece),
                    message: piece.message
                }
            }
        }

        /**
         * Get the interlocutor from the player fleet that will say the piece
         */
        private getFleetInterlocutor(piece: DialogPiece): Ship | null {
            if (this.fleet.ships.length > 0) {
                // TODO Choose a ship by its personality traits
                return this.fleet.ships[0];
            } else {
                return null;
            }
        }
    }
}
