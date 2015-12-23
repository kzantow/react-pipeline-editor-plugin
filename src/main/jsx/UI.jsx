if(!ui) ui = lib.ui = {};

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

ui.Transition = ReactCSSTransitionGroup;

ui.map = function(array, fn) {
	return $.map(array, fn); // TODO what's the 'best' map function?
};

ui.choose = function(val, options) {
	return options[val];
};

ui.when = function(condition, fn, otherwise) {
	if(condition) {
		return fn();
	}
	if(otherwise) {
		return otherwise();
	}
	return null;
};

ui.isDescendant = function(parent, child) {
    var node = child.parentNode;
    while(node !== null) {
        if(node === parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
};

ui.eachProp = function(obj, handler) {
	for(var prop in obj) {
		handler(prop);
	}
};

ui.isArray = function(o) {
	return o && o.constructor === Array;
};

ui.isString = function(o) {
	return o && (o instanceof String || typeof(o) === 'string');
};

ui.truncate = function(s, sz) {
	return s.length > sz ? (s.substring(0,sz-3) + '...') : s;
};

/**
 * Get children of a specific type
 */
ui.getChildrenOfType = function(children, type) {
	var renderedChildren = null;
	React.Children.forEach(children, function(child,i) {
		if(!child) {
			return;
		}
		if(child.type && child.type == type) {
			if(!renderedChildren) {
				renderedChildren = child;
			}
			else {
				if(!(renderedChildren instanceof Array)) {
					renderedChildren = [renderedChildren];
				}
				renderedChildren.push(child);
			}
		}
	});
	return renderedChildren;
};


/**
 * Get children of a specific type
 */
ui.eachChildOfType = function(children, type, fn) {
	var renderedChildren = null;
	React.Children.forEach(children, function(child,i) {
		if(!child) {
			return;
		}
		if(child.type && child.type == type) {
			if(!renderedChildren) {
				renderedChildren = fn(child);
			}
			else {
				if(!(renderedChildren instanceof Array)) {
					renderedChildren = [renderedChildren];
				}
				renderedChildren.push(fn(child));
			}
		}
	});
	return renderedChildren;
};

/**
 * Determines if the variable is 'empty'
 */
ui.isEmpty = function(val) {
	if(debug) console.log('is empty ' + val);
	return val === undefined || val === null || val === '';
};

/**
 * Get children of a specific type
 */
ui.getChildrenExclduingType = function(children, type) {
	var renderedChildren = null;
	React.Children.forEach(children, function(child,i) {
		if(!child) {
			return;
		}
		if(child.type && child.type != type) {
			if(!renderedChildren) {
				renderedChildren = child;
			}
			else {
				if(!(renderedChildren instanceof Array)) {
					renderedChildren = [renderedChildren];
				}
				renderedChildren.push(child);
			}
		}
	});
	return renderedChildren;
};

/**
 * Give the container a recommended width
 */
ui.Split = React.createClass({
	render: function() {
		return <div className="j-ui-split" style={this.props.style}>
		{ui.map(this.props.children, function(child,i) {
			return <span key={i}>{child}</span>;
		})}
		</div>;
	}
});

ui.Wrap = React.createClass({
	render: function() {
		return <span className="j-ui-wrap">{this.props.children}</span>;
	}
});

ui.Button = React.createClass({
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

ui.Icon = React.createClass({
	render: function() {
		return <span className={'glyphicon glyphicon-' + this.props.type} aria-hidden="true" style={this.props.style}></span>;
	}
});

ui.Tooltip = React.createClass({
    componentDidMount: function() {
    	$(ReactDOM.findDOMNode(this)).tooltip();
    },
	render: function() { return (
		<span className='tooltip' title={this.props.text}></span>
	);}
});

ui.Modal = React.createClass({
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

ui.Popover = React.createClass({
	getDefaultProps: function() {
		return {
			show: false,
			closeable: true,
			position: 'bottom right',
			type: ''
		};
	},
	getInitialState: function() {
		return {
			show: this.props.show,
			active: false
		};
	},
	componentWillReceiveProps: function(props) {
	    if(props.show != this.state.show) {
	    	this.setState({show: props.show});
	    }
	},
	componentDidUpdate: function(prevProps, prevState) {
	    if(this.props.closeable && this.state.show && this.state.show !== prevState.show) { // auto-bind close handlers for closeable popovers
	    	this.state.handler = function(e) {
	    		try {
		    		if(ui.isDescendant(ReactDOM.findDOMNode(this), e.target)) {
		    			return; // don't close for events that originated in the popover
		    		}
	    		} catch(x) {
	    			// ignore - e.g. DOM node was removed
	    		}
	    		
	    		this.handleClose();
	    		$(document).off('click', this.state.handler);
	    	}.bind(this);
	    	
	    	$(document).on('click', this.state.handler);
	    }
	},
	componentWillUnmount: function() {
		this.setState({active: false});
		if(debug) console.log('removing click handler for popover...');
		$(document).off('click', this.state.handler);
	},
	componentDidMount: function() {
//		setTimeout(function() {
//			this.setState({active: true});
//		}.bind(this), 1000);
	},
	show: function() {
		this.setState({show: true});
	},
	hide: function() {
		this.setState({show: false});
	},
	handleClose: function() {
		if(this.isMounted()) {
			this.setState({show: false});
		}
		else {
			this.state.show = false; // ick
		}
		if(this.props.onClose) {
			this.props.onClose();
		}
	},
	render: function() {
		if(!this.state.show) {
			return null;
		}
		return <ui.Transition transitionName="j-ui-popover" transitionEnterTimeout={1} transitionLeaveTimeout={1} transitionAppear={true} transitionAppearTimeout={1}>
			<div className={'j-ui-popover active ' + this.props.position + ' ' + this.props.type + (this.state.active ? ' open' : '')}>
	           {ui.when(this.props.title, function() { return <h3>{this.props.title}</h3>; })}
	           {this.props.children}
	        </div>
        </ui.Transition>;	
	}
});

/**
 * 
 */
ui.PopoverButton = React.createClass({
	propTyes: {
		label: React.PropTypes.string.isRequired,
		type: React.PropTypes.string,
		onShow: React.PropTypes.func,
		onHide: React.PropTypes.func
	},
	getDefaultProps: function() {
		return {
			position: 'bottom right',
			type: 'default'
		};
	},
	getInitialState: function() {
		return {
			show: this.props.show ? true : false
		};
	},
	componentWillReceiveProps: function(props) {
		if('show' in props && !ui.isArray(props.show) && props.show !== this.state.show) {
    		this.setState({show: props.show});
	    }
	},
	show: function(e) {
		if(e) e.preventDefault();
		
		if(ui.isArray(this.props.show)) {
			this.props.show[0][this.props.show[1]] = true;
			this.forceUpdate();
		}
		else {
			this.setState({show: true});
		}
		if(this.props.onShow) {
			this.props.onShow();
		}
	},
	hide: function(e) {
		if(e) e.preventDefault();
		
		if(ui.isArray(this.props.show)) {
			this.props.show[0][this.props.show[1]] = false;
			this.forceUpdate();
		}
		else {
			this.setState({show: false});
		}
		if(this.props.onHide) {
			this.props.onHide();
		}
	},
	isShown: function() {
		if(ui.isArray(this.props.show)) {
			return true === this.props.show[0][this.props.show[1]];
		}
		return this.state.show;
	},
	render: function() { return (
		<span className="j-ui-wrap">
			<button className={'btn btn-' + this.props.type + (this.isShown() ? ' active' : '')} onClick={this.show}>
				{this.props.label}
			</button>
			<ui.Popover position={this.props.position} show={this.isShown()} onClose={this.hide}>
				<ui.Panel>
					{ui.getChildrenExclduingType(this.props.children, ui.Actions)}
					<ui.Actions>
		                <ui.Button type="link" onClick={this.hide}>Close</ui.Button>
						{ui.eachChildOfType(this.props.children, ui.Actions, function(child) { return child.props.children; }.bind(this))}
					</ui.Actions>
				</ui.Panel>
			</ui.Popover>
		</span>
	);}
});

/**
 * Helper to conditionally render based on a condition
 */
ui.If = React.createClass({
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

ui.Horizontal = React.createClass({
	getDefaultProps: function() {
		return {
			width: null
		};
	},
	render: function() {
		return <div className="horizontal" style={this.props.width ? this.props.width : ''}>{this.props.children}</div>;
	}
});

/**
 * UI container, holds a spot for actions defined with <ui.Action> ...
 */
ui.Panel = React.createClass({
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
			if(child.type && child.type == ui.Actions) {
				actions = child;
				return;
			}
			children.push(child);
		});
		return <div className="j-ui-panel" style={{width: this.props.width ? this.props.width : ''}}>
			{children}
			{actions}
		</div>;
	}
});

/**
 * A facet placeholder for action blocks
 */
ui.Actions = React.createClass({
	render: function() {
		return <div className="actions">{this.props.children}</div>;
	}
});

/**
 * A simple wrapper around another item which provides a drop-down arrow on hover
 */
ui.ActionMenu = React.createClass({
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
			if(child.type && child.type == ui.Actions) {
				actions = <div className={'drop-down ' + (this.state.showActions ? ' active' : '')}>
					<div className="toggle" onClick={this.onShowActions}>
						<i className="fa fa-caret-down"></i>
					</div>
					<ui.Popover type="plain" position="bottom left" show={this.state.showActions} onClose={this.onHideActions}>
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
