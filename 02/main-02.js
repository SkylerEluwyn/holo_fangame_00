window.addEventListener("load", function (event) {
    "use strict";
    //// CONSTANTS ////
    // Utils
    const OBJECTS_PREFIX = "02/objects/";
    const OBJECTS_SUFFIX = ".js";

    // Utils
    const UTILS_PREFIX   = "02/utils/";
    const UTILS_SUFFIX   = ".js";

    // Zones
    const ZONE_PREFIX    = "02/maps/zone";
    const ZONE_SUFFIX    = ".json";

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

        var rectangle = display.context.canvas.getBoundingClientRect();

        p.style.left     = rectangle.left + "px";
        p.style.top      = rectangle.top  + "px";
        p.style.fontSize = game.world.tile_set.tile_size * rectangle.height / game.world.height + "px";
    }

    var render = function () {
        var frame = undefined;

        display.drawMap(assets_manager.tile_set_image, game.world.tile_set.columns, game.world.graphical_map, game.world.columns, game.world.tile_set.tile_size);
        
        for (let index = game.world.exp_hearts.length - 1; index > -1; -- index) {
            let exp_heart = game.world.exp_hearts[index];

            frame = game.world.tile_set.frames[exp_heart.frame_value];

            display.drawObject(assets_manager.tile_set_image, frame.x, frame.y, exp_heart.x + frame.offset_x, exp_heart.y + frame.offset_y, frame.width, frame.height);
        };

        frame = game.world.tile_set.frames[game.world.player.frame_value];
        
        display.drawObject(assets_manager.tile_set_image, frame.x, frame.y, game.world.player.x + Math.floor(game.world.player.width * 0.5 - frame.width * 0.5) + frame.offset_x, game.world.player.y+ frame.offset_y, frame.width, frame.height);
        
        
        var facing = undefined;
        // Debugging purposes
        switch(game.world.player.dx, game.world.player.dy) {
            case -2,-1: 
                facing = "NW";
                break;
            case -1,-1: case 1,-1:
                facing = "N";
                break;
            case 2,-1:
                facing = "NE";
                break;
            case -2,0:  case -1,0:
                facing = "W";
                break;
            case  1,0:   case 2,0:
                facing = "E";
                break;
            case -2,1:
                facing = "SW";
                break;
            case -1,1:   case 1,1:
                facing = "S";
                break;
            case 2,1:
                facing = "SE";
                break;
        };

        p.innerHTML = "Hearts Collected: " + game.world.heart_count + "<br>Facing: " + facing + "(" + game.world.player.dx + ", " + game.world.player.dy + ")";
        display.render();
    }

    var update = function () {
        // Basic Movements
        if (controller.left.active)   { game.world.player.moveLeft();  };
        if (controller.right.active)  { game.world.player.moveRight(); };

        if (controller.jump.active)   { game.world.player.jump(); controller.jump.active = false; }

        // Handle Aiming
        if (controller.up.active)     { game.world.player.upAction();   };
        if (controller.down.active)   { game.world.player.downAction(); };

        if (!controller.left.active  && game.world.player.dx < 0) { game.world.player.dx = -1 };
        if (!controller.right.active && game.world.player.dx > 0) { game.world.player.dx =  1 };
        if (!controller.up.active && !controller.down.active) {
            game.world.player.dy= 0;
        };
        
        // Combat
        if (controller.shoot.active) {
            game.world.player.shoot();
            if (game.world.player.shooting) {
                console.log('Bang!');
            };
            controller.shoot.active = false;
        };

        // Miscellaneous
        // if (controller.hold.active) {
        //     let dx = game.world.player.dx;
        //     let dy = game.world.player.dy;
        // };

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

    var p              = document.createElement("p");
    p.setAttribute("style", "color:#c07000; font-size:3.0em; position:fixed;");
    p.innerHTML = `
        Hearts Collected: 0
        <br>Facing: n/a`;
    document.body.appendChild(p);
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