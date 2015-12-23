var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('bootstrap-detached').getBootstrap();
var json = require('./model/stringify.js');

var $el = $('.react-pipeline-editor-plugin');
if($el.length > 0) {
	var data = {};
	var $inputs = [];
	var $next = $el.next();
	
	while($next.is('input')) {
		var name = $next.attr('name').replace(/\_\./,'');
//		try {
			data[name] = $next.val() !== '' ? JSON.parse($next.val().replace(/\&quot\;/g,'"')) : null;
//		} catch(e) {
//			data[name] = {};
//		}
		$inputs.push({
			name: name,
			$el: $next
		});
		$next = $next.next();
	}
	
	var type = true ? lib.PipelineEditorInline : lib.PipelineEditorDialog;
	var component = React.createElement(type, {data: data});
	ReactDOM.render(component, $el[0]);
	
	$el.parents('form').on('submit', function() {
		for(var i = 0; i < $inputs.length; i++) {
			var field = $inputs[i];
			if(debug) console.log('setting: ' + field.name + ' to: ' + json.stringify(data[field.name]));
			field.$el.val(json.stringify(data[field.name]));
		}
	});
}
