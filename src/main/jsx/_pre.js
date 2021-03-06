var React = require('react');
var ReactDOM = require('react-dom');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var ui = require('jenkins-react-components')(React, ReactDOM, ReactCSSTransitionGroup);

var $ = require('bootstrap-detached').getBootstrap();
var stringify = require('prototype-stringify-hack');

// inspired by: http://simonsmith.io/writing-react-components-as-commonjs-modules/
// and: https://facebook.github.io/react/docs/jsx-in-depth.html#namespaced-components

var lib = exports;

var f = lib.form = {};

var debug = true;

lib.plugins = [];

var listen = function(el, evt, cb) {
	try {
		el.addEventListener(evt, cb);
	} catch(x) {
		el.attachEvent('on' + evt, cb);
	}
};
var unlisten = function(el, evt, cb) {
	try {
		el.removeEventListener(evt, cb);
	} catch(x) {
		el.detachEvent('on' + evt, cb);
	}
};
var trigger = function(el, evt, d, e) {
	if(debug) console.log('trigger: ' + evt);
	d = document;
	if(d.createEvent) {
		e = new Event(evt);
		el.dispatchEvent(e);
	} else {
		e=d.createEventObject();
		el.fireEvent("on" + evt, e);
	}
};

ui.Event = function(name) {
	this.trigger = function() {
		trigger(document, name);
	};
};

/**
 * Exclude React methods in the event emitting
 */
var isExcludedEventMethod = function(name, m) {
	// https://facebook.github.io/react/docs/component-specs.html
	return /render|getInitialState|setState|forceUpdate|replaceState|isMounted|setProps|replaceProps|getDOMNode|constructor|getDefaultProps|propTypes|mixins|statics|displayName|shouldComponentUpdate|component.*|on.*|val/.test(name);
};

var wrapWithEmitter = function(component, name, event, m) {
	return function() {
		try {
			if(debug) console.log('invoke and send: ' + event + ' from: ' + name);
			return m.apply(component, arguments);
		} finally {
			//trigger(ReactDOM.findDOMNode(component), event);
			trigger(document, event);
		}
	};
};

/**
 * Emits the event after all method calls, optionally specify an explicit set
 */
ui.Emit = function(event, methodNames) {
	return {
		componentWillMount: function() {
			if(methodNames) {
				for(var i = 0; i < methodNames.length; i++) {
					var mName = methodNames[i];
					this[mName] = wrapWithEmitter(this, mName, event, this[mName]);
				}
			} else {
				for(var name in this) {
					var m = this[name];
					if(m instanceof Function) {
						if(isExcludedEventMethod(name, m)) {
							continue;
						}
						this[name] = wrapWithEmitter(this, name, event, m);
					}
				}
			}
		}
	};
};

ui.Events = {
	componentWillMount: function() {
		var prop;
		if(this.on) {
			for(var event in this.on) {
				listen(document, event, this.on[event].bind(this));
			}
		} else {
			this.__events = {};
			for(prop in this) {
				// check for 'on' handlers and register
				if(/^on.+/.test(prop) && this[prop] instanceof Function) {
					var name = prop.replace(/^on(.*)$/, '$1');
					this.__events[name] = this[prop];
					listen(document, name, this.__events[name]);
				}
			}
		}

		for(prop in this) {
			var val = this[prop];
			// check for custom events
			if(val instanceof ui.Event) {
				val.component = this;
			}
		}
	},
	componentWillUnmount: function() {
		var name;
		if(this.on) {
			for(name in this.on) {
				unlisten(document, name, this.on[name]);
			}
		} else {
			for(name in this.__events) {
				unlisten(document, name, this.__events[name]);
			}
		}
	}
};

var wrap = function(context, name, fn, handler) {
	return function() {
		var args = arguments;
		return handler({
			context: context,
			name: name,
			fn: fn,
			arguments: args,
			proceed: function() { return fn.apply(context, args); }
		});
	};
};

var objDump = false ?
	ui.stringify :
	function(o) {
		return true ? '' : stringify(o, function(key, value) {
			if(key in o) {
				return value;
			}
			return ' ... ';
		});
	};

var logFunction = function(invocation) {
	var cmp, id;
	try {
		var inst = invocation.context._reactInternalInstance;
		cmp = inst._currentElement.type.displayName;
		id = inst._rootNodeID;
	} catch(e) {
		// ignore
	}
	if(debug) console.log(cmp + '.' + invocation.name + ' @ ' + id + '(' + objDump(invocation.arguments) + ')');
	return invocation.proceed();
};

ui.Logger = {
	componentWillMount: function() {
		for(var name in this) {
			var fn = this[name];
			if(fn instanceof Function) {
				if(isExcludedEventMethod(name, fn)) {
					continue;
				}
				this[name] = wrap(this, name, fn, logFunction);
			}
		}
	}
};

if(debug) {
	var rcc = React.createClass;
	React.createClass = function() {
		var cls = arguments[0];
		if(!cls.mixins) {
			cls.mixins = [];
		}
		cls.mixins.push(ui.Logger);
		return rcc.apply(this, arguments);
	};
}
