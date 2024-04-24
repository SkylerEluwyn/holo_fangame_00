const Game = function () {
    this.world = new Game.World();
    this.update = function () {
        this.world.update();
    };
};

Game.prototype = { constructor: Game };

// Animator //
Game.Animator = function (frame_set, delay, mode = "loop") {
    this.count       = 0;
    this.delay       = (delay >= 1) ? delay : 1;
    this.frame_set   = frame_set;
    this.frame_index = 0;
    this.frame_value = frame_set[0];
    this.mode        = mode;
};

Game.Animator.prototype = {
    constructor: Game.Animator,

    animate: function() {
        switch (this.mode) {
            case "loop" : this.loop(); break;
            case "pause":              break;
        }
    },

    changeFrameSet(frame_set, mode, delay = 10, frame_index = 0) {
        if (this.frame_set === frame_set) { return; }

        this.count       = 0;
        this.delay       = delay;
        this.frame_set   = frame_set;
        this.frame_index = frame_index;
        this.frame_value = frame_set[frame_index];
        this.mode        = mode;
    },

    loop: function () {
        this.count ++;

        while(this.count > this.delay) {
            this.count -= this.delay;
            this.frame_index = (this.frame_index < this.frame_set.length - 1) ? this.frame_index + 1 : 0;
            this.frame_value = this.frame_set[this.frame_index];
        }
    }
};
// Animator end //

// Collider //
Game.Collider = function() {
    this.collide = function(value, object, tile_x, tile_y, tile_size) {
        switch(value) {
            case  1: this.collidePlatformTop       (object, tile_y            ); break;
            case  2: this.collidePlatformRight     (object, tile_x + tile_size); break;
            case  3: if (this.collidePlatformTop   (object, tile_y            )) return;
                     this.collidePlatformRight     (object, tile_x + tile_size); break;
            case  4: this.collidePlatformBottom    (object, tile_y + tile_size); break;
            case  5: if (this.collidePlatformTop   (object, tile_y            )) return;
                     this.collidePlatformBottom    (object, tile_y + tile_size); break;
            case  6: if (this.collidePlatformRight (object, tile_x + tile_size)) return;
                     this.collidePlatformBottom    (object, tile_y + tile_size); break;
            case  7: if (this.collidePlatformTop   (object, tile_y            )) return;
                     if (this.collidePlatformRight (object, tile_x + tile_size)) return;
                     this.collidePlatformBottom    (object, tile_y + tile_size); break;
            case  8: this.collidePlatformLeft      (object, tile_x            ); break;
            case  9: if (this.collidePlatformTop   (object, tile_y            )) return;
                     this.collidePlatformLeft      (object, tile_x            ); break;
            case 10: if (this.collidePlatformLeft  (object, tile_x            )) return;
                     this.collidePlatformRight     (object, tile_x + tile_size); break;
            case 11: if (this.collidePlatformTop   (object, tile_y            )) return;
                     if (this.collidePlatformLeft  (object, tile_x            )) return;
                     this.collidePlatformRight     (object, tile_x + tile_size); break;
            case 12: if (this.collidePlatformLeft  (object, tile_x            )) return;
                     this.collideObjectBottom      (object, tile_y + tile_size); break;
            case 13: if (this.collidePlatformTop   (object, tile_y            )) return;
                     if (this.collidePlatformLeft  (object, tile_x            )) return;
                     this.collidePlatformBottom    (object, tile_y + tile_size); break;
            case 14: if (this.collidePlatformLeft  (object, tile_x            )) return;
                     if (this.collidePlatformRight (object, tile_x + tile_size)) return;
                     this.collidePlatformBottom    (object, tile_y + tile_size); break;
            case 15: if (this.collidePlatformTop   (object, tile_y            )) return;
                     if (this.collidePlatformLeft  (object, tile_x            )) return;
                     if (this.collidePlatformRight (object, tile_x + tile_size)) return;
                     this.collidePlatformBottom    (object, tile_y + tile_size); break;
        };
    }
};

Game.Collider.prototype = {
    constructor: Game.Collider,
    
    collidePlatformBottom: function (object, tile_bottom) {
        if (object.getTop() < tile_bottom && object.getOldTop() >= tile_bottom) {
            object.setTop(tile_bottom);
            object.vy = 0;
            return true;
        } return false;
    },
    collidePlatformLeft: function (object, tile_left) {
        if (object.getRight() > tile_left && object.getOldRight() <= tile_left) {
            object.setRight(tile_left - 0.01);
            object.vx = 0;
            return true;
        } return false;
    },
    collidePlatformRight: function (object, tile_right) {
        if (object.getLeft() < tile_right && object.getOldLeft() >= tile_right) {
            object.setLeft(tile_right);
            object.vx = 0;
            return true;
        } return false;
    },
    collidePlatformTop: function (object, tile_top) {
        if (object.getBottom() > tile_top && object.getOldBottom() <= tile_top) {
            object.setBottom(tile_top - 0.01);
            object.vy = 0;
            object.jumping = false;
            return true;
        } return false;
    }
};
// Collider.end //

// Frame //
Game.Frame = function (x, y, width, height, offset_x, offset_y) {
    this.x        = x;
    this.y        = y;
    this.width    = width;
    this.height   = height;
    this.offset_x = offset_x;
    this.offset_y = offset_y;
};

Game.Frame.prototype = { constructor: Game.Frame };
// Frame end //

// Object //
Game.Object = function (x, y, width, height) {
    this.x      = x;
    this.y      = y;
    this.width  = width;
    this.height = height;
};

Game.Object.prototype = {
    constructor: Game.Object,

    collideObject: function (object) {
        if (this.getRight()  < object.getLeft()  ||
            this.getBottom() < object.getTop()   ||
            this.getLeft()   > object.getRight() ||
            this.getTop      > object.getBottom()) return false;
        
            return true;
    },

    collideObjectCenter: function (object) {
        let center_x = object.getCenterX();
        let center_y = object.getCenterY();

        if(center_x < this.getLeft() || center_x > this.getRight() ||
           center_y < this.getTop()  || center_y > this.getBottom()) return false;
        
            return true;
    },

    getBottom:    function ()  { return this.y + this.height;       },
    getCenterX:   function ()  { return this.x + this.width  * 0.5; },
    getCenterY:   function ()  { return this.y + this.height * 0.5; },
    getLeft:      function ()  { return this.x;                     },
    getRight:     function ()  { return this.x + this.width;        },
    getTop:       function ()  { return this.y;                     },
    setBottom:    function (y) { this.y = y - this.height;          },
    setCenterX:   function (x) { this.x = x - this.width  * 0.5;    },
    setCenterY:   function (y) { this.y = y - this.height * 0.5;    },
    setLeft:      function (x) { this.x = x;                        },
    setRight:     function (x) { this.x = x - this.width;           },
    setTop:       function (y) { this.y = y;                        },
};
// Object end //

// Moving Object //
Game.MovingObject = function(width, height, x, y, velocity_max) {
    Game.Object.call(this, x, y, width, height);

    this.jumping      = false;
    this.velocity_max = velocity_max;
    this.vx   = 0;
    this.vy   = 0;
    this.x_old        = x;
    this.y_old        = y;
};

Game.MovingObject.prototype = {
    getOldBottom:    function ()  { return this.y_old + this.height;       },
    getOldCenterX:   function ()  { return this.x_old + this.width  * 0.5; },
    getOldCenterY:   function ()  { return this.y_old + this.height * 0.5; },
    getOldLeft:      function ()  { return this.x_old;                     },
    getOldRight:     function ()  { return this.x_old + this.width;        },
    getOldTop:       function ()  { return this.y_old;                     },
    setOldBottom:    function (y) { this.y_old = y - this.height;          },
    setOldCenterX:   function (x) { this.x_old = x - this.width  * 0.5;    },
    setOldCenterY:   function (y) { this.y_old = y - this.height * 0.5;    },
    setOldLeft:      function (x) { this.x_old = x;                        },
    setOldRight:     function (x) { this.x_old = x - this.width;           },
    setOldTop:       function (y) { this.y_old = y;                        },
};

Object.assign(Game.MovingObject.prototype, Game.Object.prototype);
Game.MovingObject.prototype.constructor = Game.MovingObject;
// Moving Object end //

// Heart Expansions //
Game.ExpHeart = function (x, y) {
    Game.Object.call(this, x, y, 16, 16);
    Game.Animator.call(this, Game.ExpHeart.prototype.frame_sets["static-heart"], 0, "pause");
};

Game.ExpHeart.prototype = {
    frame_sets: { "static_heart": [10], },
};
Object.assign(Game.ExpHeart.prototype, Game.Animator.prototype);
Object.assign(Game.ExpHeart.prototype, Game.Object.prototype);
Game.ExpHeart.prototype.constructor = Game.ExpHeart;
// Heart Expansions end //

// Player //
Game.Player = function (x, y) {
    Game.Object.call(this, 100, 50, 16, 16);
    Game.Animator.call(this, Game.Player.prototype.frame_sets["idle-left"], 5);
    this.jumping  =  true;           // Player's Jumping State
    this.shooting = false;           // Player's Shooting State

    // this.projectiles = new Array();

    this.dx       =    -1;           // Player's X Direction
    this.dy       =     0;           // Player's Y Direction
    this.vx       =     0;           // Player's X Velocity
    this.vy       =     0;           // Player's Y Velocity
};

Game.Player.prototype = {
    constructor: Game.Player,
    frame_sets: {
        "idle-left"       : [0],
        "move-left"       : [1, 2],
        "jump-left"       : [3],
        "fall-left"       : [4],
        "idle-right"      : [5],
        "move-right"      : [6, 7],
        "jump-right"      : [8],
        "fall-right"      : [9],
    },

    jump: function () {
        if (!this.jumping) {
            this.jumping = true;
            this.vy -= 5;
        }
    },

    shoot: function () {
        if (!this.shooting) {
            switch(dx + "," + dy) {
                case "-2, 0": case "-1, 0":
                    this.shooting = true;
                break;
                case "1,0"  : case "2,0":
                    this.shooting = true;
                    // 
                    break;
                case "-2,-1":
                    break;
            };
        };
    },

    upAction: function () {
        this.dy  =    -1;
    },

    moveLeft: function () {
        this.dx  =    -1;
        this.vx  -=  0.3;
    },
    moveRight: function (frame_set) {
        this.dx  =     1;
        this.vx  +=  0.3;
    },

    downAction: function() {
        this.dy  =     1;
    },

    updateAnimation: function () {
        if (this.vy < 0) {
        
            if (this.dx < 0) this.changeFrameSet(this.frame_sets["jump-left"], "pause");
            else this.changeFrameSet(this.frame_sets["jump-right"], "pause");
        
        } else if (this.vy > 0) {

            if (this.dx < 0) this.changeFrameSet(this.frame_sets["fall-left"], "pause");
            else this.changeFrameSet(this.frame_sets["fall-right"], "pause");

        } else if (this.dx < 0) {
        
            if (this.vx < -0.1) this.changeFrameSet(this.frame_sets["move-left"], "loop", 10);
            else this.changeFrameSet(this.frame_sets["idle-left"], "pause");
        
        } else if (this.dx > 0) {

            if (this.vx > 0.1) this.changeFrameSet(this.frame_sets["move-right"], "loop", 12);
            else this.changeFrameSet(this.frame_sets["idle-right"], "pause");
        
        }
        this.animate();
    },

    updatePosition: function (gravity, friction) {
        this.x_old = this.x;
        this.y_old = this.y;

        this.vx *= friction;
        this.vy += gravity;

        this.x    += this.vx;
        this.y    += this.vy;
    },
};

Object.assign(Game.Player.prototype, Game.MovingObject.prototype);
Object.assign(Game.Player.prototype, Game.Animator.prototype);
Game.Player.prototype.constructor = Game.Player;
// Player end //

// TileSet //
Game.TileSet = function (columns, tile_size) {
    this.columns   = columns;
    this.tile_size = tile_size;
    
    let f = Game.Frame;

    this.frames = [new f(  0,  16,  16,  16,   0,   0),                                       // idle-left
                   new f( 16,  16,  16,  16,   0,   0), new f(  32,  16,  16,  16,   0,   0), // move-right
                   new f( 48,  16,  16,  16,   0,   0),                                       // jump-left
                   new f( 64,  16,  16,  16,   0,   0),                                       // fall-left
                   new f(  0,  32,  16,  16,   0,   0),                                       // idle-right
                   new f( 16,  32,  16,  16,   0,   0), new f(  32,  32,  16,  16,   0,   0), // move-left
                   new f( 48,  32,  16,  16,   0,   0),                                       // jump-right
                   new f( 64,  32,  16,  16,   0,   0),                                       // fall-right
                   new f( 80,   0,  16,  16,   0,   0),                                       // static-heart
    ];
};

Game.TileSet.prototype = { constructor: Game.TileSet };
// Tile Set end //

// World //
Game.World = function (friction = 0.9, gravity = 0.5) {
    this.collider    = new Game.Collider();
    
    this.friction    = friction;
    this.gravity     = gravity;

    this.columns     = 16;
    this.rows        = 9;

    this.tile_set    = new Game.TileSet(5, 16);
    this.player      = new Game.Player(100, 20);

    this.zone_id     = "00";

    this.exp_hearts  = [];
    this.heart_count = 0;

    this.height      = this.tile_set.tile_size * this.rows;
    this.width       = this.tile_set.tile_size * this.columns;
};

Game.World.prototype = {
    constructor: Game.World,

    collideObject: function (object) {
        // Declare Variables
        var bottom, left, right, top, value;

        // Top-Left Corner
        top   = Math.floor(object.getTop()  / this.tile_set.tile_size);
        left  = Math.floor(object.getLeft() / this.tile_set.tile_size);
        value = this.collision_map[top * this.columns + left];
        this.collider.collide(value, object, left * this.tile_set.tile_size, top * this.tile_set.tile_size, this.tile_set.tile_size);

        // Top-Right Corner
        top   = Math.floor(object.getTop()   / this.tile_set.tile_size);
        right = Math.floor(object.getRight() / this.tile_set.tile_size);
        value = this.collision_map[top * this.columns + right];
        this.collider.collide(value, object, right * this.tile_set.tile_size, top * this.tile_set.tile_size, this.tile_set.tile_size);

        // Bottom-Left Corner
        bottom = Math.floor(object.getBottom()  / this.tile_set.tile_size);
        left   = Math.floor(object.getLeft()    / this.tile_set.tile_size);
        value  = this.collision_map[bottom * this.columns + left];
        this.collider.collide(value, object, left * this.tile_set.tile_size, bottom * this.tile_set.tile_size, this.tile_set.tile_size);

        // Bottom-Right Corner
        bottom = Math.floor(object.getBottom()   / this.tile_set.tile_size);
        right  = Math.floor(object.getRight()    / this.tile_set.tile_size);
        value  = this.collision_map[bottom * this.columns + right];
        this.collider.collide(value, object, right * this.tile_set.tile_size, bottom * this.tile_set.tile_size, this.tile_set.tile_size);
    },

    setup: function (zone) {
        this.exp_hearts    = new Array();

        this.graphical_map = zone.graphical_map;
        this.collision_map = zone.collision_map;
        this.columns       = zone.columns;
        this.rows          = zone.rows;
        this.zone_id       = zone.zone_id;

        for(let index = zone.exp_hearts.length - 1; index > -1; -- index) {
            let exp_heart = zone.exp_hearts[index];
            this.exp_hearts[index] = new Game.ExpHeart(exp_heart);
        }
    },

    update: function () {
        this.player.updatePosition(this.gravity, this.friction);

        this.collideObject(this.player);

        //
        for (let index = this.exp_hearts.length - 1; index > -1; -- index) {
            let exp_heart = this.exp_hearts[index];

            exp_heart.animate();

            if(exp_heart.collideObject(this.player)) {
                this.exp_hearts.splice(this.exp_hearts.indexOf(exp_heart), 1);
                this.heart_count ++;
            }
        }
        //

        this.player.updateAnimation();
    }
};
// World end //