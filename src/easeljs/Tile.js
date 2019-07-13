function Enum() { }
Enum.TileCollision = { Passable: 0, Impassable: 1, Platform: 2 };
(function (window) {
    function Tile(texture, collision, x, y) {
        this.initialize(texture, collision,x,y);
    }
    Tile.prototype = new Bitmap();
    Tile.prototype.Bitmap_initialize = Tile.prototype.initialize; 
    Tile.prototype.initialize = function(texture, collision, x, y) {
        if (texture != null) {
            this.Bitmap_initialize(texture);
            this.empty = false;
        }
        else {
            this.empty = true;
        }
        this.Collision = collision;
        this.x = x * this.Width;
        this.y = y * this.Height;
    };
    Tile.prototype.Width = 40;
    Tile.prototype.Height = 32;
    window.Tile = Tile;
} (window));