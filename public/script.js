//Request table when home page is visited
var req = new XMLHttpRequest();
req.open("GET", "/getTable", true);
req.setRequestHeader('Content-Type', 'application/json');
req.addEventListener('load',function(){
  if(req.status >= 200 && req.status < 400){
    makeTable(JSON.parse(req.responseText));
    addBorder();
  }
 });
req.send();

//Bind addRow button, add ajax events
document.addEventListener('DOMContentLoaded', bindAddButton);
function bindAddButton(){
	document.getElementById('addRow').addEventListener('click', function(event) {
		//Set up a new request
		var req = new XMLHttpRequest();
		//Create object to send
		var data = {id: null, name: null, reps: null, weight: null, date: null, unit: null};
     	//Get text from html form
		data.name = document.getElementById("name").value;
		data.reps = document.getElementById("reps").value;
		data.weight = document.getElementById("weight").value;
		data.date = document.getElementById("date").value;
		data.unit = document.getElementById("unit").value;
	    //Check if name is entered
	    if(data.name == "")
	    {
	      alert("Exercise name can't be null!");
    	  event.preventDefault();
      	  return;
      	}

		//Set up the request
		var url = "/insert";
		req.open('POST', url, true);
		req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		//If get response
		req.addEventListener('load', function(){
			if(req.status >= 200 && req.status < 400) {
			  //Post form request sent success
			  console.log("Success in client send request.");
			  //Row added to database
			  //Make a new get request for table data
			  requestTable();	//Table made in requestTable() using makeTable();
		}
			else{
			  	console.log("Error in network request: " + req.statusText);
			  }
		});
		//Send the request
		console.log(data);
		req.send(JSON.stringify(data));
		event.preventDefault();
});}

//Request data to display table
function requestTable(){
		  var req = new XMLHttpRequest();
		  var url = "/getTable"; 
		  req.open('GET', url, true);
          req.addEventListener('load', function(){
		  if(req.status >= 200 && req.status < 400) {
 			  var response = JSON.parse(req.responseText);
 			  console.log(JSON.parse(req.responseText));
 			  //Make table with response Jason objects
 			  makeTable(response);        //With buttons and events added 
 			  addBorder();
		  }
		  else{
		  	console.log("Error in network request: " + req.statusText);
		  }
	});
 	//Send the request
	req.send(null);
	event.preventDefault();     
}

//Reference: 
//https://www.encodedna.com/javascript/populate-json-data-to-html-table-using-javascript.htm
//https://bytes.com/topic/javascript/answers/845240-get-last-row-table
//http://forums.devshed.com/javascript-development-115/dynamically-create-button-cell-based-tablerow-id-635799.html
//https://stackoverflow.com/questions/24771218/insert-new-html-input-tag-in-td-with-javascript
//https://github.com/mfry1/CS290-database-ui/blob/master/public/javascript/script.js
function makeTable(jsonData){
	    // EXTRACT VALUE FOR HTML HEADER. 
        var col = [];
        for (var i = 0; i < jsonData.length; i++) {
            for (var key in jsonData[i]) {
                if (col.indexOf(key) === -1 && key != "id") {
                    col.push(key);
                }
            }
        }

        // CREATE DYNAMIC TABLE.
        var table = document.createElement("table");

        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
        var tr = table.insertRow(-1);                   // TABLE ROW.

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");      // TABLE HEADER.
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < jsonData.length; i++) {
        	//Create a new row and append to table
            tr = table.insertRow(-1);
            //Set current row id = entry id
            tr.id = jsonData[i]["id"];
            for (var j = 0; j < col.length; j++) {
            	//Create a new cell and append to the current row(tr)
            	var tabCell = tr.insertCell(-1);
            	//Create an input element and append to the current cell(td)
            	var input = document.createElement("input");
            	input.type = "text";
            	tabCell.appendChild(input);
            	//Set input value 
                input.value = jsonData[i][col[j]];
            }
            //tr is the current last row
            //Add one button to current row
            var edit_Cell = tr.insertCell(-1);
	        var form = document.createElement('form');
	        //Hidden input 
	        var inputId = document.createElement('input');
          	inputId.setAttribute('type',"hidden");
          	inputId.setAttribute('value',jsonData[i]["id"]);
          	//Create button as input sent along with hidden input
            var button_edit = document.createElement("input");
            button_edit.setAttribute("type", "button");
	        button_edit.setAttribute('class', "edit");
	        button_edit.setAttribute('value', "Edit");
	        //Append two inputs to form
	        form.append(inputId);
	        form.appendChild(button_edit);
			//Append form to edit_cell
			edit_Cell.appendChild(form);
			//Append cell to current row	
			tr.appendChild(edit_Cell);	

			//Add another button
			var del_Cell = tr.insertCell(-1);
	        var form_2 = document.createElement('form');
	        //Hidden input
	        var inputId_2 = document.createElement('input');
          	inputId_2.setAttribute('type',"hidden");
          	inputId_2.setAttribute('value',jsonData[i]["id"]);
          	//Create button as input
            var button_del = document.createElement("input");
            button_del.setAttribute("type", "button");
	        button_del.setAttribute('class', "delete");
	        button_del.setAttribute('value', "Delete");
	        //Append hidden input and button to form
	        form_2.append(inputId_2);
	        form_2.appendChild(button_del);
			del_Cell.appendChild(form_2);	
			tr.appendChild(del_Cell);	
        }

        //FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
        var divContainer = document.getElementById("showData");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);
		//Add events to edit and delete buttons
		addEvents();
}

//Add border to table and cells
//Reference:
//https://stackoverflow.com/questions/3072233/getting-value-from-table-cell-in-javascript-not-jquery
function addBorder() {
    var table = document.querySelector("table");
	table.style.border="1px solid black";
    for (var r = 0, n = table.rows.length; r < n; r++) {
        for (var c = 0, m = table.rows[r].cells.length; c < m; c++) {
            table.rows[r].cells[c].style.border="1px solid black";
        }
    }
}

//Add click events to all edit and delete buttons
function addEvents() {
	var del_Buttons = document.getElementsByClassName("delete");
	var edit_Buttons = document.getElementsByClassName("edit");
	for (var i = 0; i < del_Buttons.length; i++) {
	  del_Buttons[i].addEventListener('click', deleteRow);
  	  edit_Buttons[i].addEventListener('click', editRow);
	}
}

//Delete current entry form the table
function deleteRow(event){
  var req = new XMLHttpRequest();
  //The form containing the delete button has two inputs.
  //Previous sibling is the hidden input field with value of prime key
  var id = this.previousSibling.value;
  //Create an object as payload to send in the post request body
  var prime_key = {"id":id};
  req.open("POST", "/delete", true);
  req.setRequestHeader("Content-Type", "application/json");
  //If request sent successfully and get response, make updated table
  req.addEventListener("load",function(){
    if(req.status >= 200 && req.status < 400){
      makeTable(JSON.parse(req.responseText));
      addBorder();
    }
    else {
        console.log("Error in network request: " + req.statusText);
      }
  });
  req.send(JSON.stringify(prime_key));
  event.preventDefault();
}

//Edit current entry in the table
//Reference: https://stackoverflow.com/questions/8508262/how-to-select-td-of-the-table-with-javascript
function editRow(event){
  var req = new XMLHttpRequest();
  var id = Number(this.previousSibling.value);
  //Go to the row and get tds
  var rows = document.getElementsByTagName("tr");
  var current_row = document.getElementById(id);
  // console.log(current_row);
  var tds = current_row.getElementsByTagName("td");
  //Create an object as payload to send in the post request body
  var updated_Data = {id: id, name: null, reps: null, weight: null, date: null, unit: null};
  //Get values in the current row and add values to payload
	updated_Data.name = tds[0].firstChild.value;
	updated_Data.reps = tds[1].firstChild.value;
	updated_Data.weight = tds[2].firstChild.value;
	updated_Data.date = tds[3].firstChild.value;
	updated_Data.unit = tds[4].firstChild.value;
	console.log(updated_Data);
  // Set up request
  req.open("POST", "/edit", true);
  req.setRequestHeader("Content-Type", "application/json");
  //If request sent successfully and get response, make updated table
  req.addEventListener("load",function(){
    if(req.status >= 200 && req.status < 400){
      makeTable(JSON.parse(req.responseText));
      addBorder();
    }
    else {
        console.log("Error in network request: " + req.statusText);
      }
  });
  req.send(JSON.stringify(updated_Data));
  event.preventDefault();
}