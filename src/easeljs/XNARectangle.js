(function (window) {
    //
    function XNARectangle(x, y, width, height) {
        this.initialize(x, y, width, height);
    }
    XNARectangle.prototype = new Rectangle();
    XNARectangle.prototype.Rectangle_initialize = XNARectangle.prototype.initialize;
    XNARectangle.prototype.initialize = function (x, y, width, height) {
        this.Rectangle_initialize(x, y, width, height);
        this.Location = new Point(this.x, this.y);
        this.Center = new Point(parseInt(this.x + this.width / 2), parseInt(this.y + this.height / 2));
    };
    XNARectangle.prototype.Left = function () {
        return parseInt(this.x);
    };
    XNARectangle.prototype.Right = function () {
        return parseInt(this.x + this.width);
    };
    XNARectangle.prototype.Top = function () {
        return parseInt(this.y);
    };
    XNARectangle.prototype.Bottom = function () {
        return parseInt(this.y + this.height);
    };
    XNARectangle.prototype.Contains = function (targetRectangle) {
        if (this.x <= targetRectangle.x && targetRectangle.x + targetRectangle.width <= this.x + this.width && this.y <= targetRectangle.y)
            return targetRectangle.y + targetRectangle.height <= this.y + this.height;
        else
            return false;
    };
    XNARectangle.prototype.ContainsPoint = function(targetPoint) {
        if (this.x <= targetPoint.x && targetPoint.x < this.x + this.width && this.y <= targetPoint.y)
            return targetPoint.y < this.y + this.height;
        else
            return false;
    };
    XNARectangle.prototype.Intersects = function (targetRectangle) {
        if (targetRectangle.x < this.x + this.width && this.x < targetRectangle.x + targetRectangle.width && targetRectangle.y < this.y + this.height)
            return this.y < targetRectangle.y + targetRectangle.height;
        else
            return false;
    };
    XNARectangle.prototype.GetBottomCenter = function () {
        return new Point(parseInt(this.x + (this.width / 2)), this.Bottom());
    };
    XNARectangle.prototype.GetIntersectionDepth = function (rectB) {
        var rectA = this;
        var halfWidthA = rectA.width / 2.0;
        var halfHeightA = rectA.height / 2.0;
        var halfWidthB = rectB.width / 2.0;
        var halfHeightB = rectB.height / 2.0;
        var centerA = new Point(rectA.Left() + halfWidthA, rectA.Top() + halfHeightA);
        var centerB = new Point(rectB.Left() + halfWidthB, rectB.Top() + halfHeightB);
        var distanceX = centerA.x - centerB.x;
        var distanceY = centerA.y - centerB.y;
        var minDistanceX = halfWidthA + halfWidthB;
        var minDistanceY = halfHeightA + halfHeightB;
        if (Math.abs(distanceX) >= minDistanceX || Math.abs(distanceY) >= minDistanceY)
            return new Point(0,0);
        var depthX = distanceX > 0 ? minDistanceX - distanceX : -minDistanceX - distanceX;
        var depthY = distanceY > 0 ? minDistanceY - distanceY : -minDistanceY - distanceY;
        return new Point(depthX, depthY);
    };

    window.XNARectangle = XNARectangle;
} (window));