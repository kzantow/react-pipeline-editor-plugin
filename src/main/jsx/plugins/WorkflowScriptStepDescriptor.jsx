/**
 * This is a simple shell-script plugin
 */
lib.plugins.push({
	type: 'workflow',
	name: 'Workflow Script',
	icon: <i className="fa fa-code"></i>,
	editor: React.createClass({
		render: function() {
			return <div>
				<f.TextArea link={[this.props.data,'command']} rows={6} cols={50}/>
			</div>;
		}
	}),
	generateScript: function(data) {
		return 'node \'' + data.url + '\'';
	}
});
