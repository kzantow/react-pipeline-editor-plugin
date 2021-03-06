var wf = require('./WorkflowStore.js');

/**
 * This is a simple shell-script plugin
 */
wf.addStepType({
	type: 'workflow',
	name: 'Workflow Script',
	icon: <span style={{fontFamily: 'Impact', fontWeight: 100, fontSize: '13px'}}>WF</span>,
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
		return data.command;
	}
});
