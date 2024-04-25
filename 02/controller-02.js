const Controller = function () {
    // Basic Movements
    this.left  = new Controller.ButtonInput();
    this.right = new Controller.ButtonInput();
    this.up    = new Controller.ButtonInput();
    this.down  = new Controller.ButtonInput();

    this.jump  = new Controller.ButtonInput();

    // Combat
    this.shoot = new Controller.ButtonInput();

    // Miscellaneous
    this.hold  = new Controller.ButtonInput();

    this.keyDownUp = function (type, key_code) {
        var down = (type == "keydown") ? true : false;

        switch (key_code) {
            // Basic Movements
            case 37: this.left.getInput(down);  break;
            case 38: this.up.getInput(down);    break;
            case 39: this.right.getInput(down); break;
            case 40: this.down.getInput(down);  break;

            case 90: this.jump.getInput(down);  break;

            // Combat
            case 88: this.shoot.getInput(down); break;

            // Miscellaneous
            case 16: this.hold.getInput(down);  break;
        }
    };
};

Controller.prototype = { constructor: Controller };

Controller.ButtonInput = function () {
    this.active = this.down = false;
}

Controller.ButtonInput.prototype = {
    constructor: Controller.ButtonInput,

    getInput: function (down) {
        if (this.down != down) this.active = down;
        this.down = down;
    }
};
