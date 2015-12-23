if(!lib.form) lib.form = {};

var ENTER_KEY_CODE = 13;

var hasValueProp = function(obj) {
    return 'value' in obj;
};

lib.form.BindTo = {
    
};

lib.form.Form = React.createClass({
    getDefaultProps: function() {
        return {
            type: 'vertical'
        };
    },
    propTypes: {
        type: React.PropTypes.oneOf(['vertical', 'horizontal'])
    },
    render: function() { return (
        <div className={'form j-ui-form ' + this.props.type + ui.choose(this.props.type, {horizontal: ' form-inline'})}>
        {React.Children.map(this.props.children, function(child,i) {
            return <span key={i} className="form-group">
                {child}
            </span>;
        })}
        </div>
    );}
});

/**
 * A Field is used to wrap input fields with a common label and will be styled
 * appropriately wherever used in the UI
 */
lib.form.Field = React.createClass({
    render: function() { return (
        <div className="j-ui-field form-group" style={this.props.style}>
            <label>{this.props.label}</label>
            <span className="j-ui-field-content">
                {this.props.children}
            </span>
        </div>
    );}
});

/**
 * A Field is used to wrap input field sets with a common look & feel and will be styled
 * appropriately wherever used in the UI
 */
lib.form.FieldSet = React.createClass({
    render: function() { return (
        <div className="j-ui-fieldset">
            <label>{this.props.label}</label>
            <span className="j-ui-fieldset-content">
                {this.props.children}
            </span>
        </div>
    );}
});

/**
 * This will wrap an Input component and output any appropriate style classes
 */
lib.form.Input = React.createClass({
    render: function() { return (
        <input className="form-control" {...props} />
    );}
});

/**
 * TextInput should be used for any type of text input, it will provide 
 */
lib.form.TextInput = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        id: React.PropTypes.string,
        placeholder: React.PropTypes.string,
        onChange: React.PropTypes.func,
        value: React.PropTypes.string,
        size: React.PropTypes.number,
        autoFocus: React.PropTypes.bool,
        link: React.PropTypes.array
    },
    
    getDefaultProps: function() {
        return {
            className: 'form-control'
        };
    },

    getInitialState: function() {
        return {
            value: this.props.value || ''
        };
    },
    
    componentWillReceiveProps: function(props) {
        if(props.value !== undefined && props.value !== this.state.value) {
            this.setState({value: props.value});
        }
    },
    
    render: function() { return (
        <input
            className={this.props.className}
            id={this.props.id}
            placeholder={this.props.placeholder}
            onBlur={this.handleChange}
            onChange={this.handleChange}
            onKeyDown={this.onKeyDown}
            onKeyUp={this.handleChange}
            value={this.val()}
            autoFocus={this.props.autoFocus}
            size={this.props.size}
        />
    );},
    
    val: function(val) {
        if(val !== undefined) {
            if(this.props.link) {
                this.props.link[0][this.props.link[1]] = val;
            }
            this.setState({value: val});
            return;
        }
        if(this.props.link) {
            return this.props.link[0][this.props.link[1]];
        }
        return this.state.value;
    },

    handleChange: function(event) {
        //if(debug) console.log('change from: ' + this.val() + ' to: ' + event.target.value);
        if(this.val() !== event.target.value) {
            var proceed = !this.onChange(event, this.val(), event.target.value);
            if(proceed) {
                this.val(event.target.value);
            }
        }
    },

    onKeyDown: function(event) {
        if(event.keyCode === ENTER_KEY_CODE) {
            if(this.props.onEnter) {
                this.props.onEnter(event, this.val(), this.val());
            }
            var proceed = !this.onChange(event, this.val(), this.val());
            event.preventDefault(); // no submits for enter presses by default!
        }
    },
    
    onChange: function(event, oldVal, newVal) {
        if(this.props.onChange) {
            return false === this.props.onChange(event, oldVal, newVal);
        }
        return false;
    },
    
    componentDidMount: function() {
        if(this.props.autoFocus) {
            $(ReactDOM.findDOMNode(this)).focus();
        }
    }

});


/**
 * TextInput should be used for any type of text input, it will provide 
 */
lib.form.TextArea = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        id: React.PropTypes.string,
        placeholder: React.PropTypes.string,
        onChange: React.PropTypes.func,
        validateInput: React.PropTypes.func,
        value: React.PropTypes.string,
        autoFocus: React.PropTypes.bool,
        expand: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        link: React.PropTypes.array,
        rows: React.PropTypes.number,
        cols: React.PropTypes.number
    },
    
    getDefaultProps: function() {
        return {
            className: 'form-control'
        };
    },
    
    getInitialState: function() {
        return {
            value: this.props.value || ''
        };
    },
    
    componentWillReceiveProps: function(props) {
        if(props.value !== undefined && props.value != this.state.value) {
            this.setState({value: props.value});
        }
    },
    
    getRows: function() {
        if(this.props.expand) {
            return this.val().split(/\n/).length;
        }
        
        return this.props.rows;
    },

    render: function() { return (
        <textarea
            className={this.props.className}
            id={this.props.id}
            placeholder={this.props.placeholder}
            onBlur={this.handleChange}
            onChange={this.handleChange}
            value={this.val()}
            autoFocus={this.props.autoFocus}
            rows={this.getRows()}
            cols={this.props.cols}
            disabled={this.props.disabled}
        />
    );},

    val: function(val) {
        if(val !== undefined) {
            if(this.props.link) {
                this.props.link[0][this.props.link[1]] = val;
            }
            return;
        }
        if(this.props.link) {
            return this.props.link[0][this.props.link[1]];
        }
        return this.state.value;
    },

    handleChange: function(event) {
        //if(debug) console.log('change from: ' + this.val() + ' to: ' + event.target.value);
        if(this.val() !== event.target.value) {
            var proceed = !this.validateInput(event, this.val(), event.target.value);
            if(proceed) {
                this.val(event.target.value);
                if(this.props.onChange) {
                    this.props.onChange();
                }
                if(this.props.link) {
                    this.forceUpdate();
                }
            }
        }
    },
    
    validateInput: function(event, oldVal, newVal) {
        if(this.props.validateInput) {
            return false === this.props.validateInput(event, oldVal, newVal);
        }
        return false;
    }

});

lib.form.Item = React.createClass({
    getInitialState: function() {
        return {
            value: null
        };
    },
    render: function() { return (
        <div>{this.props.children}</div>
    );}
});

lib.form.RadioGroup = React.createClass({
    getDefaultProps: function() {
        return {};
    },
    
    getInitialState: function() {
        if(hasValueProp(this.props)) {
            return {
                value: this.props.value
            };
        }
        return {};
    },
    
    handleSelectionChanged: function(child) {
        this.val(child === null ? null : child.props.value);
    },
    
    val: function(val) {
        if(val !== undefined) {
            var old = this.val();
            if(old !== val) {
                if(this.props.onChange) {
                    this.props.onChange(val);
                }
                if(this.props.link) {
                    this.props.link[0][this.props.link[1]] = val;
                    this.forceUpdate();
                }
                else {
                    this.setState({value: val});
                }
            }
            return;
        }
        if(this.props.link) {
            return this.props.link[0][this.props.link[1]];
        }
        return this.state.value;
    },

    componentDidMount: function() {
        // hack - issue with react+radio
        var self = this;
        $(ReactDOM.findDOMNode(this)).on('change','>div>label>input[type=radio]',function(e) {
            var $this = $(e.target);
            if($this.is(':checked')) {
                var v = $this.val();
                if(v) {
                    var idx = parseInt(v);
                    self.handleSelectionChanged(self.props.children[idx]);
                } else {
                    self.handleSelectionChanged(null);
                }
            }
        });
    },
    render: function() {
        var id = this._reactInternalInstance._rootNodeID; // TODO is this safe for now?
        
        return <div>
            {ui.when(this.props.nullText, function() {
                return <div className="radio">
                    <label>
                        <input type="radio"
                            name={id}
                            value={null}
                            checked={this.val() === null}
                            onClick={function(){this.handleSelectionChanged(null);}.bind(this)}
                            onChange={function(){this.handleSelectionChanged(null);}.bind(this)}/>
                        {this.props.nullTtext}
                    </label>
                </div>;
            })}
            {React.Children.map(this.props.children, function(child, i) {
                return <div key={i} className="radio">
                    <label>
                        <input type="radio"
                            name={id}
                            value={i}
                            checked={this.val() === child.props.value}
                            onClick={function(){this.handleSelectionChanged(child);}.bind(this)}
                            onChange={function(){this.handleSelectionChanged(child);}.bind(this)}/>
                        {child.props.children}
                    </label>
                </div>;
            }.bind(this))}
        </div>;
    }
});
