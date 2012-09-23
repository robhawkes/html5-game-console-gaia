ig.module(
	'biolab.biolab'
)
.requires(
	'plugins.impact-splash-loader',
	'impact.game',
	'impact.collision-map',
	'impact.background-map',
	'impact.font',
		
	'biolab.camera',

	// entities
	'biolab.entities.player',
	'biolab.entities.blob',
	'biolab.entities.grunt',
	'biolab.entities.dropper',
	'biolab.entities.spike',
	'biolab.entities.crate',
	'biolab.entities.mine',
	'biolab.entities.spewer',
	'biolab.entities.earthquake',
	'biolab.entities.mover',
	'biolab.entities.debris',
	'biolab.entities.delay',
	'biolab.entities.void',
	'biolab.entities.hurt',
	'biolab.entities.levelchange',
	'biolab.entities.respawn-pod',
	'biolab.entities.test-tube',
	'biolab.entities.glass-dome',
	'biolab.entities.endhub',

	// levels
	'biolab.levels.biolab1',
	'biolab.levels.biolab2',
	'biolab.levels.biolab3'
)
.defines(function(){



// -----------------------------------------------------------------------------
// Game


BiolabGame = ig.Game.extend({
	clearColor: '#0d0c0b',
	gravity: 240,
	player: null,
	
	mode: 0,
	lastCheckpoint: null,
	playerSpawnPos: {x:0,y:0},
	
	deathCount: 0,
	tubeCount: 0,
	tubeTotal: 0,
	levelTime: null,
	levelTimeText: '0',
	
	musicBiochemie: new ig.Sound( 'media/music/biochemie.ogg', false ),
	font: new ig.Font( 'media/04b03.font.png' ),
	camera: null,
	
	lastTick:0.016,
	realTime: 0,
	showFPS: false,
	
	init: function() {
		var as = new ig.AnimationSheet( 'media/tiles/biolab.png', 8, 8 );
		this.backgroundAnims = {
			'media/tiles/biolab.png': {
				// slime
				80: new ig.Animation( as, 0.13, [80,81,82,83,84,85,86,87] ),
				81: new ig.Animation( as, 0.17, [84,83,82,81,80,87,86,85] ),
				88: new ig.Animation( as, 0.23, [88,89,90,91,92,93,94,95] ),
				89: new ig.Animation( as, 0.19, [95,94,93,92,91,90,89,88] )
			}
		};
			
		this.camera = new Camera( ig.system.width/4, ig.system.height/3, 5 );
		this.camera.trap.size.x = ig.system.width/10;
		this.camera.trap.size.y = ig.system.height/3;
		this.camera.lookAhead.x = ig.ua.mobile ? ig.system.width/6 : 0;
		
		ig.music.volume = 0.9;
		ig.music.add( this.musicBiochemie );
		ig.music.play();
		this.loadLevel( LevelBiolab1 );
		
		this.realTime = Date.now();
		this.lastTick = 0.016;
	},
	
	
	loadLevel: function( level ) {
		if( ig.ua.iPhone4 || ig.ua.android ) {
			for( var i = 0; i < level.layer.length; i++ ) {
				if( level.layer[i].name == 'background' ) {
					level.layer.erase( level.layer[i] );
				}
			}
		}
		
		this.parent( level );
			
		this.player = this.getEntitiesByType( EntityPlayer )[0];
		this.lastCheckpoint = null;
		this.playerSpawnPos = {x:this.player.pos.x, y:this.player.pos.y};
		
		this.deathCount = 0;
		this.tubeCount = 0;
		this.tubeTotal = this.getEntitiesByType( EntityTestTube ).length;
		this.levelTime = new ig.Timer();
		this.mode = BiolabGame.MODE.GAME;
		
		// Set camera max and reposition trap
		this.camera.max.x = this.collisionMap.width * this.collisionMap.tilesize - ig.system.width;
		this.camera.max.y = this.collisionMap.height * this.collisionMap.tilesize - ig.system.height;
		
		this.camera.set( this.player );
		
		if( ig.ua.mobile ) {
			for( var i = 0; i < this.backgroundMaps.length; i++ ) {
				this.backgroundMaps[i].preRender = true;
			}
		}
	},
	
	
	endLevel: function( nextLevel ) {
		this.nextLevel = nextLevel;
		this.levelTimeText  = this.levelTime.delta().round(2).toString();
		this.mode = BiolabGame.MODE.STATS;
	},
	
	
	end: function() {
		ig.system.setGame( BiolabCredits );
	},
	
	
	respawnPlayerAtLastCheckpoint: function(x, y) {	
		var pos = this.playerSpawnPos;
		if( this.lastCheckpoint ) {
			pos = this.lastCheckpoint.getSpawnPos()
			this.lastCheckpoint.currentAnim = this.lastCheckpoint.anims.respawn.rewind();
		}
			
		this.player = this.spawnEntity( EntityPlayer, pos.x, pos.y );
		this.player.currentAnim = this.player.anims.spawn;
		this.deathCount++;
	},
	
	
	update: function() {
		this.camera.follow( this.player );
		this.parent();
		
		
	},
	
	
	draw: function() {
		this.parent();
		this.camera.draw();
		
		if( this.showFPS ) {
			this.font.draw( (1/this.lastTick).round(), 4, 4 );
		}
	},
	
	
	run: function() {
		var now = Date.now();
		this.lastTick = this.lastTick * 0.9 + ((now - this.realTime)/1000) * 0.1;
		this.realTime = now;
		
		if( ig.input.pressed('fps') ) {
			this.showFPS = !this.showFPS;
		}
		
		if( this.mode == BiolabGame.MODE.GAME ) {
			this.update();
			this.draw();
		}
		else if( this.mode == BiolabGame.MODE.STATS ) {
			this.showStats();
		}
	},
	
	
	showStats: function() {
		if( ig.input.pressed('shoot') || ig.input.pressed('jump') ) {
			this.loadLevel( this.nextLevel );
			return;
		}
		
		var mv = ig.ua.mobile ? 20 : 0;
		ig.system.clear( this.clearColor );
		
		this.font.draw( 'Level Complete!', ig.system.width/2, 20, ig.Font.ALIGN.CENTER );
		
		this.font.draw( 'Time:', 98-mv, 56, ig.Font.ALIGN.RIGHT );
		this.font.draw( this.levelTimeText + 's', 104-mv, 56 );
		
		this.font.draw( 'Tubes Collected:', 98-mv, 68, ig.Font.ALIGN.RIGHT );
		this.font.draw( this.tubeCount + '/' + this.tubeTotal, 104-mv, 68 );
		
		this.font.draw( 'Deaths:', 98-mv, 80, ig.Font.ALIGN.RIGHT );
		this.font.draw( this.deathCount.toString(), 104-mv, 80 );
		
		this.font.draw( 'Press X or C to Proceed', ig.system.width/2, 140, ig.Font.ALIGN.CENTER );
	}
});

BiolabGame.MODE = {
	GAME: 1,
	STATS: 2
};





// -----------------------------------------------------------------------------
// Title Screen


BiolabTitle = ig.Class.extend({
	introTimer: null,
	noise: null,
	
	sound: new ig.Sound( 'media/sounds/intro.ogg', false ),
	biolab: new ig.Image( 'media/title-biolab.png' ),
	disaster: new ig.Image( 'media/title-disaster.png' ),
	player: new ig.Image( 'media/title-player.png' ),
	font: new ig.Font( 'media/04b03.font.png' ),
	
	init: function() {
		if( !BiolabTitle.initialized ) {
			// Manually set up Gamepad API support for Firefox
			// Manual because polling isn't working in Fx OS, for now
			function triggerKeyDownEvent(keyCode) {
				var evObj = document.createEvent('Event');
				evObj.initEvent('keydown', true, false );;
				evObj.keyCode = keyCode;
				window.dispatchEvent(evObj);
			}

			function triggerKeyUpEvent(keyCode) {
				var evObj = document.createEvent('Event');
				evObj.initEvent('keyup', true, false );;
				evObj.keyCode = keyCode;
				window.dispatchEvent(evObj);
			}

			function onGamepadConnected(e) {
				window.addEventListener("MozGamepadButtonDown", onGamepadButtonDown);
    			window.addEventListener("MozGamepadButtonUp", onGamepadButtonUp);
    			window.addEventListener("MozGamepadAxisMove", onGamepadAxisMove);
			}

			function onGamepadDisconnected(e) {
				
			}

			function onGamepadButtonDown(e) {
				// xBox A is 0
				// xBox B is 1
				// xBox X is 2
				// xBox Y is 3
				// xBox Back is 9
				// xBox Start is 8
				// xBox Home is 10
				// xBox DPad up is 11
				// xBox DPad down is 12
				// xBox DPad left is 13
				// xBox DPad right is 14
				
				//console.log("Button: " + e.button);

				switch (e.button) {
					case 0:
						triggerKeyDownEvent(ig.KEY.X);
						break;
					case 3:
						triggerKeyDownEvent(ig.KEY.F);
						break;
					case 11:
						triggerKeyDownEvent(ig.KEY.UP_ARROW);
						break;
					case 12:
						triggerKeyDownEvent(ig.KEY.DOWN_ARROW);
						break;
					case 13:
						triggerKeyDownEvent(ig.KEY.LEFT_ARROW);
						break;
					case 14:
						triggerKeyDownEvent(ig.KEY.RIGHT_ARROW);
						break;
				}
			}

			function onGamepadButtonUp(e) {
				switch (e.button) {
					case 0:
						triggerKeyUpEvent(ig.KEY.X);
						break;
					case 3:
						triggerKeyUpEvent(ig.KEY.F);
						break;
					case 11:
						triggerKeyUpEvent(ig.KEY.UP_ARROW);
						break;
					case 12:
						triggerKeyUpEvent(ig.KEY.DOWN_ARROW);
						break;
					case 13:
						triggerKeyUpEvent(ig.KEY.LEFT_ARROW);
						break;
					case 14:
						triggerKeyUpEvent(ig.KEY.RIGHT_ARROW);
						break;
				}
			}

			function onGamepadAxisMove(e) {
				// xBox left stick X is 0
				// xBox left stick Y is 1
				// xBox right stick X is 2
				// xBox right stick Y is 3
				// xBox left trigger is 4
				// xBox right trigger is 5
				
				//console.log("Axis: " + e.axis + " = " + e.value);

				switch (e.axis) {
					case 0:
						if (e.value < -0.5) {
							triggerKeyDownEvent(ig.KEY.LEFT_ARROW);
						} else if (e.value > 0.5) {
							triggerKeyDownEvent(ig.KEY.RIGHT_ARROW);
						} else {
							triggerKeyUpEvent(ig.KEY.LEFT_ARROW);
							triggerKeyUpEvent(ig.KEY.RIGHT_ARROW);
						}
						break;
					case 5:
						if (e.value > 0.5) {
							triggerKeyDownEvent(ig.KEY.C);
						} else {
							triggerKeyUpEvent(ig.KEY.C);
						}
						break;
				}
			}

			window.addEventListener("MozGamepadConnected", onGamepadConnected);

			ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
			ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
			ig.input.bind( ig.KEY.X, 'jump' );
			ig.input.bind( ig.KEY.C, 'shoot' );
			ig.input.bind( ig.KEY.F, 'fps' );
			
			if( ig.ua.mobile ) {
				ig.input.bindTouch( '#buttonFPS', 'fps' );
				ig.input.bindTouch( '#buttonLeft', 'left' );
				ig.input.bindTouch( '#buttonRight', 'right' );
				ig.input.bindTouch( '#buttonShoot', 'shoot' );
				ig.input.bindTouch( '#buttonJump', 'jump' );
			}
			BiolabTitle.initialized = true;
		}
		
		this.introTimer = new ig.Timer( 1 );
	},
	
	run: function() {
		if( ig.input.pressed('shoot') || ig.input.pressed('jump') ) {
			ig.system.setGame( BiolabGame );
			return;
		}
		
		var d = this.introTimer.delta();
		
		// Ready sound
		if( !this.soundPlayed && d > -0.3 ) {
			this.soundPlayed = true;
			this.sound.play();
		}
		
		
		if( ig.ua.mobile ) {
			// Title
			ig.system.clear( '#0d0c0b' );
			this.biolab.draw( (d*d*-d).limit(0,1).map(1,0,-160,12), 6 );
			this.disaster.draw( (d*d*-d).limit(0,1).map(1,0,300,12), 46 );
			this.player.draw( (d*d*-d).limit(0,1).map(0.5,0,240,70), 56 );
			
			// Instructions
			if( d > 0 && (d % 1 < 0.5 || d > 2) ) {
				this.font.draw( 'Press Button to Play', 80, 140, ig.Font.ALIGN.CENTER );
			}
		}
		else {
			// Title
			ig.system.clear( '#0d0c0b' );
			this.biolab.draw( (d*d*-d).limit(0,1).map(1,0,-160,44), 26 );
			this.disaster.draw( (d*d*-d).limit(0,1).map(1,0,300,44), 70 );
			this.player.draw( (d*d*-d).limit(0,1).map(0.5,0,240,166), 56 );
			
			// Instructions
			if( d > 0 && (d % 1 < 0.5 || d > 2) ) {
				this.font.draw( 'Press X or C to Play', 120, 140, ig.Font.ALIGN.CENTER );
			}
		}
	}
});


BiolabTitle.initialized = false;




// -----------------------------------------------------------------------------
// Credits


BiolabCredits = ig.Class.extend({
	introTimer: null,
	font: new ig.Font( 'media/04b03.font.png' ),
	lineHeight: 12,
	scroll: 0,
	scrollSpeed: 10,
	
	credits: [		
		'          Thanks for Playing!',
		'',
		'',
		'Concept, Graphics & Programming',
		'    Dominic Szablewski',
		'',
		'Music',
		'    Andreas Loesch',
		'',
		'Beta Testing',
		'    Sebastian Gerhard',
		'    Benjamin Hartmann',
		'    Jos Hirth',
		'    David Jacovangelo',
		'    Tim Juraschka',
		'    Christopher Klink',
		'    Mike Neumann',
		'',
		'',
		'',
		'',
		'Made with IMPACT - http://impactjs.org/'
	],
	

	init: function() {		
		this.timer = new ig.Timer();
	},
	
	
	run: function() {
		
		// Fade from white to black
		var d = this.timer.delta();
		var color = Math.round(d.map(0,3,255,0)).limit(0,255);
		ig.system.clear( 'rgb('+color+','+color+','+color+')' );

		
		// Exit to title when button is pressed, or the credits rolled through
		if(
			(d > 3 && ig.input.pressed('shoot') || ig.input.pressed('jump')) ||
			(ig.system.height - this.scroll + (this.credits.length + 2 ) * this.lineHeight < 0)
		) {
			ig.system.setGame( BiolabTitle );
			return;
		}
		
		var mv = ig.ua.mobile ? 0 : 32;
		
		// Draw credits
		if( d > 4 ) {
			this.scroll += ig.system.tick * this.scrollSpeed;
			
			for( var i = 0; i < this.credits.length; i++ ) {
				var y = ig.system.height - this.scroll + i * this.lineHeight;
				this.font.draw( this.credits[i], mv, y );
			}
		}
	}
});

ig.Sound.use = [ig.Sound.FORMAT.M4A, ig.Sound.FORMAT.OGG];
ig.System.drawMode = ig.System.DRAW.SMOOTH;

BiolabGame.start = function() {
	if( ig.ua.iPad ) {
		ig.Sound.enabled = false;
		ig.main('#canvas', BiolabTitle, 60, 240, 160, 2, ig.ImpactSplashLoader);
	}
	else if( ig.ua.iPhone4 ) {
		ig.Sound.enabled = false;
		ig.main('#canvas', BiolabTitle, 60, 160, 160, 4, ig.ImpactSplashLoader);
	}
	else if( ig.ua.mobile ) {
		ig.Sound.enabled = false;
		ig.main('#canvas', BiolabTitle, 60, 160, 160, 2, ig.ImpactSplashLoader);
	}
	else {
		// Disable sound until Fx OS bug is found
		ig.Sound.enabled = false;
		ig.main('#canvas', BiolabTitle, 60, 240, 160, 6, ig.ImpactSplashLoader);
	}
};


});