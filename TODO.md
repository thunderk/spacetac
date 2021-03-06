To-Do-list
==========

Phaser 3 migration
------------------

* Fix valuebar requiring to be in root display list (use tile sprite?)
* Restore unit tests about boundaries (in UITools)

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

* Add factions and reputation
* Allow to cancel secondary missions
* Forbid to end up with more than 5 ships in the fleet because of escorts
* Fix problems when several dialogs are active at the same time
* Add a zoom level, to see the location only
* Restore the progressive text effect
* Improve performance when refreshing (and thus during jumps)

Character sheet
---------------

* Fix action tooltips showing battle information ("not enough power"...)
* Improve attribute tooltips
* Implement sliders for personality traits
* Center the portraits when there are less than 5

Battle
------

* Move animation should face the target (if any) at the end, not the direction
* Improve arena ships layering (sometimes information is displayed behind other sprites)
* In the ship tooltip, show power cost, toggled and overheat states
* Display shield (and its (dis)appearance)
* Display estimated damage in targetting mode
* Add a voluntary retreat option
* Toggle bar/text display in power section of action bar
* Show a cooldown indicator on move action icon, if the simulation would cause the engine to overheat
* Add an hexagonal grid (optional, may be enforced only on mobile) and work in units of this grid
* Add engine trail effect, and sound
* Find incentives to move from starting position (permanent drones or anomalies?)
* Mark targetting in error when target is refused by the action (there is already an arrow for this)
* Allow to undo last moves
* Add a battle log display
* Allow to move targetting indicator with arrow keys
* Add targetting shortcuts for "previous target", "next enemy" and "next ally"
* Area targetting should include the hotkeyed ship at best (apply exclusion and power limit), not necessarily center on it
* Add shortcut to perform only the "move" part of a move+fire simulation
* Add a turn count marker in the ship list
* BattleChecks should be done proactively when all diffs have been simulated by an action, in addition to reactively after applying

Ships models and actions
------------------------

* Fix vigilance action not disabling when reaching the maximum number of triggerings
* Highlight the effects area that will contain the new position when move-targetting
* Add movement attribute (for main engine action, km/power)
* Add damage over time effect (tricky to make intuitive)
* Add actions with cost dependent of distance (like current move actions)
* Add disc targetting (for some jump move actions)
* Add "chain" effects
* Add mines equivalent (drones that apply only at the end)
* RepelEffect should apply on ships in a good order (distance decreasing)
* Add damage on collisions (when two ships are moved to the same place)
* Add hull points to drones and make them take area damage
* Allow to customize effects based on whether a target is enemy, allied or self
* Add a reflect damage effect
* Add untargettable effect (can only be targetted with area effects)
* Add damage modifier (to change the options of incoming damage or outgoing damage)

Artificial Intelligence
-----------------------

* If web worker is not responsive, or produces only errors, it should be disabled for the session
* Prevent infinite loops of toggle/untoggle
* Produce interesting "angle" areas
* Evaluate vigilance actions
* Evaluate the "interest" of an active effect (e.g healing is better when harmed...)
* Evaluators result should be more specific (final state evaluation, diff evaluation, confidence...)
* Use a first batch of producers, and only if no "good" move has been found, go on with some infinite producers
* Abandon fight if the AI judges there is no hope of victory
* Add combination of random small move and actual maneuver, as producer
* Use tree techniques to account for potential future moves
* Prototype of evolving AI

Common UI
---------

* Add a fullscreen incentive at game start
* Fix calling setHoverClick several times on the same button not working as expected
* Fix tooltip remaining when the hovered object is hidden by animations
* If ProgressiveMessage animation performance is bad, show the text directly
* Add caret/focus and configurable background to text input
* Release keybord grabbing when UITextInput is hidden or loses focus
* UI parents should only be containers, not images
* Mobile: think UI layout so that fingers do not block the view (right and left handed)
* Mobile: display tooltips larger and on the side of screen where the finger is not
* Mobile: targetting in two times, using a draggable target indicator

Technical
---------

* Use tk-serializer package (may need to switch to webpack)
* Pause timers when the game is paused (at least animation timers)
* Pack sounds
* Add toggles for shaders, automatically disable them if too slow, and initially disable them on mobile
* Add cache for image texture lookup (getImageInfo)

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
