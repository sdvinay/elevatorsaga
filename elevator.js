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

                elevator.on("idle", function() {
                    if (floorsWaiting.up.length > 0) {
                        elevator.goToFloor(floorsWaiting.up.shift());
                        elevator.debug();
                    } else {
                        idleElevators.push(elevatorNum);
                    }
                });

                elevator.on("floor_button_pressed", function(floorNum) {
                    elevator.goToFloor(floorNum);
                });

                elevator.on("stopped_at_floor", function(floorNum) {
                    if (floorsWaiting.up.indexOf(floorNum) > -1) {
                        floorsWaiting.up.splice(floorsWaiting.up.indexOf(floorNum), 1);
                    }
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
                            elevators[idleElevators.shift()].goToFloor(floorNum);
                        }

                    }
                };
                floor.on("down_button_pressed", onButtonPressed('down'));
                floor.on("up_button_pressed"  , onButtonPressed('up'  ));
            }();
        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}