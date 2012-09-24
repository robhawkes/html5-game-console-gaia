ig.module(
	'biolab.entities.grunt'
)
.requires(
	'impact.entity',
	'biolab.entities.player',
	'biolab.entities.particle'
)
.defines(function(){
	
EntityGrunt = ig.Entity.extend({
	size: {x: 10, y: 13},
	offset: {x: 3, y: 3},
	maxVel: {x: 100, y: 100},
	friction: {x: 400, y:0},
	seenPlayer: false,
	
	inJump: false,
	
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	jumpTimer: null,
	health: 20,
	flippedAnimOffset: 12,
	flip: false,
	shootTimer: null,
	
	sfxHit: new ig.Sound('media/sounds/drygib.ogg'),
	sfxPlasma: new ig.Sound('media/sounds/grunt-plasma.ogg'),
	animSheet: new ig.AnimationSheet( 'media/sprites/grunt.png', 16, 16 ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.jumpTimer = new ig.Timer();
		
		this.addAnim( 'idle', 0.5, [0,0,0,0,1,0,0,0,1,1,1] );
		this.addAnim( 'walk', 0.1, [6,7,8,9,10,11] );
		this.addAnim( 'shoot', 1, [2] );
		this.addAnim( 'hit', 0.1, [3] );
		
		this.currentAnim.gotoRandomFrame();
		this.flip = (Math.random() > 0.5);
		this.shootTimer = new ig.Timer();
	},
	
	
	update: function() {
		var ydist = Math.abs(ig.game.player.pos.y - this.pos.y);
		var xdist = Math.abs(ig.game.player.pos.x - this.pos.x);
		var xdir = ig.game.player.pos.x - this.pos.x < 0 ? -1 : 1;
		
		if( !this.seenPlayer ) {
			if( xdist < 160 && ydist < 32 ) {
				this.seenPlayer = true;
				this.shootTimer.set(1.5);
			}
		}
		
		else if( this.standing && this.currentAnim != this.anims.hit ) {
			if(
			   (xdist > 160 || (xdist > 96 && this.currentAnim == this.anims.walk)) &&
			   this.shootTimer.delta() > 0
			) {
				this.currentAnim = this.anims.walk;
				this.vel.x = 30 * xdir;
			}
			else if( this.currentAnim == this.anims.walk ) {
				this.currentAnim = this.anims.idle;
				this.vel.x = 0;
				
				this.shootTimer.set(1);
			}
			else if( ydist < 64 &&  this.shootTimer.delta() > 0 ) {
				var x = this.pos.x + (this.flip ? -3 : 5);
				var y = this.pos.y + 6;
				ig.game.spawnEntity( EntityGruntProjectile, x, y, {flip:this.flip} );
				this.sfxPlasma.play();
				this.shootTimer.set(2);
				this.currentAnim = this.anims.idle;
			}
			
			if( this.currentAnim == this.anims.idle && this.shootTimer.delta() > -0.5 ) {
				this.currentAnim = this.anims.shoot;
			}
			
			this.flip = (xdir < 0);
		}
		if( this.currentAnim == this.anims.hit && this.currentAnim.loopCount ) {
			this.currentAnim = this.anims.idle.rewind();
		}
		
		
		
		this.parent();
		this.currentAnim.flip.x = this.flip;
		if( this.flip ) {
			// dirty hack :/
			this.currentAnim.tile += this.flippedAnimOffset;
		}
	},
	
	
	kill: function() {
		this.parent();
		this.spawnGibs( 10 );
	},
	
	
	receiveDamage: function( amount, from ) {
		this.currentAnim = this.anims.hit.rewind();
		this.vel.x = from.vel.x > 0 ? 60 : -60;
		this.parent( amount );
		this.spawnGibs( 3 );
		this.sfxHit.play();
		this.seenPlayer = true;
		
		if( this.shootTimer.delta() > -0.3 ) {
			this.shootTimer.set(0.7);
		}
	},
	
	
	spawnGibs: function( amount ) {
		var cx = this.pos.x + this.size.x/2;
		var cy = this.pos.y + this.size.y/2;
		for( var i = 0; i < amount; i++ ) {
			ig.game.spawnEntity( EntityGruntGib, cx, cy );
		}
	},
	
	
	check: function( other ) {
		other.receiveDamage( 10, this );
	}
});



EntityGruntGibGun = EntityParticle.extend({
	lifetime: 2,
	fadetime: 0.4,
	size: {x:8, y: 8},
	friction: {x:30, y: 0},
	vel: {x: 60, y: 50},
	
	animSheet: new ig.AnimationSheet( 'media/sprites/grunt.png', 8, 8 ),
	
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 0.5, [11] );
		this.parent( x, y, settings );
		this.currentAnim.flip.y = false;
	}
});



EntityGruntGib = EntityParticle.extend({
	lifetime: 1,
	fadetime: 0.5,
	bounciness: 0.6,
	vel: {x: 50, y: 150},
	size: {x:4,y:4},
	
	animSheet: new ig.AnimationSheet( 'media/sprites/grunt.png', 4, 4 ),
	
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 5, [16,17,40,41] );
		this.parent( x, y, settings );
	}
});



EntityGruntProjectile = EntityProjectile.extend({
	maxVel: {x: 120, y: 0},
	checkAgainst: ig.Entity.TYPE.A,
	animSheet: new ig.AnimationSheet( 'media/sprites/grunt-projectile.png', 8, 8 )
});

});