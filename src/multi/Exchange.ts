module TS.SpaceTac.Multi {
    /**
     * Network communication of two peers around a shared session
     * 
     * An exchange is a sequence of messages
     */
    export class Exchange {
        connection: Connection
        token: string
        writing: boolean
        localpeer: string
        count = 0
        remotepeer: string | null = null
        next = "hello"
        closed = false
        timer = new Timer()
        debug = false

        constructor(connection: Connection, token: string, initiator = false, myid = connection.device_id) {
            this.connection = connection;
            this.token = token;
            this.localpeer = myid;
            this.writing = initiator;
        }

        /**
         * Initialize communication with the other peer
         */
        async start(): Promise<void> {
            if (this.debug) {
                console.debug("Exchange started", this.localpeer);
            }

            if (this.writing) {
                await this.writeMessage(null, true);
                await this.readMessage();
            } else {
                await this.readMessage();
                await this.writeMessage(null, true);
            }

            console.log("Echange established", this.token, this.localpeer, this.remotepeer);
        }

        /**
         * Get a next frame id
         */
        getNextId(): string {
            return `${this.token}${this.count}${RandomGenerator.global.id(8)}`;
        }

        /**
         * Push a raw message
         */
        async writeMessage(message: any, over: boolean) {
            if (this.writing) {
                if (this.debug) {
                    console.debug("Exchange write", this.localpeer, this.token, this.next);
                }

                let futurenext = this.getNextId();
                let result = await this.connection.storage.upsert("exchange", { token: this.token, current: this.next },
                    { peer: this.localpeer, over: over, data: message, next: futurenext, count: this.count });

                this.count += 1;
                this.next = futurenext;
                if (over) {
                    this.writing = false;
                }
                return result;
            } else {
                throw new Error("[Exchange] Tried to write out-of-turn");
            }
        }

        /**
         * Wait for a single message
         */
        async readMessage(): Promise<any> {
            if (this.writing) {
                throw new Error("[Exchange] Tried to read out-of-turn");
            } else {
                let message: any;
                do {
                    if (this.debug) {
                        console.debug("Exchange read", this.localpeer, this.token, this.next);
                    }
                    message = await this.connection.storage.find("exchange", { token: this.token, current: this.next });
                    if (!message) {
                        await this.timer.sleep(1000);
                    }
                } while (!message);

                if (this.remotepeer) {
                    if (message.peer != this.remotepeer) {
                        throw new Error("[Exchange] Bad peer id");
                    }
                } else {
                    if (message.peer) {
                        this.remotepeer = message.peer;
                    } else {
                        throw new Error("[Exchange] No peer id");
                    }
                }

                if (message.count != this.count) {
                    throw new Error("[Exchange] Bad message count");
                } else {
                    this.count += 1;
                }

                this.next = message.next;
                if (message.over) {
                    this.writing = true;
                }

                return message.data;
            }
        }
    }
}