package org.jenkinsci.plugins.pipelineeditor;

import hudson.Extension;
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition;
import org.kohsuke.stapler.DataBoundConstructor;

/**
 * @author unascribed
 */
public class ReactPipelineVisualEditor extends CpsFlowDefinition {
    /**
     * JSON data model that the front end uses.
     */
    private final String pipelineModel;

    @DataBoundConstructor
    public ReactPipelineVisualEditor(String script, String pipelineModel) {
        super(script);
        this.pipelineModel = pipelineModel;
    }

    public String getPipelineModel() {
        return pipelineModel;
    }

    @Extension(ordinal=0.000001)
    public static class DescriptorImpl extends CpsFlowDefinition.DescriptorImpl {
        @Override
        public String getDisplayName() {
            return "Visual Editor (Experimental React-based editor)";
        }
    }
}
