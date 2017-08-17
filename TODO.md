To-Do-list
==========

Menu/settings/saves
-------------------

* Save locally first, make saving to cloud an option
* Allow to delete cloud saves
* Fix cloud save games with "Level 0 - 0 ships"

Map/story
---------

* Add initial character creation
* Add sound effects and more visual effects (jumps...)
* Fix quickly zooming in twice preventing to display some UI parts
* Allow to change/buy ship model
* Add factions and reputation
* Allow to cancel secondary missions
* Forbid to end up with more than 5 ships in the fleet because of escorts
* Fix problems when several dialogs are active at the same time
* Handle case where cargo is full to give a reward (give money ?)

Character sheet
---------------

* Disable interaction during battle (except for loot screen)
* Improve eye-catching for shop and loot section
* Highlight allowed destinations during drag-and-drop, with text hints
* When transferring to another ship, if the item can't be equipped (unmatched requirements), the transfer is cancelled instead of trying cargo
* Effective skill is sometimes not updated when upgrading base skill
* Add merged cargo display for the whole fleet

Battle
------

* Add a voluntary retreat option
* Remove dead ships from ship list and play order
* Add quick animation of playing ship indicator, on ship change
* Display a hint when a move-fire simulation failed (cannot enter exclusion area for example)
* Display effects description instead of attribute changes
* Display radius and power usage hints for area effects on action icon hover + add confirmation ?
* Any displayed info should be based on a ship copy stored in ArenaShip, and in sync with current log index (not the game state ship)
* Add engine trail effect, and sound
* Fix targetting not resetting on current cursor location when using keyboard shortcuts
* Allow to skip animations, and allow no animation mode
* Find incentives to move from starting position (permanent drones or anomalies ?)
* Add a "loot all" button, disable the loot button if there is no loot
* Do not focus on ship while targetting for area effects (dissociate hover and target)
* Repair drone has its activation effect sometimes displayed as permanent effect on ships in the radius
* Merge identical sticky effects
* Allow to undo last moves
* Add a battle log display

Ships models and equipments
---------------------------

* Add permanent effects and actions to ship models
* Add critical hit/miss
* Add damage over time effect (tricky to make intuitive)
* Chance to hit should increase with precision
* Add actions with cost dependent of distance (like current move actions)
* Add "cone" targetting
* Add disc targetting (for some jump move actions)
* Add "chain" effects
* Add mines equivalent (drones that apply only at the end)
* RepelEffect should apply on ships in a good order (distance decreasing)
* Add hull points to drones and make them take area damage
* Quality modifiers should be based on an "quality diff" to reach

Artificial Intelligence
-----------------------

* Use a first batch of producers, and only if no "good" move has been found, go on with some infinite producers
* Evaluate buffs/debuffs
* Abandon fight if the AI judges there is no hope of victory
* Add combination of random small move and actual maneuver, as producer
* New duel page with producers/evaluators tweaking
* Work in a dedicated process (webworker)

Common UI
---------

* Add caret/focus to text input
* Fix hover being stuck when the cursor exits the window, or the item moves or is hidden
* Add a standard confirm dialog
* Mobile: think UI layout so that fingers do not block the view (right and left handed)
* Mobile: display tooltips larger and on the side of screen where the finger is not
* Mobile: targetting in two times, using a draggable target indicator

Technical
---------

* Pack all images in atlases
* Pack sounds

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
* Add ship personality (with icons to identify ?), with reaction dialogs
* New battle internal flow: any game state change should be done through revertable events
* Animated arena background, instead of big picture
* Hide enemy information (shield, hull, weapons), until they are in play, or until a "spy" effect is used
* Invocation/reinforcements (need to up the 10 ships limit)
* Dynamic music composition
