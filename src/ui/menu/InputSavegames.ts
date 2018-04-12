module TK.SpaceTac.UI {
    /**
     * Input to display available save games, and load one
     */
    export class InputSavegames {
        private saves: [string, string][] = []
        private save_selected = 0
        private save_name?: UIText

        constructor(private view: BaseView, private builder: UIBuilder, x: number, y: number) {
            builder.in(builder.image("menu-input", x, y, true), builder => {
                builder.button("menu-arrow-left", -196, 0, () => this.paginateSave(1), "Older saves", undefined, { center: true });
                builder.button("menu-arrow-right", 196, 0, () => this.paginateSave(-1), "Newer saves", undefined, { center: true });

                this.save_name = builder.text("", 0, 0, { size: 24 });
            });

            this.refreshSaves();
        }

        /**
         * Refresh available save games
         */
        refreshSaves(): void {
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
        setCurrentSave(position: number): void {
            if (!this.save_name) {
                return;
            }

            if (this.saves.length == 0) {
                this.builder.change(this.save_name, "No save game found");
            } else {
                this.save_selected = clamp(position, 0, this.saves.length - 1);

                let [saveid, saveinfo] = this.saves[this.save_selected];
                this.builder.change(this.save_name, saveinfo);
            }
        }

        /**
         * Change the selected save
         */
        paginateSave(offset: number) {
            this.setCurrentSave(this.save_selected + offset);
        }

        /**
         * Load selected save game
         */
        load(): void {
            if (this.save_selected >= 0 && this.saves.length > this.save_selected) {
                let connection = this.view.getConnection();
                let [saveid, saveinfo] = this.saves[this.save_selected];

                let dialog = new UIWaitingDialog(this.view, "Loading game from server...");
                connection.loadById(saveid).then(session => {
                    if (session) {
                        this.view.gameui.setSession(session);
                        dialog.close();
                    } else {
                        dialog.displayError("No suitable data found in save game (saved with older version ?)");
                    }
                }).catch(() => {
                    dialog.displayError("Error while loading game from server");
                });
            }
        }
    }
}
