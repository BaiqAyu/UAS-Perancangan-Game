(function (window) {
    var localBounds;
    var BounceHeight = 0.18;
    var BounceRate = 3.5;
    var BounceSync = -0.75;
    function Yellow(texture, level, position) {
        this.initialize(texture, level, position);
    }
    Yellow.prototype = new Bitmap();
    Yellow.prototype.Bitmap_initialize = Yellow.prototype.initialize;
    Yellow.prototype.initialize = function (texture, level, position) {
        var width;
        var left;
        var height;
        var top;
        var frameWidth;
        var frameHeight;
        this.Bitmap_initialize(texture);
        this.level = level;
        this.x = position.x * 40;
        this.y = position.y * 32;
        if (enableShadows)
            this.shadow = new Shadow("#000", 3, 2, 2);
        this.basePosition = new Point(this.x, this.y);
        frameWidth = texture.width;
        frameHeight = texture.height;
        width = frameWidth * 0.8;
        left = frameWidth / 2;
        height = frameWidth * 0.8;
        top = frameHeight - height;
        localBounds = new XNARectangle(left, top, width, height);
    };
    Yellow.prototype.PointValue = 20;
    Yellow.prototype.BoundingRectangle = function () {
        var left = Math.round(this.x) + localBounds.x;
        var top = Math.round(this.y) + localBounds.y;
        return new XNARectangle(left, top, localBounds.width, localBounds.height);
    };
    Yellow.prototype.tick = function () {
        var t = (Ticker.getTime() / 1000) * BounceRate + this.x * BounceSync;
        var bounce = Math.sin(t) * BounceHeight * 32;
        this.y = this.basePosition.y + bounce;
    };
    window.Yellow = Yellow;
} (window));