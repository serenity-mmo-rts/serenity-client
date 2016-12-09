
var BackgroundMap = function(mapContainer,size,seed,roughness) {

    this.seed = seed;
    this.roughness = roughness;
    this.size = size;
    this.max = this.size - 1;
    this.map = new Float32Array(this.size * this.size);

    this.stage = mapContainer.stage;
    this.mapContainer = mapContainer;
    this.main_container = mapContainer.main_container;
    this.background_container = mapContainer.background_container;
    this.mapId = mapContainer.map.mapId;
    this.bg_container = new createjs.Container();
    this.bg_container.mouseMoveOutside = true;
    this.background_container.addChild(this.bg_container);

    this.generate(this.seed,this.roughness);
};


BackgroundMap.prototype.bgMapRenderer = function(){
    var noiseLevel = 0;

    var deepwaterSize = 6;
    var coastwaterSize = 4;
    var beachSize = 2;
    var valleySize = 5;
    var greenSize = 5;
    var mountainSize = 5;
    var halficeSize = 5;
    var iceSize = 20;

    var sumSize = deepwaterSize + coastwaterSize + beachSize + valleySize + greenSize + mountainSize + iceSize;


    var landscape = [];
    landscape.push({maxV: deepwaterSize / sumSize,                                         c1: {r: 0, g: 0, b: 150}, c2: {r: 0, g: 0, b: 150}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "deepwater"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + coastwaterSize / sumSize, c1: {r: 0, g: 0, b: 150}, c2: {r: 56, g: 200, b: 200}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "coastwater"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + beachSize / sumSize,      c1: {r: 255, g: 255, b: 153}, c2: {r: 200, g: 120, b: 20}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "beach"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + valleySize / sumSize,     c1: {r: 200, g: 120, b: 20}, c2: {r: 50, g: 150, b: 50}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "valley"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + greenSize / sumSize,      c1: {r: 50, g: 150, b: 50}, c2: {r: 153, g: 76, b: 0}, cnoise: {r: 100, g: 120, b: 25, vol: 0.05}, name: "green"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + mountainSize / sumSize,   c1: {r: 153, g: 76, b: 0}, c2: {r: 102, g: 51, b: 0}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "mountain"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + halficeSize / sumSize,   c1: {r: 255, g: 255, b: 255}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "halfice"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + iceSize / sumSize,        c1: {r: 255, g: 255, b: 255}, c2: {r: 255, g: 255, b: 255}, cnoise: {r: 0, g: 0, b: 0, vol: 0}, name: "ice"});

    var convertToLandscape = function(resDataScaled){
        var resDataScaled = 1-1/(1+resDataScaled);
        var c = {r: 1, g: 1, b: 1};

        var i = 0;
        while (i < landscape.length - 1 && landscape[i].maxV < resDataScaled) {
            i++;
        }
        var minV = (i == 0 ? 0 : landscape[i - 1].maxV);
        var a = (resDataScaled - minV) / (landscape[i].maxV - minV);
        c.r = landscape[i].c1.r * (1 - a) + landscape[i].c2.r * (a);
        c.g = landscape[i].c1.g * (1 - a) + landscape[i].c2.g * (a);
        c.b = landscape[i].c1.b * (1 - a) + landscape[i].c2.b * (a);

        if (landscape[i].cnoise.vol != 0) {
            //Add Noise
            var curNoiseLevel = Math.min(1,Math.max(0, Math.exp( - Math.random() / landscape[i].cnoise.vol )));
            c.r = c.r * (1 - curNoiseLevel) + landscape[i].cnoise.r * curNoiseLevel;
            c.g = c.g * (1 - curNoiseLevel) + landscape[i].cnoise.g * curNoiseLevel;
            c.b = c.b * (1 - curNoiseLevel) + landscape[i].cnoise.b * curNoiseLevel;
        }

        if (noiseLevel) {
            //Add Noise
            c.r += noiseLevel * Math.random();
            c.g += noiseLevel * Math.random();
            c.b += noiseLevel * Math.random();
        }

        return c;
    };
    return convertToLandscape
};



BackgroundMap.prototype.generate = function(seed,roughness) {
    var self = this;
    this.set(0, 0, seed+((Math.random()-0.5)*roughness*seed));
    this.set(this.max, 0, seed+((Math.random()-0.5)*roughness*seed));
    this.set(this.max, this.max, seed+((Math.random()-0.5)*roughness*seed));
    this.set(0, this.max, seed+((Math.random()-0.5)*roughness*seed));
    divide(this.max);
    function divide(size) {
        var x = size / 2;
        var y = size / 2;
        var half = size / 2;
        var scale = roughness * size;
        if (half < 1) return;
        for (y = half; y < self.max; y += size) {
            for (x = half; x < self.max; x += size) {
                square(x, y, half, Math.random() * scale * 2 - scale);
            }
        }
        for (y = 0; y <= self.max; y += half) {
            for (x = (y + half) % size; x <= self.max; x += size) {
                diamond(x, y, half, Math.random() * scale * 2 - scale);
            }
        }
        divide(size / 2);
    }
    function average(values) {
        var valid = values.filter(function(val) { return val !== -1; });
        var total = valid.reduce(function(sum, val) { return sum + val; }, 0);
        return total / valid.length;
    }
    function square(x, y, size, offset) {
        var ave = average([
            self.get(x - size, y - size),   // upper left
            self.get(x + size, y - size),   // upper right
            self.get(x + size, y + size),   // lower right
            self.get(x - size, y + size)    // lower left
        ]);
        self.set(x, y, ave + offset);
    }
    function diamond(x, y, size, offset) {
        var ave = average([
            self.get(x, y - size),      // top
            self.get(x + size, y),      // right
            self.get(x, y + size),      // bottom
            self.get(x - size, y)       // left
        ]);
        self.set(x, y, ave + offset);
    }
};

BackgroundMap.prototype.get = function(x, y) {
    if (x < 0 || x > this.max || y < 0 || y > this.max) return -1;
    return this.map[x + this.size * y];
};
BackgroundMap.prototype.set = function(x, y, val) {
    this.map[x + this.size * y] = val;
};

BackgroundMap.prototype.draw = function(ctx, width, height) {
    var self = this;
    var waterVal = this.size * 0.3;
    for (var y = 0; y < this.size; y++) {
        for (var x = 0; x < this.size; x++) {
            var val = this.get(x, y);
            var top = project(x, y, val);
            var bottom = project(x + 1, y, 0);
            var water = project(x, y, waterVal);
            var style = brightness(x, y, this.get(x + 1, y) - val);
            rect(top, bottom, style);
            rect(water, bottom, 'rgba(50, 150, 200, 0.15)');
        }
    }
    function rect(a, b, style) {
        if (b.y < a.y) return;
        var g = new createjs.Graphics();
        g.setStrokeStyle(1);
        g.beginStroke("#000000");
        g.beginFill("red");
        g.drawCircle(0,0,30);
        var myRect =  myGraphics.beginStroke("red").beginFill("blue").drawRect(20, 20, 100, 50);
    }
    function brightness(x, y, slope) {
        if (y === self.max || x === self.max) return '#000';
        var b = ~~(slope * 50) + 128;
        return ['rgba(', b, ',', b, ',', b, ',1)'].join('');
    }
    function iso(x, y) {
        return {
            x: 0.5 * (self.size + x - y),
            y: 0.5 * (x + y)
        };
    }
    function project(flatX, flatY, flatZ) {
        var point = iso(flatX, flatY);
        var x0 = width * 0.5;
        var y0 = height * 0.2;
        var z = self.size * 0.5 - flatZ + point.y * 0.75;
        var x = (point.x - self.size * 0.5) * 6;
        var y = (self.size - point.y) * 0.005 + 1;
        return {
            x: x0 + x / y,
            y: y0 + z / y
        };
    }
};



