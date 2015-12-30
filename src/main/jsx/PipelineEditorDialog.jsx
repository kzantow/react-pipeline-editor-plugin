var wf = require('./WorkflowStore.js');

/**
 * The pipeline editor entry point / container
 */
lib.PipelineEditorDialog = React.createClass({
	mixins: [ wf.mixin('update') ],
 	update: function() {
		console.log('wf update: ' + json.stringify(wf.getWorkflow()) + ' => ' + wf.toWorkflow(wf.getWorkflow()));
		this.props.data.pipelineModel = wf.getWorkflow();
		this.props.data.script = wf.toWorkflow(this.props.data.pipelineModel);
		this.forceUpdate();
 	},
 	componentWillMount: function() {
 		if(!this.props.data.pipelineModel) {
 			this.props.data.pipelineModel = [];
 		}
 		wf.setWorkflow(this.props.data.pipelineModel);
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
	render: function() { return (
		<div className="pipeline-editor bootstrap-3">
			<ui.Modal ref="modal" show={this.state.showModal} onClose={this.hideModal}>
				<lib.PipelineEditor workflow={this.props.data.pipelineModel} />
			</ui.Modal>
			<ui.Button label="Open Editor" type="success" onClick={this.onClickAdd} />
		</div>
	);}
});

lib.PipelineEditorInline = React.createClass({
	mixins: [ wf.mixin('update') ],
 	update: function() {
		console.log('wf update: ' + json.stringify(wf.getWorkflow()) + ' => ' + wf.toWorkflow(wf.getWorkflow()));
		this.props.data.pipelineModel = wf.getWorkflow();
		this.props.data.script = wf.toWorkflow(this.props.data.pipelineModel);
		this.forceUpdate();
 	},
 	componentWillMount: function() {
 		if(!this.props.data.pipelineModel) {
 			this.props.data.pipelineModel = [];
 		}
 		wf.setWorkflow(this.props.data.pipelineModel);
 	},
	render: function() { return (
		<div className="pipeline-editor bootstrap-3">
			<lib.PipelineEditor workflow={this.props.data.pipelineModel} />
		</div>
	);}
});
