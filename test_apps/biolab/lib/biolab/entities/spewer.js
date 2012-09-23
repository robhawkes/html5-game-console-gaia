ig.module(
	'biolab.entities.spewer'
)
.requires(
	'impact.entity',
	'biolab.entities.particle'
)
.defines(function(){
	
EntitySpewer = ig.Entity.extend({
	size: {x: 16, y: 8},
	offset: {x: 0, y: 0},
	
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.NEVER,
	
	health: 20,
	
	shootTimer: null,
	shootWaitTimer: null,
	canShoot: false,
	
	animSheet: new ig.AnimationSheet( 'media/sprites/spewer.png', 16, 8 ),
	sfxHit: new ig.Sound( 'media/sounds/drygib.ogg' ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.shootWaitTimer = new ig.Timer(1);
		this.shootTimer = new ig.Timer(10);
		
		this.addAnim( 'idle', 0.5, [0,0,0,0,0,0,0,0,1] );
		this.addAnim( 'shoot', 0.15, [1,2,2,1,1] );
		this.addAnim( 'hit', 0.1, [3] );
	},
	
	
	update: function() {
		if( this.currentAnim == this.anims.hit && this.currentAnim.loopCount ) {
			this.currentAnim = this.anims.idle;
			this.shootWaitTimer.set( 0.5 );
		}
		
		else if(
			this.currentAnim == this.anims.idle &&
			this.shootWaitTimer.delta() > 0 &&
			this.distanceTo(ig.game.player) < 80
		) {
			this.currentAnim = this.anims.shoot.rewind();
			this.shootTimer.set( 0.45 );
			this.canShoot = true;
		}
		
		else if(
			this.currentAnim == this.anims.shoot &&
			this.canShoot &&
			this.shootTimer.delta() > 0
		) {
			this.canShoot = false;
			ig.game.spawnEntity( EntitySpewerShot, this.pos.x+4, this.pos.y-4 );
		}
		
		if( this.currentAnim == this.anims.shoot && this.currentAnim.loopCount ) {
			this.currentAnim = this.anims.idle.rewind();
			this.shootWaitTimer.set( 1.5 );
		}
		
		this.currentAnim.flip.x = (this.pos.x - ig.game.player.pos.x < 0);
		
		this.parent();
	},
	
	
	kill: function() {
		this.spawnGibs( 10 );
		this.parent();
	},
	
	
	check: function( other ) {
		other.receiveDamage(10, this);
	},
	
	
	receiveDamage: function( amount, from ) {
		this.currentAnim = this.anims.hit.rewind();
		this.parent( amount );
		this.spawnGibs( 3 );
		this.sfxHit.play();
	},
	
	
	spawnGibs: function( amount ) {
		var cx = this.pos.x + this.size.x/2;
		var cy = this.pos.y + this.size.y/2;
		for( var i = 0; i < amount; i++ ) {
			ig.game.spawnEntity( EntitySpewerGib, cx, cy );
		}
	}
});



EntitySpewerShot = ig.Entity.extend({
	friction: {x:20, y: 0},
	bounciness: 0.7,
	size: {x: 4, y: 4},
	vel: {x: 60, y: 150},
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.LITE,

	bounceCount: 0,
	animSheet: new ig.AnimationSheet( 'media/sprites/spewer.png', 4, 4 ),

	
	init: function( x, y, settings ) {
		var xdir = x - ig.game.player.pos.x > 0 ? -1 : 1;
		this.vel.x = Math.random().map(0,1,40,120) * xdir;
		this.vel.y = -100;
		this.addAnim( 'idle', 0.1, [16] );
		
		this.parent( x, y, settings );
	},

	
	handleMovementTrace: function( res ) {
		this.parent( res );
		
		if( res.collision.x || res.collision.y ) {
			this.bounceCount++;
			if( this.bounceCount >= 3 ) {
				this.kill();
			}
		}
	},

	
	check: function( other ) {
		other.receiveDamage( 10, this );
		this.kill();
	}
});



EntitySpewerGib = EntityParticle.extend({
	lifetime: 1,
	fadetime: 0.5,
	bounciness: 0.6,
	vel: {x: 50, y: 150},
	size: {x:4,y:4},
	
	animSheet: new ig.AnimationSheet( 'media/sprites/spewer.png', 4, 4 ),
	
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 5, [18,19,38,39] );
		this.parent( x, y, settings );
	}
});

});