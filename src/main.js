var canvas;
var joystickCanvas;
var stage = null;
var contentManager;
var platformerGame;
var enableShadows = false;
var enableRAF = true;
var ieBtnLeft, ieBtnRight, ieBtnJump;
window.gameRatioX = 1;
window.gameRatioY = 1;
function restart() {
    if (stage == null) {
        canvas = document.getElementById("platformerCanvas");
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        joystickCanvas = document.getElementById("JoystickCanvas");
        joystickCanvas.style.width = window.innerWidth + 'px';
        joystickCanvas.style.height = window.innerHeight + 'px';
        stage = new Stage(canvas);
        contentManager = new ContentManager(stage, 800, 480);
        contentManager.SetDownloadCompleted(startGame);
        contentManager.StartDownload();
    }
    else {
        platformerGame.ReloadCurrentLevel();
    }
}
function jumpKey() {
    platformerGame.handleKeyDown({ "keyCode": 87 });
    setTimeout("platformerGame.handleKeyUp({ \"keyCode\": 87 })", 20);
}
function leftKey() {
    platformerGame.handleKeyDown({ "keyCode": 37 });
}
function rightKey() {
    platformerGame.handleKeyDown({ "keyCode": 39 });
}
function changeShadows() {
    enableShadows = !enableShadows;
}
function changeRAF() {
    enableRAF = !enableRAF;
    Ticker.useRAF = enableRAF;
}
function startGame() {
    platformerGame = new PlatformerGame(stage, contentManager, 800, 480, window.innerWidth, window.innerHeight);
    window.addEventListener("resize", OnResizeCalled, false);
    OnResizeCalled();
    DragDropLogic.monitorElement(canvas, platformerGame);
	platformerGame.StartGame();
}
function initGameLogic() {
    setIE9PinnedModeExperience();
    restart();
}
function OnResizeCalled() {
    var gameWidth = window.innerWidth;
    var gameHeight = window.innerHeight;
    var scaleToFitX = gameWidth / 800;
    var scaleToFitY = gameHeight / 480;
    var currentScreenRatio = gameWidth / gameHeight;
    var optimalRatio = Math.min(scaleToFitX, scaleToFitY);
    if (currentScreenRatio >= 1.77 && currentScreenRatio <= 1.79) {
        canvas.style.width = gameWidth + "px";
        canvas.style.height = gameHeight + "px";
        joystickCanvas.style.width = gameWidth + "px";
        joystickCanvas.style.height = gameHeight + "px";
        gameRatioX = scaleToFitX;
        gameRatioY = scaleToFitY;
    }
    else {
        canvas.style.width = 800 * optimalRatio + "px";
        canvas.style.height = 480 * optimalRatio + "px";
        joystickCanvas.style.width = 800 * optimalRatio + "px";
        joystickCanvas.style.height = 480 * optimalRatio + "px";
        gameRatioX = optimalRatio;
        gameRatioY = optimalRatio;
    }
}
function setIE9PinnedModeExperience() {
    try {
        document.addEventListener('msthumbnailclick', processSelection, false);
        ieBtnLeft = window.external.msSiteModeAddThumbBarButton('icons/ie9left.ico', 'Left');
        ieBtnJump = window.external.msSiteModeAddThumbBarButton('icons/ie9jump.ico', 'Jump');
        ieBtnRight = window.external.msSiteModeAddThumbBarButton('icons/ie9right.ico', 'Right');

        window.external.msSiteModeShowThumbBar();
    }
    catch (e) { }
}
function processSelection(btn) {
    switch (btn.buttonID) {
        case ieBtnLeft:
            leftKey();
            break;
        case ieBtnRight:
            rightKey();
            break;
        case ieBtnJump:
            jumpKey();
            break;
    }
}