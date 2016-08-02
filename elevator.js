{
    init: function(elevators, floors) {
        var floorsWaiting = [];

        // Elevator event listeners
        for (var i = 0; i < elevators.length; i++) {
            var x = function() {
                var elevator = elevators[i];
                elevator.on("idle", function() {
                    console.log(floorsWaiting);
                    if (floorsWaiting.length > 0) {
                        elevator.goToFloor(floorsWaiting.shift());
                    }
                });

                elevator.on("floor_button_pressed", function(floorNum) {
                    elevator.goToFloor(floorNum);
                });
            }();
        }

        // Floor event listeners
        for (var f = 0; f < floors.length; f++) {
            var y = function() {
                var floor = floors[f];
                var floorNum = f;
                floor.on("down_button_pressed", function() {
                    if (floorsWaiting.indexOf(floorNum) === -1) {
                        floorsWaiting.push(floorNum);
                    }
                });

                floor.on("up_button_pressed", function() {
                    if (floorsWaiting.indexOf(floorNum) === -1) {
                        floorsWaiting.push(floorNum);
                    }
                });

            }();
        }

    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}