
/**
 * Exclude React methods in the event emitting
 */
var isExcludedEventMethod = function(name, m) {
	return /notifyListeners|addListener|removeListener/.test(name);
};

var isString = function(s) {
	return s instanceof String || typeof(s) === 'string';
};

var isFunction = function(f) {
	return f instanceof Function || typeof(f) === 'function';
};

var wrapWithEmitter = function(name, m) {
	return function() {
		var out = m.apply(this, arguments);
		if(out === undefined) { // pattern: only notify for non-return methods
			this.notifyListeners.call(this, { event: name, args: arguments });
		}
		return out;
	};
};

var EventDispatcher = function(methods) {
	var EventDispatcher = this;
	
	this.listeners = [];

	this.errorHandlers = [];
	
	this.notifyListeners = function(event) {
		var exceptions = null;
		for(var i = 0; i < this.listeners.length; i++) {
			try {
				this.listeners[i](event);
			} catch(e) {
				if(!exceptions) {
					exceptions = [];
				}
				exceptions.push(e);
			}
		}
		if(exceptions) {
			// todo 
			for(var ix = 0; ix < exceptions.length; ix++) {
				var err = exceptions[ix];
				try {
					for(var ih = 0; ih < this.errorHandlers.length; ih++) {
						this.errorHandlers[ih].call(this, err);
					}
				} catch(ex) {
					console.error(ex);
					if(ex.stack) console.error(ex.stack);
				}
				
				console.error(err);
				if(err.stack) console.error(err.stack);
			}
		}
	};
	
	this.addListener = function(listener) {
		this.listeners.push(listener);
	};
	
	this.addErrorHandler = function(handler) {
		this.errorHandlers.push(handler);
	};
	
	this.removeListener = function(listener) {
		var idx = this.listeners.indexOf(listener);
		if(idx >= 0) {
			this.listeners.splice(idx, 1);
		}
	};
	
	this.mixin = function(listener) {
		return {
			componentWillMount: function() {
				var l = listener;
				if(isString(listener)) {
					var cmp = this;
					l = EventDispatcher[listener] = function(e) {
						cmp[listener].call(cmp, e);
					}; // this is component here
				}
				EventDispatcher.addListener(l);
			},
			componentWillUnmount: function() {
				var l = listener;
				if(isString(listener)) {
					l = EventDispatcher[listener];
				}
				EventDispatcher.removeListener(l);
			}
		};
	};
	
	for(var name in methods) {
		var m = methods[name];
		if(isFunction(m)) {
			if(!isExcludedEventMethod(name, m)) {
				m = wrapWithEmitter(name, m);
			}
		}
		this[name] = m;
	}
};

/**
 * Emits the event after all method calls, optionally specify an explicit set
 */
module.exports = EventDispatcher;
