# SpaceTac, a space tactical RPG

[![Build Status](https://travis-ci.org/thunderk/spacetac.svg?branch=master)](https://travis-ci.org/thunderk/spacetac)
[![Code Coverage](https://codecov.io/gh/thunderk/spacetac/branch/master/graph/badge.svg)](https://codecov.io/gh/thunderk/spacetac)

**Disclaimer: this is a work-in-progress technology preview**

[![Play Online](https://thunderk.net/spacetac/play.svg)](https://thunderk.net/spacetac/)

*Play directly in your browser, no download or dependency required.*

## How to develop

If you want to build on your computer, clone the repository, then run:

    npm install    # Install dependencies
    npm test       # Run unit tests
    rpm start      # Start development server, and open game in web browser

After making changes to sources, you need to recompile:

    npm run build

## Ships

### Level and experience

A ship gains experience during battles. When reaching a certain amount of experience points,
a ship will automatically level up (which is, gain 1 level).

A ship starts at level 1. There is no upper limit to level value (except 99, for display sake,
but it may not be reached in a classic campaign).

### In-combat values (HSP)

In combat, a ship's vitals are represented by the HSP system (Hull-Shield-Power):

* **Hull** - Amount of damage that a ship can sustain before having to engage emergency stasis
* **Shield** - Amount of damage that the shield equipments may absorb to protect the Hull
* **Power** - Available action points (some actions require more power than others)

These values will be changed by various effects (usage of equipments, sustained damage...).

Once the Hull of a ship is fully damaged (Hull=0), the ship engages its ESP, or Emergency
Statis Protocol. This protocol activates a statis field that protects the ship for the
remaining of the battle, preventing any further damage, but rendering it fully inoperent.
For battle purpose, the ship is to be considered "dead".

### Attributes

Attributes represent a ship's ability to use its HSP system:

* **Initiative** - Ability to play before other ships in the play order
* **Hull capacity** - Maximal Hull value (when the battle starts)
* **Shield capacity** - Maximal Shield value (when the battle starts)
* **Power capacity** - Maximal Power value
* **Initial power** - Power immediately available at the start of battle
* **Power recovery** - Power generated at the end of a ship's turn

These attributes are the sum of all currently applied effects (being permanent by an equipped item,
or a temporary effect caused by a weapon or a drone).

For example, a ship that equips a power generator with "power recovery +3", but has a sticky effect
of "power recovery -1" from a previous weapon hit, will have an effective power recovery of 2.

### Skills

Skills represent a ship's ability to use equipments:

* **Materials** - Usage of physical materials such as bullets, shells...
* **Electronics** - Components of computers and communication
* **Energy** - Raw energy manipulation
* **Human** - Management of a human team and resources
* **Gravity** - Interaction with gravitational forces
* **Time** - Manipulation of time

Each equipment has minimal skill requirements to be used. For example, a weapon may require "materials >= 2"
and "energy >= 3" to be equipped. A ship that does not meet these requirements will not be able to use 
the equipment.

Skills are defined by the player, using points given while leveling up.
As for attributes, skill values may also be altered by equipments.

If an equipped item has a requirement of "time skill >= 2", that the ship has "time skill" of exactly 2, and 
that a temporary effect of "time skill -1" is active, the requirement is no longer fulfilled and the equipped 
item is then temporarily disabled (no more effects and cannot be used), until the "time skill -1" effect is lifted.

## Drones

Drones are static objects, deployed by ships, that apply effects in a circular zone around themselves.
 
Drone effects are applied :

* On all ships in the zone at the time the drone is deployed
* On any ship entering the zone
* On any ship inside the zone at the start and end of its turn (there and staying there)

Drones are fully autonomous, and once deployed, are not controlled by their owner ship.

They are small and cannot be the direct target of weapons. They are not affected by area effects,
except for area damage and area effects specifically designed for drones.

A drone lasts for a given number of turns, counting down each time its owner's turn starts. 
When reaching the number of turns, the drone is destroyed (before the owner's turn is started).
For example, a drone with 1-turn duration will destroy just before the next turn of its owner.
