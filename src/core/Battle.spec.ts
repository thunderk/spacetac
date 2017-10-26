module TK.SpaceTac {
    testing("Battle", test => {
        test.case("defines play order by initiative throws", check => {
            var fleet1 = new Fleet();
            var fleet2 = new Fleet();

            var ship1 = new Ship(fleet1, "F1S1");
            ship1.setAttribute("maneuvrability", 2);
            var ship2 = new Ship(fleet1, "F1S2");
            ship2.setAttribute("maneuvrability", 4);
            var ship3 = new Ship(fleet1, "F1S3");
            ship3.setAttribute("maneuvrability", 1);
            var ship4 = new Ship(fleet2, "F2S1");
            ship4.setAttribute("maneuvrability", 8);
            var ship5 = new Ship(fleet2, "F2S2");
            ship5.setAttribute("maneuvrability", 2);

            var battle = new Battle(fleet1, fleet2);
            check.equals(battle.play_order.length, 0);

            var gen = new SkewedRandomGenerator([1.0, 0.1, 1.0, 0.2, 0.6]);
            battle.throwInitiative(gen);

            check.equals(battle.play_order.length, 5);
            check.equals(battle.play_order, [ship1, ship4, ship5, ship3, ship2]);
        });

        test.case("places ships on lines, facing the arena center", check => {
            var fleet1 = new Fleet();
            var fleet2 = new Fleet();

            var ship1 = new Ship(fleet1, "F1S1");
            var ship2 = new Ship(fleet1, "F1S2");
            var ship3 = new Ship(fleet1, "F1S3");
            var ship4 = new Ship(fleet2, "F2S1");
            var ship5 = new Ship(fleet2, "F2S2");

            var battle = new Battle(fleet1, fleet2, 1000, 500);
            battle.placeShips();

            check.nears(ship1.arena_x, 250);
            check.nears(ship1.arena_y, 150);
            check.nears(ship1.arena_angle, 0);

            check.nears(ship2.arena_x, 250);
            check.nears(ship2.arena_y, 250);
            check.nears(ship2.arena_angle, 0);

            check.nears(ship3.arena_x, 250);
            check.nears(ship3.arena_y, 350);
            check.nears(ship3.arena_angle, 0);

            check.nears(ship4.arena_x, 750);
            check.nears(ship4.arena_y, 300);
            check.nears(ship4.arena_angle, Math.PI);

            check.nears(ship5.arena_x, 750);
            check.nears(ship5.arena_y, 200);
            check.nears(ship5.arena_angle, Math.PI);
        });

        test.case("advances to next ship in play order", check => {
            var fleet1 = new Fleet();
            var fleet2 = new Fleet();

            var ship1 = new Ship(fleet1, "ship1");
            var ship2 = new Ship(fleet1, "ship2");
            var ship3 = new Ship(fleet2, "ship3");

            var battle = new Battle(fleet1, fleet2);

            // Check empty play_order case
            check.equals(battle.playing_ship, null);
            battle.advanceToNextShip();
            check.equals(battle.playing_ship, null);

            // Force play order
            iforeach(battle.iships(), ship => ship.setAttribute("maneuvrability", 1));
            var gen = new SkewedRandomGenerator([0.1, 0.2, 0.0]);
            battle.throwInitiative(gen);
            check.equals(battle.playing_ship, null);

            battle.advanceToNextShip();
            check.same(battle.playing_ship, ship2);

            battle.advanceToNextShip();
            check.same(battle.playing_ship, ship1);

            battle.advanceToNextShip();
            check.same(battle.playing_ship, ship3);

            battle.advanceToNextShip();
            check.same(battle.playing_ship, ship2);

            // A dead ship is skipped
            ship1.setDead();
            battle.advanceToNextShip();
            check.same(battle.playing_ship, ship3);

            // Playing ship dies
            ship3.setDead();
            battle.advanceToNextShip();
            check.same(battle.playing_ship, ship2);
        });

        test.case("calls startTurn on ships", check => {
            var fleet1 = new Fleet();
            var fleet2 = new Fleet();

            var ship1 = new Ship(fleet1, "F1S1");
            var ship2 = new Ship(fleet1, "F1S2");
            var ship3 = new Ship(fleet2, "F2S1");

            var battle = new Battle(fleet1, fleet2);

            spyOn(ship1, "startTurn").and.callThrough();
            spyOn(ship2, "startTurn").and.callThrough();
            spyOn(ship3, "startTurn").and.callThrough();

            // Force play order
            var gen = new SkewedRandomGenerator([0.3, 0.2, 0.1]);
            battle.throwInitiative(gen);

            battle.advanceToNextShip();
            expect(ship1.startTurn).toHaveBeenCalledWith();

            battle.advanceToNextShip();
            expect(ship2.startTurn).toHaveBeenCalledWith();

            battle.advanceToNextShip();
            expect(ship3.startTurn).toHaveBeenCalledWith();

            battle.advanceToNextShip();
            expect(ship1.startTurn).toHaveBeenCalledWith();
        });

        test.case("detects victory condition and logs a final EndBattleEvent", check => {
            var fleet1 = new Fleet();
            var fleet2 = new Fleet();

            var ship1 = new Ship(fleet1, "F1S1");
            var ship2 = new Ship(fleet1, "F1S2");
            new Ship(fleet2, "F2S1");

            var battle = new Battle(fleet1, fleet2);

            battle.start();
            check.equals(battle.ended, false);

            ship1.setDead();
            ship2.setDead();

            battle.log.clear();
            battle.advanceToNextShip();

            check.equals(battle.ended, true);
            check.equals(battle.log.events.length, 1);
            check.equals(battle.log.events[0].code, "endbattle");
            check.notequals((<EndBattleEvent>battle.log.events[0]).outcome.winner, null);
            check.same((<EndBattleEvent>battle.log.events[0]).outcome.winner, fleet2);
        });

        test.case("wear down equipment at the end of battle", check => {
            let fleet1 = new Fleet();
            let ship1a = fleet1.addShip();
            let equ1a = TestTools.addWeapon(ship1a);
            let ship1b = fleet1.addShip();
            let equ1b = TestTools.addWeapon(ship1b);
            let fleet2 = new Fleet();
            let ship2a = fleet2.addShip();
            let equ2a = TestTools.addWeapon(ship2a);
            let eng2a = TestTools.addEngine(ship2a, 50);

            let battle = new Battle(fleet1, fleet2);
            battle.start();

            check.equals(equ1a.wear, 0);
            check.equals(equ1b.wear, 0);
            check.equals(equ2a.wear, 0);
            check.equals(eng2a.wear, 0);

            range(8).forEach(() => battle.advanceToNextShip());

            check.equals(equ1a.wear, 0);
            check.equals(equ1b.wear, 0);
            check.equals(equ2a.wear, 0);
            check.equals(eng2a.wear, 0);

            battle.endBattle(null);

            check.equals(equ1a.wear, 3);
            check.equals(equ1b.wear, 3);
            check.equals(equ2a.wear, 3);
            check.equals(eng2a.wear, 3);
        });

        test.case("handles a draw in end battle", check => {
            var fleet1 = new Fleet();
            var fleet2 = new Fleet();

            var ship1 = new Ship(fleet1, "F1S1");
            var ship2 = new Ship(fleet1, "F1S2");
            var ship3 = new Ship(fleet2, "F2S1");

            var battle = new Battle(fleet1, fleet2);

            battle.start();
            check.equals(battle.ended, false);

            ship1.setDead();
            ship2.setDead();
            ship3.setDead();

            battle.log.clear();
            battle.advanceToNextShip();

            check.equals(battle.ended, true);
            check.equals(battle.log.events.length, 1);
            check.equals(battle.log.events[0].code, "endbattle");
            check.equals((<EndBattleEvent>battle.log.events[0]).outcome.winner, null);
        });

        test.case("collects ships present in a circle", check => {
            var fleet1 = new Fleet();
            var ship1 = new Ship(fleet1, "F1S1");
            ship1.setArenaPosition(0, 0);
            var ship2 = new Ship(fleet1, "F1S2");
            ship2.setArenaPosition(5, 8);
            var ship3 = new Ship(fleet1, "F1S3");
            ship3.setArenaPosition(6.5, 9.5);
            var ship4 = new Ship(fleet1, "F1S4");
            ship4.setArenaPosition(12, 12);

            var battle = new Battle(fleet1);
            battle.throwInitiative(new SkewedRandomGenerator([5, 4, 3, 2]));

            var result = battle.collectShipsInCircle(Target.newFromLocation(5, 8), 3);
            check.equals(result, [ship2, ship3]);
        });

        test.case("adds and remove drones", check => {
            let battle = new Battle();
            let ship = new Ship();
            let drone = new Drone(ship);

            check.equals(battle.drones, []);
            check.equals(battle.log.events, []);

            battle.addDrone(drone);

            check.equals(battle.drones, [drone]);
            check.equals(battle.log.events, [new DroneDeployedEvent(drone)]);

            battle.addDrone(drone);

            check.equals(battle.drones, [drone]);
            check.equals(battle.log.events, [new DroneDeployedEvent(drone)]);

            battle.removeDrone(drone);

            check.equals(battle.drones, []);
            check.equals(battle.log.events, [new DroneDeployedEvent(drone), new DroneDestroyedEvent(drone)]);

            battle.removeDrone(drone);

            check.equals(battle.drones, []);
            check.equals(battle.log.events, [new DroneDeployedEvent(drone), new DroneDestroyedEvent(drone)]);

            // check initial log fill
            battle.drones = [drone];
            let expected = new DroneDeployedEvent(drone);
            expected.initial = true;
            check.equals(battle.getBootstrapEvents(), [expected]);
        });

        test.case("checks if a player is able to play", check => {
            let battle = new Battle();
            let player = new Player();

            check.equals(battle.canPlay(player), false);

            let ship = new Ship();
            TestTools.setShipPlaying(battle, ship);

            check.equals(battle.canPlay(player), false);

            ship.fleet.player = player;

            check.equals(battle.canPlay(player), true);
        });

        test.case("gets the number of turns before a specific ship plays", check => {
            let battle = new Battle();
            spyOn(battle, "checkEndBattle").and.returnValue(false);
            battle.play_order = [new Ship(), new Ship(), new Ship()];
            battle.advanceToNextShip();

            check.same(battle.playing_ship, battle.play_order[0]);
            check.equals(battle.getPlayOrder(battle.play_order[0]), 0);
            check.equals(battle.getPlayOrder(battle.play_order[1]), 1);
            check.equals(battle.getPlayOrder(battle.play_order[2]), 2);

            battle.advanceToNextShip();

            check.same(battle.playing_ship, battle.play_order[1]);
            check.equals(battle.getPlayOrder(battle.play_order[0]), 2);
            check.equals(battle.getPlayOrder(battle.play_order[1]), 0);
            check.equals(battle.getPlayOrder(battle.play_order[2]), 1);

            battle.advanceToNextShip();

            check.equals(battle.getPlayOrder(battle.play_order[0]), 1);
            check.equals(battle.getPlayOrder(battle.play_order[1]), 2);
            check.equals(battle.getPlayOrder(battle.play_order[2]), 0);

            battle.advanceToNextShip();

            check.equals(battle.getPlayOrder(battle.play_order[0]), 0);
            check.equals(battle.getPlayOrder(battle.play_order[1]), 1);
            check.equals(battle.getPlayOrder(battle.play_order[2]), 2);
        });

        test.case("lists area effects", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            check.equals(imaterialize(battle.iAreaEffects(100, 50)), []);

            let drone1 = new Drone(ship);
            drone1.x = 120;
            drone1.y = 60;
            drone1.radius = 40;
            drone1.effects = [new DamageEffect(12)];
            battle.addDrone(drone1);
            let drone2 = new Drone(ship);
            drone2.x = 130;
            drone2.y = 70;
            drone2.radius = 20;
            drone2.effects = [new DamageEffect(14)];
            battle.addDrone(drone2);

            check.equals(imaterialize(battle.iAreaEffects(100, 50)), [
                new DamageEffect(12)
            ]);

            let eq1 = ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            eq1.action = new ToggleAction(eq1, 0, 500, [new AttributeEffect("maneuvrability", 1)]);
            (<ToggleAction>eq1.action).activated = true;
            let eq2 = ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            eq2.action = new ToggleAction(eq2, 0, 500, [new AttributeEffect("maneuvrability", 2)]);
            (<ToggleAction>eq2.action).activated = false;
            let eq3 = ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            eq3.action = new ToggleAction(eq3, 0, 100, [new AttributeEffect("maneuvrability", 3)]);
            (<ToggleAction>eq3.action).activated = true;

            check.equals(imaterialize(battle.iAreaEffects(100, 50)), [
                new DamageEffect(12), new AttributeEffect("maneuvrability", 1)
            ]);
        });

        test.case("is serializable", check => {
            let battle = Battle.newQuickRandom();
            battle.ai_playing = true;

            let serializer = new Serializer(TK.SpaceTac);
            let data = serializer.serialize(battle);

            let loaded = serializer.unserialize(data);

            check.equals(loaded.ai_playing, false);
            battle.ai_playing = false;
            check.equals(loaded, battle);
        });
    });
}
