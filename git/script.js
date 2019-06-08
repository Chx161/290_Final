document.addEventListener('DOMContentLoaded', getCurrentData);
document.addEventListener('DOMContentLoaded', bindButtons);

var port = "12037";

function bindButtons(){
	//Add Value Function:
	document.getElementById('add').addEventListener('click', function(event) {
		//Create a new HTTP request
		var req = new XMLHttpRequest();  
        var payload = {};

		//Get form data
		payload.name = document.getElementById('name').value; 
		payload.reps = document.getElementById('reps').value;  
		payload.weight = document.getElementById('weight').value; 
		payload.date = document.getElementById('date').value; 
		payload.lbs = document.getElementById('lbs').value; 
		
		if(payload.name != ""){
		//Url for GET request
		var url = "http://flip2.engr.oregonstate.edu:" + port + "/insert?" + "name=" + payload.name + "&reps=" + payload.reps + "&weight=" + payload.weight + "&date=" + payload.date + "&lbs=" + payload.lbs; 
		
	    //Make request
		req.open("GET", url, false); 
		req.addEventListener('load',function(){
			if(req.status >= 200 && req.status < 400){
				//Update table
				clearTable(); 
				getCurrentData();
			} 
			else {
				console.log("Error in network request: " + req.statusText);
			}});				
		req.send(null);         //no need to send additional data
		event.preventDefault(); //prevent the page from refreshing
	    }
	    else {
	    	var inputError = document.getElementById("error-output");
	    	inputError.innerText = "Input a name please";
            event.preventDefault();
	    }
	});
}

function getCurrentData(){
	var req = new XMLHttpRequest();
	req.open('GET', "http://flip3.engr.oregonstate.edu:" + port + "/select", true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.addEventListener('load',function(){
		var response = JSON.parse(req.responseText); // This gives us the response as a variable
		buildTable(response); //Creates the table
	});
	req.send(); //Send the content
};

function buildTable(data){
	if(obj === null) {return null}
    var fields = Object.keys(data[0]);
    var workoutTable = document.getElementById("workouts");
    data.forEach(function(object){
    	var tableID = object["id"];
	    var row = document.createElement("tr");
	    row.style.textAlign = "center";
	    fields.forEach(function(field){
		var cell = document.createElement("td");
		cell.setAttribute('id', field+tableID);
		cell.contentEditable = "true";
	  	cell.textContent = object[field];
	  	if(field == "id")
	  		cell.style.display = "none";
	  	row.appendChild(cell);
	    });
	    // Delete button
	    var cell = document.createElement("td");
		var delButton = document.createElement("BUTTON");
		var text = document.createTextNode("Delete");
		delButton.appendChild(text);
		delButton.id = row.firstChild.textContent;
		delButton.onclick = function(x){
			return function(){
				deleteRow(x);
			};
		}(delButton.id);  
		cell.appendChild(delButton);
		row.appendChild(cell);
		
		//Edit button
		var cell = document.createElement("td");
		var editButton = document.createElement("BUTTON");
		var text = document.createTextNode("Edit");
		editButton.appendChild(text);
		editButton.id = row.firstChild.textContent;
		editButton.onclick = function(x){
			return function(){
				editRow(x);
			};
		}(editButton.id); 
		cell.appendChild(editButton);
		row.appendChild(cell);

	    workoutTable.appendChild(row);
	});
}

function deleteRow(id){
	var req = new XMLHttpRequest();
	req.open('GET', "http://flip2.engr.oregonstate.edu:" + port + "/delete?id=" + id , true);
	req.addEventListener('load',function(){
		//delete and rebuild table
		clearTable();
		getCurrentData(); 
	});
	req.send(); 
	event.preventDefault(); 
}

function editRow(id){
	var payload = {};
	payload.id = id;
	payload.name = document.getElementById("name"+id).textContent; 
	payload.reps = document.getElementById("reps"+id).textContent;;  
	payload.weight = document.getElementById("weight"+id).textContent;
	payload.date = document.getElementById("date"+id).textContent;
	payload.lbs = document.getElementById("lbs"+id).textContent;; 
    var req = new XMLHttpRequest();
    var url = "http://flip2.engr.oregonstate.edu:" + port + "/update?" + "name=" + payload.name + "&id=" + payload.id + "&reps=" + payload.reps + "&weight=" + payload.weight + "&date=" + payload.date + "&lbs=" + payload.lbs; 
	req.open('GET', url, true);
	req.addEventListener('load',function(){
		//delete and rebuild table
		clearTable();
		getCurrentData(); 
	});
	req.send(); 
	event.preventDefault();

}

function clearTable(){
	//Delete all but header row
	if (document.getElementById("workouts").rows.length > 1) {
		for (i = (document.getElementById("workouts").rows.length - 1); i > 0; i--) {
			document.getElementById("workouts").deleteRow(i);
		}
	}
}