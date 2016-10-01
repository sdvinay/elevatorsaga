{
    init: function(elevators, floors) {

        // Elevator event listeners and functions
        _.each(elevators, function(elevator, elevatorNum) {
            elevator.debug = function() {
                var debugStr = `Elevator ${elevatorNum} on floor ${elevator.currentFloor()}: \
                        DestQueue = ${elevator.destinationQueue}`;
                console.log(debugStr);
            }

            elevator.call = function(floorNum) {
                if (elevator.destinationQueue.indexOf(floorNum) < 0) {
                    elevator.goToFloor(floorNum);
                }
            }

            elevator.on("floor_button_pressed", function(floorNum) {
                console.log(`Elevator ${elevatorNum}: floor button pressed for ${floorNum}; `);
                elevator.call(floorNum);
                elevator.debug();
            });
        });

        // Floor event listeners
        _.each(floors, function(floor) {
            var floorNum = floor.floorNum();
            var onCallButtonPressed = function(direction) {
                return function() {
                    console.log(`${direction} pressed on floor ${floorNum}; `);
                    elevators[0].call(floorNum);
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