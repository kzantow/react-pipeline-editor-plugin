var lines = require('./svg/lines');

var stringify = require('./model/stringify');
var wf = require('./model/workflow-fixed');

var WorkflowStore = {
	workflow: null,
	stepTypes: lib.plugins, // FIXME lookup
	getWorkflow: function() {
		return this.workflow;
	},
	getStepTypes: function() {
		return this.stepTypes;
	},
	getStepMap: function() {
		var stepMap = {};
		var stepTypes = this.getStepTypes();
		for(var i = 0; i < stepTypes.length; i++) {
			stepMap[stepTypes[i].type] = stepTypes[i];
		}
		return stepMap;
	}
};

var StageBlock = React.createClass({
	getInitialState: function() {
		return {
			showStageListing: false
		};
	},
	toggleStageListing: function() {
		this.setState({showStageListing: !this.state.showStageListing});
	},
	removeStage: function() {
		wf.removeStage(this.props.workflow, this.props.state);
	},
	render: function() { return (
	    <div className="panel panel-default stage-block">
	        <div className="panel-heading">
	            <ui.Button type="link" onClick={this.toggleStageListing}>
	            	{ui.when(this.state.showStageListing, function() {
	            		return <i className="fa fa-caret-down"></i>;
	            	}, function() {
	            		return <i className="fa fa-caret-right"></i>;
	            	})}
		    		<ui.ActionMenu>
		    			{this.props.stage.name}
		    			<ui.Actions>
		    				<ui.Button onClick={this.removeStage}>Remove</ui.Button>
	    				</ui.Actions>
	    			</ui.ActionMenu>
            	</ui.Button>
	            
	            <ui.If rendered={this.state.showStageListing}>
	            	<StepsListing stage={this.props.stage} />
	            </ui.If>
	        </div>
	    </div>
	);}

});

var StageBlockContainer = React.createClass({
	//<i className="fa fa-random"></i> <i className="fa fa-forward"></i>
	mixins: [ui.Emit('WorkflowUpdate')],
	getInitialState: function() {
		return {
			showAddBranch: false
		};
	},
	showAddBranch: function() {
		this.setState({showAddBranch: true});
	},
	hideAddBranch: function() {
		this.setState({showAddBranch: false});
	},
	addBranch: function() {
		if(!wf.isParallelStage(this.props.stage)) {
			wf.makeParallel(this.props.stage);
		}
		this.props.stage.streams.push({
			name: this.refs.newBranchName.val(),
			steps: []
		});
		
		this.setState({showAddBranch: false});
	},
	toggleParallel: function() {
		wf.toggleParallel(this.props.stage);
	},
	removeStage: function() {
		 wf.removeStage(this.props.workflow, this.props.stage);
	},
	render: function() { return (
		<div>
		<div className="panel">
        <div className="panel-heading">
    		<h3>
	    		<ui.ActionMenu>
	    			{this.props.stage.name}
	    			<ui.Actions>
	    				<ui.Button onClick={this.removeStage}>Remove</ui.Button>
    				</ui.Actions>
    			</ui.ActionMenu>
	    		
	    		{ui.when(wf.isParallelStage(this.props.stage), function() {
	    			return <i className="fa fa-random small"></i>;
	    		})}
			</h3>
    	</div>
    	
		{ui.when(!wf.isParallelStage(this.props.stage), function() {
			return <StageBlock stage={this.props.stage} workflow={this.props.workflow} />;
		}.bind(this), function() {
			return <ul className="list-unstyled">
				{ui.map(this.props.stage.streams, function(subStage,i) {
				return <li key={'stage-' + i}>
					<StageBlock stage={subStage} workflow={this.props.workflow} />
				</li>;
				})}
			</ul>;
		}.bind(this))}
		</div>
		
		<ui.Wrap>
			<ui.Button onClick={this.showAddBranch} type={(this.state.showAddBranch ? 'primary active' : 'default')}><i className="fa fa-plus"></i> Add Parallel Branch</ui.Button>
			<ui.Popover show={this.state.showAddBranch} onClose={this.hideAddBranch}>
				<ui.Panel>
					<f.Field label="Name">
						<f.TextInput ref="newBranchName" placeholder="New Parallel Branch Name" />
					</f.Field>
					<ui.Actions>
						<ui.Button type="primary" onClick={this.addBranch}>OK</ui.Button>
					</ui.Actions>
				</ui.Panel>
			</ui.Popover>
		</ui.Wrap>
		</div>
	);}
});

var AddStageBlock = React.createClass({
	mixins: [ui.Emit('WorkflowUpdate')],
	showAddStage: function() {
		this.refs.addStage.show();
	},
	addStage: function() {
		this.refs.addStage.hide();
		this.props.workflow.push({
			name: this.refs.stageName.val(),
			steps: []
		});
	},
	render: function() { return (
		<div className="col-md-3 edit-mode">
			<ui.Button onClick={this.showAddStage}>
				<ui.Icon type="plus"/> Add Stage
			</ui.Button>
			<ui.Popover ref="addStage">
				<f.TextInput ref="stageName" value={''} onEnter={this.addStage}/>
				<ui.Button onClick={this.addStage}>OK</ui.Button>
			</ui.Popover>
		</div>
	);}
});

var StepDetailButton = React.createClass({
	getInitialState: function() {
		return {
			showStepDetails: false
		};
	},
	clickStepDetails: function(e) {
		this.setState({showStepDetails: !this.state.showStepDetails});
	},
	onCloseStepDetails: function() {
		this.setState({showStepDetails: false});
	},
	render: function() {
		return <ui.Wrap>
			<ui.Button onClick={this.clickStepDetails} type={(this.state.showStepDetails ? 'primary active' : 'default')}>{this.props.step.name}</ui.Button>
			<ui.Popover show={this.state.showStepDetails} onClose={this.onCloseStepDetails}>
				<StepEditor step={this.props.step}/>
			</ui.Popover>
		</ui.Wrap>;
	}
});

var StepEditor = React.createClass({
	getInitialState: function() {
		return {
		};
	},
	showStepDetails: function() {
		this.setState({showStepDetails: true});
	},
	render: function() {
		if(this.props.step) {
			var stepType = WorkflowStore.getStepMap()[this.props.step.type];
			return <div>
				<h3>{stepType.icon} <f.TextInput link={[this.props.step, 'name']}/></h3>
				{React.createElement(stepType.editor, {data: this.props.step})}
			</div>;
		}
		if(false) {
			var editors = [];
			ui.eachProp(this.props.step, function(prop) {
				var editor = <div key={prop}><label>{prop}</label><f.TextInput link={[this.props.step,prop]}/></div>;
				editors.push(editor);
			}.bind(this));
			return <f.Form>
				{editors}
			</f.Form>;
		}
		return null;
	}
});

var StepsListing = React.createClass({
	mixins: [ui.Emit('WorkflowUpdate')],
	getInitialState: function() {
		return {
			showAddStep: false,
			addStepDisabled: true,
			stepType: null,
			stepData: this.props.stepData ? this.props.stepData : {}
		};
	},
	showAddStep: function() {
		this.setState({showAddStep: true});
		this.refs.addStep.show();
	},
	addStep: function() {
		var step = this.state.stepData;
		step.name = this.refs.stepName.val();
		this.props.stage.steps.push(step);

		this.setState({showAddStep: false, addStepDisabled: true, stepType: null});
	},
	onAddStepClose: function() {
		this.setState({showAddStep: false, addStepDisabled: true, stepType: null});
	},
	onAddStepInputChange: function(e, oldVal, newVal) {
		this.setState({addStepDisabled: newVal === ''});
	},
	removeStep: function(step) {
		wf.removeStep(this.props.stage, step);
	},
	onStepTypeSelected: function(stepType) {
		this.setState({
			stepData: {type: stepType.type},
			stepType: stepType
		});
	},
	render: function() { return (
		<div className="list-group step-listing">
	    	{ui.map(this.props.stage.steps, function(step,i) {
			    return <div key={i}>
			    	<StepDetailButton step={step}/>
			    	<ui.Button onClick={function(){this.removeStep(step);}.bind(this)}><i className="fa fa-times"></i></ui.Button>
		    	</div>;
	    	}.bind(this))}
	    	
			<ui.Wrap>
				<ui.Button onClick={this.showAddStep}>
			    	<ui.Icon type="plus"/> Add Step
			    </ui.Button>
			    
	    		<ui.Tooltip ref="addStepTip" text="Woot" />

    			<ui.Popover ref="addStep" show={this.state.showAddStep} onClose={this.onAddStepClose}>
	    			<ui.Panel>
	    				<f.RadioGroup onChange={this.onStepTypeSelected}>
	    				{ui.map(WorkflowStore.getStepTypes(), function(stepType, i) {
	    					return <f.Item key={i} value={stepType}>{stepType.name}</f.Item>;
    					})}
	    				</f.RadioGroup>
						<f.TextInput ref="stepName" onChange={this.onAddStepInputChange} onEnter={this.addStep} placeholder="New Step Name"/>
						{ui.when(this.state.stepType !== null, function() {
							return <StepEditor step={this.state.stepData}/>;
						}.bind(this))}
						<ui.Actions>
							<ui.Button onClick={this.addStep} disabled={this.state.addStepDisabled}>Add</ui.Button>
						</ui.Actions>
					</ui.Panel>
				</ui.Popover>
			</ui.Wrap>
		</div>
	);}
});

/**
 * The pipeline editor itself
 */
lib.PipelineEditor = React.createClass({
	mixins: [ui.Events],
	on: {
		WorkflowUpdate: function() {
			this.forceUpdate();
		}
	},
	removeStage: function(workflow, stage) {
		wf.removeStage(workflow, stage);
		this.forceUpdate();
	},
	componentWillMount: function() {
		if(!this.props.workflow) { // nothing there, need a root object (this is an array... ugh)
			this.props.workflow = [];
		}
		WorkflowStore.workflow = this.props.workflow;
		console.log('loading workflow: ' + json.stringify(this.props.workflow));
	},
	render: function() {
		return (
			<div className='pipeline-visual-editor'>
				<div className="container stage-listing">
					<div className="row">
					{ui.map(this.props.workflow, function(stage,i) {
						return <div key={i} className="col-md-3">
							<StageBlockContainer key={'stage-'+stage.name} stage={stage} workflow={this.props.workflow} />
						</div>;
					}.bind(this))}
					</div>
					<AddStageBlock workflow={this.props.workflow} />
					<f.TextArea value={wf.toWorkflow(this.props.workflow, WorkflowStore.getStepMap())} expand={true} />
				</div>
			</div>
		);
	}
});
