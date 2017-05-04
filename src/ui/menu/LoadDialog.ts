/// <reference path="../common/UIComponent.ts"/>

module TS.SpaceTac.UI {
    /**
     * Dialog to load a saved game, or join an online one
     */
    export class LoadDialog extends UIComponent {
        saves: [string, string][] = []
        save_selected = 0
        save_name: UILabel
        token_input: UITextInput

        constructor(parent: MainMenu) {
            super(parent, 1344, 566, "menu-load-bg");

            this.addButton(600, 115, () => this.paginateSave(-1), "common-arrow", "common-arrow", 180);
            this.addButton(1038, 115, () => this.paginateSave(1), "common-arrow", "common-arrow", 0);
            this.addButton(1224, 115, () => this.load(), "common-button-ok");
            this.addButton(1224, 341, () => this.join(), "common-button-ok");

            this.save_name = new UILabel(this, 351, 185, "", 32, "#000000");
            this.save_name.setPosition(645, 28);

            this.token_input = new UITextInput(this, 468, 68, 10, "#000000");
            this.token_input.setPosition(585, 304);

            this.refreshSaves();
        }

        /**
         * Refresh available save games
         */
        private refreshSaves(): void {
            let connection = this.view.getConnection();

            // TODO include local save
            // TODO Disable interaction, with loading icon

            connection.listSaves().then(results => {
                this.saves = items(results).sort(([id1, info1], [id2, info2]) => cmp(info2, info1));
                this.setCurrentSave(0);
            });
        }

        /**
         * Set the current selected save game
         */
        private setCurrentSave(position: number): void {
            if (this.saves.length == 0) {
                this.save_name.setContent("No save game found");
            } else {
                this.save_selected = clamp(position, 0, this.saves.length - 1);

                let [saveid, saveinfo] = this.saves[this.save_selected];
                this.save_name.setContent(saveinfo);
            }
        }

        /**
         * Change the selected save
         */
        private paginateSave(offset: number) {
            this.setCurrentSave(this.save_selected + offset);
        }

        /**
         * Join an online game
         */
        private join(): void {
            let token = this.token_input.getContent();
            let connection = this.view.getConnection();

            connection.loadByToken(token).then(session => {
                if (session) {
                    this.view.gameui.setSession(session);
                }
            });
        }

        /**
         * Load selected save game
         */
        private load(): void {
            if (this.save_selected >= 0 && this.saves.length > this.save_selected) {
                let connection = this.view.getConnection();
                let [saveid, saveinfo] = this.saves[this.save_selected];
                connection.loadById(saveid).then(session => {
                    if (session) {
                        this.view.gameui.setSession(session);
                    }
                });
            }
        }
    }
}
