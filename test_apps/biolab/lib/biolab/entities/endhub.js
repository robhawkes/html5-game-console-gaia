ig.module(
	'biolab.entities.endhub'
)
.requires(
	'impact.entity',
	'biolab.perlin-noise'
)
.defines(function(){

EntityEndhub = ig.Entity.extend({
	size: {x: 24, y: 24},
	zIndex: -1,
	
	sound: new ig.Sound('media/sounds/respawn-activate.ogg', false),
	soundEnd: new ig.Sound('media/sounds/theend.ogg', false),
	animSheet: new ig.AnimationSheet( 'media/sprites/endhub.png', 24, 24 ),
	
	stage: 0,
	stageTimer: null,
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.addAnim( 'idle', 0.5, [0,1] );
		this.addAnim( 'activated', 0.5, [2,3] );
		this.stageTimer = new ig.Timer(0);
	},
	
	
	update: function() {
		this.currentAnim.update();
	},
	
	
	triggeredBy: function( entity, trigger ) {
		this.stage++;
		this.stageTimer.set(0);
		
		// Stage 1 - music fadeout, play sound
		if( this.stage == 1 ) {
			this.sound.play();
			this.currentAnim = this.anims.activated;
			ig.music.fadeOut( 4 );
		}
		
		// Stage 2 - plasma animation
		else if( this.stage == 2 ) {			
			this.soundEnd.play();
			
			var pn = new PerlinNoise();
			var sx = this.pos.x;
			var sy = this.pos.y - 24;
			var particles = ig.ua.mobile ? 30 : 100;
			for( var i = 0; i < particles; i++ ) {
				ig.game.spawnEntity( EntityPlasma, sx, sy, {noise: pn, index: i*10} );
			}
		}
		
		// Stage 3 - fade to white
		else if( this.stage == 3 ) {
			ig.game.spawnEntity( EntityFadeScreen, sx, sy );
		}
		
		// Stage 4 - end the game
		else if( this.stage == 4 ) {
			ig.game.end();
		}
	}
});



EntityFadeScreen = ig.Entity.extend({
	duration: 1,
	color: '#fff',
	alpha: 0,
	
	
	init: function( x, y, settings ) {
		this.fadeTimer = new ig.Timer(this.duration);
	},
	
	
	update: function() {
		this.alpha = this.fadeTimer.delta()
			.map( -this.duration, 0, 0, 1)
			.limit( 0, 1 );		
	},
	
	
	draw: function() {
		ig.system.context.globalAlpha = this.alpha;
		ig.system.clear( this.color );
		ig.system.context.globalAlpha = 1;
	}
});



EntityPlasma = ig.Entity.extend({
	noise: null,
	index: 0,
	
	animSheet: new ig.AnimationSheet( 'media/sprites/plasma.png', 20, 20 ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.center = {x: x, y: y};
		
		this.timer = new ig.Timer();
		this.addAnim( 'idle', 5, [0] );
		this.update();
	},
	
	
	update: function() {
		var d = this.timer.delta();
		var t = d * 100 + 16000;
		var i = this.index;
		var xn1 = this.noise.noise2( i/97, t/883);
		var xn2 = this.noise.noise2( i/41, t/311)*2;
		var xn3 = this.noise.noise2( i/13, t/89 )*0.5;
		
		var yn1 = this.noise.noise2( i/97, t/701 );
		var yn2 = this.noise.noise2( i/41, t/373 )*2;
		var yn3 = this.noise.noise2( i/13, t/97)*0.5;
		
		var scale = (80/(d*d*0.7)).limit(0,1000);
		this.pos.x = this.center.x + (xn1+xn2+xn3)*40*scale;
		this.pos.y = this.center.y + (yn1+yn2+yn3)*30*scale;
	},
	
	
	draw: function() {
		// Additive blending
		ig.system.context.globalCompositeOperation = 'lighter';
		this.parent();
		ig.system.context.globalCompositeOperation = 'source-over';
	}
});

});

