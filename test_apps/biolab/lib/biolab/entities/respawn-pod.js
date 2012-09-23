ig.module(
	'biolab.entities.respawn-pod'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityRespawnPod = ig.Entity.extend({
	size: {x: 18, y: 16},
	zIndex: -1,
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.NEVER,
	
	sound: new ig.Sound('media/sounds/respawn-activate.ogg', false ),
	animSheet: new ig.AnimationSheet( 'media/sprites/respawn-pod.png', 18, 16 ),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.addAnim( 'idle', 0.5, [0,1] );
		this.addAnim( 'activated', 0.5, [2,3] );
		this.addAnim( 'respawn', 0.1, [0,4] );
	},
	
	
	update: function() {
		if(
			this.currentAnim == this.anims.respawn &&
			this.currentAnim.loopCount > 4
		) {
			this.currentAnim = this.anims.activated;
		}
		this.currentAnim.update();
	},
	
	
	getSpawnPos: function() {
		return { x: (this.pos.x + 11), y: this.pos.y };
	},
	
	
	activate: function() {
		this.sound.play();
		this.active = true;
		this.currentAnim = this.anims.activated;
		ig.game.lastCheckpoint = this;
	},
	
	
	check: function( other ) {
		if( !this.active ) {
			this.activate();
		}
	}
});

});

