ig.module(
	'biolab.entities.delay'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityDelay = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(255, 100, 0, 0.7)',
	
	size: {x: 8, y: 8},
	delay: 1,
	delayTimer: null,
	triggerEntity: null,
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.delayTimer = new ig.Timer();
	},
	
	
	triggeredBy: function( entity, trigger ) {		
		this.fire = true;
		this.delayTimer.set( this.delay );
		this.triggerEntity = entity;
	},
	
	
	update: function(){
		if( this.fire && this.delayTimer.delta() > 0 ) {
			this.fire = false;

			for( var t in this.target ) {
				var ent = ig.game.getEntityByName( this.target[t] );
				if( ent && typeof(ent.triggeredBy) == 'function' ) {
					ent.triggeredBy( this.triggerEntity, this );
				}
			}
		}
	}
});

});