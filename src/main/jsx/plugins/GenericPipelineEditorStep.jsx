/**
 * Generic pipeline editor plugin, must implement:
 * 
 * type <-- a unique id
 * name <-- a display name
 * generateScript(data) <-- generate the workflow script based on the provided data object
 * default() <-- create a new object for this type
 * 
 */

var PipelineStepType = function(args) {
	for(var name in args) {
		this[name] = args[name];
	}
};

PipelineStepType.prototype.icon = <i className="fa fa-circle-o"></i>;

PipelineStepType.prototype.editor = React.createClass({
	onUpdate: function() {
		this.forceUpdate();
		if(this.props.onChange) {
			this.props.onChange();
		}
	},
	render: function() {
		return <span>
	        {ui.eachProp(this.props.step, function(prop) {
	            var editor = <f.Field key={prop} label={prop}><f.TextInput link={[this.props.step,prop]} onChange={this.onUpdate}/></f.Field>;
	            editors.push(editor);
	        }.bind(this))}
        </span>;
	}
});

PipelineStepType.prototype.isValid = function(data) {
	return true;
};

module.exports = PipelineStepType;
