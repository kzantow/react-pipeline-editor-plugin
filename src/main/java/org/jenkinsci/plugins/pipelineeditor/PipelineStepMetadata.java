package org.jenkinsci.plugins.pipelineeditor;

import hudson.Extension;
import hudson.ExtensionList;
import hudson.model.Descriptor;
import hudson.model.RootAction;
import java.io.IOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.jenkinsci.plugins.workflow.cps.Snippetizer;
import org.jenkinsci.plugins.workflow.steps.StepDescriptor;
import org.kohsuke.stapler.DataBoundConstructor;
import org.kohsuke.stapler.DataBoundSetter;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;
import org.springframework.core.LocalVariableTableParameterNameDiscoverer;
import org.springframework.core.ParameterNameDiscoverer;

@Extension
public class PipelineStepMetadata implements RootAction {
    ParameterNameDiscoverer nameFinder = new LocalVariableTableParameterNameDiscoverer();

    @Override
    public String getDisplayName() {
        return null;
    }
    @Override
    public String getIconFileName() {
        return null;
    }
    @Override
    public String getUrlName() {
        return "pipeline-snippetizer-metadata";
    }
    public void doGetPipelineStepMetadata(StaplerRequest req, StaplerResponse res) throws IOException {
        Jenkins j = Jenkins.getInstance();
        Snippetizer snippetizer = ExtensionList.create(j, Snippetizer.class).get(0);

        JSONObject rsp = new JSONObject();
        rsp.put("snippetizer", req.getContextPath() + "/" + snippetizer.getUrlName() + "/generateSnippet");

        JSONArray steps = new JSONArray();
        for (StepDescriptor d : StepDescriptor.all()) {
            JSONObject step = descriptorMetadata(d);
            steps.add(step);
        }

        rsp.put("steps", steps);

        res.setContentType("application/json");
        //rsp.write(res.getWriter());
        res.getWriter().write(rsp.toString(2));
    }

    private JSONObject descriptorMetadata(Descriptor<?> d) {
        Class<?> typ = d.clazz;
        return descriptorMetadata(d.getDisplayName(), typ);
    }

    private JSONObject descriptorMetadata(String name, Class<?> typ) {
        JSONObject o = new JSONObject();
        JSONArray params = new JSONArray();

        o.put("name", name);
        o.put("type", typ.getName());

        for (Method m : typ.getDeclaredMethods()) {
            if (m.isAnnotationPresent(DataBoundSetter.class)) {
                String paramName = StringUtils.uncapitalize(m.getName().substring(3));
                Class<?> paramType = m.getParameterTypes()[0];
                JSONObject param = descriptorMetadata(paramName, paramType);
                params.add(param);
            }
        }

        for (Constructor<?> c : typ.getDeclaredConstructors()) {
            if (c.isAnnotationPresent(DataBoundConstructor.class)) {
                Class<?>[] paramTypes = c.getParameterTypes();
                String[] paramNames = nameFinder.getParameterNames(c);
                if(paramNames != null) {
                    for (int i = 0; i < paramNames.length; i++) {
                        String paramName = paramNames[i];
                        Class<?> paramType = paramTypes[i];
                        JSONObject param = descriptorMetadata(paramName, paramType);
                        params.add(param);
                    }
                }
            }
        }

        o.put("params", params);
        return o;
    }
}