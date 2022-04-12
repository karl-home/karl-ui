import { Graph } from '../graph';
import { Examples } from '../examples';

export module TextGraphHTML {
	let buttonContainer : HTMLDivElement = undefined;
	let textDOT : HTMLSpanElement
	let g: Graph = undefined;

	export function addbuttons(graph : Graph) {
		g = graph;
		buttonContainer = document.createElement('div')
    	let savebutton = document.createElement('button') 
    	savebutton.innerText = 'Save' // creates save button
    	buttonContainer.appendChild(savebutton)
    	savebutton.onclick = function(){
    		var text = textDOT as HTMLInputElement;
    		text.select();
    		document.execCommand("Copy")
    		alert("Code copied to clipboard.")

    	}
    	let resetButton = document.createElement('button')
    	resetButton.innerText = 'Reset' // creates reset button
    	buttonContainer.appendChild(resetButton)
    	resetButton.onclick = function() {
    		alert("Reset button")
    	} 
   		document.getElementById('text-graph').appendChild(buttonContainer) // adds buttons to Text Graph portion of interface
   		// to test graphToWords (remove later)
   		textDOT = document.createElement('textarea')
   		textDOT.innerHTML = graphToWords()
   		textDOT.setAttribute("type", "text")
   		document.getElementById('text-graph').appendChild(textDOT)
   		
    }

    function graphToWords(){
    	console.log('inside graphToWords')
    	Examples.figure5(g)
    	let format = g.getGraphFormat();
    	let dot = "";
    	dot += "digraph { \n"; 
    	dot += "node[shape = record];\n"
    	var intervals : Array<string> = []
    	var nums : Array<number> = []
    	format.sensors.forEach(function (value, e) { // searches through each sensor to set up written visual sensors
    		var sens = value['id'] // sensor id
    		var returned = value['returns'] // where the sensor points to 
    		dot += sens + '[label = "{ ' + sens + '| {' 
    		// returns is a list of items, make each list its own portion of the node
    		for (var i = 0; i < returned.length; i++) {
    			dot += ' <' + returned[i] + '> ' + returned[i]
    			if (i == returned.length - 1) {
    				dot += '}} ", style = filled, fillcolor = dimgray];\n'
    			} else {
    				dot += '| '
    			}
    		}
    		if (returned.length == 0) {
    			dot += ' <on> on }}", style = filled, fillcolor = dimgray];\n'
    		}
    	})
    	format.edges.interval.forEach(function(value, e) { // adds interval names and durations to lists so that they can be used for ref
    		var inter = value['module_id']
    		var num = value['duration_s']
    		intervals.push(inter)
    		nums.push(num)
    	})
    	format.moduleIds.forEach(function (value, e) { // searches through modules to set up the visual aspects of the modules
    		var id = value['local'] // name of the module
    		var params = value['params'] // node at the top of the module
    		var ret = value['returns'] // node at the bottom of the module 
    		dot += id + '[label = "{ ' //+ params + "> " + params + "| " + id //+ ret + "> " + ret + '}"'// if it has a network, then add color green to it
    		// need to add if then if there is no param then it should just be empty to remove empty nodes in the future
    		if (params.length == 0) {
    			dot += id
    			if (intervals.indexOf(id) > -1) {
    				dot += '*'
    			}
    		} else if (params.length > 0) {
    			dot += '{ '
    		}
    		for (var param = 0; param < params.length; param++) {
    			dot += '<' + params[param] + '> ' + params[param]
    			if (params.length > 1) {
    				dot += '| '
    			}
    		}
    		if (params.length > 0) {
    			dot += '} |' + id
    		}
    		if (ret.length > 0) {
    			dot += '| {'
    		} else if (ret.length == 0) {
    			dot += '}"'
    		} 
    		for (var i = 0; i < ret.length; i++) {
    			dot += '<' + ret[i] + '> ' + ret[i]
    			if (i == ret.length - 1) {
    				dot += '}}"'
    			} else {
    				dot += '| '
    			}
    		}
    		format.edges.network.forEach(function (value, i) { // checks if the module needs to be green because of the network association
    			var edge = value['module_id']
    			var network = value['domain']
    			if (edge == id) { // checks if the edge and the module name are the same, if they are then it turns it green
    				dot += ", color = green"
    			}
    		})
    		if (dot.charAt(dot.length - 1) != "\n") {
    			dot += "];\n"
    		}
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
    	format.edges.state.forEach(function (value, e) { // rewrite this so that if there are no data edges then you can do the same with the state edge
    		if (dot.charAt(dot.length - 2) != ";") {
    			dot += "];\n"
    		} // write if statement to check the dot string and see what the last character is, and based on that add close bracket
    		var id = value['module_id']
    		var ret = value['module_ret']
    		var sens = value['sensor_id']
    		var key = value['sensor_key']
    		dot += "edge [color = red, style = normal];\n"
    		dot += id + " : " + ret + " -> " + sens + " : " + key + ";\n";
    		// include the next for loop into this step because it would make it easier for the output to be made.
    		console.log(dot)
    	})
    	dot += "}\n";
    	if (intervals.length > 0) { // if there are intervals that are included, this adds the interval name and time for reference
    		for (var i = 0; i < intervals.length; i++) {
    			dot += '"*' + intervals[i] + ' = ' + nums[i] + ' (s)"'
    		}
    	}
    	return dot

    }
}