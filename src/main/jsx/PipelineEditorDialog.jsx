var wf = require('./model/workflow-fixed');

/**
 * The pipeline editor entry point / container
 */
lib.PipelineEditorDialog = React.createClass({
	mixins: [ui.Events],
	on: {
		WorkflowUpdate: function() {
			//this.props.script = wf.generateScript();
		}
	},
	getInitialState: function() {
		return {
			showModal: false
		};
	},
	onClickAdd: function() {
		this.setState({showModal: true});
	},
	hideModal: function() {
		this.setState({showModal: false});
	},
	render: function() {
		return (
			<div className="pipeline-editor bootstrap-3">
				<ui.If ref="modal" rendered={this.state.showModal}>
					<ui.Modal ref="modal2" show={true} onClose={this.hideModal}>
						<lib.PipelineEditor workflow={this.props.pipelineModel} />
					</ui.Modal>
				</ui.If>
				<ui.Button label="Open Editor" type="success" onClick={this.onClickAdd} />
			</div>
		);
	}
});

lib.PipelineEditorInline = React.createClass({
	render: function() {
		return (
			<div className="pipeline-editor bootstrap-3">
				<lib.PipelineEditor workflow={this.props.pipelineModel} />
			</div>
		);
	}
});
