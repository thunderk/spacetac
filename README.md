# SpaceTac, a space tactical RPG

## Abilities

There are six ship abilities that can be levelled up :

- Material
- Energy
- Electronics
- Human
- Time
- Gravity

## Equipment

Equipments can be assigned to slots on a ship.

Slots are categorized by type:

- Armor (to fortify the hull)
- Shield (to avoid damages)
- Engine (to move and evade)
- Power (to recover action points)
- Weapon (to do damages)
- Utility (for anything else)

## Loot

This section describes how random equipment is generated for looting.

Equipment generation is based on templates. A template defines:

- Type of slot this equipment fit in (weapon, shield, armor...)
- Base name (e.g. Terminator Missile)
- Acceptable range for each ability's requirement (e.g. material/1/3, gravity/3/8)
- Targetting flags (self, allied, enemy, space)
- Range for distance to target
- Range for effect area's radius
- Range for duration
- List of effects, with efficacity range
- Action Points usage range
- Level requirements range

Here is an example of template:

- slot: weapon
- name: Concussion Missile Salvo
- material: 1/3
- energy: 2/5
- time: 1/1
- target: enemy, space
- range: 50/80
- effect radius: 2/5
- duration: 1/1
- damage shield: 50/80
- damage hull: 20/60
- action points: 2/4
- level: 3/6

The weaker weapon this template will generate, will be based on lower value for all ranges:

- material: 1
- energy: 2
- time: 1
- range: 50
- effect radius: 2
- duration: 1
- damage shield: 50
- damage hull: 20
- action points: 2
- level: 3

Conversely, the stronger weapon will be based on higher range values.
