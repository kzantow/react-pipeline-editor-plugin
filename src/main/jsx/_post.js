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
			if($next.is('.json')) {
				data[name] = $next.val() !== '' ? JSON.parse($next.val().replace(/\&quot\;/g,'"')) : null;
			}
			else {
				data[name] = $next.val();
			}
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
	
	var wf = require('./WorkflowStore.js');

	wf.addListener(function() {
		for(var i = 0; i < $inputs.length; i++) {
			var field = $inputs[i];
			var val;
			if(field.$el.is('.json')) {
				val = json.stringify(data[field.name]);
			}
			else {
				val = data[field.name];
			}
			if(debug) console.log('setting: ' + field.name + ' to: ' + val);
			field.$el.val(val);
		}
	});
}
