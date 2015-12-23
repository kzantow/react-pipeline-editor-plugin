var lines = require('./svg/lines');
var wf = require('./WorkflowStore.js');

var StageBlock = React.createClass({
    //mixins: [ui.Emit('WorkflowUpdate')],
    getInitialState: function() {
        return {
            showStageListing: false
        };
    },
    toggleStageListing: function() {
        this.setState({showStageListing: !this.state.showStageListing});
    },
    removeStage: function() {
        wf.removeStage(this.props.workflow, this.props.stage);
    },
    showRenameStep: function() {
        this.refs.renameStep.show();
    },
    renameStage: function() {
        this.refs.renameStep.hide();
    },
    render: function() { return (
        <div className="panel panel-default stage-block">
            <div className="panel-heading">
                <ui.ActionMenu>
                    <i className={'fa fa-expand-arrow ' + (this.state.showStageListing ? 'active' : '')}></i>
                    <ui.Button type="link" onClick={this.toggleStageListing}>
                        {this.props.stage.name}
                    </ui.Button>
                    <ui.Actions>
                        <ui.Button type="link" onClick={this.showRenameStep}>Rename</ui.Button>
                        <ui.Popover ref="renameStep">
                            <ui.Panel>
                                <f.Field label="Name">
                                    <f.TextInput link={[this.props.stage,'name']} size={22} />
                                </f.Field>
                                <ui.Actions>
                                    <ui.Button type="primary" onClick={this.renameStage}>OK</ui.Button>
                                </ui.Actions>
                            </ui.Panel>
                        </ui.Popover>
                        <ui.Button type="link" onClick={this.removeStage}>Remove</ui.Button>
                    </ui.Actions>
                </ui.ActionMenu>
                
                <ui.If rendered={this.state.showStageListing}>
                    <StepsListing stage={this.props.stage} />
                </ui.If>
            </div>
        </div>
    );}
});

var StageBlockContainer = React.createClass({
    //<i className="fa fa-random"></i> <i className="fa fa-forward"></i>
    //mixins: [ui.Emit('WorkflowUpdate')],
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
                        }.bind(this))}
                    </ul>;
                }.bind(this))}
            </div>
            
            <ui.PopoverButton show={this.state.showAddBranch} onClose={this.hideAddBranch} label={<span><i className="fa fa-plus"></i> Add Parallel Branch</span>}>
                <f.Field label="Name">
                    <f.TextInput ref="newBranchName" placeholder="Branch Name" size={22} />
                </f.Field>
                <ui.Actions>
                    <ui.Button type="primary" onClick={this.addBranch}>OK</ui.Button>
                </ui.Actions>
            </ui.PopoverButton>
        </div>
    );}
});

var AddStageBlock = React.createClass({
    getInitialState: function() {
        return {
            showAddStage: false,
            newStageName: ''
        };
    },
    addStage: function() {
        wf.addStage({
            name: this.state.newStageName,
            steps: []
        });
        this.reset();
    },
    refresh: function() {
        this.forceUpdate();
    },
    reset: function() {
        this.setState({newStageName: '', showAddStage: false});
    },
    render: function() { return (
        <ui.PopoverButton show={[this.state,'showAddStage']} onClose={this.reset} label={<span><ui.Icon type="plus"/> Add Stage</span>}>
            <f.Field label="Stage Name">
                <f.TextInput link={[this.state,'newStageName']} onChange={this.refresh} onEnter={this.addStage} autofocus={true} size={22} />
            </f.Field>
            <ui.Actions>
                <ui.Button ref="addStageBtn" type="primary" onClick={this.addStage} disabled={ui.isEmpty(this.state.newStageName)}>OK</ui.Button>
            </ui.Actions>
        </ui.PopoverButton>
    );}
});

var StepDetailButton = React.createClass({
    saveStep: function() {
        this.refs.step.hide();
    },
    render: function() {
        var stepType = wf.getStepMap()[this.props.step.type];
        var stepName = this.props.step.name ? this.props.step.name : ui.truncate(stepType.generateScript(this.props.step), 30);
        return (
        <ui.PopoverButton ref="step" label={<span>{stepType.icon} {stepName}</span>}>
            <h3>{stepType.icon} <f.TextInput link={[this.props.step, 'name']}/></h3>
            <StepEditor step={this.props.step}/>
            <ui.Actions><ui.Button type="primary" onClick={this.saveStep}>OK</ui.Button></ui.Actions>
        </ui.PopoverButton>
    );}
});

var StepEditor = React.createClass({
    showStepDetails: function() {
        this.setState({showStepDetails: true});
    },
    render: function() {
        if(this.props.step) {
            var stepType = wf.getStepMap()[this.props.step.type];
            return React.createElement(stepType.editor, {data: this.props.step, onChange: this.props.onChange});
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
    getInitialState: function() {
        return {
            addStepDisabled: true,
            stepData: {}
        };
    },
    addStep: function() {
        var step = this.state.stepData;
        step.name = this.refs.stepName.val();
        wf.addStep(this.props.stage, step);
        this.refs.addStepContainer.hide();
        this.onAddStepClose();
    },
    onAddStepClose: function() {
        this.setState({addStepDisabled: true, stepData: {}});
    },
    onStepChange: function(e, oldVal, newVal) {
        this.setState({addStepDisabled: !wf.isValidStep(this.state.stepData)});
    },
    removeStep: function(step) {
        wf.removeStep(this.props.stage, step);
    },
    renameStep: function(step) {
        
    },
    onStepTypeSelected: function(stepType) {
        console.log('stepType set: ' + json.stringify(stepType));
        
        this.setState({
            stepData: {type: stepType}
        });
    },
    render: function() { return (
    <ui.Transition transitionName="step-listing" transitionEnterTimeout={1} transitionLeaveTimeout={1} transitionAppear={true} transitionAppearTimeout={1}>
        <div className="list-group step-listing">
            {ui.map(this.props.stage.steps, function(step,i) {
                return <div key={i}>
                    <ui.ActionMenu>
                        <StepDetailButton step={step} />
                        <ui.Actions>
                            <ui.Button type="link" onClick={function(){this.removeStep(step);}.bind(this)}><i className="fa fa-times"></i></ui.Button>
                        </ui.Actions>
                    </ui.ActionMenu>
                </div>;
            }.bind(this))}
            
            <ui.PopoverButton ref="addStepContainer" onClose={this.onAddStepClose} label={<span><ui.Icon type="plus"/> Add Step</span>}>
                <ui.Split>
                    <div>
                        <f.TextInput ref="stepName" onChange={this.onStepChange} onEnter={this.addStep} 
                        	placeholder={wf.isValidStep(this.state.stepData) ? wf.generateScript(this.state.stepData) : 'Step Name'}
                        	size={22}/>
                        <f.RadioGroup onChange={this.onStepTypeSelected}>
                        {ui.map(wf.getStepTypes(), function(stepType, i) {
                            return <f.Item key={i} value={stepType.type}>{stepType.icon} {stepType.name}</f.Item>;
                        })}
                        </f.RadioGroup>
                    </div>
                    <div>
                        {ui.when(!ui.isEmpty(this.state.stepData.type), function() {
                            return <StepEditor onChange={this.onStepChange} step={this.state.stepData}/>;
                        }.bind(this))}
                    </div>
                </ui.Split>
                <ui.Actions>
                    <ui.Button ref="addStep" onClick={this.addStep} type="primary" disabled={this.state.addStepDisabled}>Add</ui.Button>
                </ui.Actions>
            </ui.PopoverButton>
        </div>
    </ui.Transition>
    );}
});

/**
 * The pipeline editor itself
 */
lib.PipelineEditor = React.createClass({
    removeStage: function(workflow, stage) {
        wf.removeStage(workflow, stage);
    },
    render: function() { return (
        <div className='pipeline-visual-editor'>
            <div className="container stage-listing">
                {ui.map(this.props.workflow, function(stage,i) {
                    return <div key={i} className="col-md-3">
                        <StageBlockContainer key={'stage-'+stage.name} stage={stage} workflow={this.props.workflow} />
                    </div>;
                }.bind(this))}
        
                <div className="col-md-12">
                    <AddStageBlock workflow={this.props.workflow} />
                </div>

                <div className="col-md-12">
                    <f.TextArea ref="script" value={wf.toWorkflow(this.props.workflow)} expand={true} disabled={true} />
                </div>
            </div>
        </div>
    );}
});
