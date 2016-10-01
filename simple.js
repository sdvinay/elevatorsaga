{
    init: function(elevators, floors) {

        // Elevator event listeners; attaching the same code/listeners to each elevator here:
        for (var i = 0; i < elevators.length; i++) {
            var x = function() { // create a closure for local state per-elevator
                var elevator = elevators[i];
                var elevatorNum = i;

                elevator.debug = function() {
                    var debugStr = `Elevator ${elevatorNum} on floor ${elevator.currentFloor()}: \
                        DestQueue = ${elevator.destinationQueue}; ` 
                    console.log(debugStr);
                }

                elevator.call = function(floorNum) {
                    elevator.goToFloor(floorNum);
                }

                elevator.on("floor_button_pressed", function(floorNum) {
                    console.log(`Elevator ${elevatorNum}: floor button pressed for ${floorNum}; `);
					elevator.debug();
					elevator.goToFloor(floorNum);
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
                        console.log(`${direction} pressed on floor ${floorNum}; `);
						elevators[0].goToFloor(floorNum);
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
