if(!lib.form) lib.form = {};

var ENTER_KEY_CODE = 13;

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
		<div className="j-ui-field form-group">
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
	
	val: function() {
		if(this.props.link) {
			return this.props.link[0][this.props.link[1]];
		}
		return this.state.value;
	},

	render: function() {
		return (
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
			/>
		);
	},

	handleChange: function(event) {
		//console.log('change from: ' + this.state.value + ' to: ' + event.target.value);
		if(this.state.value !== event.target.value) {
			var proceed = !this.onChange(event, this.state.value, event.target.value);
			if(proceed) {
				if(this.props.link) {
					this.props.link[0][this.props.link[1]] = event.target.value;
				}
				this.setState({
					value: event.target.value
				});
			}
		}
	},

	onKeyDown: function(event) {
		if(event.keyCode === ENTER_KEY_CODE) {
			if(this.props.onEnter) {
				this.props.onEnter(event, this.state.value, this.state.value);
			}
			var proceed = !this.onChange(event, this.state.value, this.state.value);
			event.preventDefault(); // no submits for enter presses by default!
		}
	},
	
	onChange: function(event, oldVal, newVal) {
		if(this.props.onChange) {
			return false === this.props.onChange(event, oldVal, newVal);
		}
		return false;
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
		value: React.PropTypes.string,
		autoFocus: React.PropTypes.bool,
		expand: React.PropTypes.bool,
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
			value: this.props.value || '',
			rows: this.props.rows
		};
	},
	
	val: function() {
		if(this.props.link) {
			return this.props.link[0][this.props.link[1]];
		}
		return this.state.value;
	},
	
	getRows: function() {
		if(this.props.expand) {
			return this.val().split(/\n/).length + 1;
		}
		
		return this.props.rows;
	},

	render: function() {
		return (
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
			/>
		);
	},

	handleChange: function(event) {
		//console.log('change from: ' + this.state.value + ' to: ' + event.target.value);
		if(this.state.value !== event.target.value) {
			var proceed = !this.onChange(event, this.state.value, event.target.value);
			if(proceed) {
				if(this.props.link) {
					this.props.link[0][this.props.link[1]] = event.target.value;
				}
				this.setState({
					value: event.target.value
				});
			}
		}
	},
	
	onChange: function(event, oldVal, newVal) {
		if(this.props.onChange) {
			return false === this.props.onChange(event, oldVal, newVal);
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
	render: function() {
		return <div>{this.props.children}</div>;
	}
});

lib.form.RadioGroup = React.createClass({
	getDefaultProps: function() {
		return {
			value: null
		};
	},
	
	getInitialState: function() {
		return {
			value: this.props.value
		};
	},
	
	handleSelectionChanged: function(child) {
		var value = child === null ? null : child.props.value;
		this.setState({value: value});
		if(this.props.onChange) {
			this.props.onChange(value);
		}
		if(this.props.link) {
			this.props.link[0][this.props.link[1]] = value;
		}
	},
	
	val: function() {
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
