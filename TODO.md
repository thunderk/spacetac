To-Do-list
==========

Menu/settings/saves
-------------------

* Save locally first, make saving to cloud an option
* Allow to delete cloud saves
* Fix cloud save games with "Level 0 - 0 ships"
* Store the game version in saves (for future work on compatibility)

Map/story
---------

* Add sound effects and more visual effects (jumps...)
* Add factions and reputation
* Allow to cancel secondary missions
* Forbid to end up with more than 5 ships in the fleet because of escorts
* Fix problems when several dialogs are active at the same time
* Handle case where cargo is full to give a reward (give money?)

Character sheet
---------------

* Improve eye-catching for shop and loot section
* Highlight allowed destinations during drag-and-drop
* Effective skill is sometimes not updated when upgrading base skill
* Add merged cargo display for the whole fleet
* Allow to change/buy ship model
* Add personality indicators (editable in creation view)
* Allow to cancel spent skill points (and confirm when closing the sheet)
* Add filters and sort options for cargo and shop
* Display level and slot type on equipment
* Fixed tooltips not being visible in loot mode (at the end of battle)

Battle
------

* Add a voluntary retreat option
* Add scroll buttons when there are too many actions
* Toggle bar/text display in power section of action bar
* Display effects description instead of attribute changes
* Show a cooldown indicator on move action icon, if the simulation would cause the engine to overheat
* Add engine trail effect, and sound
* Allow to skip animations, and allow no animation mode
* Find incentives to move from starting position (permanent drones or anomalies?)
* Add a "loot all" button (on the character sheet or outcome dialog?)
* Mark targetting in error when target is refused by the action (there is already an arrow for this)
* Allow to undo last moves
* Add a battle log display
* Allow to move targetting indicator with arrow keys
* Add targetting shortcuts for "previous target", "next enemy" and "next ally"
* Area targetting should include the hotkeyed ship at best (apply exclusion and power limit), not necessarily center on it
* Add shortcut to perform only the "move" part of a move+fire simulation
* Fix delay of shield/hull impact effects (should depend on weapon animation, and ship location)
* Add a turn count marker in the ship list
* BattleChecks should be done proactively when all diffs have been simulated by an action, in addition to reactively after applying

Ships models and equipments
---------------------------

* Add permanent effects and actions to ship models
* Add critical hit/miss
* Add damage over time effect (tricky to make intuitive)
* Chance to hit should increase with precision
* Add actions with cost dependent of distance (like current move actions)
* Add disc targetting (for some jump move actions)
* Add "chain" effects
* Add mines equivalent (drones that apply only at the end)
* RepelEffect should apply on ships in a good order (distance decreasing)
* Add hull points to drones and make them take area damage
* Quality modifiers should be based on an "quality difference" to reach

Artificial Intelligence
-----------------------

* Evaluate diffs instead of effects
* Use a first batch of producers, and only if no "good" move has been found, go on with some infinite producers
* Abandon fight if the AI judges there is no hope of victory
* Add combination of random small move and actual maneuver, as producer
* New duel page with producers/evaluators tweaking
* Work in a dedicated process (webworker)

Common UI
---------

* UIBuilder.button should be able to handle hover and pushed images
* If ProgressiveMessage animation performance is bad, show the text directly
* Add caret/focus to text input
* Mobile: think UI layout so that fingers do not block the view (right and left handed)
* Mobile: display tooltips larger and on the side of screen where the finger is not
* Mobile: targetting in two times, using a draggable target indicator

Technical
---------

* Pack all images in atlases, and split them by stage
* Pack sounds
* Add toggles for shaders, automatically disable them if too slow, and initially disable them on mobile
* Replace jasmine with mocha+chai

Network
-------

* Handle cancel button in invitation dialog
* Close connection on view exit
* Add timeouts to read operations
* Display connection status

Postponed
---------

* Tutorial
* Secondary story arcs
* Replays
* Multiplayer/co-op
* Formation or deployment phase
* Add ship personality (with icons to identify?), with reaction dialogs
* Hide enemy information (shield, hull, weapons), until they are in play, or until a "spy" effect is used
* Invocation/reinforcements (need to up the 10 ships limit)
* Dynamic music composition
