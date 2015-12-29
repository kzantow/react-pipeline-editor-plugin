React-based Pipeline Editor
---------------

To run this you'll need 2 other projects:

[kzantow/react-plugin-base](https://github.com/kzantow/react-plugin-base)

[kzantow/react-plugin-parent](https://github.com/kzantow/react-plugin-parent)

Here's how to run:

    
    git clone https://github.com/kzantow/react-plugin-base.git
    pushd react-plugin-base
    mvn install
    popd
    
    git clone https://github.com/kzantow/react-plugin-parent.git
    pushd react-plugin-parent
    mvn install
    popd
    
    git clone https://github.com/kzantow/react-pipeline-editor-plugin.git
    pushd react-pipeline-editor-plugin
    mvn hpi:run
    popd

To see it in action:

1. go to the Jenkins instance
1. add a new 'Workflow' item
1. select the 'React Pipeline Visual Editor'

Enjoy!