{
    init: function(elevators, floors) {
        var floorsWaiting = {'up' : [], 'down' : []};
        var idleElevators = [];

        // Elevator event listeners
        for (var i = 0; i < elevators.length; i++) {
            var x = function() {
                var elevator = elevators[i];
                var elevatorNum = i;

                elevator.debug = function() {
                    var debugStr = `Elevator ${elevatorNum} on floor ${elevator.currentFloor()}: \
                        DestQueue = ${elevator.destinationQueue}; floorsWaiting = ${floorsWaiting}`;
                    console.log(debugStr);
                }

                elevator.call = function(floorNum) {
                    elevator.goToFloor(floorNum);
                }

                elevator.on("idle", function() {
                    if (floorsWaiting.up.length > 0) {
                        elevator.goToFloor(floorsWaiting.up.shift());
                        elevator.debug();
                    } else {
                        idleElevators.push(elevatorNum);
                    }
                });

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

                // Goes immediately to the closest floor that has a button pressed
                // Does nothing if no buttons are pressed
                elevator.goToClosestPressedFloor = function() {
                    var floors = elevator.getPressedFloors();
                    if (floors.length > 0) {
                        var closestFloor = elevator.findClosestFloor(elevator.currentFloor(), floors);
                        console.log(`Elevator ${elevatorNum}:  Currently on floor ${elevator.currentFloor()}\
                            pressedFloors = ${floors}. Headed to floor ${closestFloor} `);
                        elevator.goToFloor(closestFloor, true);
                    }
                }

                elevator.on("floor_button_pressed", function(floorNum) {
                    console.log(`Elevator ${elevatorNum}: floor button pressed for ${floorNum}; `);
                    elevator.goToClosestPressedFloor();
                });

                elevator.on("stopped_at_floor", function(floorNum) {
                    if (floorsWaiting.up.indexOf(floorNum) > -1) {
                        floorsWaiting.up.splice(floorsWaiting.up.indexOf(floorNum), 1);
                    }
                    elevator.goToClosestPressedFloor();
                    elevator.debug();
                })
            }();
        }

        // Floor event listeners
        for (var f = 0; f < floors.length; f++) {
            var y = function() {
                var floor = floors[f];
                var floorNum = f;
                var onButtonPressed = function(direction) {
                    return function() {
                        if (floorsWaiting.up.indexOf(floorNum) === -1) {
                            floorsWaiting.up.push(floorNum);
                        }
                        console.log(`${direction} pressed on floor ${floorNum}; floorsWaiting = ${JSON.stringify(floorsWaiting)}`)
                        if (idleElevators.length > 0) {
                            elevators[idleElevators.shift()].call(floorNum);
                        }

                    }
                };
                floor.on("down_button_pressed", onButtonPressed('down'));
                floor.on("up_button_pressed", onButtonPressed('up'));
            }();
        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}