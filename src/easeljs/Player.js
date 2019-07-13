(function (window) {
    var MoveAcceleration = 13000.0;
    var MaxMoveSpeed = 1750.0;
    var GroundDragFactor = 0.48;
    var AirDragFactor = 0.58;
    var MaxJumpTime = 0.35;
    var JumpLaunchVelocity = -5000.0;
    var GravityAcceleration = 1800.0;
    var MaxFallSpeed = 550.0;
    var JumpControlPower = 0.14;
    var globalTargetFPS = 17;
    var StaticTile = new Tile(null, Enum.TileCollision.Passable, 0, 0);
    function Player(imgPlayer, level, position) {
        this.initialize(imgPlayer, level, position);
    }
    Player.prototype = new BitmapAnimation();
    Player.prototype.IsAlive = true;
    Player.prototype.HasReachedExit = false;
    Player.prototype.IsOnGround = true;
    Player.prototype.BitmapAnimation_initialize = Player.prototype.initialize;
    Player.prototype.initialize = function (imgPlayer, level, position) {
        var width;
        var left;
        var height;
        var top;
        var frameWidth;
        var frameHeight;
        var localSpriteSheet = new SpriteSheet({
            images: [imgPlayer], 
            frames: { width: 64, height: 128, regX: 32, regY: 128 },
            animations: {
                walk: [0, 9, "walk", 4],
                die: [10, 21, false, 4],
                jump: [22, 32, false],
                celebrate: [33, 43, false, 4],
                idle: [44, 44]
            }
        });
        SpriteSheetUtils.addFlippedFrames(localSpriteSheet, true, false, false);
        this.BitmapAnimation_initialize(localSpriteSheet);
        this.level = level;
        this.position = position;
        this.velocity = new Point(0, 0);
        this.previousBottom = 0.0;
        this.elapsed = 0;
        this.isJumping = false;
        this.wasJumping = false;
        this.jumpTime = 0.0;
        frameWidth = this.spriteSheet.getFrame(0).rect.width;
        frameHeight = this.spriteSheet.getFrame(0).rect.height;
        width = parseInt(frameWidth * 0.4);
        left = parseInt((frameWidth - width) / 2);
        height = parseInt(frameWidth * 0.4);
        top = parseInt(frameHeight - height) - 64;
        this.localBounds = new XNARectangle(left, top, width, height);
        if (enableShadows)
            this.shadow = new Shadow("#000", 3, 2, 2);

        this.name = "Hero";
        this.direction = 0;
        this.currentFrame = 66;
        this.Reset(position);
    };
    Player.prototype.Reset = function (position) {
        this.x = position.x;
        this.y = position.y;
        this.velocity = new Point(0, 0);
        this.IsAlive = true;
        this.level.IsHeroDied = false;
        this.gotoAndPlay("idle");
    };
    Player.prototype.BoundingRectangle = function () {
        var left = parseInt(Math.round(this.x - 32) + this.localBounds.x);
        var top = parseInt(Math.round(this.y - 64) + this.localBounds.y);

        return new XNARectangle(left, top, this.localBounds.width, this.localBounds.height);
    };
    Player.prototype.tick = function () {
        this.elapsed = globalTargetFPS / 1000;

        this.ApplyPhysics();

        if (this.IsAlive && this.IsOnGround && !this.HasReachedExit) {
            if (Math.abs(this.velocity.x) - 0.02 > 0) {
                if (this.direction < 0 && this.currentAnimation !== "walk") {
                    this.gotoAndPlay("walk");
                }
                if (this.direction > 0 && this.currentAnimation !== "walk_h") {
                    this.gotoAndPlay("walk_h");
                }
            }
            else {
                if (this.currentAnimation !== "idle" && this.direction === 0) {
                    this.gotoAndPlay("idle");
                }
            }
        }
        this.isJumping = false;
    };
    Player.prototype.ApplyPhysics = function () {
        if (this.IsAlive && !this.HasReachedExit) {
            var previousPosition = new Point(this.x, this.y);
            this.velocity.x += this.direction * MoveAcceleration * this.elapsed;
            this.velocity.y = Math.clamp(this.velocity.y + GravityAcceleration * this.elapsed, -MaxFallSpeed, MaxFallSpeed);
            this.velocity.y = this.DoJump(this.velocity.y);
            if (this.IsOnGround) {
                this.velocity.x *= GroundDragFactor;
            }
            else {
                this.velocity.x *= AirDragFactor;
            }
            this.velocity.x = Math.clamp(this.velocity.x, -MaxMoveSpeed, MaxMoveSpeed);
            this.x += this.velocity.x * this.elapsed;
            this.y += this.velocity.y * this.elapsed;
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            this.HandleCollisions();
            if (this.x === previousPosition.x) {
                this.velocity.x = 0;
            }

            if (this.y === previousPosition.y) {
                this.velocity.y = 0;
            }
        }
    };
    Player.prototype.DoJump = function (velocityY) {
        if (this.isJumping) {
            if ((!this.wasJumping && this.IsOnGround) || this.jumpTime > 0.0) {
                if (this.jumpTime == 0.0) {
                    this.level.levelContentManager.playerJump.play();
                }
                this.jumpTime += this.elapsed;
                if (this.direction == 1) {
                    this.gotoAndPlay("jump_h");
                }
                else {
                    this.gotoAndPlay("jump");
                }
            }
            if (0.0 < this.jumpTime && this.jumpTime <= MaxJumpTime) {
                velocityY = JumpLaunchVelocity * (1.0 - Math.pow(this.jumpTime / MaxJumpTime, JumpControlPower));
            }
            else {
                this.jumpTime = 0.0;
            }
        }
        else {
            this.jumpTime = 0.0;
        }
        this.wasJumping = this.isJumping;
        return velocityY;
    };
    Player.prototype.HandleCollisions = function () {
        var bounds = this.BoundingRectangle();
        var leftTile = Math.floor(bounds.Left() / StaticTile.Width);
        var rightTile = Math.ceil((bounds.Right() / StaticTile.Width)) - 1;
        var topTile = Math.floor(bounds.Top() / StaticTile.Height);
        var bottomTile = Math.ceil((bounds.Bottom() / StaticTile.Height)) - 1;
        this.IsOnGround = false;
        for (var y = topTile; y <= bottomTile; ++y) {
            for (var x = leftTile; x <= rightTile; ++x) {
                var collision = this.level.GetCollision(x, y);
                if (collision !== Enum.TileCollision.Passable) {
                    var tileBounds = this.level.GetBounds(x, y);
                    var depth = bounds.GetIntersectionDepth(tileBounds);
                    if (depth.x !== 0 && depth.y !== 0) {
                        var absDepthX = Math.abs(depth.x);
                        var absDepthY = Math.abs(depth.y);
                        if (absDepthY < absDepthX || collision == Enum.TileCollision.Platform) {
                            if (this.previousBottom <= tileBounds.Top()) {
                                this.IsOnGround = true;
                            }
                            if (collision == Enum.TileCollision.Impassable || this.IsOnGround) {
                                this.y = this.y + depth.y;
                                bounds = this.BoundingRectangle();
                            }
                        }
                        else if (collision == Enum.TileCollision.Impassable) 
                        {
                            this.x = this.x + depth.x;
                            bounds = this.BoundingRectangle();
                        }
                    }
                }
            }
        }
        this.previousBottom = bounds.Bottom();
    };
    Player.prototype.OnKilled = function (killedBy) {
        this.IsAlive = false;
        this.velocity = new Point(0, 0);
        if (this.direction === 1) {
            this.gotoAndPlay("die_h");
        }
        else {
            this.gotoAndPlay("die");
        }

        if (killedBy !== null && killedBy !== undefined) {
            this.level.levelContentManager.playerKilled.play();
        }
        else {
            this.level.levelContentManager.playerFall.play();
        }
    };
    Player.prototype.OnReachedExit = function () {
        this.HasReachedExit = true;
        this.level.levelContentManager.exitReached.play();
        if (this.direction === 1) {
            this.gotoAndPlay("celebrate_h");
        }
        else {
            this.gotoAndPlay("celebrate");
        }
    };

    window.Player = Player;
} (window));