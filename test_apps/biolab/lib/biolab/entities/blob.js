ig.module(
	'biolab.entities.blob'
)
.requires(
	'impact.entity',
	'biolab.entities.particle'
)
.defines(function(){

EntityBlob = ig.Entity.extend({
	size: {x: 10, y: 13},
	offset: {x: 3, y: 3},
	maxVel: {x: 100, y: 100},
	seenPlayer: false,
	
	inJump: false,
	
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.PASSIVE,
	
	jumpTimer: null,
	health: 20,
	
	sfxGib: new ig.Sound('media/sounds/wetgib.ogg'),
	animSheet: new ig.AnimationSheet( 'media/sprites/blob.png', 16, 16 ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.jumpTimer = new ig.Timer();
		
		this.addAnim( 'idle', 0.5, [1,2,2,2,2,2,2,2,2,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2] );
		this.addAnim( 'crawl', 0.1, [0,1] );
		this.addAnim( 'jump', 0.2, [2,3,4] );
		this.addAnim( 'hit', 0.1, [5] );
		
		this.currentAnim.gotoRandomFrame();
		this.currentAnim.flip.x = (Math.random() > 0.5);
	},
	
	
	update: function() {
		var ydist = Math.abs(ig.game.player.pos.y - this.pos.y);
		var xdist = Math.abs(ig.game.player.pos.x - this.pos.x);
		var xdir = ig.game.player.pos.x - this.pos.x < 0 ? -1 : 1;
		var wasStanding = this.standing;
		
		if( !this.seenPlayer ) {
			if( xdist < 64 && ydist < 20 ) {
				this.seenPlayer = true;
			}
		}
		
		else if( this.standing && this.currentAnim != this.anims.hit ) {
			// Init jump
			if( 
				this.currentAnim != this.anims.jump && this.jumpTimer.delta() >  0.5 && (
					(xdist < 40 && xdist > 20) || // near player
					ig.game.collisionMap.getTile( this.pos.x + this.size.x * xdir, this.pos.y + this.size.y ) == 1 // or blocked by wall
				)
			) {
				this.currentAnim = this.anims.jump.rewind();
				this.currentAnim.flip.x = (xdir < 0);
				this.vel.x = 0;
			}
			
			// Jump
			else if( this.currentAnim == this.anims.jump && this.currentAnim.loopCount ) {
				this.vel.y = -70;
				this.vel.x = 60 * (this.currentAnim.flip.x ? -1 : 1);
				this.inJump = true;
			}
			
			// Crawl
			else if( this.currentAnim != this.anims.jump && this.jumpTimer.delta() >  0.2 ) {
				this.currentAnim = this.anims.crawl;
				this.currentAnim.flip.x = (xdir < 0);
				this.vel.x = 20 * xdir;
			}
		}
		
		if( this.currentAnim == this.anims.hit && this.currentAnim.loopCount ) {
			this.currentAnim = this.anims.idle;
		}
		
		if( this.inJump && this.vel.x == 0 && this.currentAnim != this.anims.hit ) {
			this.vel.x = 30 * (this.currentAnim.flip.x ? -1 : 1);
		}
		
		this.parent();
		
		// Just landed?
		if( this.standing && !wasStanding && this.currentAnim != this.anims.hit ) {
			this.inJump = false;
			this.jumpTimer.reset();
			this.anims.idle.flip.x = this.currentAnim.flip.x;
			this.currentAnim = this.anims.idle;
			this.vel.x = 0;
		}
	},
	
	
	kill: function() {
		var gibs = ig.ua.mobile ? 5 : 30;
		for( var i = 0; i < gibs; i++ ) {
			ig.game.spawnEntity( EntityBlobGib, this.pos.x, this.pos.y );
		}
		this.parent();
	},
	
	
	receiveDamage: function( amount, from ) {
		this.anims.hit.flip.x = this.currentAnim.flip.x;
		this.currentAnim = this.anims.hit.rewind();
		this.seenPlayer = true;
		this.inJump = false;
		this.vel.x = from.vel.x > 0 ? 50 : -50;
		
		var gibs = ig.ua.mobile ? 2 : 5;
		for( var i = 0; i < gibs; i++ ) {
			ig.game.spawnEntity( EntityBlobGib, this.pos.x, this.pos.y );
		}
		
		this.sfxGib.play();
		this.parent( amount );
	},
	
	
	check: function( other ) {
		other.receiveDamage( 10, this );
	}
});



EntityBlobGib = EntityParticle.extend({
	lifetime: 3,
	fadetime: 6,
	friction: {x:0, y: 0},
	vel: {x: 60, y: 150},
	
	animSheet: new ig.AnimationSheet( 'media/sprites/blob-gibs.png', 4, 4 ),
		
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 0.1, [0,1,2] );		
		this.parent( x, y, settings );
	}
});

});