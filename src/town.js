
var TileSize = 20;
var PlayerSpeed = 4.0; //tiles per second

var heroImgs = [
	require("../img/hero1.png"),
	require("../img/hero2.png"),
	require("../img/hero3.png")
];

var tilesImg = require("../img/ground.png");

var map = [
	[6,1,1,1,1,1,1,1,8],
	[3,4,4,4,4,4,4,4,3],
	[3,4,4,6,7,8,4,4,3],
	[3,4,4,5,4,3,4,4,3],
	[3,4,4,3,4,3,4,4,3],
	[3,4,4,4,4,5,4,4,3],
	[3,4,4,0,1,2,4,4,3],
	[3,4,4,4,4,4,4,4,3],
	[3,4,4,4,4,4,4,4,3],
	[3,4,4,4,4,4,4,4,3],
	[0,1,1,1,1,1,1,1,2]
];

//camera position (in tiles):
var camera = {
	x: 4.5,
	y: 5.5
};

//player position (in tiles):
var player = {
	x: 4.5,
	y: 5.5,
	frameAcc: 0.0,
	frame: 0,
};


function draw() {
	var ctx = sald.ctx;

	//First, clear the screen:
	ctx.setTransform(ctx.factor,0, 0,ctx.factor, 0,0);
	ctx.fillStyle = "#f0f"; //bright pink, since this *should* be drawn over

	ctx.fillRect(0, 0, 320, 240); //<--- hardcoded size. bad style!

	//don't interpolate scaled images. Let's see those crisp pixels:
	ctx.imageSmoothingEnabled = false;

	//Now transform into camera space:
	//  (units are tiles, +x is right, +y is up, camera is at the center:
	ctx.setTransform(
		//x direction:
			ctx.factor * TileSize, 0,
		//y direction (sign is negative to make +y up):
			0,-ctx.factor * TileSize,
		//offset (in pixels):
			ctx.factor * (320 / 2 - Math.round(camera.x * TileSize)),
			ctx.factor * (240 / 2 + Math.round(camera.y * TileSize)) //<-- y is added here because of sign flip
		);
	
	(function drawTiles() {
		//Find bounds of current view (avoid drawing offscreen tiles):
		var minTile = {
			x: Math.floor(camera.x - (320 / 2 / TileSize)) | 0,
			y: Math.floor(camera.y - (240 / 2 / TileSize)) | 0
		};
		var maxTile = {
			x: Math.floor(camera.x + (320 / 2 / TileSize)) | 0,
			y: Math.floor(camera.y + (240 / 2 / TileSize)) | 0
		};

		//loop over all tiles in the view and draw them:
		for (var ty = minTile.y; ty <= maxTile.y; ++ty) {
			for (var tx = minTile.x; tx <= maxTile.x; ++tx) {
				/*
				//Disco Mode:
				ctx.fillStyle = "rgb("
					+ Math.round(Math.random() * 256) + ","
					+ Math.round(Math.random() * 256) + ","
					+ Math.round(Math.random() * 256) + ")";
				ctx.fillRect(tx, ty, 1, 1);
				*/

				var idx;
				if (ty >= 0 && ty < map.length && tx >= 0 && tx < map[ty].length) {
					idx = map[ty][tx];
				} else {
					idx = 4;
				}

				ctx.save();
				//locally flip the 'y' axis since images draw with upper-left origins:
				ctx.transform(1,0, 0,-1, tx, ty+1);

				ctx.drawImage(tilesImg, (idx % 3) * TileSize, ((idx / 3) | 0) * TileSize, TileSize, TileSize, 0,0, 1, 1);
				ctx.restore();
			}
		}
	})();

	//draw the player:
	(function draw_player() {
		var img = heroImgs[player.frame];
		ctx.save();
		//locally flip the 'y' axis since images draw with upper-left origins:
		ctx.transform(1,0, 0,-1,
			Math.round(player.x * TileSize - 0.5 * img.width) / TileSize,
			Math.round(player.y * TileSize - 0.5 * img.height) / TileSize + 1
			);
		ctx.drawImage(img,
			0, 0, img.width, img.height,
			0,0,1,1);
		ctx.restore();
	})();

	//rounded corners:
	ctx.setTransform(ctx.factor,0, 0,ctx.factor, 0,0);
	ctx.fillStyle = "#452267"; //background color of page
	ctx.fillRect(0,0, 1,2);
	ctx.fillRect(1,0, 1,1);

	ctx.fillRect(0,238, 1,2);
	ctx.fillRect(1,239, 1,1);

	ctx.fillRect(319,0, 1,2);
	ctx.fillRect(318,0, 1,1);

	ctx.fillRect(319,238, 1,2);
	ctx.fillRect(318,239, 1,1);
	

}

function update(elapsed) {
	var keys = sald.keys;

	var command = {
		x:0.0,
		y:0.0
	};
	//First column is 'wasd', second is arrow keys:
	if (keys[65] || keys[37]) command.x -= 1.0;
	if (keys[68] || keys[39]) command.x += 1.0;
	if (keys[83] || keys[40]) command.y -= 1.0;
	if (keys[87] || keys[38]) command.y += 1.0;
	
	if (command.x != 0.0 || command.y != 0.0) {
		var len = Math.sqrt(command.x * command.x + command.y * command.y);
		command.x /= len;
		command.y /= len;

		player.x += command.x * PlayerSpeed * elapsed;
		player.y += command.y * PlayerSpeed * elapsed;

		//alternate player frames 1 and 2 if walking:
		player.frameAcc = (player.frameAcc + (elapsed * PlayerSpeed) / 0.3) % 2;
		player.frame = 1 + Math.floor(player.frameAcc);
	} else {
		//player is stopped:
		player.frame = 0;
	}

	//pan camera if player is within 3 tiles of the edge:
	camera.x = Math.max(camera.x, player.x - (320 / TileSize / 2 - 3));
	camera.x = Math.min(camera.x, player.x + (320 / TileSize / 2 - 3));
	camera.y = Math.max(camera.y, player.y - (240 / TileSize / 2 - 3));
	camera.y = Math.min(camera.y, player.y + (240 / TileSize / 2 - 3));

}

function key(key, state) {
	//don't do anything
}


module.exports = {
	draw:draw,
	update:update,
	key:key
};
