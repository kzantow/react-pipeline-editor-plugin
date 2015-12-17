if(!lib.ui) lib.ui = {};

lib.ui.map = function(array, fn) {
	return $.map(array, fn); // TODO what's the 'best' map function?
};

lib.ui.choose = function(val, options) {
	return options[val];
};

lib.ui.when = function(condition, fn, otherwise) {
	if(condition) {
		return fn();
	}
	if(otherwise) {
		return otherwise();
	}
	return null;
};

lib.ui.isDescendant = function(parent, child) {
    var node = child.parentNode;
    while(node !== null) {
        if(node === parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
};

lib.ui.eachProp = function(obj, handler) {
	for(var prop in obj) {
		handler(prop);
	}
};

lib.ui.Wrap = React.createClass({
	render: function() {
		return <span className="j-ui-wrap">{this.props.children}</span>;
	}
});

lib.ui.Button = React.createClass({
	getDefaultProps: function() {
		return {
			type: 'default',
			disabled: false
		};
	},
	handleClick: function(event) {
		event.preventDefault();
		if(this.props.onClick) {
			this.props.onClick();
		}
	},
	getContent: function() {
		if(React.Children.count(this.props.children) > 0) {
			return this.props.children;
		}
		return this.props.label;
	},
	render: function() {
		return <button className={'btn btn-' + this.props.type} disabled={this.props.disabled} onClick={this.handleClick}>{this.getContent()}</button>;
	}
});

lib.ui.Icon = React.createClass({
	render: function() {
		return <span className={'glyphicon glyphicon-' + this.props.type} aria-hidden="true"></span>;
	}
});

lib.ui.Tooltip = React.createClass({
    componentDidMount: function() {
    	$(ReactDOM.findDOMNode(this)).tooltip();
    },
	render: function() {
		return <span className='tooltip' title={this.props.text}></span>;
	}
});

lib.ui.Modal = React.createClass({
	getDefaultProps: function() {
		return {
			show: false
		};
	},
	getInitialState: function() {
		return {
			show: this.props.show
		};
	},
    componentDidMount: function() {
        $(this.refs.modal).modal('show');
        $(this.refs.modal).on('hidden.bs.modal', this.onClose);
    },
    onClose: function() {
    	if(this.props.onClose) {
    		this.props.onClose(this);
    	}
    },
    show: function() {
    	this.setState({show: true});
    },
    hide: function() {
    	this.setState({show: false});
    },
    render: function() {
    	if(!this.state.show) {
    		return null;
    	}
        return (
          <div className="modal fade" ref="modal">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title">{this.props.title}</h4>
                </div>
                <div className="modal-body">
                	{this.props.children}
                </div>
                <div className="modal-footer">
                  <ui.Button type="default" onClick={this.hide}>Close</ui.Button>
                  <ui.Button type="primary">Save changes</ui.Button>
                </div>
              </div>
            </div>
          </div>
        );
    },
    propTypes: {
        show: React.PropTypes.bool.isRequired,
        onClose: React.PropTypes.func.isRequired
    }
});

var forceUpdate = false;
lib.ui.Popover = React.createClass({
	getDefaultProps: function() {
		return {
			show: false,
			closeable: true,
			position: 'bottom right'
		};
	},
	getInitialState: function() {
		return {
			show: this.props.show
		};
	},
	componentWillReceiveProps: function(props) {
	    if(props.show != this.state.show) {
	    	this.setState({show: props.show});
	    }
	},
	componentDidUpdate: function(prevProps, prevState) {
	    if(this.props.closeable && this.state.show && this.state.show !== prevState.show) { // auto-bind close handlers for closeable popovers
	    	var handler = function(e) {
	    		if(lib.ui.isDescendant(ReactDOM.findDOMNode(this), e.target)) {
	    			return; // don't close for events that originated in the popover
	    		}
	    		this.handleClose();
	    		$(document).off('click', handler);
	    	}.bind(this);
	    	$(document).on('click', handler);
	    }
	},
	show: function() {
		this.setState({show: true});
		if(forceUpdate) {
			if(this.props.children) {
				for(var i = 0; i < this.props.children.length; i++) {
					if(this.props.children[i].forceUpdate) {
						this.props.children[i].forceUpdate();
					}
				}
			}
			this.forceUpdate();
		}
	},
	hide: function() {
		this.setState({show: false});
		if(forceUpdate) {
			this.forceUpdate();
		}
	},
	handleClose: function() {
		this.setState({show: false});
		if(this.props.onClose) {
			this.props.onClose();
		}
	},
	render: function() {
		if(!this.state.show) {
			return null;
		}
		return <div className={'j-ui-popover ' + this.props.position + (this.state.show ? ' active' : '')}>
           {lib.ui.when(this.props.title, function() { return <h3>{this.props.title}</h3>; })}
           {this.props.children}
        </div>;	
	}
});

lib.ui.If = React.createClass({
	getDefaultProps: function() {
		return {
			rendered: false
		};
	},
	render: function() {
		if(this.props.rendered && this.props.children) {
			return <div>{this.props.children}</div>;
		}
		return null;
	},
    propTypes: {
    	rendered: React.PropTypes.bool.isRequired
    }
});

lib.ui.Horizontal = React.createClass({
	getDefaultProps: function() {
		return {
			width: null
		};
	},
	render: function() {
		return <div className="horizontal" style={this.props.width ? this.props.width : ''}>{this.props.children}</div>;
	}
});

lib.ui.Panel = React.createClass({
	getDefaultProps: function() {
		return {
			width: null
		};
	},
	render: function() {
		var actions = null;
		var children = [];
		React.Children.forEach(this.props.children, function(child,i) {
			if(!child) {
				return;
			}
			if(child.type && child.type == lib.ui.Actions) {
				actions = child;
				return;
			}
			children.push(child);
		});
		return <div className="panel" style={{width: this.props.width ? this.props.width : ''}}>
			{children}
			{actions}
		</div>;
	}
});

/**
 * A facet placeholder for action blocks
 */
lib.ui.Actions = React.createClass({
	render: function() {
		return <div className="actions">{this.props.children}</div>;
	}
});

lib.ui.ActionMenu = React.createClass({
	getDefaultProps: function() {
		return {
			width: null
		};
	},
	getInitialState: function() {
		return {
			showActions: false
		};
	},
	onShowActions: function() {
		this.setState({showActions: true});
	},
	onHideActions: function() {
		this.setState({showActions: false});
	},
	render: function() {
		var actions = null;
		var renderedChildren = [];
		React.Children.forEach(this.props.children, function(child) {
			if(!child) {
				return;
			}
			if(child.type && child.type == lib.ui.Actions) {
				actions = <div className={'drop-down ' + (this.state.showActions ? ' active' : '')}>
					<div className="toggle" onClick={this.onShowActions}>
						<i className="fa fa-caret-down"></i>
					</div>
					<ui.Popover position="bottom left" show={this.state.showActions} onClose={this.onHideActions}>
						{child.props.children}
					</ui.Popover>
				</div>;
				return;
			}
			renderedChildren.push(child);
		}.bind(this));
		return <div className="action-menu">
			{renderedChildren}
			{actions}
		</div>;
	}
});
