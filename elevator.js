{
    init: function(elevators, floors) {
        var floorsWaiting = [];
        for (var i = 0; i < elevators.length; i++) {
            var x = function() {
                var elevator = elevators[i];
                elevator.on("idle", function() {
                    if (floorsWaiting.length > 0) {
                        elevator.goToFloor(floorsWaiting.pop());
                    }
                });

                elevator.on("floor_button_pressed", function(floorNum) {
                    elevator.goToFloor(floorNum);
                });
            }();
        }
        for (var f = 0; f < floors.length; f++) {
            var y = function() {
                var floor = floors[f];
                var floorNum = f;
                floor.on("down_button_pressed", function() {
                    floorsWaiting.push(floorNum);
                });

            }();
        }

    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}