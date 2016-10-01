{
    init: function(elevators, floors) {

        // Elevator event listeners and functions
        _.each(elevators, function(elevator, elevatorNum) {
            elevator.elevatorNum = elevatorNum;

            elevator.debug = function() {
                var debugStr = `Elevator ${elevatorNum} on floor ${elevator.currentFloor()}: \
                        DestQueue = ${elevator.destinationQueue}`;
                console.log(debugStr);
            }

            elevator.on("passing_floor", function(floorNum, direction) {
                if (elevator.hasDestination(floorNum)) {
                    elevator.stripOutDestinations(floorNum);
                    elevator.goToFloor(floorNum, true);
                }
            });

            elevator.hasDestination = (floorNum) => (elevator.destinationQueue.indexOf(floorNum) >= 0);

            elevator.stripOutDestinations = function(floorNum) {
                elevator.destinationQueue = elevator.destinationQueue.filter(f => f != floorNum);
                elevator.checkDestinationQueue();
            }

            elevator.call = function(floorNum) {
                if (! elevator.hasDestination(floorNum)) {
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
                    // If any elevator is already going there, do nothing
                    if (elevators.some((e) => (e.hasDestination(floorNum)))) {
                        return;
                    }

                    // Choose the elevator that currently has the shortest destination queue
                    var e = elevators.reduce((prev, cur) => (cur.destinationQueue.length < prev.destinationQueue.length ? cur : prev), elevators[0]);
                    console.log(`${direction} pressed on floor ${floorNum}; calling elevator ${e.elevatorNum}`);
                    e.call(floorNum);
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