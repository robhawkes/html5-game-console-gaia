ig.module(
	'biolab.entities.test-tube'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityTestTube = ig.Entity.extend({
	size: {x: 8, y: 10},
	
	checkAgainst: ig.Entity.TYPE.A,
	
	animSheet: new ig.AnimationSheet('media/sprites/test-tube.png', 8, 10),
	collect: new ig.Sound('media/sounds/collect.ogg'),
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.addAnim( 'idle', 0.1, [0,0,0,1,2,3,0,0,0,2,0,0,1,0,0] );
		this.currentAnim.gotoRandomFrame();
	},
	
	
	check: function( other ) {
		this.kill();
		this.collect.play();
		ig.game.tubeCount++;
	},
	
	
	update: function(){
		this.currentAnim.update();
	}
});

});