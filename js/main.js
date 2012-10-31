// JavaScript Document - main.js
// alert("main.js fired");

// if we see page with id="checkout" then run this code
//$.mobile.routerlite.pageinit("#search-state", function(page){
  //alert("pageinit fired");
//});

// every time we visit the page with id="checkout" then run this code
//$.mobile.routerlite.pagechange("#search-state", function(page){
  //alert("pagechange fired");
//});

// Initalize Select Hides
//************************
// $('span.span-fresh-nondonor-select').hide();
$('span.span-frozen-nondonor-select').hide();
$('span.span-donor-frozen-select').hide();
$('span.span-donor-fresh-select').hide();


// Parse select fields to description and sql names
function parseDescriptions(submitted) {
	var splitstr=new Array();
	for (var x=0;x<submitted.length;x++) {
		splitstr[x]=submitted[x].value.split("~");
		//alert (splitstr[x][0]+" ***** "+splitstr[x][1]);
	}
	return splitstr;
}


// Bind events
//************************
$('#form_pregancy_success').submit(function() {
	var parsedSubmit= parseDescriptions($(this).serializeArray());
	//console.log(parsedSubmit);

		switch(parsedSubmit[0][0]) {
	        case "fresh-nondonor":
				$('#accordionSet').trigger('collapse');
				//alert(parsedSubmit[0][0]+"<br>"+parsedSubmit[1][0]+"<br> "+parsedSubmit[2][0]+"<br> "+parsedSubmit[6][0]+"<br> "+parsedSubmit[7][0]);
				//alert("select * from ___  where "+parsedSubmit[2][1]+parsedSubmit[1][1]+" "+parsedSubmit[6][1]+" "+parsedSubmit[7][0]);
	            $('#filterList').append('<li data-icon="delete"><a href="index.html"><p><strong>'+ parsedSubmit[0][0]+'</strong>'+ parsedSubmit[1][0]+'</p><p>'+ parsedSubmit[2][0]+' <strong>'+parsedSubmit[6][1]+'</strong> '+parsedSubmit[7][0]+'</p></a></li>');
	
				// '+parsedSubmit[0][0]+'</strong>'+ parsedSubmit[1][0]+'</p><p>'+ parsedSubmit[2][0]+' <strong>'+parsedSubmit[6][1]+'</strong> '+parsedSubmit[7][0]+'</p></a></li>');
				$('#filterList').listview('refresh');
				break;
	        case "frozen-nondonor":
				$('#accordionSet').trigger('collapse');
				break;
			case "donor-fresh":

				break;
		    case "donor-frozen":
			
			}
return false;
});

//  Hide and show Age-of-Women selector
$("#select-pregnacy-success-category").change(function() {
	var myselect = $("#select-pregnacy-success-category");
	
	switch(myselect.val()) {
        case "fresh-nondonor":
            $('span.span-age-of-women-select').show();
			$('span.span-fresh-nondonor-select').show();
			$('span.span-frozen-nondonor-select').hide();
			$('span.span-donor-frozen-select').hide();
			$('span.span-donor-fresh-select').hide();
			
            break;
        case "frozen-nondonor":
        	$('span.span-age-of-women-select').show();
			$('span.span-fresh-nondonor-select').hide();
			$('span.span-frozen-nondonor-select').show();
			$('span.span-donor-frozen-select').hide();
			$('span.span-donor-fresh-select').hide();
			
			break;
		case "donor-fresh":
	        $('span.span-age-of-women-select').hide();
	        $('span.span-fresh-nondonor-select').hide();
			$('span.span-frozen-nondonor-select').hide();
			$('span.span-donor-frozen-select').hide();
			$('span.span-donor-fresh-select').show();
			
			break;
	    case "donor-frozen":
	        $('span.span-age-of-women-select').hide();
			$('span.span-fresh-nondonor-select').hide();
			$('span.span-frozen-nondonor-select').hide();
			$('span.span-donor-frozen-select').show();
			$('span.span-donor-fresh-select').hide();
			
		}
});