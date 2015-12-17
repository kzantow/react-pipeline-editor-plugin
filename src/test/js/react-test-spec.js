var jsTest = require('jenkins-js-test');

var jsLibName = "../ui/react-pipieline-editor-plugin.js";

__REACT_DEVTOOLS_GLOBAL_HOOK__ = function() {
	// This is to work around a global issue when require()-ing react...
};

var jsdom = require("jsdom");

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = global.document.defaultView;
global.Element = global.window.Element;
global.navigator = {
    userAgent: 'node.js'
};

var React = require('react');
var ReactDOM = require('react-dom');
var ReactTestUtils = require('react-addons-test-utils');

var withReact = function(testFunction) {
	try {
		var bs = require('bootstrap-detached');

		var $ = bs.getBootstrap();
		var plugin = require(jsLibName);
		
		var el = document.createElement('div');
		testFunction({
				'$': $,
				root: el,
				
				React: React,
				ReactDOM: ReactDOM,
				Simulate: ReactTestUtils.Simulate,
				
				find: function(selector) {
					if(selector instanceof Object) {
						return this.getElementFor(selector);
					}
					return $(el).find(selector);
				},
				createElement: function() {
					return React.createElement.apply(React, arguments);
				},
				render: function() {
					return ReactDOM.render.apply(ReactDOM, arguments);
				},
				createTestElement: function() {
					return this.render.call(ReactTestUtils, this.createElement.apply(this, arguments), el);
				},
				getText: function(component) {
					return this.getElementFor(component).text();
				},
				getHtml: function(component) {
					return this.getElementFor(component).html();
				},
				getElementFor: function(component) {
					return $(ReactDOM.findDOMNode(component));
				}
			}, plugin);
	} finally {
        ReactDOM.unmountComponentAtNode(document.body); // Assuming mounted to document.body
        document.body.innerHTML = '';                   // Just to be sure :-P
        //setTimeout(done);
	}
};

var testElement = function(el) {
	
};

describe('UI library', function() {
	it('popover should display', function(done) {
		withReact(function(ReactTest, plugin) {
			var popover = ReactTest.createTestElement(plugin.ui.Popover, {show: true});
			expect(1).toBe(ReactTest.find('.j-ui-popover').length);
			done();
		});
	});

	it('popover should NOT display', function(done) {
		withReact(function(ReactTest, plugin) {
			ReactTest.createTestElement(plugin.ui.Popover, {show: false});
			expect(0).toBe(ReactTest.find('.j-ui-popover').length);
			done();
		});
	});

	it('popover should display on change', function(done) {
		withReact(function(ReactTest, plugin) {
			var popover = ReactTest.createTestElement(plugin.ui.Popover, {show: false},
				ReactTest.createElement('div', null, 'popover-content')
			);

			expect(0).toBe(ReactTest.find('.j-ui-popover').length);
			expect('').toBe(ReactTest.getText(popover));
			
			ReactTest.Simulate.click(popover);

			popover.show();
			
			expect(1).toBe(ReactTest.find('.j-ui-popover').length);
			expect('popover-content').toBe(ReactTest.getText(popover));
			
			done();
		});
	});

});
