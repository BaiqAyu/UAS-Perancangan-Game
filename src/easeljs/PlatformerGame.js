(function (window) {
    "use strict"
    var KEYCODE_SPACE = 32;
    var KEYCODE_UP = 38;
    var KEYCODE_LEFT = 37;
    var KEYCODE_RIGHT = 39;
    var KEYCODE_W = 87;
    var KEYCODE_A = 65;
    var KEYCODE_D = 68;
    var numberOfLevels = 97;
    var numberOfLevelDownloaded = 96;
    var hardcodedErrorTextLevel = ".....................................................................................................................................................GGG.................###................................GGG.......GGG.......###...--..###........................1................X.####################";
    var overlayDisplayed = false;
    var statusBitmap = null;
    var scoreText = null;
    var timeRemainingText = null;
    var WarningTime = 35;
    var canvasContext, 
        halfWidth,
        halfHeight,
        leftPointerID = -1,
        leftPointerPos = new Vector2(0, 0),
        leftPointerStartPos = new Vector2(0, 0),
        leftVector = new Vector2(0, 0);
    function PlatformerGame(stage, contentManager, gameWidth, gameHeight, displayWidth, displayHeight) {
        this.platformerGameStage = stage;
        this.platformerGameContentManager = contentManager;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.levelIndex = -1;
        this.level = null;
        this.wasContinuePressed = false;
        this.continuePressed = false;
        this.loadNextLevel = false;
        this.joystickCanvas = document.getElementById("JoystickCanvas");
        if (window.navigator.msPointerEnabled) {
            this.msGestureTap = new MSGesture();
        }
        else {
            this.joystickCanvas.style.position = "absolute";
            this.joystickCanvas.style.top = "0px";
            this.joystickCanvas.style.left = "0px";
        }
        var instance = this;
        document.onkeydown = function (e) {
            instance.handleKeyDown(e);
        };
        document.onkeyup = function (e) {
            instance.handleKeyUp(e);
        };
        canvasContext = this.joystickCanvas.getContext('2d');
        canvasContext.strokeStyle = "#ffffff";
        canvasContext.lineWidth = 2;
        halfWidth = this.joystickCanvas.width / 2;
        halfHeight = this.joystickCanvas.height / 2;
        window.scrollTo(0, 0);
        requestAnimFrame(draw);
        this.registerTouchEvents();
        this.registerTransitionEndEvents();
        PlatformerGame.IsOnline = this.CheckIfOnline();
        if (PlatformerGame.IsOnline) {
            this.DownloadAllLevels();
        }
        else {
            this.LoadNextLevel();
        }
    };
    PlatformerGame.prototype.registerTransitionEndEvents = function () {
        this.platformerGameStage.canvas.addEventListener("MSTransitionEnd", onTransitionEnd(this));
        this.platformerGameStage.canvas.addEventListener("transitionend", onTransitionEnd(this));
        this.platformerGameStage.canvas.addEventListener("webkitTransitionEnd", onTransitionEnd(this));
        this.platformerGameStage.canvas.addEventListener("oTransitionEnd", onTransitionEnd(this));
    };
    PlatformerGame.prototype.registerTouchEvents = function () {
        if (window.navigator.msPointerEnabled) {
            this.msGestureTap.target = this.joystickCanvas;
        }
        var that = this;
        this.joystickCanvas.addEventListener("pointerdown", function (event) { return onPointerDown(event, that); });
        this.joystickCanvas.addEventListener("pointermove", function (event) { return onPointerMove(event, that); });
        this.joystickCanvas.addEventListener("pointerup", function (event) { return onPointerUp(event, that); });
        this.joystickCanvas.addEventListener("pointerout", function (event) { return onPointerUp(event, that); });
        this.joystickCanvas.addEventListener("MSGestureTap", function (event) { return onTap(event, that); });
    }
    function onPointerDown(event, instance) {
        if ((leftPointerID < 0) && ((event.clientX - instance.joystickCanvas.offsetLeft < halfWidth) / gameRatioX)) {
            leftPointerID = event.pointerId;
            leftPointerStartPos.reset((event.clientX - instance.joystickCanvas.offsetLeft) / gameRatioX, (event.clientY - instance.joystickCanvas.offsetTop) / gameRatioY);
            leftPointerPos.copyFrom(leftPointerStartPos);
            leftVector.reset(0, 0);
        }
        else {
            if (window.navigator.msPointerEnabled) {
                instance.msGestureTap.addPointer(event.pointerId);
            }
            else {
                onTap(null, instance);
            }
        }
    }
    function onPointerMove(event, instance) {
        if (leftPointerID == event.pointerId) {
            leftPointerPos.reset((event.clientX - instance.joystickCanvas.offsetLeft) / gameRatioX, (event.clientY - instance.joystickCanvas.offsetTop) / gameRatioY);
            leftVector.copyFrom(leftPointerPos);
            leftVector.minusEq(leftPointerStartPos);
            instance.level.Hero.direction = Math.clamp(leftVector.x / 30, -1, 1);
        }
    }
    function onPointerUp(event, instance) {
        if (leftPointerID == event.pointerId) {
            leftPointerID = -1;
            leftVector.reset(0, 0);
            instance.level.Hero.direction = 0;
        }
    }
    function onTap(event, instance) {
        if (!instance.level.Hero.HasReachedExit && instance.level.Hero.IsAlive) {
            instance.level.Hero.isJumping = true;
            instance.continuePressed = false;
        }
        else {
            instance.continuePressed = true;
        }
    }
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    function draw() {
        canvasContext.clearRect(0, 0, 800, 400);

        if (leftPointerID !== -1) {
            canvasContext.beginPath();
            canvasContext.strokeStyle = "transparent";
            canvasContext.lineWidth = 3;
            canvasContext.arc(leftPointerStartPos.x, leftPointerStartPos.y, 25, 0, Math.PI * 2, true);
            canvasContext.stroke();
            canvasContext.beginPath();
            canvasContext.strokeStyle = "transparent";
            canvasContext.lineWidth = 1;
            canvasContext.arc(leftPointerStartPos.x, leftPointerStartPos.y, 37, 0, Math.PI * 2, true);
            canvasContext.stroke();
            canvasContext.beginPath();
            canvasContext.strokeStyle = "transparent";
            canvasContext.arc(leftPointerPos.x, leftPointerStartPos.y, 25, 0, Math.PI * 2, true);
            canvasContext.stroke();
        }
        requestAnimFrame(draw);
    }
    function onTransitionEnd(instance) {
        return function () {
            if (instance.loadNextLevel === true) {
                instance.LoadNextLevel();
            }
        }
    };
    PlatformerGame.prototype.tick = function () {
        try {
            if (this.level !== null) {
                this.HandleInput();
                this.level.Update();
                this.UpdateScore();
                if (!overlayDisplayed) {
                    this.DrawOverlay();
                }
            }
        }
        catch (e) {
        }
    };
    PlatformerGame.prototype.StartGame = function () {
        Ticker.addListener(this);
        Ticker.useRAF = enableRAF;
        Ticker.setFPS(50);
    };
    PlatformerGame.prototype.UpdateScore = function () {
        if (scoreText === null) {
            timeRemainingText = new Text("NILAI: ", "bold 14px Arial", "yellow");
            timeRemainingText.x = 10;
            timeRemainingText.y = 20;
            this.platformerGameStage.addChild(timeRemainingText);
            scoreText = new Text("WAKTU: 0", "bold 14px Arial", "yellow");
            scoreText.x = 10;
            scoreText.y = 34;
            this.platformerGameStage.addChild(scoreText);
        }

        if (this.level.TimeRemaining < WarningTime && !this.level.ReachedExit) {
            timeRemainingText.color = "red";
        }
        else {
            timeRemainingText.color = "yellow";
        }
        scoreText.text = "NILAI:" + (this.level.Score);
        timeRemainingText.text = "WAKTU: " + parseInt(this.level.TimeRemaining);
    };
    PlatformerGame.prototype.HandleInput = function () {
        if (!this.wasContinuePressed && this.continuePressed) {
            if (!this.level.Hero.IsAlive) {
                this.level.StartNewLife();
                this.platformerGameStage.removeChild(statusBitmap);
                overlayDisplayed = false;
            }
            else if (this.level.TimeRemaining == 0) {
                if (this.level.ReachedExit) {
                    if (Modernizr.csstransitions) {
                        this.loadNextLevel = true;
                        this.platformerGameStage.canvas.className = "moveRotation";
                    }
                    else {
                        this.LoadNextLevel();
                    }
                }
                else
                    this.ReloadCurrentLevel();
            }
        }
        this.wasContinuePressed = this.continuePressed;
    };
    PlatformerGame.prototype.DrawOverlay = function () {
        var status = null;

        if (this.level.TimeRemaining == 0) {
            if (this.level.ReachedExit) {
                status = this.platformerGameContentManager.winOverlay;
            }
            else {
                status = this.platformerGameContentManager.loseOverlay;
            }
        }
        else if (!this.level.Hero.IsAlive) {
            status = this.platformerGameContentManager.diedOverlay;
        }

        if (status !== null) {
            statusBitmap = new Bitmap(status);
            statusBitmap.x = (this.gameWidth - statusBitmap.image.width) / 2;
            statusBitmap.y = (this.gameHeight - statusBitmap.image.height) / 2;
            overlayDisplayed = true;
            this.platformerGameStage.addChild(statusBitmap);
        }
    };

    PlatformerGame.prototype.DownloadAllLevels = function () {
        var levelsUrl = window.location.href.replace('default.html', '') + "levels/";
        var that = this;

        for (var i = 0; i < numberOfLevels; i++) {
            try {
                var request = new XMLHttpRequest();
                request.open('GET', levelsUrl + i + ".txt", true);
                request.onreadystatechange = makeStoreCallback(i, request, that);
                request.send(null);
            }
            catch (e) {
                if (!window.localStorage["platformer_level_0"]) {
                    window.localStorage["platformer_level_0"] = hardcodedErrorTextLevel;
                }
            }
        }
    };
    function makeStoreCallback(index, request, that) {
        return function () {
            storeLevel(index, request, that);
        }
    }

    function storeLevel(index, request, that) {
        if (request.readyState == 4) {
            if (request.status == 200) {
                window.localStorage["platformer_level_" + index] = request.responseText.replace(/[\n\r\t]/g, '');
                numberOfLevelDownloaded++;
            }
            else {
                window.localStorage["platformer_level_" + index] = hardcodedErrorTextLevel;
            }

            if (numberOfLevelDownloaded === numberOfLevels) {
                that.LoadNextLevel();
            }
        }
    }

    PlatformerGame.prototype.CheckIfOnline = function () {
        if (!navigator.onLine) return false;
        var levelUrl = window.location.href.replace('default.html', '') + "levels/" + "0.txt";
        try {
            var request = new XMLHttpRequest();
            request.open('GET', levelUrl, false);
            request.send(null);
        }
        catch (e) {
            return false;
        }
        if (request.status !== 200) {
            return false;
        }
        else {
            return true;
        }
    };
    PlatformerGame.prototype.LoadNextLevel = function () {
        this.loadNextLevel = false;
        this.platformerGameStage.canvas.className = "initialRotation";
        this.levelIndex = (this.levelIndex + 1) % numberOfLevels;
        var newTextLevel = window.localStorage["platformer_level_" + this.levelIndex];
        this.LoadThisTextLevel(newTextLevel);
    };


    PlatformerGame.prototype.LoadThisTextLevel = function (textLevel) {
        scoreText = null;
        if (this.level != null)
            this.level.Dispose();
        this.level = new Level(this.platformerGameStage, this.platformerGameContentManager, textLevel, this.gameWidth, this.gameHeight);
        this.level.StartLevel();
        this.platformerGameStage.removeChild(statusBitmap);
        overlayDisplayed = false;
    };
    PlatformerGame.prototype.ReloadCurrentLevel = function () {
        --this.levelIndex;
        this.LoadNextLevel();
    };

    PlatformerGame.prototype.handleKeyDown = function (e) {
        if (!e) { var e = window.event; }
        switch (e.keyCode) {
            case KEYCODE_A:;
            case KEYCODE_LEFT:
                this.level.Hero.direction = -1;
                break;
            case KEYCODE_D:;
            case KEYCODE_RIGHT:
                this.level.Hero.direction = 1;
                break;
            case KEYCODE_UP:;
            case KEYCODE_W:
                this.level.Hero.isJumping = true;
                this.continuePressed = true;
        }
    };

    PlatformerGame.prototype.handleKeyUp = function (e) {
        if (!e) { var e = window.event; }
        switch (e.keyCode) {
            case KEYCODE_A:;
            case KEYCODE_LEFT:;
            case KEYCODE_D:;
            case KEYCODE_RIGHT:
                this.level.Hero.direction = 0;
                break;
            case KEYCODE_UP:;
            case KEYCODE_W:
                this.continuePressed = false;
                break;
        }
    };

    window.PlatformerGame = PlatformerGame;
}(window));