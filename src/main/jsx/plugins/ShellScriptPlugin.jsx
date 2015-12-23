var wf = require('./WorkflowStore.js');

/**
 * This is a simple shell-script plugin
 */
wf.addStepType({
	type: 'sh',
	name: 'Shell Script',
	icon: <i className="fa fa-terminal"></i>,
	editor: React.createClass({
		onChange: function() {
			if(this.props.onChange) {
				this.props.onChange();
			}
		},
		render: function() {
			return <div>
				<f.TextArea link={[this.props.data,'command']} rows={6} cols={50} onChange={this.onChange}/>
			</div>;
		}
	}),
	isValid: function(data) {
		return !ui.isEmpty(data.command);
	},
	generateScript: function(data) {
		return 'sh \'\'\'' + data.command + '\'\'\'';
	}
});
