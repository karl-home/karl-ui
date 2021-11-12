import { Graph } from '../graph';
import { Examples } from '../examples';

export module TextGraphHTML {
	let buttonContainer : HTMLDivElement = undefined;
	let g: Graph = undefined;

	export function addbuttons(graph : Graph) {
		g = graph;
		buttonContainer = document.createElement('div')
    	let savebutton = document.createElement('button') 
    	savebutton.innerText = 'Save' // creates save button
    	buttonContainer.appendChild(savebutton)
    	let resetButton = document.createElement('button')
    	resetButton.innerText = 'Reset' // creates reset button
    	buttonContainer.appendChild(resetButton) 
   		document.getElementById('text-graph').appendChild(buttonContainer) // adds buttons to Text Graph portion of interface
   		// to test graphToWords (remove later)
   		graphToWords() 	
    }

    function graphToWords(){
    	console.log('inside graphToWords')
    	Examples.searchPipeline(g)
    	let format = g.getGraphFormat();
    	let dot = "";
    	dot += "digraph {\n";
    	dot += "node[shape = record];\n "
    	format.sensors.forEach(function (value, e) { // searches through each sensor to set up written visual sensors
    		var sens = value['id'] // sensor id
    		var returned = value['returns'] // where the sensor points to 
    		dot += sens + '[label = "{ ' + sens + '| <' + returned + '> ' + returned + '} ", style = filled, fillcolor = dimgray];\n'
    		console.log(dot) 
    	})
    	format.moduleIds.forEach(function (value, e) { // searches through modules to set up the visual aspects of the modules
    		var id = value['local'] // name of the module
    		var params = value['params'] // node at the top of the module
    		var ret = value['returns'] // node at the bottom of the module
    		dot += id + "'[label = { <" + params + "> " + params + "| " + id + " | <" + ret + "> " + ret + "}'"// if it has a network, then add color green to it
    		format.edges.network.forEach(function (value, i) { // checks if the module needs to be green because of the network association
    			var edge = value['module_id']
    			var network = value['domain']
    			if (edge == id) { // checks if the edge and the module name are the same, if they are then it turns it green
    				dot += ", color = green];\n"
    			} else {
    				dot += "]; "
    			}

    		})
    		console.log(dot)
    	})
    	format.edges.data.forEach(function (value, e) {
    		console.log(e)
    		var state = value['stateless']
    		if (state) { // edits the style of the arrow based on what is true about the module information
    			dot += "edge [color = dodgerblue, style = normal];\n" 
    		} else {
    			dot += "edge [color = dodgerblue, style = dashed];\n"
    		}
    		var entity = value['out_id']
    		var mod = value['module_id']
    		var out = value['out_ret']
    		var to = value['module_param']
    		dot += entity + " : " + out + " -> " + mod + " : " + to + ";\n"; // points each module to where it is assigned to
    		console.log(dot)
    	})
    	for (var state in format.edges.state) {
    		if (state.includes('true')) {
    			dot += "edge [color = red, style = normal];\n" // makes arrows normal so that they can differentiate between modules and sensors
    			console.log(dot)
    		} else {
    			dot += "edge [colors = red, style = dashed];\n"
    			console.log(dot)
    		}
    	}
    	dot += "}";

    }
}