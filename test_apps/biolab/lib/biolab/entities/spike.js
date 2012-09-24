ig.module(
	'biolab.entities.spike'
)
.requires(
	'impact.entity',
	'biolab.entities.particle'
)
.defines(function(){
	
EntitySpike = ig.Entity.extend({
	size: {x: 16, y: 9},
	offset: {x: 0, y: 7},
	maxVel: {x: 100, y: 100},
	friction: {x: 150, y: 0},
	
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	health: 30,
	flip: false,
	shootTimer: null,
	shootWaitTimer: null,
	canShoot: false,
	
	animSheet: new ig.AnimationSheet( 'media/sprites/spike.png', 16, 16 ),
	sfxHit: new ig.Sound( 'media/sounds/drygib.ogg' ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.shootTimer = new ig.Timer(10);
		this.shootWaitTimer = new ig.Timer(10);
		
		this.addAnim( 'crawl', 0.08, [5,6,7] );
		this.addAnim( 'shoot', 0.15, [3,3,0,1,2,2,2,1,3,3,3] );
		this.addAnim( 'hit', 0.1, [8] );
	},
	
	
	update: function() {
		
		// shooting
		if( this.currentAnim == this.anims.shoot ) {
			
			// end shooting
			if( this.currentAnim.loopCount ) {
				this.currentAnim = this.anims.crawl.rewind();
			}
			
			// spawn spikes
			if( this.canShoot && this.shootTimer.delta() > 0 ) {
				this.canShoot = false;
				ig.game.spawnEntity(EntitySpikeShot, this.pos.x+6, this.pos.y-4, {dir:'up'});
				ig.game.spawnEntity(EntitySpikeShot, this.pos.x+1, this.pos.y-2, {dir:'left'});
				ig.game.spawnEntity(EntitySpikeShot, this.pos.x+10, this.pos.y-2, {dir:'right'});
			}
		}
		
		// crawling
		else if( this.currentAnim == this.anims.crawl ) {
			
			// init shoot
			if(
				this.shootWaitTimer.delta() > 0 &&
				this.distanceTo(ig.game.player) < 160 
			) {
				this.currentAnim = this.anims.shoot.rewind();
				this.shootWaitTimer.set( 5 );
				this.shootTimer.set( 1.2 );
				this.canShoot = true;
				this.vel.x = 0;
			}
			
			// crawl on
			else {
				
				// near abyss? return!
				if( !ig.game.collisionMap.getTile(
						this.pos.x + (this.flip ? +4 : this.size.x -4),
						this.pos.y + this.size.y+1
					)
				) {
					this.flip = !this.flip;
				}
				
				var xdir = this.flip ? -1 : 1;
				this.vel.x = 14 * xdir;
			}
		}
		
		// hit anim finished?
		else if( this.currentAnim == this.anims.hit && this.currentAnim.loopCount ) {
			this.currentAnim = this.anims.crawl.rewind();
		}
		
		this.parent();
	},
	
	
	handleMovementTrace: function( res ) {
		this.parent( res );
		if( res.collision.x ) {
			this.flip = !this.flip;
		}
	},
	
	
	kill: function() {
		this.parent();
		this.spawnGibs( 10 );
	},
	
	
	receiveDamage: function( amount, from ) {
		this.currentAnim = this.anims.hit.rewind();
		this.vel.x = from.vel.x > 0 ? 50 : -50;
		this.parent( amount );
		this.spawnGibs( 3 );
		this.sfxHit.play();
	},
	
	
	spawnGibs: function( amount ) {
		var cx = this.pos.x + this.size.x/2;
		var cy = this.pos.y + this.size.y/2;
		for( var i = 0; i < amount; i++ ) {
			ig.game.spawnEntity( EntitySpikeGib, cx, cy );
		}
	},
	
	
	check: function( other ) {
		other.receiveDamage( 10, this );
	}
});



EntitySpikeShot = ig.Entity.extend({
	size: {x: 4, y: 4},
	offset: {x: 2, y: 0},
	maxVel: {x: 60, y: 60},
	lastPos: {x: 0, y: 0},
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.LITE,
	
	gravityFactor: 0,
	animSheet: new ig.AnimationSheet( 'media/sprites/spike.png', 8, 8 ),
	
	init: function( x, y, settings ) {		
		if( settings.dir == 'up' ) {
			this.vel.y = -this.maxVel.y;
		}
		else if( settings.dir == 'left' ) {
			this.vel.x = -this.maxVel.x;
		}
		else if( settings.dir == 'right' ) {
			this.vel.x = this.maxVel.x;
		}
		
		this.addAnim( 'idle', 0.1, [8,9] );
		this.addAnim( 'hit', 0.1, [18,19] );

		this.parent( x, y, settings );
	},
	
	
	handleMovementTrace: function( res ) {
		this.parent( res );
		if( res.collision.x || res.collision.y ) {
			this.currentAnim = this.anims.hit.rewind();			
		}
	},
	
	collideWith: function( other, axis ) {
		this.currentAnim = this.anims.hit;
		this.hasHit = true;
	},
	
	update: function() {
		this.parent();
		
		if( this.currentAnim == this.anims.hit && this.currentAnim.loopCount > 0 ) {
			this.kill();
		}
	},
	
	check: function( other ) {
		other.receiveDamage( 10, this );
		this.currentAnim = this.anims.hit;
	}
});



EntitySpikeGib = EntityParticle.extend({
	lifetime: 4,
	fadetime: 1,
	bounciness: 0.6,
	vel: {x: 30, y: 80},
	size: {x:4,y:4},
	offset: {x:2,y:2},
	
	animSheet: new ig.AnimationSheet( 'media/sprites/spike.png', 8, 8 ),
	
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 5, [28,29,38,39] );		
		this.parent( x, y, settings );
	}
});

});