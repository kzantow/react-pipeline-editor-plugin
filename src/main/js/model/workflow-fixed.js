var json = require('./stringify.js');

/**
 * remove the stage
 */
exports.removeStage = function(workflow, stage) {
	var idx = -1;
	for (var i = 0; i < workflow.length; i++) {
		var s = workflow[i];
		if(s === stage) {
			idx = i;
			console.log('removing idx: ' + idx);
			break;
		} else if(exports.isParallelStage) {
			exports.removeStage(s.streams, stage);
		}
		console.log((s === stage) + json.stringify(s) + '==' + json.stringify(stage));
	}
	if(idx >= 0) {
		workflow.splice(idx, 1);
	}
};

/**
 * remove the step
 */
exports.removeStep = function(stage, step) {
	stage.steps.splice(stage.steps.indexOf(step), 1);
};

/**
 * a parallel stage has to have streams
 */
exports.isParallelStage = function(stage) {
	if (stage.streams && stage.streams.length > 0) {
		return true;
	} else {
		return false;
	}
};

/** Toggle the parallel-ness of a stage */
exports.toggleParallel = function(stage) {
	if (exports.isParallelStage(stage)) {
		exports.parallelToNormal(stage);
	} else {
		exports.makeParallel(stage);
	}
};

/**
 * Convert a stage that is already parallel, to one that is normal, but
 * combining the streams.
 */
exports.parallelToNormal = function(stage) {
	stage.steps = [];
	for (var i = 0; i < stage.streams.length; i++) {
		var stream = stage.streams[i];
		stage.steps = stage.steps.concat(stream.steps);
	}
	delete stage.streams;
};

/**
 * Take a normal stage which is a list of steps, and split it evenly to parallel
 * streams. Use the name of the first steps as the stream name.
 */
exports.makeParallel = function(stage) {
	var childStream = {
		name : step.name,
		steps : [ ]
	};
	stage.streams = [ childStream ];
	for (var i = 0; i < stage.steps.length; i++) {
		var step = stage.steps[i];
		childStream.steps.push(step);
	}
	delete stage.steps;
};

/**
 * Print out the workflow script using the given modules to render the steps.
 */
exports.toWorkflow = function(pipelineData, modules) {
	var toStreams = function(streamData, modules) {
		var par = "\n    parallel (";
		for (var i = 0; i < streamData.length; i++) {
			var stream = streamData[i];
			par += '\n     "' + stream.name + '" : {';
			par += toSteps(stream.steps, modules);
			if (i === (streamData.length - 1)) {
				par += "\n     }";
			} else {
				par += "\n     },";
			}
		}
		return par + "\n    )";
	};

	var toSteps = function(stepData, modules) {
		var steps = "";
		for (var i = 0; i < stepData.length; i++) {
			var stepInfo = stepData[i];
			var mod = modules[stepInfo.type];
			steps += "\n        " + mod.generateScript(stepInfo);
		}
		return steps;
	};

	var inner = "";
	for (var i = 0; i < pipelineData.length; i++) {
		var stage = pipelineData[i];
		inner += '\n    stage name: "' + stage.name + '"';
		if (stage.streams) {
			inner += toStreams(stage.streams, modules);
		} else {
			inner += toSteps(stage.steps, modules);
		}
	}
	return "node {" + inner + "\n}";
};
