ig.module(
	'biolab.entities.trigger'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityTrigger = ig.Entity.extend({
	size: {x: 16, y: 16},
	
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(196, 255, 0, 0.7)',
	
	target: null,
	delay: -1,
	delayTimer: null,
	canFire: true,
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.NEVER,
	
	
	init: function( x, y, settings ) {
		if( settings.checks ) {
			this.checkAgainst = ig.Entity.TYPE[settings.checks.toUpperCase()] || ig.Entity.TYPE.A;
			delete settings.check;
		}
		
		this.parent( x, y, settings );
		this.delayTimer = new ig.Timer();
	},
	
	
	check: function( other ) {
		if( this.canFire && this.delayTimer.delta() >= 0 ) {
			if( typeof(this.target) == 'object' ) {
				for( var t in this.target ) {
					var ent = ig.game.getEntityByName( this.target[t] );
					if( ent && typeof(ent.triggeredBy) == 'function' ) {
						ent.triggeredBy( other, this );
					}
				}
			}
			
			if( this.delay == -1 ) {
				this.canFire = false;
			}
			else {
				this.delayTimer.set( this.delay );
			}
		}
	},
	
	
	update: function(){}
});

});