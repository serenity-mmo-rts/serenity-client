// resize the canvas
window.addEventListener('resize', reresize, false);

function setup() {
	stage.canvas.height = window.innerHeight;    
    stage.canvas.width = window.innerWidth;  
	canvas_height = window.innerHeight; 
	canvas_width = window.innerWidth; 	
}

function reresize() {
	stage.canvas.height = window.innerHeight;    
    stage.canvas.width = window.innerWidth;  
	canvas_height = window.innerHeight; 
	canvas_width = window.innerWidth; 
	kill_child = menu_container.removeAllChildren();
	initHeader();
	initMenu(); 		
}

//// global variables
var stage;
var mapData;
var socket;

///// PARAMETERS /////
// Canvas
var canvas_height; 
var canvas_width; 
var tile_height = 32;
var tile_width = 64;

// Position
var global_offsetX = 0;
var global_offsetY = 0;
var global_buildXpos;
var global_buildYpos;
var local_buildXpos = (Math.floor(360/64))*64;
var local_buildYpos = (Math.floor(161/32))*32;

var local_buildXpos2;
var local_buildYpos2;

// Others
var border = 0;
var building_counter = 0;
var tile_size = 90;
var nr_menu_child;

// Ressources
var amount_of_wood = 20;
var tick_counter = 0;

///// BOOLEANS /////
var build = false;
var allowedToBuild = false;
var hit_object = false;
var destroy = false;
var move = false;
var moving = false;
var destroyed = false;

///// OBJECTS /////
var current_object;
var grid_con;
var ground;
var menu_buttons;


///// ARRAYS /////
var collitionData = [];
var x_edge = [];
var y_edge = [];
var Matrix = [];
var Xlane =[];
var Ylane =[];	
var Col_ArrX = [];
var Col_ArrY = [];
var truthArr = [false,true];



// Init function (main loop more or less)
function init() {

	// initialize stage and containers
	stage = new createjs.Stage("canvas");
	
	// resize
	setup();
	
	main_container = new createjs.Container();
	menu_container = new createjs.Container();
	
	
	map_container = new createjs.Container();
	obj_container = new createjs.Container();
	grid_container = new createjs.Container();		
	
	stage.mouseMoveOutside = true;
	main_container.mouseMoveOutside = true;
	map_container.mouseMoveOutside = true;
	obj_container.mouseMoveOutside = true;
	//stage.enableMouseOver(10);
		
	// initialize image data
	//mapData = mapDataJson;	
    
    socket = io.connect('http://localhost:8000');
    socket.on('mapData', onMapDataReceived);
}


function onMapDataReceived(data){
    mapData = data;
	tileset = new Image();	
	tileset.src = mapData.tilesets[0].image;
	tileset.onLoad = initLayers();
	
	// init Grid	
	initGrid();
	menu_buttons = initMenu();
	initHeader();
	Matrix = getMatrix();
	
	// inherit
	main_container.addChild(map_container,obj_container);	
	stage.addChild(main_container,menu_container);
	
					
	// event listener for dragging map
	main_container.addEventListener("mousedown", handleMousedownMap);

	
	// set FPS and call tick 
	createjs.Ticker.setFPS(24);
	createjs.Ticker.addEventListener("tick", tick);		

	
}


// make button and add it to button container
function initMenu(){
	baseMenu_container = new createjs.Container();
	baseMenu_container.name = "menu";
	
	build_button_container = new createjs.Container();
	build_menu_container = new createjs.Container();
	build_menu_grid_container = new createjs.Container();
	

	// base menu	
	var base_menu_img = new createjs.Bitmap("resources/icons/Globe.png");
	base_menu_img.x = 0;
	base_menu_img.y = canvas_height - 128;		
	var base_menu_form = new createjs.Shape();
	base_menu_form.graphics.drawCircle(64, canvas_height - 64,64);
	
	// delete button
	var delete_button_img = new createjs.Bitmap("resources/icons/destroy.png");
	delete_button_img.x = 5;
	delete_button_img.y = canvas_height - 128 -64 -20;
	delete_button_img.scaleX = 0.5;
	delete_button_img.scaleY = 0.5;	
	
	// move button
	var move_button_img = new createjs.Bitmap("resources/icons/move.png");
	move_button_img.x = 5 + 64;
	move_button_img.y = canvas_height - 128 -64;	
	move_button_img.scaleX = 0.5;
	move_button_img.scaleY = 0.5;	
	
	// build button
	
	var build_button_img = new createjs.Bitmap("resources/icons/build.png");
	build_button_img.x = 5 + 64 +64;
	build_button_img.y = canvas_height - 128 - 64 +40;
	build_button_img.scaleX = 0.5;
	build_button_img.scaleY = 0.5;		
	
	// build menu	
	var build_menu_main_rect = new createjs.Shape();
	build_menu_main_rect.graphics.beginFill("#F5F7C4").drawRoundRect(220,120,665,437,30);

	var build_menu_header_rect1 = new createjs.Shape();	
	build_menu_header_rect1.graphics.beginFill("#eee081").drawRoundRectComplex(220,120,280,30,30,0,0,0);
	
	var build_menu_header_rect2 = new createjs.Shape();
	build_menu_header_rect2.graphics.beginFill("#eed781").drawRoundRectComplex(410,120,280,30,0,0,0,0);
	
	var build_menu_header_rect3 = new createjs.Shape();
	build_menu_header_rect3.graphics.beginFill("#eece81").drawRoundRectComplex(600,120,285,30,0,30,0,0);
	
	// grid	
		// horizontal
		xstart = 230; ystart = 160; yend = 547; 
	for (var x = 0; x<6; x++ ){	
		var menu_grid = new createjs.Shape();	
		menu_grid.graphics.setStrokeStyle(1, "butt", "miter").beginStroke("#000000").moveTo(xstart,ystart).lineTo(xstart,yend);	
		xstart += 129;
		menu_grid.alpha = 0.75;
		build_menu_grid_container.addChild(menu_grid);
	}
		// vertical
	xstart = 230; xend = 875; ystart = 160;  
	for (var x = 0; x<4; x++ ){	
		var menu_grid = new createjs.Shape();	
		menu_grid.graphics.setStrokeStyle(1, "butt", "miter").beginStroke("#000000").moveTo(xstart,ystart).lineTo(xend,ystart);	
		ystart += 129;
		menu_grid.alpha = 0.75;
		build_menu_grid_container.addChild(menu_grid);
	}
	
	// images 	
	var bakery_preview = new createjs.Bitmap("resources/objects/bakery1.png");
		bakery_preview.x = 231;
		bakery_preview.y = 161;	

	var bank_preview = new createjs.Bitmap("resources/objects/bank1.png");
		bank_preview.x = 231 + 129;
		bank_preview.y = 161;
		bank_preview.scaleX = (2/3);
		bank_preview.scaleY = (2/3);
		
	var burger_preview = new createjs.Bitmap("resources/objects/burger1.png");
		burger_preview.x = 231 + (2*129);
		burger_preview.y = 161;
	
	var butcher_preview = new createjs.Bitmap("resources/objects/butcher1.png");
		butcher_preview.x = 231 + (3*129);
		butcher_preview.y = 161;
	
	build_menu_container.addChild(build_menu_main_rect,build_menu_header_rect3,build_menu_header_rect2,build_menu_header_rect1,build_menu_grid_container,bakery_preview,bank_preview,burger_preview,butcher_preview);
	build_button_container.addChild(build_button_img);	
	baseMenu_container.addChild(base_menu_img,base_menu_form);
	menu_container.addChild(baseMenu_container);
	
	// event listener for main menu
	baseMenu_container.addEventListener("click",click_main_menu);	
	
	
	return [delete_button_img,move_button_img,build_button_container,build_menu_container];
	
}


function click_main_menu() { 
	nr_child = menu_container.getNumChildren();
	if (nr_child < 3){
	menu_container.addChild(menu_buttons[0],menu_buttons[1],menu_buttons[2]);
	menu_buttons[0].addEventListener("click", deletehouse);
	menu_buttons[1].addEventListener("click", movehouse);	
	menu_buttons[2].addEventListener("click",click_build_menu);
	stage.update();
	}
	else {
		for (var c = 2; c<5; c++) {
		kill_child = menu_container.getChildAt(2);
		menu_container.removeChild(kill_child);
		}
	
	}
}


function click_build_menu() { 
	nr_child = menu_container.getNumChildren();
	if (nr_child < 6){
	menu_container.addChild(menu_buttons[3]);
	menu_buttons[3].children[6].addEventListener("click",buildhouse);	
	stage.update();
	}
	else {
	kill_child = menu_container.getChildAt(5);
	menu_container.removeChild(kill_child);
	}
}



function initHeader(){
	// headermenu
	header_container = new createjs.Container();
	header_container.name = "header";
	var header_rect = new createjs.Shape();
	header_rect.graphics.beginFill("#F5F7C4").drawRoundRect((canvas_width/2) -400,0,800,32,16);
	
	;
	
	woodi = new Image();
	woodi.src = "resources/icons/Wood_02.png";	
	wood = new createjs.Bitmap(woodi);		
	wood.x = (canvas_width/2) -400 +10;
	wood.y = 0;
	wood.scaleX = 0.5;
	wood.scaleY = 0.5;
	
	wood_amount = amount_of_wood.toString();
	var wood_label = new createjs.Text(wood_amount, "bold 16px Arial", "#000000");
	wood_label.x = (canvas_width/2) -400 +50;
	wood_label.y = 10;			
	
	header_container.addChild(header_rect,wood,wood_label);
	menu_container.addChild(header_container);
}


 
// loading layers
function initLayers() {
	// compose EaselJS tileset from image (fixed 64x64 now, but can be parametized)
	var imageData = {
		images : [ tileset ],
		frames : {
			width : 64,//in pixel
			height :64,//in pixel
		}
	};
	// create spritesheet
	var tilesetSheet = new createjs.SpriteSheet(imageData);
	
	// loading layer 1 and 2
	for (var idx = 0; idx < mapData.layers.length; idx++) {
		var layerData = mapData.layers[idx];
		initLayer(layerData, tilesetSheet, mapData.tilewidth, mapData.tileheight);
	}
}


// drawing layer data
function initLayer(layerData, tilesetSheet, tilewidth, tileheight) {
	for ( var y = 0; y < layerData.height; y++) {
		for ( var x = 0; x < layerData.width; x++) {
			// create a new Bitmap for each cell
			var cellBitmap = new createjs.BitmapAnimation(tilesetSheet);			
			// layer data has single dimension array
			var idx = x + y * layerData.width;
			// tilemap data uses 1 as first value, EaselJS uses 0 (sub 1 to load correct tile)
			cellBitmap.gotoAndStop(layerData.data[idx] - 1);
			// isometrix tile positioning based on X Y order from Tiled
			cellBitmap.x = x * tilewidth/2 - y * tilewidth/2 -32; // center X
			cellBitmap.y = y * tileheight/2 + x * tileheight/2 -32 - 1440;  // center Y
			// add bitmap to container
			map_container.addChild(cellBitmap);
			
		}
	}		
}


function initGrid() {

	for ( var y = 0; y < 90; y++) {	
	
	diamond = {
		upX : 0,
		upY : -1440,
		riX : 32,
		riY : -1424,
		loX : 0,
		loY : -1408,
		leX : -32, 
		leY : -1424
	}
	
		diamond.upX = diamond.leX - (y*32);
		diamond.upY = diamond.leY + (y*16);
		diamond.riX = diamond.riX - (y*32);
		diamond.riY = diamond.riY + (y*16);
		diamond.loX = diamond.loX - (y*32)
		diamond.loY = diamond.loY + (y*16);	
		diamond.leX = diamond.leX - (y*32)
		diamond.leY = diamond.leY + (y*16);
	
	
		for ( var x = 0; x < 90; x++) {			
			
			
		// wired exeption for first row
		if (x == 0) {		
			var grid = new createjs.Shape();
			grid.graphics.setStrokeStyle(1, "butt", "miter").beginStroke("#000000").moveTo(0- (y*32),- 1440 + (y*16)).lineTo(32 - (y*32),16- 1440 + (y*16)).lineTo(0 - (y*32),32- 1440 + (y*16)).lineTo(-32 - (y*32),16- 1440 + (y*16)).lineTo(0 - (y*32),- 1440 + (y*16));	
			grid.alpha = 0.1;
			grid_container.addChild(grid);
		}	
		else {
		// add grid
			var grid = new createjs.Shape();
			grid.graphics.setStrokeStyle(1, "butt", "miter").beginStroke("#000000").moveTo(diamond.upX,diamond.upY).lineTo(diamond.riX,diamond.riY).lineTo(diamond.loX,diamond.loY).lineTo(diamond.leX,diamond.leY).lineTo(diamond.upX,diamond.upY);			
			grid.alpha = 0.1;
			grid_container.addChild(grid);		
		}
			
			diamond.upX = diamond.riX;
			diamond.upY = diamond.riY;
			diamond.leX = diamond.loX;
			diamond.leY = diamond.loY;
			diamond.riX = diamond.riX +32;
			diamond.riY = diamond.riY +16;
			diamond.loX = diamond.loX +32;
			diamond.loY = diamond.loY +16;
		}
	}		
}


// event Listener for dragging map
function handleMousedownMap(evt) {

	
	if (build) { // build the house 
		if (allowedToBuild) {
			build = false;
			document.body.style.cursor='default';
			grid_con = main_container.getChildAt(2);			
			main_container.removeChild(grid_con);
			burger.localBuildPosX = local_buildXpos2;
			burger.localBuildPosY = local_buildYpos2;
            socket.emit('buildHouse', { buildXpos2: local_buildXpos2, local_buildYpos2: local_buildYpos2 } );
			amount_of_wood -=10;				//   put Object into collition matrix
				putx = Col_ArrX[i];
				puty = Col_ArrY[i];				
				Matrix[putx][puty] = 101;
		} 
	}	

	else if (destroy) { // delete object		
		if (hit_object){
			// delte from collition matrix
			for (var i = 0; i<Col_ArrX.length; i++ ){
				//   put Object into collition matrix
				putx = Col_ArrX[i];
				puty = Col_ArrY[i];				
				Matrix[putx][puty] = 0;
			} 
		
			obj_container.removeChild(current_object);
			stage.update();						
		}
	}
	
	else if (move) { // move objects
		if (hit_object && visit ==0){
			current_object.alpha = 0.5;			
			// delete object from collition matrix
			for (var i = 0; i<Col_ArrX.length; i++ ){
				//   put Object into collition matrix
				putx = Col_ArrX[i];
				puty = Col_ArrY[i];				
				Matrix[putx][puty] = 0;
			} 
			
			moving = true;
			visit = 1;	
			
			offset = {
			x:evt.target.x-evt.stageX,
			y:evt.target.y-evt.stageY			
			};			
			
			evt.addEventListener("mousemove",function(ev) {
				ev.target.x = ev.stageX+offset.x;
				ev.target.y = ev.stageY+offset.y;
				global_offsetX = ev.target.x;		
				global_offsetY = ev.target.y;										  
			});	
			
		}
		else if (hit_object && visit ==1 && allowedToBuild) {
		
		moving = false;
		
			for (var i = 0; i<Col_ArrX.length; i++ ){
				//   put Object into collition matrix
				putx = Col_ArrX[i];
				puty = Col_ArrY[i];				
				Matrix[putx][puty] = 101;
			}
			
		
		//current_object.alpha = 1;
		}	
	}
		
			
	// move whole map with objects
	else if (!build && !move) {
		
		if (hit_object) { // open window
		
		stage.removeAllChildren();
		stage.update();
		
		drawCapitol();
		}
		
		else { // drag map
			offset = {
			x:evt.target.x-evt.stageX,
			y:evt.target.y-evt.stageY			
			};			
			
			evt.addEventListener("mousemove",function(ev) {
				ev.target.x = ev.stageX+offset.x;
				ev.target.y = ev.stageY+offset.y;
				global_offsetX = ev.target.x;		
				global_offsetY = ev.target.y;										  
			});			
		}
	}
	
	
}



function drawCapitol() {
	
	capitol_container = new createjs.Container();
	capitol_menu_container = new createjs.Container();		
	capitol_button_container = new createjs.Container();	
	capitol_back_button_container = new createjs.Container();
	
	capitol_button_container.addChild(capitol_back_button_container);
	capitol_menu_container.addChild(capitol_button_container);
	capitol_container.addChild(capitol_menu_container);	
	stage.addChild(capitol_container);
		
	ciz= new Image();
	ciz.src = "resources/Cicero.jpg";	
		
	cicero = new createjs.Bitmap(ciz);
	
	var capitol_title = new createjs.Text("This is the Capitol!", "bold 24px Arial", "#FFFFFF");
		capitol_title.x = 480;
		capitol_title.y = 20;
	
	capitol_container.addChild(cicero,capitol_title);	
	
	var button_height = 63;
	
	var back_button = new createjs.Bitmap("resources/button.gif");
		back_button.x = 1;	
		back_button.y = canvas_height - button_height;			
	// text menu
	var back_label = new createjs.Text("Back to WorldMap", "bold 24px Arial", "#FFFFFF");
		back_label.x = 20;
		back_label.y = canvas_height - button_height +20;		
		capitol_back_button_container.addChild(back_button,back_label);
		
		capitol_back_button_container.addEventListener("click", backToMap);
}

function backToMap() {
		stage.removeAllChildren();
		stage.addChild(main_container,menu_container);
		stage.update();
}


// event Listener for building houses
function buildhouse(evt1) {

	if (build) {	
		obname = burger.name
		var del_child = obj_container.getChildByName(obname); 
		obj_container.removeChild(del_child); 
		build = false;
		document.body.style.cursor='default';
		grid_con = main_container.getChildAt(2);			
		main_container.removeChild(grid_con);
	}
	else {
		main_container.addChild(grid_container);
		document.body.style.cursor='pointer';
		
		kill_child = menu_container.getChildAt(5);
		menu_container.removeChild(kill_child);


		destroy = false;
		del_count =1;		
		move = false;
		move_count = 1;
		img = new Image();
		img.src = "resources/objects/bank1.png";	
		
		img_height = img.height;
		img_width = img.width;
		ground = makeground(img_height,img_width);
		
		burger = new createjs.Bitmap(img);		
		burger.mouseMoveOutside = true;	
		build_count = building_counter.toString();
		burger.name = ["buger" + build_count];
		burger.alpha = 0.5;
		
		global_buildXpos = - global_offsetX + local_buildXpos;
		global_buildYpos = - global_offsetY + local_buildYpos;
		
		bx = global_buildXpos;
		by = global_buildYpos;
		x_tile = Math.floor(bx /64);
	    y_tile = Math.floor(by /32);
		x_int_pos = x_tile * 64;
		y_int_pos = y_tile * 32;
		
		burger.x = x_int_pos;
		burger.y = y_int_pos;
		
		just_start = true;	
		build = true;			
		obj_container.addChild(burger);	
		building_counter = building_counter +1;		
	}		
}


// event Listener for deleting houses
function deletehouse(evt1) {

	if (build) {
		obname = burger.name
		var del_child = obj_container.getChildByName(obname); 
		obj_container.removeChild(del_child);
		document.body.style.cursor='default';
		grid_con = main_container.getChildAt(2);			
		main_container.removeChild(grid_con);		
	}
	
	build = false;
	document.body.style.cursor='default';
	destroy = truthArr[del_count];
	move = false;
	move_count = 1;

	del_count += 1;
	if (del_count >1) {
		del_count = 0;
	}
		
		
}


// event Listener for building houses
function movehouse(evt1) {

	if (build) {
		obname = burger.name
		var del_child = obj_container.getChildByName(obname); 
		obj_container.removeChild(del_child);
		document.body.style.cursor='default';
		grid_con = main_container.getChildAt(2);			
		main_container.removeChild(grid_con);		
	}
	
	main_container.addChild(grid_container);
	build = false;
	document.body.style.cursor='default';
	destroy = false;
	del_count =1;
	move = truthArr[move_count];
	if (!move) {
		grid_con = main_container.getChildAt(2);			
		main_container.removeChild(grid_con);
	}
	
	move_count += 1;
	if (move_count >1) {
		move_count = 0;
		
	}
	
	

		
}


function makeground(h,w) {
	// dynamic but not precise
	ground = {
		leftX : 0, 
		leftY : h*(3/4),
		rightX : w,
		rightY : h*(3/4),	
		upperX : (w/2),
		upperY: (h/2),
		lowerX: (w/2),
		lowerY: h
	}	
	
	// specific but precise (maybe)
	//ground = {
	//	leftX : 0, 
	//	leftY : 149,
	//	rightX : 213,
	//	rightY : 152,	
	//	upperX : 102,
	//	upperY: 98,
	//	lowerX: 115,
	//	lowerY: 206
	//}
	
	return ground;
}


function calc_edges(x,y,b) {

	edges = {
	leX: burger.x + (ground.leftX - (2*b)),	
	leY: burger.y + ground.leftY,
	reX: burger.x + (ground.rightX + (2*b)),
	reY: burger.y + ground.rightY,
	upX: burger.x + ground.upperX,
	upY: burger.y + (ground.upperY-b),
	loX: burger.x + ground.lowerX,
	loY: burger.y + (ground.lowerY+b)
	};
}

function calc_edges_current(x,y,b) {

	edges = {
	leX: current_object.x + (ground.leftX - (2*b)),	
	leY: current_object.y + ground.leftY,
	reX: current_object.x + (ground.rightX + (2*b)),
	reY: current_object.y  + ground.rightY,
	upX: current_object.x + ground.upperX,
	upY: current_object.y  + (ground.upperY-b),
	loX: current_object.x + ground.lowerX,
	loY: current_object.y  + (ground.lowerY+b)
	};
}



function get_tiles_from_world_coords(points) {

	x_edge[0] =(edges.leX-32) / 64;
	x_edge[1] =(edges.reX-32) / 64;
	x_edge[2] =(edges.upX-32) / 64;
	x_edge[3]=(edges.loX-32) / 64;
	
	y_edge[0] =(edges.leY) / 32;
	y_edge[1] =(edges.reY) / 32;
	y_edge[2] =(edges.upY) / 32;
	y_edge[3] =(edges.loY) / 32;
	
	for(var i = 0; i<x_edge.length; i++) {
	
		if (x_edge[i] <=0 && x_edge[i]>= -1) {
			x_edge[i] = 45;		
		}
		else {
			x_edge[i] = Math.floor(x_edge[i]) +46;
		}
		
		
		if (y_edge[i] <=0 && y_edge[i]>= -1) {
			y_edge[i] = 45;		
		}
		else {
			y_edge[i] = Math.floor(y_edge[i]) +46;
		}
	}
	for (var i= 0; i<x_edge.length; i++) { 
		Xlane[i] = 45 - (x_edge[i] -y_edge[i]);
		Ylane[i] = (x_edge[i] +y_edge[i]) -45;
	}
}


function getMatrix() {	
	collitionData = mapData.layers[1].data; 
	for (var row = 0; row<tile_size; row++) {
		Matrix[row] = [];	
		for (var col = 0; col<tile_size; col++) {				
			Matrix[row][col]  = collitionData[col+(row *tile_size)] ;
		}
	}
	return Matrix;	
}


function get_all_coll_points(X1,Y1) {
		
	// start and end points
	//var Xstart = Math.min.apply(null, X)
	xp1 = X1[0]; xp2 = X1[1]; xp3 = X1[2]; xp4 = X1[3];
	yp1 = Y1[0]; yp2 = Y1[1]; yp3 = Y1[2]; yp4 = Y1[3];
	
	Xstart =  Math.min(xp2,xp3)-1;
	Xende = Math.max(xp1,xp4);	
	Ystart = Math.min(yp1,yp3)-1;
	Yende = Math.max(yp2,yp4);

	
	Col_ArrX = [];
	Col_ArrY = [];
	
	//go through raster from top left to buttom right
	for (var i = Ystart; i <=Yende; i++ ) {
		for(var k= Xstart; k <=Xende; k++) {			
			Col_ArrX.push(k);
			Col_ArrY.push(i);
		}
	}
}


function calculateCollition(X,Y) {
	var total = 0;
	
	for (var i = 0;i <X.length; i++) {
		 a= X[i];
		 b =Y[i];
		 if (a < 1 || a > 90 || b < 1 || b > 90) { // out of map
		 total = 10000;
		 }
		 else {
			total += Matrix[a][b]; 
		 }
	}
		
	if (total > 0) {
		allowedToBuild = false;
	}
	
	else {
		allowedToBuild = true;
	}		
	return allowedToBuild;
}
	
	
	



// tick funtion called every frame
function tick(event) {

		if (build) { 
			if (just_start)	{
				
				// after hit building
				l = obj_container.getNumChildren();
				start_movement = false;			
				child = obj_container.getChildAt(l-1);				
				var pt = child.globalToLocal(stage.mouseX, stage.mouseY);
				if (child.hitTest(pt.x, pt.y)) { 
					start_movement = true;
					just_start = false;	
					local_buildXpos2 = local_buildXpos;
					local_buildYpos2 = local_buildYpos;					
					local_buildYpos2 = local_buildYpos2;			
				}
			}
			
			else if (start_movement) {
			
				// get offset	
				xoffinreal = (stage.mouseX - (burger.x+global_offsetX)) + burger.x -100;
				yoffinreal = (stage.mouseY - (burger.y+global_offsetY)) + burger.y -100;
			
				burger.x =(Math.floor(xoffinreal / 32))*32;
				burger.y =(Math.floor(yoffinreal / 16))*16;
				
				

				
				var edges = calc_edges(burger.x,burger.y,border);
				get_tiles_from_world_coords(edges);
				get_all_coll_points(Xlane,Ylane);
				var allowedToBuild = calculateCollition(Col_ArrX,Col_ArrY);	
			
				if  (allowedToBuild) {
				burger.alpha = 1;
				}
				else {
				burger.alpha = 0.5;
				}								
			}						
		}
		
		else if (moving) { // move building
			xoffinreal = (stage.mouseX - (current_object.x+global_offsetX)) + current_object.x -100;
			yoffinreal = (stage.mouseY - (current_object.y+global_offsetY)) + current_object.y -100;
			
			current_object.x =(Math.floor(xoffinreal / 32))*32;
			current_object.y =(Math.floor(yoffinreal / 16))*16;
			
			
			var edges = calc_edges_current(current_object.x,current_object.y,border);
			get_tiles_from_world_coords(edges);
			get_all_coll_points(Xlane,Ylane);
			var allowedToBuild = calculateCollition(Col_ArrX,Col_ArrY);	
			if  (allowedToBuild) {
				current_object.alpha = 1;
			}
			else {
				current_object.alpha = 0.5;
			}
			
			
		}
		
		
		else { 
			l = obj_container.getNumChildren();
			hit_object = false;
			for(var i = 0; i<l; i++){
				child = obj_container.getChildAt(i);				
				var pt = child.globalToLocal(stage.mouseX, stage.mouseY);
				if (child.hitTest(pt.x, pt.y)) { 
					hit_object = true;					
					current_object = obj_container.getChildAt(i);					
					
					var edges = calc_edges_current(current_object.x,current_object.y,border);
					get_tiles_from_world_coords(edges);
					get_all_coll_points(Xlane,Ylane);
				}
				
				else {
					visit = 0;
				}
			}
		}
		
		if (tick_counter == 30) { // after 1 Seconds
		
			last = header_container.getChildAt(2);			
			header_container.removeChild(last);
			
			tick_counter = 0;
			amount_of_wood += 1;
			wood_amount = amount_of_wood.toString();
					
			var wood_label = new createjs.Text(wood_amount, "bold 16px Arial", "#000000");
			wood_label.x = (canvas_width/2) -400 +50;
			wood_label.y = 10;				
			header_container.addChild(wood_label);
		} 
		
		
	tick_counter += 1;	
	// update canvas  
	stage.update(event);
}