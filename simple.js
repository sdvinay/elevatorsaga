{
    init: function(elevators, floors) {

        // Elevator event listeners and functions
        _.each(elevators, function(elevator, elevatorNum) {
            elevator.debug = function() {
                var debugStr = `Elevator ${elevatorNum} on floor ${elevator.currentFloor()}: \
                        DestQueue = ${elevator.destinationQueue}`;
                console.log(debugStr);
            }

            elevator.dropOffClosestPassenger = function() {
                if (elevator.getPressedFloors().length > 0) {
                    var nextDest = this.findClosestFloor(elevator.currentFloor(), elevator.getPressedFloors());
                    elevator.stripOutDestinations(nextDest);
                    elevator.goToFloor(nextDest, true);
                }
            }

            elevator.stripOutDestinations = function(floorNum) {
                var q = elevator.destinationQueue;
                for (var i = q.length - 1; i >= 0; i--) {
                    if (q[i] === floorNum) {
                        q.splice(i, 1);
                    }
                }
            }

            // returns the closest floor to current, regardless of direction
            elevator.findClosestFloor = function(currentFloor, destinationFloors) {
                if (destinationFloors.length > 0) {
                    var closestFloor = destinationFloors[0];
                    var dist = floors.length + 2;
                    for (var i = 0; i < destinationFloors.length; i++) {
                        var thisDist = Math.abs(destinationFloors[i] - currentFloor);
                        if (thisDist < dist && thisDist > 0) {
                            closestFloor = destinationFloors[i];
                            dist = thisDist;
                        }
                    }
                }
                return closestFloor;
            }
            elevator.call = function(floorNum) {
                if (elevator.destinationQueue.indexOf(floorNum) < 0) {
                    elevator.goToFloor(floorNum);

                }
            }

            elevator.on("floor_button_pressed", function(floorNum) {
                console.log(`Elevator ${elevatorNum}: floor button pressed for ${floorNum}; `);
                elevator.call(floorNum);
                elevator.dropOffClosestPassenger();
                elevator.debug();
            });
        });

        // Floor event listeners
        _.each(floors, function(floor) {
            var floorNum = floor.floorNum();
            var onCallButtonPressed = function(direction) {
                return function() {
                    var elevatorToCall = floorNum % elevators.length;
                    console.log(`${direction} pressed on floor ${floorNum}; calling elevator ${elevatorToCall}`);
                    elevators[elevatorToCall].call(floorNum);
                    elevators[elevatorToCall].debug();

                }
            };
            floor.on("down_button_pressed", onCallButtonPressed('down'));
            floor.on("up_button_pressed", onCallButtonPressed('up'));
        });
    },

    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}