ig.module(
	'biolab.entities.hurt'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityHurt = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(255, 0, 0, 0.7)',
	
	size: {x: 8, y: 8},
	damage: 10,
		
	triggeredBy: function( entity, trigger ) {	
		entity.receiveDamage(this.damage, this);
	},
	
	update: function(){}
});

});