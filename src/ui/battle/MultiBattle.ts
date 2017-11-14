module TK.SpaceTac.UI {
    /**
     * Tool to synchronize two players sharing a battle over network
     */
    export class MultiBattle {
        // Network exchange of messages
        exchange: Multi.Exchange

        // True if this peer is the primary one (the one that invited the other)
        primary: boolean

        // Battle being played
        battle: Battle

        // Count of battle log events that were processed
        processed: number

        // Serializer to use for actions
        serializer: Serializer

        // Timer for scheduling
        timer: Timer

        /**
         * Setup the session other a token
         */
        async setup(view: BaseView, battle: Battle, token: string, primary: boolean) {
            if (this.exchange) {
                // TODO close it
            }

            this.battle = battle;
            this.primary = primary;

            this.exchange = new Multi.Exchange(view.getConnection(), token, primary);
            await this.exchange.start();

            this.serializer = new Serializer(TK.SpaceTac);
            this.processed = this.battle.log.count();
            this.timer = view.timer;

            // This is voluntarily not waited on, as it is a background task
            this.backgroundSync();
        }

        /**
         * Background work to maintain the battle state in sync between the two peers
         */
        async backgroundSync() {
            while (true) {
                if (this.exchange.writing) {
                    await this.sendDiffs();
                } else {
                    await this.receiveDiff();
                }
            }
        }

        /**
         * Send one new diff from the battle log
         */
        async sendDiffs() {
            if (this.processed >= this.battle.log.count()) {
                await this.timer.sleep(500);
            } else {
                let event = this.battle.log.get(this.processed);
                this.processed++;

                if (event instanceof ShipActionUsedDiff) {
                    let data = this.serializer.serialize(event);
                    // TODO "over" should be true if the current ship should be played by remote player
                    await this.exchange.writeMessage(data, false);
                }
            }
        }

        /**
         * Read and apply one diff from the peer
         */
        async receiveDiff() {
            let message = await this.exchange.readMessage();
            let received = this.serializer.unserialize(message);
            if (received instanceof BaseBattleDiff) {
                console.log("Received diff from exchange", received);
                // TODO Apply the diff
            } else {
                console.error("Exchange received something that is not a battle diff", received);
            }
            this.processed = this.battle.log.count();
        }
    }
}
