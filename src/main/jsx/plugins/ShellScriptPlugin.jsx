/**
 * This is a simple shell-script plugin
 */
lib.plugins.push({
	type: 'sh',
	name: 'Shell Script',
	icon: <i className="fa fa-terminal"></i>,
	editor: React.createClass({
		render: function() {
			return <div>
				<f.TextArea link={[this.props.data,'command']} rows={6} cols={50}/>
			</div>;
		}
	}),
	generateScript: function(data) {
		return 'sh \'' + data.url + '\'';
	}
});
