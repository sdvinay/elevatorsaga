{
    init: function(elevators, floors) {
        // Global state
        var floorsWaiting = { // floors that have passengers waiting for elevators, by direction they want to go
            'up': [],
            'down': []
        };
        var idleElevators = []; // elevators sitting idle, available to be called

        // Elevator event listeners; attaching the same code/listeners to each elevator here:
        for (var i = 0; i < elevators.length; i++) {
            var x = function() { // create a closure for local state per-elevator
                var elevator = elevators[i];
                var elevatorNum = i;

                elevator.debug = function() {
                    var debugStr = `Elevator ${elevatorNum} on floor ${elevator.currentFloor()}: \
                        DestQueue = ${elevator.destinationQueue}; \ 
                        floorsWaiting = ${JSON.stringify(floorsWaiting)}`;
                    console.log(debugStr);
                }

                elevator.call = function(floorNum) {
                    elevator.goToFloor(floorNum);
                }

                elevator.on("idle", function() {
                    // Remove ourselves from the list of idle elvators
                    if (idleElevators.indexOf(elevatorNum) > -1) {
                        idleElevators.splice(idleElevators.indexOf(elevatorNum), 1);
                    }

                    // Go to a waiting floor, if one exists
                    // We first check for floors with passengers going down (e.g. not floor zero)
                    // If we did the reverse, we'd almost always go to floor zero, and starve the other
                    // floors.  If we pick from the floors going down, those passengers are almost always
                    // going to zero, so there is no danger of starving zero. 
                    if (floorsWaiting.down.length > 0) {
                        elevator.goToFloor(floorsWaiting.down.shift());
                        elevator.debug();
                    } else if (floorsWaiting.up.length > 0) {
                        elevator.goToFloor(floorsWaiting.up.shift());
                        elevator.debug();
                    } else {
                        idleElevators.push(elevatorNum);
                    }
                });

                // returns the closest floor to current, regardless of direction
                elevator.findClosestFloor = function(currentFloor, floors) {
                    if (floors.length > 0) {
                        var closestFloor = floors[0];
                        var dist = Math.abs(currentFloor - floors[0]);
                        for (var i = 1; i < floors.length; i++) {
                            var thisDist = Math.abs(currentFloor - floors[i]);
                            if (thisDist < dist) {
                                closestFloor = floors[i];
                                dist = thisDist;
                            }
                        }
                    }
                    return closestFloor;
                }

                // Goes immediately to the closest destination floor of the elevator's passengers
                // Does nothing if no destination buttons are pressed
                elevator.goToClosestPressedDestination = function() {
                    var floors = elevator.getPressedFloors();
                    if (floors.length > 0) {
                        var closestFloor = elevator.findClosestFloor(elevator.currentFloor(), floors);
                        console.log(`Elevator ${elevatorNum}:  Currently on floor ${elevator.currentFloor()}\
                            pressedFloors = ${floors}. Headed to floor ${closestFloor} `);
                        elevator.goToFloor(closestFloor, true);
                    }
                }

                // when a destination button is pressed, go to the *closest* pressed destination
                // if we were already going to a closer floor, this is effectively a no-op
                // but if the button was pressed for a closer floor, now we'll go there first
                elevator.on("floor_button_pressed", function(floorNum) {
                    console.log(`Elevator ${elevatorNum}: floor button pressed for ${floorNum}; `);
                    elevator.goToClosestPressedDestination();
                });

                elevator.on("stopped_at_floor", function(floorNum) {
                    // clear the call press button only for the direction(s) we have indicated
                    // (because only those passengers will get on board)
                    if (elevator.goingUpIndicator() && (floorsWaiting.up.indexOf(floorNum) > -1)) {
                        floorsWaiting.up.splice(floorsWaiting.up.indexOf(floorNum), 1);
                    }
                    if (elevator.goingDownIndicator() && (floorsWaiting.down.indexOf(floorNum) > -1)) {
                        floorsWaiting.down.splice(floorsWaiting.down.indexOf(floorNum), 1);
                    }

                    // Always attempt to go to the closest floor requested by a passenger
                    // If there are none, this will no-op and the elevator will act on its destination queue
                    // (if any) and then go idle.
                    elevator.goToClosestPressedDestination();
                    elevator.debug();
                });

                // if we're passing a floor, and there are passengers looking to get on in the same direction,
                // let's stop to pick them up
                elevator.on("passing_floor", function(floorNum, direction) {
                    var direction = elevator.destinationDirection();
                    if (floorsWaiting[direction].indexOf(floorNum) > -1) {
                        elevator.goToFloor(floorNum, true);
                    }
                });
            }();
        }

        // Floor event listeners
        for (var f = 0; f < floors.length; f++) {
            var y = function() {
                var floor = floors[f];
                var floorNum = f;
                var onCallButtonPressed = function(direction) {
                    return function() {
                        if (floorsWaiting[direction].indexOf(floorNum) === -1) {
                            floorsWaiting[direction].push(floorNum);
                        }
                        console.log(`${direction} pressed on floor ${floorNum}; \
                            floorsWaiting = ${JSON.stringify(floorsWaiting)}`)
                        if (idleElevators.length > 0) {
                            elevators[idleElevators.shift()].call(floorNum);
                        }

                    }
                };
                floor.on("down_button_pressed", onCallButtonPressed('down'));
                floor.on("up_button_pressed", onCallButtonPressed('up'));
            }();
        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}