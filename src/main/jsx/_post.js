var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('bootstrap-detached').getBootstrap();
var json = require('./model/stringify.js');

var wfData = require('./model/json');

var $el = $('.react-plugin-test');
if($el.length > 0) {
	var props = {};
	var $inputs = [];
	var $next = $el.next();
	
	props.pipelineModel = wfData.simpleSample;
	
	while($next.is('input')) {
		var name = $next.attr('name').replace(/\_\./,'');
		try {
			props[name] = JSON.parse($next.val().replace(/\&quot\;/g,'"'));
		} catch(e) {
			props[name] = {};
		}
		$inputs.push({
			name: name,
			$el: $next,
			val: props[name]
		});
		$next = $next.next();
	}
	
	//ReactDOM.render(React.createElement(lib.PipelineEditorDialog, props), $el[0]);
	ReactDOM.render(React.createElement(lib.PipelineEditorInline, props), $el[0]);
	
	$el.parents('form').on('submit', function() {
		for(var i = 0; i < $inputs.length; i++) {
			var field = $inputs[i];
			console.log('setting: ' + field.name + ' to: ' + json.stringify(field.val));
			field.$el.val(json.stringify(field.val));
		}
	});
}
