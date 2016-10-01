{
    init: function(elevators, floors) {

        // Elevator event listeners and functions
        _.each(elevators, function(elevator, elevatorNum) {
            elevator.debug = function() {
                var debugStr = `Elevator ${elevatorNum} on floor ${elevator.currentFloor()}: \
                        DestQueue = ${elevator.destinationQueue}`;
                console.log(debugStr);
            }

            elevator.on("passing_floor", function(floorNum, direction) {
                if (elevator.destinationQueue.indexOf(floorNum) > -1) {
                    elevator.stripOutDestinations(floorNum);
                    elevator.goToFloor(floorNum, true);
                }
            });

            elevator.stripOutDestinations = function(floorNum) {
                elevator.destinationQueue = elevator.destinationQueue.filter(f => f != floorNum);
                elevator.checkDestinationQueue();
            }

            elevator.call = function(floorNum) {
                if (elevator.destinationQueue.indexOf(floorNum) < 0) {
                    elevator.goToFloor(floorNum);
                }
                elevator.debug();
            }

            elevator.on("floor_button_pressed", function(floorNum) {
                console.log(`Elevator ${elevatorNum}: floor button pressed for ${floorNum}; `);
                elevator.call(floorNum);
            });
        });

        // Floor event listeners
        _.each(floors, function(floor) {
            var floorNum = floor.floorNum();
            var onCallButtonPressed = function(direction) {
                return function() {
                    if (elevators.some(function(e) {
                            return (e.destinationQueue.indexOf(floorNum) >= 0)
                        })) {
                        return;
                    }
                    var elevatorToCall = 0;
                    var minQueue = elevators[0].destinationQueue.length;
                    for (var i = 1; i < elevators.length; i++) {
                        if (elevators[i].destinationQueue.length < minQueue) {
                            elevatorToCall = i;
                            minQueue = elevators[i].destinationQueue.length;
                        }
                    }
                    console.log(`${direction} pressed on floor ${floorNum}; calling elevator ${elevatorToCall}`);
                    elevators[elevatorToCall].call(floorNum);
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