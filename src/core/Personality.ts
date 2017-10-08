module TK.SpaceTac {
    /**
     * List of personality traits (may be used with "keyof").
     */
    export interface IPersonalityTraits {
        aggressive: number
        funny: number
        heroic: number
        optimistic: number
    }

    /**
     * A personality is a set of traits that defines how a character thinks and behaves
     * 
     * Each trait is a number between -1 and 1
     * 
     * In the game, a personality represents an artificial intelligence, and is transferable
     * from one ship (body) to another. This is why a personality has a name
     */
    export class Personality implements IPersonalityTraits {
        // Name of this personality
        name = ""

        // Aggressive 1 / Poised -1
        aggressive = 0

        // Funny 1 / Serious -1
        funny = 0

        // Heroic 1 / Coward -1
        heroic = 0

        // Optimistic 1 / Pessimistic -1
        optimistic = 0
    }
}
