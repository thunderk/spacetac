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

## Attributes

* **Initiative** - Ability to play before other ships in the play order
* **Hull** - Amout of damage that a ship can receive before having to shut down all its systems
* **Shield** - Amount of damage that the shield equipments may absorb to protect the Hull
* **Power** - Available action points (some actions require more power than others)
* **Power recovery** - Power generated at the end of a ship's turn

## Capabilities

* **Materials** - Usage of physical materials such as bullets, shells...
* **Electronics** - Components of computers and communication
* **Energy** - Raw energy manipulation
* **Human** - Management of a human team and resources
* **Gravity** - Interaction with gravitational forces
* **Time** - Manipulation of time
