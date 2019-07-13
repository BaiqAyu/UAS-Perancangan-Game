function ContentManager(stage, width, height) {
    var ondownloadcompleted;
    var NUM_ELEMENTS_TO_DOWNLOAD = 30;
    var numElementsLoaded = 0;
    var canPlayMp3;
    var canPlayOgg;
    var downloadProgress; 
    var myAudio = document.createElement('audio');
    if (myAudio.canPlayType) {
        canPlayMp3 = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/mpeg');
        canPlayOgg = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/ogg; codecs="vorbis"');
    }
    this.SetDownloadCompleted = function (callbackMethod) {
        ondownloadcompleted = callbackMethod;
    };
    this.imgMonsterA = new Image();
    this.imgMonsterB = new Image(); 
    this.imgMonsterC = new Image(); 
    this.imgMonsterD = new Image();
    this.imgBlockA0 = new Image();
    this.imgBlockA1 = new Image();
    this.imgBlockA2 = new Image();
    this.imgBlockA3 = new Image();
    this.imgBlockA4 = new Image();
    this.imgBlockA5 = new Image();
    this.imgBlockA6 = new Image();
    this.imgBlockB0 = new Image();
    this.imgBlockB1 = new Image();
    this.imgExit = new Image();
    this.imgOffline = new Image();
    this.imgPlatform = new Image();
    this.imgPlayer = new Image();
    this.imgGem = new Image();
    this.imgYellow = new Image();
    this.winOverlay = new Image();
    this.loseOverlay = new Image();
    this.diedOverlay = new Image();
    this.globalMusic = new Audio();
    this.playerKilled = new Audio();
    this.playerJump = new Audio();
    this.playerFall = new Audio();
    this.exitReached = new Audio();
    this.gemCollected = [];
    this.imgBackgroundLayers = new Array();
    this.StartDownload = function () {
        downloadProgress = new Text("-- %", "bold 14px Arial", "Green");
        downloadProgress.x = (width / 2) - 50;
        downloadProgress.y = height / 2;
        stage.addChild(downloadProgress);
        var audioExtension = ".none";
        if (canPlayMp3)
            audioExtension = ".mp3";
        else if (canPlayOgg) {
            audioExtension = ".ogg";
        }
        if (audioExtension !== ".none") {
            SetAudioDownloadParameters(this.globalMusic, "sounds/Music" + audioExtension);
            SetAudioDownloadParameters(this.playerKilled, "sounds/PlayerKilled" + audioExtension);
            SetAudioDownloadParameters(this.playerJump, "sounds/PlayerJump" + audioExtension);
            SetAudioDownloadParameters(this.playerFall, "sounds/PlayerFall" + audioExtension);
            SetAudioDownloadParameters(this.exitReached, "sounds/ExitReached" + audioExtension);
                for (var a = 0; a < 8; a++) {
                    this.gemCollected[a] = new Audio();
                    SetAudioDownloadParameters(this.gemCollected[a], "sounds/GemCollected" + audioExtension);
                }
        }
        for (var i = 0; i < 3; i++) {
            this.imgBackgroundLayers[i] = new Array();
            for (var j = 0; j < 3; j++) {
                this.imgBackgroundLayers[i][j] = new Image();
                SetDownloadParameters(this.imgBackgroundLayers[i][j], "img/Backgrounds/Layer" + i + "_" + j + ".png");
            }
        }
        SetDownloadParameters(this.imgPlayer, "img/Player.png");
        SetDownloadParameters(this.imgMonsterA, "img/MonsterA.png");
        SetDownloadParameters(this.imgMonsterB, "img/MonsterB.png");
        SetDownloadParameters(this.imgMonsterC, "img/MonsterC.png");
        SetDownloadParameters(this.imgMonsterD, "img/MonsterD.png");
        SetDownloadParameters(this.winOverlay, "overlays/you_win.png");
        SetDownloadParameters(this.loseOverlay, "overlays/you_lose.png");
        SetDownloadParameters(this.diedOverlay, "overlays/you_died.png");
        SetDownloadParameters(this.imgBlockA0, "img/Tiles/BlockA0.png");
        SetDownloadParameters(this.imgBlockA1, "img/Tiles/BlockA1.png");
        SetDownloadParameters(this.imgBlockA2, "img/Tiles/BlockA2.png");
        SetDownloadParameters(this.imgBlockA3, "img/Tiles/BlockA3.png");
        SetDownloadParameters(this.imgBlockA4, "img/Tiles/BlockA4.png");
        SetDownloadParameters(this.imgBlockA5, "img/Tiles/BlockA5.png");
        SetDownloadParameters(this.imgBlockA6, "img/Tiles/BlockA6.png");
        SetDownloadParameters(this.imgBlockB0, "img/Tiles/BlockB0.png");
        SetDownloadParameters(this.imgBlockB1, "img/Tiles/BlockB1.png");
        SetDownloadParameters(this.imgYellow, "img/Tiles/Yellow.png");
        SetDownloadParameters(this.imgGem, "img/Tiles/Gem.png");
        SetDownloadParameters(this.imgExit, "img/Tiles/Exit.png");
        SetDownloadParameters(this.imgOffline, "img/offlinelogoblack.png");
        SetDownloadParameters(this.imgPlatform, "img/Tiles/Platform.png");
        Ticker.addListener(this);
        Ticker.setInterval(50);
    };
    function SetDownloadParameters(assetElement, url) {
        assetElement.src = url;
        assetElement.onload = handleElementLoad;
        assetElement.onerror = handleElementError;
    };

    function SetAudioDownloadParameters(assetElement, url) {
        assetElement.src = url;
        assetElement.load();
    };
    function handleElementLoad(e) {
        numElementsLoaded++;
        if (numElementsLoaded === NUM_ELEMENTS_TO_DOWNLOAD) {
            stage.removeChild(downloadProgress);
            Ticker.removeAllListeners();
            numElementsLoaded = 0;
            ondownloadcompleted();
        }
    }
    function handleElementError(e) {
        console.log("Error Loading Asset : " + e.target.src);
    }
    this.tick = function() {
        downloadProgress.text = "Loading " + Math.round((numElementsLoaded / NUM_ELEMENTS_TO_DOWNLOAD) * 100) + " %";
        stage.update();
    };
}

