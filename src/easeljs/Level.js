(function (window) {
    var fpsLabel;
    var backgroundSeqTile1, backgroundSeqTile2, backgroundSeqTile3,backgroundSeqTile4,backgroundSeqTile5, offlineLogo;
    var PointsPerSecond = 5;
    var globalTargetFPS = 17;
    var audioGemIndex = 0;
    var StaticTile = new Tile(null, Enum.TileCollision.Passable, 0, 0);
    function Level(stage, contentManager, textLevel, gameWidth, gameHeight) {
        this.levelContentManager = contentManager;
        this.levelStage = stage;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.Hero = null;
        this.Gems = [];
        this.Yellows = [];
        this.Enemies = [];
        this.Start = null;
        this.Exit = new Point(-1, 0);
        this.Score = 0;
        this.ReachedExit = false;
        this.IsHeroDied = false;
        this.TimeRemaining = 100;
        this.InitialGameTime = Ticker.getTime();
        offlineLogo = new Bitmap(this.levelContentManager.imgOffline);
        this.CreateAndAddRandomBackground();
        this.textTiles = Array.matrix(15, 20, "|");
        this.tiles = Array.matrix(15, 20, "|");
        this.LoadTiles(textLevel);
    };
    Level.prototype.Dispose = function () {
        this.levelStage.removeAllChildren();
        this.levelStage.update();
        try {
            this.levelContentManager.globalMusic.pause();
        }
        catch (err) { }
    };
    Level.prototype.ParseLevelLines = function (levelLine) {
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 20; j++) {
                this.textTiles[i][j] = levelLine.charAt((i * 20) + j);
            }
        }
    };
    Level.prototype.LoadTiles = function (fileStream) {
        this.ParseLevelLines(fileStream);
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 20; j++) {
                this.tiles[i][j] = this.LoadTile(this.textTiles[i][j], j, i);
            }
        }
        if (this.Hero == null) {
            throw "A level must have a starting point.";
        }
        if (this.Exit.x === -1 && this.Exit.y === -1) {
            throw "A level must have an exit.";
        }
    };
    Level.prototype.LoadTile = function (tileType, x, y) {
        switch (tileType) {                                                                                                               
            case '.':
                return new Tile(null, Enum.TileCollision.Passable, x, y);
                break;                                                                                  
            case 'X':
                return this.LoadExitTile(x, y);
                break;                                                                                 
            case 'G':
                return this.LoadGemTile(x, y);
                break;
          case 'F' :
                return this.LoadYellowTile(x,y);
                break;                                                                                  
            case '-':
                return this.LoadNamedTile("Platform", Enum.TileCollision.Platform, x, y);
                break;                                                                            
            case 'A':
                return this.LoadEnemyTile(x, y, "MonsterA");
                break;
            case 'B':
                return this.LoadEnemyTile(x, y, "MonsterB");
                break;
            case 'C':
                return this.LoadEnemyTile(x, y, "MonsterC");
                break;
            case 'D':
                return this.LoadEnemyTile(x, y, "MonsterD");
                break;                                                                       
            case '~':
                return this.LoadVarietyTile("BlockB", 2, Enum.TileCollision.Platform, x, y);
                break;                                                                      
            case ':':
                return this.LoadVarietyTile("BlockB", 2, Enum.TileCollision.Passable, x, y);
                break;                                                                                   
            case '1':
                return this.LoadStartTile(x, y);
                break;                                                                                   
            case '#':
                return this.LoadVarietyTile("BlockA", 7, Enum.TileCollision.Impassable, x, y);
                break;
        }
    };
    Level.prototype.LoadNamedTile = function (name, collision, x, y) {
        switch (name) {
            case "Platform":
                return new Tile(this.levelContentManager.imgPlatform, collision, x, y);
                break;
            case "Exit":
                return new Tile(this.levelContentManager.imgExit, collision, x, y);
                break;
            case "BlockA0":
                return new Tile(this.levelContentManager.imgBlockA0, collision, x, y);
                break;
            case "BlockA1":
                return new Tile(this.levelContentManager.imgBlockA1, collision, x, y);
                break;
            case "BlockA2":
                return new Tile(this.levelContentManager.imgBlockA2, collision, x, y);
                break;
            case "BlockA3":
                return new Tile(this.levelContentManager.imgBlockA3, collision, x, y);
                break;
            case "BlockA4":
                return new Tile(this.levelContentManager.imgBlockA4, collision, x, y);
                break;
            case "BlockA5":
                return new Tile(this.levelContentManager.imgBlockA5, collision, x, y);
                break;
            case "BlockA6":
                return new Tile(this.levelContentManager.imgBlockA6, collision, x, y);
                break;
            case "BlockB0":
                return new Tile(this.levelContentManager.imgBlockB0, collision, x, y);
                break;
            case "BlockB1":
                return new Tile(this.levelContentManager.imgBlockB1, collision, x, y);
                break;
        }
    };
    Level.prototype.LoadVarietyTile = function (baseName, variationCount, collision, x, y) {
        var index = Math.floor(Math.random() * (variationCount - 1));
        return this.LoadNamedTile(baseName + index, collision, x, y);
    };
    Level.prototype.LoadStartTile = function (x, y) {
        if (this.Hero != null) {
            throw "A level may only have one starting point.";
        }
        this.Start = this.GetBounds(x, y).GetBottomCenter();
        this.Hero = new Player(this.levelContentManager.imgPlayer, this, this.Start);
        return new Tile(null, Enum.TileCollision.Passable, x, y);
    };
    Level.prototype.LoadExitTile = function (x, y) {
        if (this.Exit.x !== -1 & this.Exit.y !== y) {
            throw "A level may only have one exit.";
        }
        this.Exit = this.GetBounds(x, y).Center;
        return this.LoadNamedTile("Exit", Enum.TileCollision.Passable, x, y);
    };
    Level.prototype.LoadGemTile = function (x, y) {
        position = this.GetBounds(x, y).Center;
        var position = new Point(x, y);
        this.Gems.push(new Gem(this.levelContentManager.imgGem, this, position));
        return new Tile(null, Enum.TileCollision.Passable, x, y);
    };
    Level.prototype.LoadYellowTile = function (x,y){
        position =this.GetBounds(x,y).Center;
        var position = new Point(x,y);
        this.Yellows.push(new Yellow(this.levelContentManager.imgYellow, this, position));
    
        return new Tile(null,Enum.TileCollision.Passable,x,y);
    };
    Level.prototype.LoadEnemyTile = function (x, y, name) {
        var position = this.GetBounds(x, y).GetBottomCenter();
        switch (name) {
            case "MonsterA":
                this.Enemies.push(new Enemy(this, position, this.levelContentManager.imgMonsterA));
                break;
            case "MonsterB":
                this.Enemies.push(new Enemy(this, position, this.levelContentManager.imgMonsterB));
                break;
            case "MonsterC":
                this.Enemies.push(new Enemy(this, position, this.levelContentManager.imgMonsterC));
                break;
            case "MonsterD":
                this.Enemies.push(new Enemy(this, position, this.levelContentManager.imgMonsterD));
                break;
        }
        return new Tile(null, Enum.TileCollision.Passable, x, y);
    };
    Level.prototype.GetBounds = function (x, y) {
        return new XNARectangle(x * StaticTile.Width, y * StaticTile.Height, StaticTile.Width, StaticTile.Height);
    };
    Level.prototype.Width = function () {
        return 20;
    };
    Level.prototype.Height = function () {
        return 15;
    };
    Level.prototype.GetCollision = function (x, y) {
        if (x < 0 || x >= this.Width()) {
            return Enum.TileCollision.Impassable;
        }
        if (y < 0 || y >= this.Height()) {
            return Enum.TileCollision.Passable;
        }
        return this.tiles[y][x].Collision;
    };
    Level.prototype.CreateAndAddRandomBackground = function () {
        var randomnumber = Math.floor(Math.random() * 3);

        backgroundSeqTile1 = new Bitmap(this.levelContentManager.imgBackgroundLayers[0][randomnumber]);
        backgroundSeqTile2 = new Bitmap(this.levelContentManager.imgBackgroundLayers[1][randomnumber]);
        backgroundSeqTile3 = new Bitmap(this.levelContentManager.imgBackgroundLayers[2][randomnumber]);
        backgroundSeqTile4 = new Bitmap(this.levelContentManager.imgBackgroundLayers[2][randomnumber]);
        backgroundSeqTile5 = new Bitmap(this.levelContentManager.imgBackgroundLayers[1][randomnumber]);
        this.levelStage.addChild(backgroundSeqTile1);
        this.levelStage.addChild(backgroundSeqTile2);
        this.levelStage.addChild(backgroundSeqTile3);
        this.levelStage.addChild(backgroundSeqTile4);
        this.levelStage.addChild(backgroundSeqTile5);
        if (!PlatformerGame.IsOnline) {
            offlineLogo.x = 710;
            offlineLogo.y = -1;
            offlineLogo.scaleX = 0.5;
            offlineLogo.scaleY = 0.5;
            this.levelStage.addChild(offlineLogo);
        }
    };
    Level.prototype.StartLevel = function () {
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 20; j++) {
                if (!!this.tiles[i][j] && !this.tiles[i][j].empty) {
                    this.levelStage.addChild(this.tiles[i][j]);
                }
            }
        }
        for (var i = 0; i < this.Gems.length; i++) {
            this.levelStage.addChild(this.Gems[i]);
        }
        for (var i = 0; i < this.Yellows.length; i++) {
            this.levelStage.addChild(this.Yellows[i]);
        }
        for (var i = 0; i < this.Enemies.length; i++) {
            this.levelStage.addChild(this.Enemies[i]);
        }
        this.levelStage.addChild(this.Hero);
        this.levelContentManager.globalMusic.play();
        fpsLabel = new Text("-- fps", "bold 14px Arial", "#000");
        this.levelStage.addChild(fpsLabel);
        fpsLabel.x = this.gameWidth - 50;
        fpsLabel.y = 20;
    };
    Level.prototype.Update = function () {
        var ElapsedGameTime = (Ticker.getTime() - this.InitialGameTime) / 1000;
        this.Hero.tick();
        if (!this.Hero.IsAlive || this.TimeRemaining === 0) {
            this.Hero.ApplyPhysics();
        }
        else if (this.ReachedExit) {
            var seconds = parseInt((globalTargetFPS / 1000) * 200);
            seconds = Math.min(seconds, parseInt(Math.ceil(this.TimeRemaining)));
            this.TimeRemaining -= seconds;
            this.Score += seconds * PointsPerSecond;
        }
        else {
            this.TimeRemaining = 90 - ElapsedGameTime;
            if (!this.IsHeroDied)
                this.UpdateGems();
            if (!this.IsHeroDied)
                this.UpdateYellows();
            if (this.Hero.BoundingRectangle().Top() >= this.Height() * StaticTile.Height) {
                this.OnPlayerKilled();
            }
            this.UpdateEnemies();
            if (this.Hero.IsAlive &&
                    this.Hero.IsOnGround &&
                    this.Hero.BoundingRectangle().ContainsPoint(this.Exit)) {
                this.OnExitReached();
            }
        }
        if (this.TimeRemaining < 0)
            this.TimeRemaining = 0;

        fpsLabel.text = Math.round(Ticker.getMeasuredFPS()) + " fps";
        this.levelStage.update();
    };
    Level.prototype.UpdateGems = function () {
        for (var i = 0; i < this.Gems.length; i++) {
            this.Gems[i].tick();
            if (this.Gems[i].BoundingRectangle().Intersects(this.Hero.BoundingRectangle())) {
                this.levelStage.removeChild(this.Gems[i]);
                this.Score += this.Gems[i].PointValue;
                this.Gems.splice(i, 1);
                this.levelContentManager.gemCollected[audioGemIndex % 8].play();
                audioGemIndex++;
            }
        }
    };
    Level.prototype.UpdateYellows = function () {
        for (var i = 0; i < this.Yellows.length; i++) {
            this.Yellows[i].tick();
            if (this.Yellows[i].BoundingRectangle().Intersects(this.Hero.BoundingRectangle())) {
                this.levelStage.removeChild(this.Yellows[i]);
                this.Score += this.Yellows[i].PointValue;
                this.Yellows.splice(i, 1);
                this.levelContentManager.YellowCollected[audioGemIndex % 9].play();
                audioGemIndex++;
            }
        }
    };
    Level.prototype.UpdateEnemies = function () {
        for (var i = 0; i < this.Enemies.length; i++) {
            if (this.Hero.IsAlive && this.Enemies[i].BoundingRectangle().Intersects(this.Hero.BoundingRectangle())) {
                this.OnPlayerKilled(this.Enemies[i]);
                i = 0;
            }
            this.Enemies[i].tick();
        }
    };
    Level.prototype.OnPlayerKilled = function (killedBy) {
        this.IsHeroDied = true;
        this.Hero.OnKilled(killedBy);
    };
    Level.prototype.OnExitReached = function () {
        this.Hero.OnReachedExit();
        this.ReachedExit = true;
    };

    Level.prototype.StartNewLife = function () {
        this.Hero.Reset(this.Start);
    };

    window.Level = Level;
} (window));