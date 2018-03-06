To-Do-list
==========

Menu/settings/saves
-------------------

* Save locally first, make saving to cloud an option
* Allow to delete cloud saves
* Fix cloud save games with "Level 0 - 0 ships"
* Store the game version in saves (for future work on compatibility)
* Add simple options to quick battle (fleet level / difficulty)
* Add optional fleet customization (both player and enemy) to quick battle

Map/story
---------

* Add sound effects and more visual effects (jumps...)
* Add factions and reputation
* Allow to cancel secondary missions
* Forbid to end up with more than 5 ships in the fleet because of escorts
* Fix problems when several dialogs are active at the same time
* Add a zoom level, to see the location only

Character sheet
---------------

* Replace the close icon by a validation icon in creation view
* Allow to change/buy ship model
* Allow to rename a personality (in creation view only)
* Add personality indicators (editable in creation view)

Battle
------

* Fix stats only filling for one fleet
* Add a voluntary retreat option
* Toggle bar/text display in power section of action bar
* Show a cooldown indicator on move action icon, if the simulation would cause the engine to overheat
* Add engine trail effect, and sound
* Allow to skip animations, and allow no animation mode
* Find incentives to move from starting position (permanent drones or anomalies?)
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

Ships models and actions
------------------------

* Add critical hit/miss (or indicate lucky/unlucky throws)
* Add damage over time effect (tricky to make intuitive)
* Add actions with cost dependent of distance (like current move actions)
* Add disc targetting (for some jump move actions)
* Add "chain" effects
* Add mines equivalent (drones that apply only at the end)
* RepelEffect should apply on ships in a good order (distance decreasing)
* Add hull points to drones and make them take area damage
* Add a target type filter (all, enemies, allies, self or not)
* Shields should be able to absorb (some type of) damage, even with 1 remaining
* Add a balance testing page, using AI battles with or without an upgrade, to help in balancing

Artificial Intelligence
-----------------------

* If web worker is not responsive, or produces only errors, it should be disabled for the session
* Produce interesting "angle" areas
* Evaluate active effects
* Account for luck
* Evaluators result should be more specific (final state evaluation, diff evaluation, confidence...)
* Use a first batch of producers, and only if no "good" move has been found, go on with some infinite producers
* Abandon fight if the AI judges there is no hope of victory
* Add combination of random small move and actual maneuver, as producer
* New duel page with producers/evaluators tweaking
* Use tree techniques to account for potential future moves
* Prototype of evolving AI

Common UI
---------

* Fix calling setHoverClick several times on the same button not working as expected
* Fix tooltip remaining when the hovered object is hidden by animations
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
* Puzzle mode
* Formation or deployment phase
* Add ship personality (with icons to identify?), with reaction dialogs
* Hide enemy information (shield, hull, weapons), until they are in play, or until a "spy" effect is used
* Invocation/reinforcements (need to up the 10 ships limit)
* Dynamic music composition
