$(document).ready(function(){
	var nc = Object.create(CardCreator);
	nc.init(document.getElementById("cardEditor"));
});

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();

var CardCreator = {
	stage: null,
	canvasOb: null,
	dirty:false,
	elements: [], 
	init: function(targetCanvas){
		console.log("hello world!");
		canvasOb = targetCanvas;
		this.stage = targetCanvas.getContext("2d");
		this.stage.fillStyle="#FFFFFF";
		this.stage.fillRect(0,0,canvasOb.width,canvasOb.height);
		//stage.fillStyle = "#000000";
		//stage.font = "Italic 30px Sans-Serif";
		//stage.fillText("Hello World", 10, 100, 500);
		var that = this;
		setInterval(function(){that.update()}, 1000/30);
		this.setupElements();
		this.setupUI();
	},

	setupUI: function(){

	},

	setupElements: function(){
		//this.elements.push(new ClickableEntity({x:1,y:1,width:101}));
		//this.elements[this.elements.length-1].traceSpec();
		//console.log(this.elements[this.elements.length-1].x);
		//this.elements[this.elements.length-1].init(10,10,100,50,this.stage);		
		var tf = new TextField({});
		tf.say();
	},

	update: function(){
		if(this.dirty){
			this.redraw();
		}
	},

	redraw: function(){
		//console.log("hii");
		this.stage.fillStyle="#FFFFFF";
		this.stage.fillRect(0,0,canvasOb.width,canvasOb.height);
		//stage.clearRect(0,0,300,100);
	}

};

Function.prototype.method = function (name, func){
	this.prototype[name] = func;
	return this;
}

Object.method('superior', function(name){
	var that = this,
	method = that[name];
	return function(){
		return method.apply(that, arguments);
	};
});

var ClickableEntity = function(spec){
	var that = {};
	var my = my || {};
	that.x = spec.x || 0;
	that.y = spec.y || 0;
	that.width = spec.width || 0;
	that.height = spec.height || 0;
	that.stage = spec.stage || null;

	var say = function(){
		return "Hey";
	}
	that.say=say;

	var update = function(){

	};
	that.update = update;
	// check to see if point at x/y overlaps this object returns true or false
	var hitTest = function (x,y){
		return x>that.x && x<that.x+that.width && y>that.y && y<that.y+that.height;
	};

	return that;
};

var TextField = function(spec){
	var that = ClickableEntity(spec);
	var super_say = that.superior('say');
	that.say = function(n){
		return super_say() + " Baby";
	}
	
	return that; 
};
