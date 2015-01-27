
window.scene = require('town.js');

window.keys = {}; //keep track of all down keys

window.main = function main() {
	//---------- graphics setup --------------
	var canvas = document.getElementById("canvas");
	window.ctx = canvas.getContext('2d');

	var currentFactor = -1;

	function resized() {
		var parent = canvas.parentNode;
		var parentStyle = getComputedStyle(parent);
		var maxSize = {width:parent.clientWidth, height:parent.clientHeight};
		maxSize.width -= parseInt(parentStyle.getPropertyValue("padding-left")) + parseInt(parentStyle.getPropertyValue("padding-right"));
		maxSize.height -= parseInt(parentStyle.getPropertyValue("padding-top")) + parseInt(parentStyle.getPropertyValue("padding-bottom"));

		//want a size that is a multiple of 320 x 240
		var factor = Math.floor(Math.min(maxSize.width / 320, maxSize.height / 240)) | 0;
		if (factor < 1) factor = 1;

		if (factor != currentFactor) {
			currentFactor = factor;

			//actually set canvas size:
			//   ...both the display size:
			canvas.style.width = (320 * factor) + "px";
			canvas.style.height = (240 * factor) + "px";
			//   ...and the actual pixel count:
			canvas.width = 320 * factor;
			canvas.height = 240 * factor;

			//store the information into the drawing context for other code:
			ctx.width = 320 * factor;
			ctx.hight = 240 * factor;
			ctx.factor = factor;
		}
	}

	//install 'resized' to handle window resize events:
	window.addEventListener('resize', resized);
	//also call it now to set up a good initial size:
	resized();

	//---------- input handling --------------
	window.addEventListener('keydown', function(evt){
		keys[evt.keyCode] = true;
		scene && scene.key && scene.key(evt.keyCode, true);
		evt.preventDefault();
		return false;
	});

	window.addEventListener('keyup', function(evt){
		delete keys[evt.keyCode];
		scene && scene.key && scene.key(evt.keyCode, false);
		evt.preventDefault();
		return false;
	});

	//---------- main loop --------------

	var previous = NaN;
	function animate(timestamp) {
		if (isNaN(previous)) {
			previous = timestamp;
		}
		var elapsed = (timestamp - previous) / 1000.0;
		previous = timestamp;

		//Run update (variable timestep):
		scene && scene.update && scene.update(elapsed);

		//Draw:
		scene && scene.draw && scene.draw();

		window.requestAnimationFrame(animate);
	}

	window.requestAnimationFrame(animate);

};
