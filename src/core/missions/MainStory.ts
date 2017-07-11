/// <reference path="Mission.ts" />

module TS.SpaceTac {
    function randomLocation(random: RandomGenerator, stars: Star[], excludes: StarLocation[] = []) {
        let star = stars.length == 1 ? stars[0] : random.choice(stars);
        return RandomGenerator.global.choice(star.locations.filter(loc => !contains(excludes, loc)));
    }

    /**
     * Main story arc
     */
    export class MainStory extends Mission {
        constructor(universe: Universe, fleet: Fleet) {
            super(universe, fleet, true);

            let random = RandomGenerator.global;
            let start_location = nn(fleet.location);

            // Arrival
            let conversation = this.addPart(new MissionPartConversation(this, [], "Travel to Terranax galaxy"));
            conversation.addPiece(null, "Wow ! From what my sensors tell me, there is not much activity around here.");
            conversation.addPiece(null, "I remember the last time I came in this galaxy, you needed to be aware of collisions at all time, so crowded it was.");
            conversation.addPiece(null, "Well...I did not pick a signal from our contact yet. We should be looking for her in this system.");

            // Get in touch with our contact
            let contact_location = randomLocation(random, [start_location.star], [start_location]);
            let contact_character = new Ship(null, "Osten-37", ShipModel.getRandomModel(1, random));
            contact_character.fleet.setLocation(contact_location, true);
            this.addPart(new MissionPartGoTo(this, contact_location, `Find your contact in ${contact_location.star.name}`, MissionPartDestinationHint.SYSTEM));
            conversation = this.addPart(new MissionPartConversation(this, [contact_character], "Speak with your contact"));
            conversation.addPiece(contact_character, "Finally, you came!");
            conversation.addPiece(contact_character, "Sorry for not broadcasting my position. As you may have encountered, this star system is not safe anymore.");
            conversation.addPiece(null, "Nothing we could not handle, we just hope the other teams have not run across more trouble.");
            conversation.addPiece(contact_character, "I do not even know if the other contacts made it to their rendezvous point. Jumping between systems has become quite a hassle around here.");
            conversation.addPiece(null, "And we still do not know why those rogue fleets are trying to lockdown the whole galaxy? Did you have some interaction with them?");
            conversation.addPiece(contact_character, "Well, they tend to shoot you on sight if you go near a location they defend. Do not know if that qualifies as interaction though...");
            conversation.addPiece(null, "So where do we go from here? In your last message, you told us of a resistance group growing.");
            conversation.addPiece(contact_character, "Yes, some merchants and miners have rallied behind a retired TSF general, but I lost contact with them weeks ago.");
            conversation.addPiece(contact_character, "We may go to their last known location, but first I want you to see something in a nearby system.");
            conversation.addPiece(null, "Ok, let's go...");

            // Go take a look at the graveyard
            let nearby_systems = nna(start_location.star.getLinks().map(link => link.getPeer(contact_location.star)));
            let graveyard_location = randomLocation(random, [minBy(nearby_systems, system => system.level)]);
            this.addPart(new MissionPartEscort(this, graveyard_location, contact_character, `Go with ${contact_character.name} in ${graveyard_location.star.name} system`));
        }
    }
}
