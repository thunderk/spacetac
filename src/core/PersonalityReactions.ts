module TK.SpaceTac {
    // Reaction triggered
    export type PersonalityReaction = PersonalityReactionConversation

    // Condition to check if a reaction may happen, returning involved ships (order is important)
    export type ReactionCondition = (player: Player, battle: Battle | null, ship: Ship | null, event: BaseBattleEvent | null) => Ship[]

    // Reaction profile, giving a probability for types of personality, and an associated reaction constructor
    export type ReactionProfile = [(traits: IPersonalityTraits) => number, (ships: Ship[]) => PersonalityReaction]

    // Reaction config (condition, chance, profiles)
    export type ReactionConfig = [ReactionCondition, number, ReactionProfile[]]

    // Pool of reaction config
    export type ReactionPool = { [code: string]: ReactionConfig }

    /**
     * Reactions to external events according to personalities.
     * 
     * This allows for a more "alive" world, as characters tend to speak to react to events.
     * 
     * This object will store the previous reactions to avoid too much recurrence, and should be global to a whole
     * game session.
     */
    export class PersonalityReactions {
        done: string[] = []
        random = RandomGenerator.global

        /**
         * Check for a reaction.
         * 
         * This will return a reaction to display, and add it to the done list
         */
        check(player: Player, battle: Battle | null = null, ship: Ship | null = null, event: BaseBattleEvent | null = null, pool: ReactionPool = BUILTIN_REACTION_POOL): PersonalityReaction | null {
            let codes = difference(keys(pool), this.done);

            let candidates = nna(codes.map((code: string): [string, Ship[], ReactionProfile[]] | null => {
                let [condition, chance, profiles] = pool[code];
                if (this.random.random() <= chance) {
                    let involved = condition(player, battle, ship, event);
                    if (involved.length > 0) {
                        return [code, involved, profiles];
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            }));

            if (candidates.length > 0) {
                let [code, involved, profiles] = this.random.choice(candidates);
                let primary = involved[0];
                let weights = profiles.map(([evaluator, _]) => evaluator(primary.personality));
                let action_number = this.random.weighted(weights);
                if (action_number >= 0) {
                    this.done.push(code);
                    let reaction_constructor = profiles[action_number][1];
                    return reaction_constructor(involved);
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
    }

    /**
     * One kind of personality reaction: saying something out loud
     */
    export class PersonalityReactionConversation {
        messages: { interlocutor: Ship, message: string }[]
        constructor(messages: { interlocutor: Ship, message: string }[]) {
            this.messages = messages;
        }
    }

    /**
     * Standard reaction pool
     */
    export const BUILTIN_REACTION_POOL: ReactionPool = {
        friendly_fire: [cond_friendly_fire, 1, [
            [traits => 1, ships => new PersonalityReactionConversation([
                { interlocutor: ships[0], message: "Hey !!! Watch where you're shooting !" },
                { interlocutor: ships[1], message: "Sorry mate..." },
            ])]
        ]]
    }

    function cond_friendly_fire(player: Player, battle: Battle | null, ship: Ship | null, event: BaseBattleEvent | null): Ship[] {
        if (battle && ship && event) {
            if (event instanceof DamageEvent && event.ship != ship && event.ship.getPlayer() == player && ship.getPlayer() == player) {
                return [event.ship, ship];
            } else {
                return [];
            }
        } else {
            return [];
        }
    }
}
