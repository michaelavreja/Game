/*

The Game Project Final

*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;
var clouds;
var mountains;
var trees_x;
var collectable;
var moon;

var game_score;
var flagpole;
var lives;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var jumpSound;
var applauseSound;

var platforms;

function preload() {
	soundFormats('mp3', 'wav');

	//load your sounds here
	jumpSound = loadSound('assets/jump.wav');
	jumpSound.setVolume(0.1);
	diamondSound = loadSound('assets/diamond.mp3');
	diamondSound.setVolume(0.1);
	flagpoleSound = loadSound('assets/flagpole.mp3');
	flagpoleSound.setVolume(0.1);
	fallSound = loadSound('assets/fall.mp3');
	fallSound.setVolume(0.1);
}

function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
	lives = 4;
	startGame();
}

function startGame() {
	gameChar_x = width/5;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
	trees_x = [100, 300, 500, 900, 1100, 1200, 1500, 1800, 1900];
	clouds = [
		{pos_x: 100, pos_y: 200},
		{pos_x: 400, pos_y: 130},
		{pos_x: 800, pos_y: 200},
		{pos_x: 1000, pos_y: 130},
		{pos_x: 1400, pos_y: 200},
		{pos_x: 1600, pos_y: 200},
		{pos_x: 2000, pos_y: 200},
		{pos_x: 2400, pos_y: 200}
	];
	moon = [2500, 100];
	stars = [
		{pos_x: 2400, pos_y: 90}
	]
	canyon = [
		{x_pos:700, width: 200},
		{x_pos:1000, width: 100},
		{x_pos:1300, width: 200},
		{x_pos:1700, width: 100}
	];

	platforms = [];
	platforms.push(createPlatforms(600, floorPos_y-100, 100));
	platforms.push(createPlatforms(1600, floorPos_y-100, 100));
	platforms.push(createPlatforms(2000, floorPos_y-100, 200));

	collectable = [
		{x_pos: 400, y_pos: floorPos_y, size: 40, isFound: false},
		{x_pos: 900, y_pos: floorPos_y, size: 40, isFound: false},
		{x_pos: 1300, y_pos: floorPos_y, size: 40, isFound: false},
		{x_pos: 1600, y_pos: floorPos_y, size: 40, isFound: false},
		{x_pos: 1800, y_pos: floorPos_y, size: 40, isFound: false}
	];
	mountains = [
		{pos_x: 300, height: 400},
		{pos_x: 600, height: 300},
		{pos_x: 900, height: 200},
		{pos_x: 1100, height: 400},
		{pos_x: 1300, height: 200},
		{pos_x: 1700, height: 200}
	]; 

	game_score = 0;

	flagpole = {isReached: false, x_pos: 2500};
	enemies = [];
	enemies.push(new Enemy(500, floorPos_y - 10, 100));
	enemies.push(new Enemy(1600, floorPos_y - 10, 100));
	enemies.push(new Enemy(2100, floorPos_y - 10, 100));
	enemies.push(new Enemy(2300, floorPos_y - 10, 100));
}

function draw()
{
	background('#4E6478'); // fill the sky blue
	noStroke();
	fill('#1E261B');
	rect(0, floorPos_y, width, height/4); // draw some green ground
	push();
	translate(scrollPos, 0);
	// Draw clouds.
	drawClouds();
	drawMoon();

	// Draw mountains.
	drawMountains();

	// Draw trees.
	drawTrees();

	for(var i = 0; i < platforms.length; i++) {
		platforms[i].draw();
	}

	// Draw canyons.
	for(var i = 0; i < canyon.length; i++) {
		drawCanyon(canyon[i]);
		checkCanyon(canyon[i]);
	}

	// Draw collectable items.
	for(var i = 0; i < collectable.length; i++) {
		if(collectable[i].isFound == false) {
			drawCollectable(collectable[i]);
			checkCollectable(collectable[i]);
		} 
	}
	renderFlagpole();
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].draw();

		var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
		if(isContact) {
			if(lives > 0) {
				startGame();
				lives--;
				break;
			}
		}
	}
	checkPlayerDie();

	// Draw game character.
	pop();
	drawGameChar();

	fill(255);
	noStroke();
	text(`Score: ${game_score}`, 40, 40);
	text(`Lives: ${lives}`, 40, 60);
	if(lives < 1) {
		push()
		textSize(40);
		text(`Game over. Press space to continue.`, 200, 250)
		lives = 0;
		pop()
		return;
	} else if(flagpole.isReached) {
		push()
		textSize(40);
		text(`Level complete. Press space to continue.`, 200, 250)
		pop()
		return;

	}

	// Logic to make the game character move or the background scroll.

	 if (isPlummeting == true && gameChar_y ==floorPos_y) {
			gameChar_y -= 150;
		}


	 if(gameChar_y !== floorPos_y) 
	 {
		var isContact = false;
		for(var i = 0; i < platforms.length; i++) 
		{
			if(platforms[i].checkContact(gameChar_world_x, gameChar_y) == true) 
			{
				isContact = true;
				isFalling = false;
				break;
			}
		}
		if(isContact == false) {
			gameChar_y+= 2;
			isFalling = true;
	    }
	} else {
		isFalling = false;
	}

	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
		
	}


	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}


	// Logic to make the game character rise and fall.
	if(flagpole.isReached == false) {
		checkFlagpole();
	}

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	checkPlayerDie();
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed(){
	if(flagpole.isReached && key == ' ') {
		nextLevel();
	}
	else if(lives == 0 && keyCode == 32) {
		startGame();
		lives = 4;
	}

	if(key == 'A' || keyCode == 37)
	{
		isLeft = true;
	}

	if(key == 'D' || keyCode == 39)
	{
		isRight = true;

	}
	if(keyCode == 32 || key == "W") {
		isPlummeting = true;
		jumpSound.play();
	}
}

function keyReleased()
{
	if(key == 'A' || keyCode == 37)
	{
		isLeft = false;
	}

	if(key == 'D' || keyCode == 39)
	{
		isRight = false;

	}
	if(keyCode == 32 || key == "W") {
		isPlummeting = false;
	}
}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	// draw game character
	if(isLeft && isFalling)
	{
		// add your jumping-left code
			//neck
		fill('#C7A590');
		rect(gameChar_x-4, gameChar_y-46, 8, 8);
		//head
		fill('#FFD3B8');
		ellipse(gameChar_x, gameChar_y-54, 20);
		//eyes
		fill('#3B3B3B');
		ellipse(gameChar_x-5, gameChar_y-54, 4);
		//hat
		fill('#9F3E00');
		rect(gameChar_x-13, gameChar_y-64, 26, 6);
		fill('#A87555');
		rect(gameChar_x-9, gameChar_y-76, 18, 12);
		//arms
		strokeWeight(6);
		stroke('#C7A590');
		line(gameChar_x+4, gameChar_y-28, gameChar_x-15, gameChar_y-49);
		noStroke();
		//legs
		fill('#4AAAFF');
		triangle(gameChar_x-7, gameChar_y-20, gameChar_x+6, gameChar_y-16, gameChar_x+8, gameChar_y-20);
		stroke('#4AAAFF');
		strokeWeight(8);
		line(gameChar_x, gameChar_y-20, gameChar_x+10, gameChar_y+4);
		line(gameChar_x-2, gameChar_y-20, gameChar_x-6, gameChar_y);
		noStroke();
		//body
		fill('#00498A'); 
		rect(gameChar_x-7, gameChar_y-40, 15, 20);
		//first arm
		stroke('#FFD3B8');
		strokeWeight(6);
		line(gameChar_x-4, gameChar_y-28, gameChar_x-18, gameChar_y-42);
		noStroke();
		//shoe
		fill('#00498A');
		rect(gameChar_x-13, gameChar_y-2, 9, 6);
		rect(gameChar_x+3, gameChar_y+4, 9, 6);
	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code
		//neck
		fill('#C7A590');
		rect(gameChar_x-4, gameChar_y-46, 8, 8);
		//head
		fill('#FFD3B8');
		ellipse(gameChar_x, gameChar_y-54, 20);
		//eyes
		fill('#3B3B3B');
		ellipse(gameChar_x+5, gameChar_y-54, 4);
		//hat
		fill('#9F3E00');
		rect(gameChar_x-13, gameChar_y-64, 26, 6);
		fill('#A87555');
		rect(gameChar_x-9, gameChar_y-76, 18, 12);
		//arms
		strokeWeight(6);
		stroke('#C7A590');
		line(gameChar_x-4, gameChar_y-28, gameChar_x+15, gameChar_y-49);
		noStroke();
		//legs
		fill('#4AAAFF');
		triangle(gameChar_x-7, gameChar_y-20, gameChar_x-6, gameChar_y-16, gameChar_x+8, gameChar_y-20);
		stroke('#4AAAFF');
		strokeWeight(8);
		line(gameChar_x, gameChar_y-20, gameChar_x-6, gameChar_y+4);
		line(gameChar_x+2, gameChar_y-20, gameChar_x+10, gameChar_y);
		noStroke();
		//body
		fill('#00498A'); 
		rect(gameChar_x-7, gameChar_y-40, 15, 20);
		//first arm
		stroke('#FFD3B8');
		strokeWeight(6);
		line(gameChar_x+5, gameChar_y-28, gameChar_x+18, gameChar_y-42);
		noStroke();
		//shoe
		fill('#00498A');
		rect(gameChar_x-8, gameChar_y+4, 9, 6);
		rect(gameChar_x+10, gameChar_y-2, 9, 6);
	}
	else if(isLeft)
	{
		// add your walking left code	
		//neck
		fill('#C7A590');
		rect(gameChar_x-4, gameChar_y-46, 8, 8);
		//head
		fill('#FFD3B8');
		ellipse(gameChar_x, gameChar_y-54, 20);
		//eyes
		fill('#3B3B3B');
		ellipse(gameChar_x-5, gameChar_y-54, 4);
		//hat
		fill('#9F3E00');
		rect(gameChar_x-13, gameChar_y-64, 26, 6);
		fill('#A87555');
		rect(gameChar_x-9, gameChar_y-76, 18, 12);
		//arms
		strokeWeight(6);
		stroke('#C7A590');
		line(gameChar_x+3, gameChar_y-36, gameChar_x+16, gameChar_y-20);
		noStroke();
		//legs
		fill('#4AAAFF');
		triangle(gameChar_x-7, gameChar_y-20, gameChar_x+6, gameChar_y-16, gameChar_x+8, gameChar_y-20);
		stroke('#4AAAFF');
		strokeWeight(8);
		line(gameChar_x-2, gameChar_y-20, gameChar_x-12, gameChar_y);
		line(gameChar_x, gameChar_y-20, gameChar_x+13, gameChar_y);
		noStroke();
		//body
		fill('#00498A'); 
		rect(gameChar_x-7, gameChar_y-40, 15, 20);
		//first arm
		stroke('#FFD3B8');
		strokeWeight(6);
		line(gameChar_x-2, gameChar_y-34, gameChar_x-16, gameChar_y-20);
		noStroke();
		//shoe
		fill('#00498A');
		rect(gameChar_x-20, gameChar_y-2, 9, 6);
		rect(gameChar_x+6, gameChar_y-2, 9, 6);
	}
	else if(isRight)
	{
		// add your walking right code
		//neck
		fill('#C7A590');
		rect(gameChar_x-4, gameChar_y-46, 8, 8);
		//head
		fill('#FFD3B8');
		ellipse(gameChar_x, gameChar_y-54, 20);
		//eyes
		fill('#3B3B3B');
		ellipse(gameChar_x+5, gameChar_y-54, 4);
		//hat
		fill('#9F3E00');
		rect(gameChar_x-13, gameChar_y-64, 26, 6);
		fill('#A87555');
		rect(gameChar_x-9, gameChar_y-76, 18, 12);
		//arms
		strokeWeight(6);
		stroke('#C7A590');
		line(gameChar_x-2, gameChar_y-34, gameChar_x-16, gameChar_y-20);
		noStroke();
		//legs
		fill('#4AAAFF');
		triangle(gameChar_x-7, gameChar_y-20, gameChar_x-6, gameChar_y-16, gameChar_x+8, gameChar_y-20);
		stroke('#4AAAFF');
		strokeWeight(8);
		line(gameChar_x, gameChar_y-20, gameChar_x-12, gameChar_y);
		line(gameChar_x+2, gameChar_y-20, gameChar_x+13, gameChar_y);
		noStroke();
		//body
		fill('#00498A'); 
		rect(gameChar_x-7, gameChar_y-40, 15, 20);
		//first arm
		stroke('#FFD3B8');
		strokeWeight(6);
		line(gameChar_x+3, gameChar_y-34, gameChar_x+16, gameChar_y-20);
		noStroke();
		//shoe
		fill('#00498A');
		rect(gameChar_x-14, gameChar_y-2, 9, 6);
		rect(gameChar_x+12, gameChar_y-2, 9, 6);
	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
		//neck
		fill('#C7A590');
		rect(gameChar_x-4, gameChar_y-46, 8, 8);
		//head
		fill('#FFD3B8');
		ellipse(gameChar_x, gameChar_y-54, 20);
		//eyes
		fill('#3B3B3B');
		ellipse(gameChar_x-4, gameChar_y-54, 4, 6);
		ellipse(gameChar_x+4, gameChar_y-54, 4, 6);
		//hat
		fill('#9F3E00');
		rect(gameChar_x-13, gameChar_y-64, 26, 6);
		fill('#A87555');
		rect(gameChar_x-9, gameChar_y-76, 18, 12);
		//arms
		stroke('#FFD3B8');
		strokeWeight(6);
		line(gameChar_x-6, gameChar_y-36, gameChar_x-20, gameChar_y-56);
		line(gameChar_x+6, gameChar_y-36, gameChar_x+20, gameChar_y-56);
		noStroke();
		//legs
		triangle(gameChar_x-7,gameChar_y-20, gameChar_x, gameChar_y-16, gameChar_x+6, gameChar_y-20);
		stroke('#4AAAFF');
		strokeWeight(8);
		line(gameChar_x, gameChar_y-20, gameChar_x-14, gameChar_y-4);
		line(gameChar_x+2, gameChar_y-20, gameChar_x+15, gameChar_y-4);
		noStroke();
		//body
		noStroke();
		fill('#00498A'); 
		rect(gameChar_x-7, gameChar_y-40, 15, 20);
		//shoe
		fill('#00498A');
		rect(gameChar_x-20, gameChar_y-6, 9, 6);
		rect(gameChar_x+12, gameChar_y-6, 9, 6);
	}
	else
	{
		// add your standing front facing code
		//neck
		fill('#C7A590');
		rect(gameChar_x-4, gameChar_y-46, 8, 8);
		//head
		fill('#FFD3B8');
		ellipse(gameChar_x, gameChar_y-54, 20);
		//eyes
		fill('#3B3B3B');
		ellipse(gameChar_x-4, gameChar_y-54, 4, 6);
		ellipse(gameChar_x+4, gameChar_y-54, 4, 6);
		//hat
		fill('#9F3E00');
		rect(gameChar_x-13, gameChar_y-64, 26, 6);
		fill('#A87555');
		rect(gameChar_x-9, gameChar_y-76, 18, 12);
		//arms
		stroke('#FFD3B8');
		strokeWeight(6);
		line(gameChar_x-6, gameChar_y-36, gameChar_x-16, gameChar_y-18);
		line(gameChar_x+6, gameChar_y-36, gameChar_x+16, gameChar_y-18);
		//body
		noStroke();
		fill('#00498A');
		rect(gameChar_x-7, gameChar_y-40, 15, 20);
		//legs
		fill('#4AAAFF');
		rect(gameChar_x+1, gameChar_y-20, 7, 23);
		rect(gameChar_x-7, gameChar_y-20, 7, 23);
		triangle(gameChar_x-7,gameChar_y-20, gameChar_x, gameChar_y-16, gameChar_x+6, gameChar_y-20);
		//shoe
		fill('#00498A');
		rect(gameChar_x-6, gameChar_y-2, 9, 6);
		rect(gameChar_x+6, gameChar_y-2, 9, 6);
	}
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds(){
	for(i = 0; i < clouds.length; i++) {
		//shadow cloud1
		fill(186, 186, 186);
		ellipse(clouds[i].pos_x+200, clouds[i].pos_y-50, 80, 80);
		ellipse(clouds[i].pos_x+240, clouds[i].pos_y-20, 40, 40);
		ellipse(clouds[i].pos_x+270, clouds[i].pos_y-60, 80, 80);
		//white cloud1
		fill(217, 217, 217);
		ellipse(clouds[i].pos_x+200, clouds[i].pos_y-60, 80, 70);
		ellipse(clouds[i].pos_x+240, clouds[i].pos_y-30, 40, 40);
		ellipse(clouds[i].pos_x+270, clouds[i].pos_y-70, 80, 70);
		ellipse(clouds[i].pos_x+240, clouds[i].pos_y-90, 70, 60);
		//cloud2
		//shadow cloud
		fill(173, 173, 173);
		ellipse(clouds[i].pos_x+300, clouds[i].pos_y+40, 60, 60);
		ellipse(clouds[i].pos_x+325, clouds[i].pos_y+65, 30, 20);
		ellipse(clouds[i].pos_x+340, clouds[i].pos_y+35, 60, 60);
		//white cloud
		fill(194, 194, 194);
		ellipse(clouds[i].pos_x+300, clouds[i].pos_y+35, 60, 50);
		ellipse(clouds[i].pos_x+325, clouds[i].pos_y+60, 30, 20);
		ellipse(clouds[i].pos_x+340, clouds[i].pos_y+30, 60, 50);
	}
}

// Function to draw mountains objects.
function drawMountains(){
	for(i = 0; i < mountains.length; i++) {
		fill('#3C4854');
		triangle(mountains[i].pos_x+230, 432, mountains[i].pos_x+380, 200, mountains[i].pos_x+530, 432);
		fill('#2F3942');
		triangle(mountains[i].pos_x+150, 432, mountains[i].pos_x+305, 150, mountains[i].pos_x+450, 432);
		fill('#ADADAD');
		triangle(mountains[i].pos_x+277, 200, mountains[i].pos_x+305, 150, mountains[i].pos_x+331, 200);
		triangle(mountains[i].pos_x+277, 200, mountains[i].pos_x+305, 230, mountains[i].pos_x+331, 200);
	}
}

// Function to draw trees objects.
function drawTrees() {
	for(i = 0; i < trees_x.length; i++) {
		fill(30, 38, 27);
		rect(trees_x[i], 346, 25, 90);
		triangle(trees_x[i]-20, 415, trees_x[i]+15, 280, trees_x[i]+50, 415);
		fill('#2E3B2A');
		triangle(trees_x[i]-24, 418, trees_x[i]+11, 280, trees_x[i]+46, 418);
	}
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
		fill('#2F3942');
		rect(t_canyon.x_pos, 432, t_canyon.width-50, 100);
		//
		fill('#9F1F00');
		rect(t_canyon.x_pos, 450, t_canyon.width-50, 80);
		//
		fill('#BF3900');
		rect(t_canyon.x_pos, 470, t_canyon.width-50, 80);
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
	if(gameChar_world_x > t_canyon.x_pos && gameChar_world_x < (t_canyon.x_pos + t_canyon.width-50) && gameChar_y >= floorPos_y) {
		isPlummeting = true;
		gameChar_y++;
		gameChar_world_x = (gameChar_world_x > t_canyon.x_pos) && gameChar_world_x < (t_canyon.x_pos + t_canyon.width-50);
	}
}

// Function to draw moon objects.
function drawMoon() {
	fill('#C4C4C4');
	ellipse(moon[0], moon[1], 60);
	fill('#4E6478');
	ellipse(moon[0]-10, moon[1], 60);
	fill('#C4C4C4');
	//stars
	triangle(stars[0].pos_x, stars[0].pos_y, stars[0].pos_x+3, stars[0].pos_y-10, stars[0].pos_x+5, stars[0].pos_y);
	triangle(stars[0].pos_x, stars[0].pos_y, stars[0].pos_x+3, stars[0].pos_y+10, stars[0].pos_x+5, stars[0].pos_y);
	triangle(stars[0].pos_x, stars[0].pos_y, stars[0].pos_x+15, stars[0].pos_y, stars[0].pos_x+5, stars[0].pos_y-2);
	triangle(stars[0].pos_x, stars[0].pos_y, stars[0].pos_x-10, stars[0].pos_y, stars[0].pos_x+1, stars[0].pos_y-2);
	fill('#D6D6D6');
	triangle(stars[0].pos_x+60, stars[0].pos_y+30, stars[0].pos_x+63, stars[0].pos_y+20, stars[0].pos_x+65, stars[0].pos_y+30);
	triangle(stars[0].pos_x+60, stars[0].pos_y+30, stars[0].pos_x+63, stars[0].pos_y+40, stars[0].pos_x+65, stars[0].pos_y+30);
	triangle(stars[0].pos_x+60, stars[0].pos_y+30, stars[0].pos_x+78, stars[0].pos_y+30, stars[0].pos_x+65, stars[0].pos_y+28);
	triangle(stars[0].pos_x+60, stars[0].pos_y+30, stars[0].pos_x+50, stars[0].pos_y+30, stars[0].pos_x+61, stars[0].pos_y+28);
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
		// Draw collectable items
		fill('#5398BA');
		triangle(t_collectable.x_pos, t_collectable.y_pos, t_collectable.x_pos-24, t_collectable.y_pos-30, t_collectable.x_pos+24, t_collectable.y_pos-30);
		triangle(t_collectable.x_pos, t_collectable.y_pos-40, t_collectable.x_pos-14, t_collectable.y_pos-40, t_collectable.x_pos-10, t_collectable.y_pos-30);
		triangle(t_collectable.x_pos+14, t_collectable.y_pos-40, t_collectable.x_pos, t_collectable.y_pos-40, t_collectable.x_pos+10, t_collectable.y_pos-30);
		fill('#68BEE8');
		triangle(t_collectable.x_pos, t_collectable.y_pos, t_collectable.x_pos-12, t_collectable.y_pos-30, t_collectable.x_pos+12, t_collectable.y_pos-30);
		fill('#60AFD6');
		triangle(t_collectable.x_pos, t_collectable.y_pos-40, t_collectable.x_pos-12, t_collectable.y_pos-30, t_collectable.x_pos+12, t_collectable.y_pos-30);
		triangle(t_collectable.x_pos-14, t_collectable.y_pos-40, t_collectable.x_pos-24, t_collectable.y_pos-30, t_collectable.x_pos-8, t_collectable.y_pos-30);
		triangle(t_collectable.x_pos+14, t_collectable.y_pos-40, t_collectable.x_pos+24, t_collectable.y_pos-30, t_collectable.x_pos+8, t_collectable.y_pos-30);

}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
	if(dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 20) {
		diamondSound.play();
		t_collectable.isFound = true;
		game_score += 1;
	}
}


//FLAGPOLE
function renderFlagpole(){
	push();
	strokeWeight(5);
	stroke(180);
	line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y-250);
	noStroke();
	fill(255, 0, 255);
	if(flagpole.isReached){
		rect(flagpole.x_pos, floorPos_y-250, 50, 50);
	} else {
		rect(flagpole.x_pos, floorPos_y-50, 50, 50);
	}
	pop();
}

function checkFlagpole(){
	var d = abs(gameChar_world_x - flagpole.x_pos);
	if(d < 15) {
		flagpoleSound.play();
		flagpole.isReached = true; 
	}
}

//ENEMIES
function Enemy(x, y, range) {
	this.x = x;
	this.y = y;
	this.range = range;

	this.currentX = x;
	this.inc = 1;

	this.update = function() {
		this.currentX += this.inc;
		if(this.currentX >= this.x + this.range) {
			this.inc = -1;
		} else if(this.currentX < this.x) {
			this.inc = 1;
		}
	}
	this.draw = function() {
		this.update();
		push();
		fill(0); 
		ellipse(this.currentX, this.y-10, 35, 35);
		fill('#00DF25');
		ellipse(this.currentX+10, this.y+7, 13, 7);
		ellipse(this.currentX-10, this.y+7, 13, 7);
		fill('#D9D9D9');
		ellipse(this.currentX-7, this.y-10, 8, 13);
		ellipse(this.currentX+7, this.y-10, 8, 13);
		fill(0);
		ellipse(this.currentX-7, this.y-11, 5, 10);
		ellipse(this.currentX+7, this.y-11, 5, 10);
		fill('#D9D9D9');
		ellipse(this.currentX-6, this.y-11, 2, 5);
		ellipse(this.currentX+6, this.y-11, 2, 5);
		stroke(0);
		strokeWeight(3);
		line(this.currentX,this.y-12, this.currentX-9, this.y-17);
		line(this.currentX,this.y-12, this.currentX+9, this.y-17);
		pop();
	}
	this.checkContact = function(gc_x, gc_y) {
		var d = dist(gc_x, gc_y, this.currentX, this.y)
		if(d < 20) {
			fallSound.play();
			return true;
		}
		return false;
	}
}

//PLATFORMS
function createPlatforms(x, y, length) {
	var p = {
		x: x,
		y: y,
		length: length,
		draw: function() {
			push();
			stroke(51);
			strokeWeight(2);
			fill('#A87555');
			rect(this.x, this.y, this.length, 20, 5);
			pop();
		},
		checkContact: function(gc_x, gc_y) {
			if(gc_x > this.x && gc_x < this.x + this.length) {
				var d = this.y - gc_y;
				if(d >= 0 && d < 5) {
					return true;
				}
			}
			return false;
		}
	}
	return p;
}

//Check Player Die
function checkPlayerDie() {
	if(gameChar_y > 576) {
		fallSound.play();
		lives -= 1;
		if(lives > 0) {
			startGame();
		}
	}
}

/* COMMENTS
    I really enjoyed making this game and I'm even curious to make a few more levels. As extensions, I added many sounds, platforms and enemies. 
  It was really good for me to practice Javascript through this game, because every step I took was really fun and interactive. I find this 
  process of coding and drawing helpful, because it also challenged my creativity, too! 
	I found difficult making the platforms and enemies, because I had to use the Factory Pattern and Constructor functions.
	I found these a little bit hard to understand at first, but with practice everything made sense. So, now I understand how important
	these constructor functions are and useful when you code or when you want to multiply many objects in a clean way. 
*/