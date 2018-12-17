var errors = new Array();
var success = 0;
var target = "Lliurable 6 - HTML";
var version = "1.1.0";

$(function(){
	var fn = document.location.href.match(/[^\/]+$/)[0];
	switch(fn){
		case "index.html":
			checkIndex();
			break;

		case "contacte.html":
			checkContacte();
			break;

		default:
			errors.push("Incorrect HTML file name: " + fn);	
			printResults(0, 0);		
			break;
	}
});
function checkIndex(){	
	//checking headers
	if($("h1").length == 0) errors.push("Unable to find a level 1 heading.");
	else success++;

	if($("h2").length == 0) errors.push("Unable to find a level 2 heading.");
	else success++;

	//checking paragraphs
	var length = 0;	
	$("p").each(function() {
		length += $(this).text().length;
	});	
	if(!length) errors.push("Not enough amount of text inside the paragraphs.");		
	else success++;

	//other checks
	if($("p > br").length == 0) errors.push("Unable to find a line break inside a paragraph.");
	else success++;

	if($("img").length == 0) errors.push("Unable to find any image.");
	else success++;

	//unordered list and links
	var ul = $("ul");
	if(ul.length == 0) errors.push("Unable to find any unordered list.");
	else success++;

	if(ul.find("a").length < ul.length) errors.push("Each list element must contain a list.");
	else success++;

	//display errors an mark
	printResults(3.36);
}
function checkContacte(){	
	//checking form
	var form = $("form");
	if(form.length > 0) success++;
	else{
		errors.push("Unable to find any form.");
		form = $("body");
	}
	
	//checking table
	var table = form.find("table");
	if(table.length == 0){
		errors.push("Unable to find any table.");
		table = $("body");
	}
	else{		
		success++;

		var rows = table.find("tr"); 
		for(var i= 0; i < rows.length - 1; i++){	//excluding the last row (just buttons)
			var r = $(rows[i]);									
			var cols = r.children("td");

			var count = 0;
			var labelIdx = 2;
			for(var j= 0; j < cols.length; j++){
				var c = $(cols[j]);
				if(c.attr("colspan") != null){
					var colspan = parseInt(c.attr("colspan"));
					count += colspan;
					labelIdx -= (colspan-1);
				} 
				else count++;
			}

			if(count != 4) errors.push("The table does not contains exactly 4 columns at row " + (i+1) + ".");
			else success++;

			if($(r.children()[0]).find("label").length == 0 ) errors.push("The first columns at row " + (i+1) + " does not contains a label.");
			else success++;

			if($(r.children()[labelIdx]).find("label").length == 0 ) errors.push("The third columns at row " + (i+1) + " does not contains a label.");
			else success++;
		}
	} 

	//checking input fields	
	checkInputs("text", table, 2);
	checkInputs("number", table, 1);	
	checkInputs("email", table, 1);
	checkInputs("radio", table, 3);
	checkInputs("checkbox", table, 3);
	checkInputs("reset", table, 1);
	checkInputs("submit", table, 1);
	
	//check select
	var select = table.find("select");
	checkLabels(select);
	if(select.length == 0){
		 errors.push("Unable to find any select field.");
		 errors.push("Unable to find a label input for the select field.");
	}
	else{
		success += 2;		

		if(select.children().length < 3) errors.push("Unable to find all the options for the select field.");
		else success++;		

		if(select.children("[selected]").length == 0) errors.push("Unable to find a default option for the select field.");		
		else success++;		
	}

	//check textarea
	var textarea = table.find("textarea");
	checkLabels(textarea);

	if(table.find("textarea[placeholder]").length == 0) errors.push("Unable to find the placeholder attribute defined on the textarea.");	
	else success++;		

	//display errors an mark (pending)		
	printResults(5.76);
}
function checkInputs(type, table, num){
	var input = table.find("input[type=" + type + "]");
	while(num > 0){
		if(input.length < num--){
			errors.push("Unable to find a " + type + " input field.");
			
			if(type == "reset" && type == "clear") errors.push("Unable to find a label input for the " + type + " field.");
			else success++;		
	   }
	}
	
	if(type == "radio" || type == "checkbox"){ 
		checkSharedName(input, type);	
		var def = table.find("input[type=" + type + "][checked]");

		if(def.length == 0) errors.push("Unable to find a default value for the" + type + " field.");
		else success++;		
	}
	
	if(type == "reset" && type == "clear")
		checkLabels(input);	
}
function checkLabels(input){
	if(input.length > 0){
		input.each(function(){
			var label = $("label[for='"+$(this).attr('id')+"']");
			if(label.length == 0)  errors.push("Unable to find a the label related to the " + $(this).attr('id') + " field.");
			else success++;		
		});
	}
}
function checkSharedName(input, type){
	if(input.length > 0){
		var name = input[0].name;		
		input.each(function(){
			if($(this).attr("name") == name) success++;
			else{
				errors.push("The " + type + " buttons must share the name attribute.");
				return false;
			}
		});
	}	
}
function printResults(totalScore){
	var score = totalScore;
	var errCost = score / (success + errors.length);
	var errList = $("<ol></ol>");
	for(i = 0; i < errors.length; i++){
		errList.append("<li>" + errors[i] + "</li>");
		score -= errCost;
	}

	var errContainer = $("<div>", {	
		id: "errContainer",	
		css: {
			"position": "absolute",				
			"top": "100px",
			"left": "50%",
			"width": "400px",
			"margin-left": "-200px",
			"border": "1px solid black",
			"background-color": "white",
			"z-index": "99999999999999",
			"padding": "20px"				
		}
	}).appendTo("body");	
	
	var color = "red";
	if(score >= totalScore/2) color = "orange";
	if(score == totalScore) color = "green";
	errContainer.append("<p><b>Remember to check your document against the official <a target='_blank' href='https://validator.w3.org/#validate_by_input'>W3C HTML5 Validator!</a></b></p><p><b style='color: " + color + "'>Total score: " + score.toFixed(2) + "p (over " + totalScore + "p)</b> v" + version + " <a href='javascript:void(0)' onclick='$(\"#errContainer\").hide();' >[close]</a></p>").append(errList);
}
