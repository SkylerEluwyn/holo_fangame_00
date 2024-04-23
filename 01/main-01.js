window.addEventListener("load", function (event) {
    "use strict";
    //// CONSTANTS ////
    const ZONE_PREFIX = "01/zone";
    const ZONE_SUFFIX = ".json";

    /////////////////
    //// CLASSES ////
    /////////////////
    const AssetsManager = function () {
        this.tile_set_image = undefined;
    };

    AssetsManager.prototype = {
        constructor: Game.AssetsManager,

        requestJSON: function (url, callback) {
            let request = new XMLHttpRequest();

            request.addEventListener("load", function (event) {
                callback(JSON.parse(this.responseText));
            }, {once: true });

            request.open("GET", url);
            request.send();
        },

        requestImage: function (url, callback) {
            let image = new Image();

            image.addEventListener("load", function (event) {
                callback(image);
            }, {once: true});

            image.src = url;
        },
    };

    ///////////////////
    //// FUNCTIONS ////
    ///////////////////
    var keyDownUp = function (event) {
        controller.keyDownUp(event.type, event.keyCode);
        // console.log(event);
    };

    var resize = function (event) {
        display.resize(document.documentElement.clientWidth - 32, document.documentElement.clientHeight - 32, game.world.height / game.world.width);
        display.render();
    }

    var render = function () {
        display.drawMap(assets_manager.tile_set_image, game.world.tile_set.columns, game.world.map, game.world.columns, game.world.tile_set.tile_size);

        let frame = game.world.tile_set.frames[game.world.player.frame_value];

        display.drawObject(assets_manager.tile_set_image, frame.x, frame.y, game.world.player.x + Math.floor(game.world.player.width * 0.5 - frame.width * 0.5) + frame.offset_x, game.world.player.y+ frame.offset_y, frame.width, frame.height);
        
        display.render();
    }

    var update = function () {
        // Basic Movements
        if (controller.left.active)  { game.world.player.moveLeft(); };  // Left Movement
        if (controller.right.active) { game.world.player.moveRight(); }; // Right Movement
        if (controller.up.active)    {
            game.world.player.upAction();                                 // Face up if the Up key is held down
        } else {
            game.world.player.direction_y = 0;                            // Face forward if the Up key is not held down
        };
        if (!controller.down.active) {                                    // Check if the Down key is not held down
            if (controller.jump.active)  {                                // Perform a jump
                game.world.player.jump();
                controller.jump.active = false;
            }
        };
        
        // Combat
        // if (controller.shoot.active) {};

        game.update();
    }
    /////////////////
    //// OBJECTS ////
    /////////////////
    var assets_manager = new AssetsManager();
    var controller     = new Controller();
    var display        = new Display(document.querySelector("canvas"));
    var game           = new Game();
    var engine         = new Engine(1000 / 60, render, update);

    ////////////////////
    //// INITIALIZE ////
    ////////////////////
    display.buffer.canvas.height = game.world.height;
    display.buffer.canvas.width  = game.world.width;
    display.buffer.imageSmoothingEnabled = false;

    assets_manager.requestJSON(ZONE_PREFIX + game.world.zone_id + ZONE_SUFFIX, (zone) => {
       game.world.setup(zone);
       
       assets_manager.requestImage("sprites-01.png", (image) => {
        assets_manager.tile_set_image = image;

        resize();
        engine.start(); 
       });
    });

    window.addEventListener("keydown", keyDownUp);
    window.addEventListener("keyup", keyDownUp);
    window.addEventListener("resize", resize);
});