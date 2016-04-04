var stringify = require('prototype-stringify-hack');
var wf = require('./WorkflowStore.js');
var $ = require('bootstrap-detached').getBootstrap();

/**
 * Reads plugin metadata
 */
$(function() {
    $.ajax({
        url: '/jenkins'+'/pipeline-snippetizer-metadata/getPipelineStepMetadata',
        method: 'get',
        async: true, // FIXME 
        success: function(data) {
            $.each(data.steps, function() {
                var step = this;
                wf.addStepType({
                    type: step.type,
                    name: step.name,
                    icon: <i className={'fa fa-terminal '+step.type}></i>,
                    editor: React.createClass({
                        onChange: function() {
                            if(this.props.onChange) {
                                this.props.onChange();
                            }
                        },
                        render: function() {
                            return <div>
                                {ui.map(step.params, function(param,i) {
                                    switch(param.type) {
                                    case 'byte':
                                    case 'java.lang.Byte':
                                    case 'short':
                                    case 'java.lang.Short':
                                    case 'int':
                                    case 'java.lang.Integer':
                                    case 'long':
                                    case 'java.lang.Long':
                                    case 'java.math.BigInteger':
                                        return <f.Field key={i} label={param.name}>
                                            <f.IntegerInput link={[this.props.data,param.name]} onChange={this.onChange}/>
                                        </f.Field>;
                                    case 'float':
                                    case 'java.lang.Float':
                                    case 'double':
                                    case 'java.lang.Double':
                                    case 'java.math.BigDecimal':
                                        return <f.Field key={i} label={param.name}>
                                            <f.DecimalInput link={[this.props.data,param.name]} onChange={this.onChange}/>
                                        </f.Field>;
                                    case 'boolean':
                                    case 'java.lang.Boolean':
                                        return <f.Field key={i} label={param.name}>
                                            <f.Checkbox link={[this.props.data,param.name]} onChange={this.onChange}/>
                                        </f.Field>;
                                    case 'java.lang.String':
                                        return <f.Field key={i} label={param.name}>
                                            <f.TextInput link={[this.props.data,param.name]} onChange={this.onChange}/>
                                        </f.Field>;
                                    case 'java.util.List':
                                        //throw "Need accepted types";
                                        return <div>Unsupported: List type, need additional metadata</div>;
                                    }
                                    return <f.Field key={i} label={param.name + ' / ' + param.type}>
                                        <f.TextInput link={[this.props.data,param.name]} onChange={this.onChange}/>
                                    </f.Field>;
                                }.bind(this))}
                            </div>;
                        }
                    }),
                    isValid: function(data) {
                        return true; // TODO 
                    },
                    generateScript: function(obj) {
                        var script = '';
                        var headers = {};
                        var crumb = window.crumb;
                        if(crumb) {
                            headers[crumb.fieldName] = crumb.value;
                        }
                        if(obj) {
                            $.ajax({
                                url: data.snippetizer,
                                method: 'post',
                                processData: false,
                                contentType: 'application/x-www-form-urlencoded',
                                async: false,
                                data: "json=" + stringify($.extend({"stapler-class": step.type, "$class": step.type}, obj)),
                                headers: headers,
                                success: function(rsp) {
                                    script = rsp;
                                }
                            });
                        }
                        return script;
                    }
                });
            });
        }
    });
});
