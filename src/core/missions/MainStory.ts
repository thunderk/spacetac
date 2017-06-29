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

            // Get in touch with our contact
            let contact_location = randomLocation(random, [start_location.star], [start_location]);
            let contact_character = new Ship(null, "Osten-37", ShipModel.getRandomModel(1, random));
            contact_character.fleet.setLocation(contact_location, true);
            this.addPart(new MissionPartGoTo(this, contact_location, "Find your contact"));
            let dialog = this.addPart(new MissionPartDialog(this, [contact_character], "Speak with your contact"));
            dialog.addPiece(contact_character, "Finally, you came!");
            dialog.addPiece(contact_character, "Sorry for not broadcasting my position. As you may have encountered, this star system is not safe anymore.");
            dialog.addPiece(null, "Nothing we could not handle, we just hope the other teams have not run across more trouble.");
            dialog.addPiece(contact_character, "I do not even know if the other contacts made it to their rendezvous point. Jumping between systems has become quite a hassle around here.");
            dialog.addPiece(null, "And we still do not know why those rogue fleets are trying to lockdown the whole galaxy? Did you have some interaction with them?");
            dialog.addPiece(contact_character, "Well, they tend to shoot you on sight if you go near a location they defend. Do not know if that qualifies as interaction though...");
            dialog.addPiece(null, "So where do we go from here? In your last message, you told us of a resistance group growing.");
            dialog.addPiece(contact_character, "Yes, some merchants and miners have rallied behind a retired TSF general, but I lost contact with them weeks ago.");
            dialog.addPiece(contact_character, "We may go to their last known location, but first I want you to see something in a nearby system.");
            dialog.addPiece(null, "Ok, let's go...");
        }
    }
}
