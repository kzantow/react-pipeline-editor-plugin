var wf = require('./WorkflowStore.js');

/**
 * This is a more complicated plugin providing a richer editor for git functionality
 */
wf.addStepType({
	type: 'git',
	name: 'Git',
	icon: <i className="fa fa-code-fork"></i>,
	editor: React.createClass({
		mixins: [ui.Emit('WorkflowUpdate')],
		updateValue: function(event, old, newVal) {
			//this.props.data.url = newVal; // TODO validate
			this.forceUpdate();
			if(this.props.onChange) {
				this.props.onChange();
			}
		},
		render: function() {
			return <ui.Split>
				<f.Field label="Command">
					<f.RadioGroup link={[this.props.data,'command']} onChange={this.updateValue}>
					{ui.map(['clone','checkout','stash','stash pop','push'], function(command, i) {
						return <f.Item value={command}>{command}</f.Item>;
					})}
					</f.RadioGroup>
				</f.Field>
				{ui.choose(this.props.data.command, {
					clone: <f.Field label="Git URL">
							<f.TextInput link={[this.props.data,'url']} size={22}/>
						</f.Field>,
					checkout: <f.Field label="Branch Name">
							<f.TextInput link={[this.props.data,'branch']} size={22}/>
						</f.Field>
				})}
			</ui.Split>;
		}
	}),
	isValid: function(data) {
		return this.generateScript(data).length > 'git '.length;
	},
	generateScript: function(data) {
		var cmd = '';
		switch(data.command) {
		case 'clone':
			cmd = ' \'' + data.url + '\'';
			break;
		case 'checkout':
			cmd = data.branch;
			break;
		}
		return 'git ' + data.command + cmd;
	}
});
