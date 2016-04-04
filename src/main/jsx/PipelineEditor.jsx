var lines = require('./svg/svg');
var wf = require('./WorkflowStore.js');

lines.reconnect = function() {
    // if there are already drawn lines, just update quickly
    if($('.pipeline-visual-editor svg').length > 0) {
        lines.init({strokeWidth: 2, animate: false, animationDuration: 0});
    } else {
        lines.init({strokeWidth: 2});
    }
    lines.set('strokeColor', '#999');
    lines.disconnect();
    lines.connect();
};

lines.disconnect = function() {
    lines.off();
};

lines.connect = function() {
    var parent = $('.pipeline-visual-editor')[0];
    
    var connections = [];
    $('.stage').each(function() {
        var $stages = $(this).find('.stage-block');
        // when connecting multiple, insert middle connection point
        if(connections.length > 0 && connections[connections.length-1].length > 1 && $stages.length > 1) {
            connections.push([$(this).find('.connect-between')[0]]);
        }
        
        var blocks = [];
        connections.push(blocks);
        $stages.each(function() {
            blocks.push(this);
        });
    });
    
    for(var i = 1; i < connections.length; i++) {
        var prev = connections[i-1];
        var curr = connections[i];
        
        for(var p = 0; p < prev.length; p++) {
            lines.on(parent, prev[p], curr[0]);
        }
        
        for(var n = 1; n < curr.length; n++) {
            lines.on(parent, prev[0], curr[n]);
        }
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
        wf.removeStage(this.props.stage);
    },
    showRenameStep: function() {
        this.refs.renameStage.show();
    },
    renameStage: function() {
        this.refs.renameStage.hide();
    },
    componentDidUpdate: function(prevProps, prevState) {
        if(!prevState || this.state.showStageListing != prevState.showStageListing) {
            setTimeout(function() { // wait for the show animation
                lines.reconnect();
            }, 500);
        }
    },
    componentDidMount: function() {
        this.componentDidUpdate();
    },
    hideRenameStage: function() {
        this.refs.actions.hide();
    },
    render: function() { return (
        <div className="panel panel-default stage-block">
            <div className="panel-heading">
                <ui.ActionMenu ref="actions">
                    <ui.Button type="link" onClick={this.toggleStageListing}>
                        <i className={'fa fa-expand-arrow ' + (this.state.showStageListing ? 'active' : '')}></i>
                        {this.props.stage.name}
                    </ui.Button>
                    <ui.Actions>
                        <ui.PopoverButton ref="renameStage" type="link" label="Rename" onHide={this.hideRenameStage}>
                            <f.Field label="Name">
                                <f.TextInput link={[this.props.stage,'name']} size={22} />
                            </f.Field>
                            <ui.Actions>
                                <ui.Button type="primary" onClick={this.renameStage}>OK</ui.Button>
                            </ui.Actions>
                        </ui.PopoverButton>
                        <ui.Button type="link" onClick={this.removeStage}>Remove</ui.Button>
                    </ui.Actions>
                </ui.ActionMenu>
                
                <ui.If rendered={this.state.showStageListing}>
                    <StepList stage={this.props.stage} />
                </ui.If>
            </div>
        </div>
    );}
});

var StageBlockContainer = React.createClass({
    //<i className="fa fa-random"></i> <i className="fa fa-forward"></i>
    getInitialState: function() {
        return {
            showAddBranch: false,
            addBranchDisabled: true
        };
    },
    showAddBranch: function() {
        this.setState({showAddBranch: true, addBranchDisabled: true});
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
         wf.removeStage(this.props.stage);
    },
    handleBranchName: function() {
        this.setState({showAddBranch: true, addBranchDisabled: ui.isEmpty(this.refs.newBranchName)});
    },
    render: function() { return (
        <div className="stage">
            <div className="insert-stage">
                <AddStageBlock type="primary outline xs" stage={this.props.stage} />
            </div>
                
            <div className="connect-between"></div>
            
            <div className="panel">
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
            
            <ui.PopoverButton type="primary outline" show={this.state.showAddBranch} onClose={this.hideAddBranch} label={<span><i className="fa fa-plus"></i> Parallel</span>}>
                <f.Field label="Name">
                    <f.TextInput ref="newBranchName" placeholder="Branch Name" autoFocus={true} size={22} onChange={this.handleBranchName} />
                </f.Field>
                <ui.Actions>
                    <ui.Button type="primary" disabled={this.state.addBranchDisabled} onClick={this.addBranch}>OK</ui.Button>
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
        if(this.props.stage) {
            wf.insertStage(this.props.stage, {
                name: this.state.newStageName,
                steps: []
            });
        }
        else {
            wf.addStage({
                name: this.state.newStageName,
                steps: []
            });
        }
        this.reset();
    },
    refresh: function() {
        this.forceUpdate();
    },
    reset: function() {
        this.setState({newStageName: '', showAddStage: false});
    },
    render: function() { return (
        <ui.PopoverButton show={[this.state,'showAddStage']} type={this.props.type} onClose={this.reset} label={<span><ui.Icon type="plus"/>{this.props.label}</span>}>
            <f.Field label="Stage Name">
                <f.TextInput link={[this.state,'newStageName']} onChange={this.refresh} onEnter={this.addStage} autoFocus={true} size={22} />
            </f.Field>
            <ui.Actions>
                <ui.Button ref="addStageBtn" type="primary" onClick={this.addStage} disabled={ui.isEmpty(this.state.newStageName)}>OK</ui.Button>
            </ui.Actions>
        </ui.PopoverButton>
    );}
});

var StepDetailButton = React.createClass({
    getInitialState: function() {
        return {
            showEditor: false
        };
    },
    saveStep: function() {
        wf.updateStep(this.props.step);
        this.setState({showEditor: false});
    },
    removeStep: function() {
        wf.removeStep(this.props.stage, this.props.step);
        this.setState({showEditor: false});
    },
    toggleEditor: function() {
        this.setState({showEditor: !this.state.showEditor});
    },
    hideEditor: function() {
        this.setState({showEditor: false});
    },
    render: function() {
        var stepType = wf.getStepMap()[this.props.step.type];
        var stepName = this.props.step.name ? this.props.step.name : ui.truncate(stepType.generateScript(this.props.step), 30);
        return (
        <div className={'step' + (this.state.showEditor ? ' active' : '')}>
            <div onClick={this.toggleEditor}><span className="step-icon">{stepType.icon}</span> {stepName}</div>
            <ui.Popover show={this.state.showEditor} onClose={this.hideEditor} ref="step" position="bottom-right">
                <ui.Panel>
                    <div>
                        <h3>
                            <ui.Split align="middle">
                                <span className="step-icon">{stepType.icon}</span>
                                <div>
                                    <f.InlineEdit onSave={this.forceUpdate.bind(this)}
                                        view={<span>{stepName}</span>}
                                        edit={<f.ContentEditable link={[this.props.step, 'name']} />} />
                                </div>
                            </ui.Split>
                        </h3>
                    </div>
                    <StepEditor step={this.props.step}/>
                    <ui.Row>
                        <ui.Button type="danger-outline" onClick={this.removeStep}><i className="fa fa-times"></i> Remove</ui.Button>
                    </ui.Row>
                    <ui.Actions>
                        <ui.Button type="link" onClick={this.hideEditor}>Close</ui.Button>
                        <ui.Button type="primary" onClick={this.saveStep}>OK</ui.Button>
                    </ui.Actions>
                </ui.Panel>
            </ui.Popover>
        </div>
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
        return null;
    }
});

var StepList = React.createClass({
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
    onStepTypeSelected: function(stepType) {
        console.log('stepType set: ' + stringify(stepType));
        
        this.setState({
            stepData: {type: stepType}
        });
    },
    render: function() { return (
        <ui.ClassTransition transitionName="step-listing" transitionEnterTimeout={0} transitionLeaveTimeout={0} transitionAppear={true} transitionAppearTimeout={500}>
            <div className="list-group step-listing">
                {ui.map(this.props.stage.steps, function(step,i) {
                    return <StepDetailButton key={i} stage={this.props.stage} step={step} />;
                }.bind(this))}
                
                <ui.PopoverButton ref="addStepContainer" onClose={this.onAddStepClose} type="primary xs" label={<span><ui.Icon type="plus"/></span>}>
                    <ui.Split>
                        <div className="nowrap">
                            <f.TextInput ref="stepName" onChange={this.onStepChange} onEnter={this.addStep} 
                                placeholder={wf.isValidStep(this.state.stepData) ? wf.generateScript(this.state.stepData) : 'Step Name'}
                                size={22}/>
                            <div className="step-select-box">
                            <f.RadioGroup onChange={this.onStepTypeSelected}>
                            {ui.map(wf.getStepTypes(), function(stepType, i) {
                                return <f.Item key={i} value={stepType.type}><span className="step-icon">{stepType.icon}</span> {stepType.name}</f.Item>;
                            })}
                            </f.RadioGroup>
                            </div>
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
        </ui.ClassTransition>
    );}
});

/**
 * The pipeline editor itself
 */
lib.PipelineEditor = React.createClass({
    mixins: [ wf.mixin('update') ],
     update: function() {
        lines.reconnect();
     },
     render: function() { return (
        <div className='pipeline-visual-editor'>
            <div className="stage-listing">
                <ui.Split>
                {ui.map(this.props.workflow, function(stage,i) {
                    return <StageBlockContainer key={'stage-'+stage.name} stage={stage} workflow={this.props.workflow} />;
                }.bind(this))}
                <AddStageBlock type="primary outline" label=" Add Stage"/>
                </ui.Split>
            </div>
        
            <div className="hidden generated-pipeline-script">
                <pre>{wf.toWorkflow(this.props.workflow)}</pre>
            </div>
        </div>
    );}
});
