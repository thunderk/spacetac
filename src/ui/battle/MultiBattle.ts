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
            this.processed = this.battle.log.events.length;
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
                    await this.sendActions();
                } else {
                    await this.receiveAction();
                }
            }
        }

        /**
         * Send all new actions from the battle log
         */
        async sendActions() {
            let events = this.battle.log.events;

            if (this.processed >= events.length) {
                await this.timer.sleep(500);
            } else {
                while (this.processed < events.length) {
                    let event = events[this.processed];
                    this.processed++;

                    if (event instanceof ActionAppliedEvent) {
                        let data = this.serializer.serialize(event);
                        // TODO "over" should be true if the current ship should be played by remote player
                        await this.exchange.writeMessage(data, false);
                    }
                }
            }
        }

        /**
         * Read and apply one action from the peer
         */
        async receiveAction() {
            let message = await this.exchange.readMessage();
            let received = this.serializer.unserialize(message);
            if (received instanceof ActionAppliedEvent) {
                console.log("Received action from exchange", received);
                // TODO Find the matching action, ship and target, and apply
            } else {
                console.error("Exchange received something that is not an action event", received);
            }
            this.processed = this.battle.log.events.length;
        }
    }
}
