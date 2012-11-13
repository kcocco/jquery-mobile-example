// JavaScript Document - main.js

//************************
// Initalize Variables
//*************************

var db;
var dbCreated = false;
// NewFilter x hold new filters to be written to DB
sessionStorage.NewFilterDescr1="";
sessionStorage.NewFilterDescr2="";
sessionStorage.NewFilterDescr3="";
sessionStorage.NewFilterDescr4="";
sessionStorage.NewFilterNum="";
// full where clause to be ANDed to together
sessionStorage.NewFilterSQLWhere="";
// SQL Key is used to over write filters ...sql minus the value
sessionStorage.NewFilterSQLKey="";

// Holds the parsed together query in refresh filters
sessionStorage.CurrentWhereQuery="";
sessionStorage.OrderByQuery="DESC";
sessionStorage.SelectQuery="";

//var scroll = new iScroll('wrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });

document.addEventListener("deviceready", onDeviceReady, false);
//onDeviceReady();  // comment to run on phonegap mobile, uncoment to run on web... to be verified

function onDeviceReady() {
	try {
	    if (!window.openDatabase) {
	        alert('window.openDatabase - not supported');
	    } else {
	        var shortName = 'IVF-Success-Rate';
	        var version = '1.0';
	        var displayName = 'IVF-Success-Rate';
	        var maxSize = 1024 * 1024; // 1MB ... in bytes
			// Note var db at head of code
	        db = window.openDatabase(shortName, version, displayName, maxSize);
			//alert(db); // You should have a database instance in db.
	    }
	} catch(e) {
	    // Error handling code goes here.
	    if (e == 2) {
	        // Version number mismatch.
	        alert("Invalid database version.");
	    } else {
	        alert("Unknown error "+e+".");
	    }
	    return;
	} 
	if (dbCreated==false) {
    	//alert("dbCreated false call pop db");
		db.transaction(populateDB, transaction_error);
	}
}






// ***********************
// Live & Bind Events
//************************

// Initalize the Advanced search page
// FIX - Move to initalize does this need event pagecreate?? Firing twice on startup?
$( '#search-advanced' ).live( 'pagecreate',function(event){
		//alert( 'pagecreate firing' );
		//page to show current filters saved in DB
		refreshFilters();
		// Initalize Select Hides on advanced search page to create a dynamics
		// $('span.span-fresh-nondonor-select').hide();
		$('span.span-frozen-nondonor-select').hide();
		$('span.span-donor-frozen-select').hide();
		$('span.span-donor-fresh-select').hide();
});

// Save State Check Box Select
$("#State-Save").click(function () {
	$('#state-accordionSet').trigger('collapse');
	options = $("#state-options input:checkbox");
	//alert(options[0].name+':'+options[0].checked);
	var tempStates="";
	var tempStateCount=0;
	for (var i=0; i < options.length; i++){
		if (options[i].checked) {
			tempStateCount++;
			tempStates=tempStates+'"'+options[i].name.split("-")[1]+'",';
			}
	}
	//alert(tempStates.replace(/"/g,''));
	if (tempStateCount==0) {
		alert('You must select atleast one state');
	}
	else {
		if (tempStateCount==49) {  // Select all states
			sessionStorage.NewFilterSQLWhere='1=1';
			sessionStorage.NewFilterDescr3="All States";
		}
		else {
			tempStates=tempStates.replace(/,+$/, '');
			sessionStorage.NewFilterSQLWhere='ClinStateCode IN ('+tempStates+')';
			sessionStorage.NewFilterDescr3=tempStates.replace(/"/g,'');
		}
		sessionStorage.NewFilterSQLKey='ClinStateCode IN';
		sessionStorage.NewFilterDescr1="State(s) ";
		sessionStorage.NewFilterDescr2=tempStateCount+' of 49 selected';
		sessionStorage.NewFilterDescr4="";
		sessionStorage.NewFilterNum="";
		//alert("SQL:"+sessionStorage.NewFilterSQLWhere);
		db.transaction(addFilters,transaction_error, refreshFilters);
	}
});

// Select All Check Boxes State Select
$("#State-Select-All").click(function () {
	options = $("#state-options input:checkbox");
	options.prop("checked",true).checkboxradio("refresh");
	//alert(options[0].name+':'+options[0].checked);
});

// UNSelect All Check Boxes State Select
$("#State-Unselect-All").click(function () {
	options = $("#state-options input:checkbox");
	options.prop("checked",false).checkboxradio("refresh");
});

// Submitting Filters
$('#form_pregancy_success').submit(function() {
	var parsedSubmit= parseDescriptions($(this).serializeArray());
	//console.log(parsedSubmit);
		switch(parsedSubmit[0][0]) {
	        case "Fresh-E-Nondonor":
				$('#accordionSet').trigger('collapse');
				sessionStorage.NewFilterDescr1=parsedSubmit[0][0];
				sessionStorage.NewFilterDescr2=parsedSubmit[1][0];
				sessionStorage.NewFilterDescr3=parsedSubmit[2][0];
				sessionStorage.NewFilterDescr4=parsedSubmit[6][0];
				sessionStorage.NewFilterNum=parsedSubmit[7][0];
				sessionStorage.NewFilterSQLWhere=parsedSubmit[2][1]+parsedSubmit[1][1]+" "+parsedSubmit[6][1]+parsedSubmit[7][0];
				sessionStorage.NewFilterSQLKey=parsedSubmit[2][1]+parsedSubmit[1][1]+" "+parsedSubmit[6][1];
				//alert(parsedSubmit[0][0]+"<br>"+parsedSubmit[1][0]+"<br> "+parsedSubmit[2][0]+"<br> "+parsedSubmit[6][0]+"<br> "+parsedSubmit[7][0]);
				// var tempSQL=parsedSubmit[2][1]+parsedSubmit[1][1]+" "+parsedSubmit[6][1];
	            //$('#filterList').listview('refresh');
				db.transaction(addFilters,transaction_error, refreshFilters);
				break;
	        case "Frozen-E-Nondonor":
				$('#accordionSet').trigger('collapse');
				break;
			case "Donor-Fresh-E":
				break;
		    case "Donor-Frozen-E":
			}
	return false;
});

//  Event change select pregnacy - Hide and show Age-of-Women selector
$("#select-pregnacy-success-category").change(function() {
	var myselect = $("#select-pregnacy-success-category");
	
	switch(myselect.val()) {
        case "Fresh-E-Nondonor":
            $('span.span-age-of-women-select').show();
			$('span.span-fresh-nondonor-select').show();
			$('span.span-frozen-nondonor-select').hide();
			$('span.span-donor-frozen-select').hide();
			$('span.span-donor-fresh-select').hide();
			
            break;
        case "Frozen-E-Nondonor":
        	$('span.span-age-of-women-select').show();
			$('span.span-fresh-nondonor-select').hide();
			$('span.span-frozen-nondonor-select').show();
			$('span.span-donor-frozen-select').hide();
			$('span.span-donor-fresh-select').hide();
			
			break;
		case "Donor-Fresh-E":
	        $('span.span-age-of-women-select').hide();
	        $('span.span-fresh-nondonor-select').hide();
			$('span.span-frozen-nondonor-select').hide();
			$('span.span-donor-frozen-select').hide();
			$('span.span-donor-fresh-select').show();
			
			break;
	    case "Donor-Frozen-E":
	        $('span.span-age-of-women-select').hide();
			$('span.span-fresh-nondonor-select').hide();
			$('span.span-frozen-nondonor-select').hide();
			$('span.span-donor-frozen-select').show();
			$('span.span-donor-fresh-select').hide();
			
	}
});

$('.filterDelete').live('click', function() {
	if(event.handled !== true) {
    	//alert("rowid to delete:"+sessionStorage.filterDeleteRow);
    	db.transaction(deleteFilter,transaction_error, refreshFilters);
    	event.handled = true;
    }
    return false;
});

// Refresh search-display page
//****FIX ME FIRES TWICE!!??? ******
$('#search-display').live('pageshow', function() {
    // Configure the Switch for order acs/desc
	$('#order-switch').unbind('slidestop');
	$('#order-switch').val(sessionStorage.OrderByQuery).slider("refresh");
	// set orderby switch
	$('#order-switch').bind('slidestop', function() { 
		//alert('switch changed!'+jQuery(this).val());
		sessionStorage.OrderByQuery=jQuery(this).val();
		db.transaction(getSearchQuery, transaction_error);
	});
	// Run filter query
	//alert('search-display live page show fired');
	db.transaction(getSearchQuery, transaction_error);
});

$('#clinic-display').live('pageshow', function() {
    if(event.handled !== true) {
	    db.transaction(getClinicDetail, transaction_error);
	    event.handled = true;
    }
    return false;
});







//*************************
// Databae Logic
//*************************

function refreshFilters(tx) {
	//alert('firing refreshfilters');
	db.transaction(queryFilters,transaction_error);
}

function queryFilters(tx) {
	//alert('firing queryfilters');
	tx.executeSql('SELECT rowid,* FROM FILTERS',[],displayFilters);
}

function deleteFilter(tx) {
	//alert('firing deletefilters');
	tx.executeSql('DELETE FROM FILTERS WHERE rowid="'+sessionStorage.filterDeleteRow+'"');
}

//  Display filters & Build Filters Where SQL
function displayFilters(tx, results) {
	sessionStorage.CurrentWhereQuery="";
	var andVar="";
	var len = results.rows.length;
	//alert("results.row.length:"+len);
	jQuery("#filterList > li").remove();
	for (var i=0; i<len; i++) {
	var filterResults = results.rows.item(i);
	$('#filterList').append('<li data-icon="delete"><a href="#search-advanced" class="filterDelete" onClick="sessionStorage.filterDeleteRow='+filterResults.rowid+'" ><p><strong>'+ filterResults.Descr1 +' </strong> '+ filterResults.Descr2 +'</p><p>'+ filterResults.Descr3 +' <strong>'+unescape(filterResults.Descr4) +'</strong> '+ filterResults.Num +'</p></a></li>');
	if (i==0) {
		andVar=" WHERE "}
	else {
		andVar=" AND "
	}
	sessionStorage.CurrentWhereQuery= sessionStorage.CurrentWhereQuery + andVar + unescape(filterResults.SQLWhere);
	}
	$('#filterList').listview('refresh');
}

function addFilters(tx) {
	// encode sql statements
	sessionStorage.NewFilterSQLWhere=escape(sessionStorage.NewFilterSQLWhere);
	sessionStorage.NewFilterSQLKey=escape(sessionStorage.NewFilterSQLKey);
	sessionStorage.NewFilterDescr4=escape(sessionStorage.NewFilterDescr4);
	tx.executeSql('DELETE FROM FILTERS WHERE SQLKey="'+sessionStorage.NewFilterSQLKey+'"');
	tx.executeSql('INSERT INTO FILTERS (Descr1, Descr2, Descr3, Descr4, Num, SQLWhere, SQLKey) VALUES ("'+sessionStorage.NewFilterDescr1+'","'+sessionStorage.NewFilterDescr2+'","'+sessionStorage.NewFilterDescr3+'","'+sessionStorage.NewFilterDescr4+'","'+sessionStorage.NewFilterNum+'","'+sessionStorage.NewFilterSQLWhere+'","'+sessionStorage.NewFilterSQLKey+'")');
	//alert('in addFilters');
}

// getSearchQuery using selected Filters
function getSearchQuery(tx) {
	var sql = "SELECT rowid,* from IVF" + unescape(sessionStorage.CurrentWhereQuery) +' ORDER BY FshNDLvBirthsRate1 '+sessionStorage.OrderByQuery;
	alert(sql);
	tx.executeSql(sql, [], displaySearchResults);
}

//  Display Query results of filter query to compare page
function displaySearchResults(tx, results) {
	jQuery("#searchDisplayList > li").remove();
	var len = results.rows.length;
	for (var i=0; i<len; i++) {
    	var IVFresults = results.rows.item(i);
		$('#searchDisplayList').append('<li><a href="#clinic-display" onClick="sessionStorage.rowid='+IVFresults.rowid+'">'+
			'<h1><bold>'+(i+1)+'.</bold> ' + IVFresults.CurrClinNameAll + '</h1>' +
			'<p>' + IVFresults.ClinCityCode + ', ' +IVFresults.ClinStateCode +'<p>'+
			'<span class="ui-li-count">' + IVFresults.FshNDLvBirthsRate1 + '</span></a></li>');
    	}
	$('#searchDisplayList').listview('refresh');
}

function getClinicDetail(tx) {
	//alert("getClinics");
	var sql = "SELECT * FROM IVF WHERE rowid="+sessionStorage.rowid;
	tx.executeSql(sql, [], displayClinicDetail);
}

//  Display Query results of filter query to compare page
function displayClinicDetail(tx, results) {
	jQuery("#clinicDisplayList > li").remove();
	var IVFresults = results.rows.item(0);
	$('#clinicDisplayList').append('<li><a href="" >'+
			'<h1>' + IVFresults.CurrClinNameAll + '</h1>' +
			'<p>' + IVFresults.ClinCityCode + ', ' +IVFresults.ClinStateCode +'<p>'+
			'</a></li>');
	$('#clinicDisplayList').append('<li><a href="" >'+
			'<h1> Fresh Embryos From NonDonor Eggs - Age of Women <35</h1>' +
			'<h1> % of cycles resulting in live births: <bold>' + IVFresults.FshNDLvBirthsRate1 + '%</bold></h1>'+
			'</a></li>');
	$('#clinicDisplayList').listview('refresh');
}

function transaction_error(tx, error) {
    alert("Database Error: " + error);
}

function populateDB(tx) {
	//alert("populateDB called");
		dbCreated = true;
	//  Create Filter Data  ** note ROWID autoinc automaticly
	    tx.executeSql('DROP TABLE IF EXISTS FILTERS');
	    tx.executeSql('CREATE TABLE IF NOT EXISTS FILTERS (Descr1, Descr2, Descr3, Descr4, Num, SQLWhere, SQLKey)');
	    //tx.executeSql('INSERT INTO FILTERS (Descr1, Descr2, Descr3, Descr4, Num, SQLWhere, SQLKey) VALUES("State Selection","","All States","",0,"","ClinStateCode IN")');	    
	//  Load Clinic data	
	    tx.executeSql('DROP TABLE IF EXISTS IVF');
	    tx.executeSql('CREATE TABLE IF NOT EXISTS IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll, FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (1,"ALABAMA","BIRMINGHAM","Alabama Fertility Specialists",28.6,25,16.7,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (2,"ALABAMA","BIRMINGHAM","ART Fertility Program of Alabama",32.7,39.3,12.5,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (3,"ALABAMA","BIRMINGHAM","University of Alabama at Birmingham",22.2,35.7,33.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (4,"ALABAMA","HUNTSVILLE","Huntsville Reproductive Medicine  PC",45.2,42.1,33.3,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (5,"ALABAMA","MOBILE","Center for Reproductive Medicine",46.3,35.9,47.8,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (6,"ALABAMA","MOBILE","University of South Alabama IVF and ART Program",50,28.6,33.3,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (7,"ALASKA","SOLDOTNA","Peninsula Medical Center  John Nels Anderson  MD",21.9,16.7,0,14.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (8,"ARIZONA","GLENDALE","Troché Fertility Centers",52.5,26.7,28.6,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (9,"ARIZONA","PHOENIX","Arizona Reproductive Medicine Specialists",31.5,25.5,17,5.6,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (10,"ARIZONA","PHOENIX","Southwest Fertility Center",29.6,21.4,28.6,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (11,"ARIZONA","SCOTTSDALE","Advanced Fertility Care  PLLC",52.2,52,15.8,12.5,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (12,"ARIZONA","SCOTTSDALE","Arizona Associates for Reproductive Health",48.1,31.3,33.3,7.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (13,"ARIZONA","SCOTTSDALE","Arizona Center for Fertility Studies",33.3,25,31.3,28.6,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (14,"ARIZONA","SCOTTSDALE","IVF Phoenix",45.5,50,50,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (15,"ARIZONA","TEMPE","Fertility Treatment Center",34.8,29.2,18.2,7.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (16,"ARIZONA","TUCSON","Arizona Center for Reproductive Endocrinology and Infertility",41.7,36.8,19.4,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (17,"ARIZONA","TUCSON","Reproductive Health Center",33.3,34.8,22.7,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (18,"ARKANSAS","LITTLE ROCK","Arkansas Fertility Center  Little Rock Fertility Center",44.4,23.4,28.9,8.3,50)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (19,"CALIFORNIA","AGOURA HILLS","LifeStart Fertility Center",62.5,null,20,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (20,"CALIFORNIA","BERKELEY","Alta Bates In Vitro Fertilization Program",36.4,25,23.5,50,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (21,"CALIFORNIA","BEVERLY HILLS","California Center for Reproductive Health  Beverly Hills Reproductive Fertility Center",50,33.3,31.8,14.3,5.6)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (22,"CALIFORNIA","BEVERLY HILLS","Center for Reproductive Health & Gynecology  (CRH&G)",61.9,53.3,40,15.4,5.9)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (23,"CALIFORNIA","BEVERLY HILLS","Southern California Reproductive Center",50,36.6,32.1,14.5,9.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (24,"CALIFORNIA","BEVERLY HILLS","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",null,0,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (25,"CALIFORNIA","BREA","Fertility Care of Orange County",44,46.2,33.3,20,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (26,"CALIFORNIA","CLOVIS","Central California IVF Program  Women s Specialty and Fertility Center",30.2,28.2,18.5,25,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (27,"CALIFORNIA","DAVIS","California IVF: Davis Fertility Center  Inc.",32.8,26.1,32,6.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (28,"CALIFORNIA","ENCINO","The Fertility Institutes  Los Angeles  New York  Guadalajara",58.8,47.5,47.1,28.1,14.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (29,"CALIFORNIA","ENCINO","HRC Fertility-Encino",57.6,51.7,33,12.8,15.4)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (30,"CALIFORNIA","FOSTER CITY","Zouves Fertility Center",32.5,31.9,22.9,7.8,10.5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (31,"CALIFORNIA","FOUNTAIN VALLEY","West Coast Fertility Centers",46.3,27,21.1,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (32,"CALIFORNIA","FOUNTAIN VALLEY","Xpert Fertility Care of California  Minh N. Ho  MD  FACOG",28.6,60,66.7,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (33,"CALIFORNIA","FREMONT","Kaiser Permanente Center for Reproductive Health",40.4,39.2,28.4,19.1,19.2)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (34,"CALIFORNIA","GLENDALE","Kathleen Kornafel  MD  PhD",20,25,16.7,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (35,"CALIFORNIA","IRVINE","Coastal Fertility Medical Center  Inc.",32.4,24.1,6.9,15,66.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (36,"CALIFORNIA","IRVINE","Fertility Center of Southern California",52.4,43.8,18.5,16,28.6)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (37,"CALIFORNIA","IRVINE","Reproductive Fertility Center-OC",48.3,42.5,26.3,10.5,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (38,"CALIFORNIA","LA JOLLA","Reproductive Partners-UCSD Regional Fertility Center",55.9,49.5,31.3,13,5.6)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (39,"CALIFORNIA","LA JOLLA","Reproductive Sciences Center",27.8,28.6,15.4,50,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (40,"CALIFORNIA","LAGUNA HILLS","HRC Fertility-Orange County",56.5,44.3,25,15.2,7.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (41,"CALIFORNIA","LAGUNA NIGUEL","Acacio Fertility Center",34,39.5,36.4,14.7,3.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (42,"CALIFORNIA","LOMA LINDA","Loma Linda University Center for Fertility and IVF",39.3,31.6,32,10,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (43,"CALIFORNIA","LOS ANGELES","California Fertility Partners",42.9,28,16.5,14.4,4.8)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (44,"CALIFORNIA","LOS ANGELES","Cedars Sinai Medical Center  Center for Fertility and Reproductive Medicine",20,38.1,12.5,30.8,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (45,"CALIFORNIA","LOS ANGELES","CHA Fertility Center",41,33.3,26.1,0,20)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (46,"CALIFORNIA","LOS ANGELES","Pacific Fertility Center-Los Angeles",45.5,43.3,34.9,9.5,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (47,"CALIFORNIA","LOS ANGELES","UCLA Fertility Center",42.9,23.1,25,14.3,7.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (48,"CALIFORNIA","LOS ANGELES","USC Reproductive Endocrinology and Infertility",46.9,40.6,16.7,17.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (49,"CALIFORNIA","MONTEREY","The Fertility and Gynecology Center  Monterey Bay IVF Program",35,29.4,33.3,25,16.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (50,"CALIFORNIA","MOUNTAIN VIEW","Nova In Vitro Fertilization",51.6,29.7,35.9,5.9,7.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (51,"CALIFORNIA","NEWPORT BEACH","Reproductive Specialty Medical Center",5.9,40,0,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (52,"CALIFORNIA","NEWPORT BEACH","Southern California Center for Reproductive Medicine",50,50,29.1,12.8,4.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (53,"CALIFORNIA","ORANGE","IVF-Orange Surgery Center",0,0,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (54,"CALIFORNIA","PALO ALTO","Stanford University IVF/ART Program  Department of Gynecology and Obstetrics",30.9,19.4,13.6,9.6,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (55,"CALIFORNIA","PASADENA","HRC-Pasadena",50.5,42.6,27.9,20.6,8.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (56,"CALIFORNIA","PORTOLA VALLEY","Palo Alto Medical Foundation  Reproductive Endocrinology & Fertility",21.2,8.6,4.9,8,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (57,"CALIFORNIA","REDONDO BEACH","Reproductive Partners-Redondo Beach",45.5,39.4,21.3,14.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (58,"CALIFORNIA","ROSEVILLE","Northern California Fertility Medical Center",41.3,26.5,23.5,9.3,4.8)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (59,"CALIFORNIA","SACRAMENTO","Kaiser Permanente Center for Reproductive Health-Sacramento",53.2,45.2,24,16.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (60,"CALIFORNIA","SAN DIEGO","Fertility Specialists Medical Group",43.8,35.5,20.8,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (61,"CALIFORNIA","SAN DIEGO","NTC Infertility Clinic",37.3,50,20,50,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (62,"CALIFORNIA","SAN DIEGO","San Diego Fertility Center  (SDFC)",40,29.8,28,15,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (63,"CALIFORNIA","SAN DIMAS","Williams OB/GYN",50,0,null,null,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (64,"CALIFORNIA","SAN FRANCISCO","Laurel Fertility Care",20,35.3,15.4,5.3,10)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (65,"CALIFORNIA","SAN FRANCISCO","Pacific Fertility Center",34.7,18.8,19.6,11.5,6.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (66,"CALIFORNIA","SAN FRANCISCO","UCSF Center for Reproductive Health",36.1,36.4,25.3,11.9,6.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (67,"CALIFORNIA","SAN JOSE","Fertility Physicians of Northern California",39,25.9,23.9,12.5,6.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (68,"CALIFORNIA","SAN LUIS OBISPO","Alex Steinleitner  MD  Inc.",60,50,26.7,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (69,"CALIFORNIA","SAN RAMON","Reproductive Science Center of the San Francisco Bay Area",38.2,31.3,24.2,18.8,5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (70,"CALIFORNIA","SANTA BARBARA","Santa Barbara Fertility Center",57.1,77.8,57.1,3.6,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (71,"CALIFORNIA","SANTA MONICA","Parker-Rosenman-Rodi Gynecology and Infertility Medical Group",27.3,0,19,25,14.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (72,"CALIFORNIA","SANTA ROSA","Advanced Fertility Associates Medical Group  Inc.",38.5,40,24,22.2,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (73,"CALIFORNIA","SHERMAN OAKS","Valley Center for Reproductive Health  Tina Koopersmith  MD",55.6,7.1,33.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (74,"CALIFORNIA","SOUTH PASADENA","Garfield Fertility Center",77.8,20,50,25,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (75,"CALIFORNIA","TARZANA","The Center for Fertility and Gynecology  Vermesh Center for Fertility",47.6,42.3,25,23.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (76,"CALIFORNIA","TARZANA","Tree of Life Center for Fertility  Snunit Ben-Ozer  MD",57.1,50,28.6,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (77,"CALIFORNIA","THOUSAND OAKS","Fertility and Surgical Associates of California",41.1,39.7,23.2,11.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (78,"CALIFORNIA","TORRANCE","Pacific Reproductive Center",53.7,41,22,19.4,5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (79,"CALIFORNIA","TORRANCE","University Fertility Center",28.3,32,19,9.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (80,"CALIFORNIA","WESTMINSTER","Reproductive Partners-Westminster",54.8,39,37.1,27.8,14.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (81,"COLORADO","AURORA","Advanced Reproductive Medicine  University of Colorado",44.4,23.5,25,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (82,"COLORADO","COLORADO SPRINGS","Reproductive Medicine & Fertility Center",28.3,25,7.1,40,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (83,"COLORADO","COLORADO SPRINGS","Eric H. Silverstein  MD  Professional LLC dba  The Fertility Center of Colorado",46.2,21.4,33.3,33.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (84,"COLORADO","DENVER","Colorado Reproductive Endocrinology",23.7,22.2,33.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (85,"COLORADO","FORT COLLINS","Rocky Mountain Center for Reproductive Medicine",43.3,33.3,20,null,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (86,"COLORADO","LITTLETON","Conceptions Reproductive Associates",54.5,52,25.5,29.4,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (87,"COLORADO","LONE TREE","Colorado Center for Reproductive Medicine",68.4,65.1,49.5,22.9,14.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (88,"COLORADO","PARKER","Rocky Mountain Fertility Center  PC",44.7,33.3,80,100,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (89,"CONNECTICUT","BRIDGEPORT","Connecticut Fertility Associates",34,25.6,7.9,0,12.5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (90,"CONNECTICUT","FARMINGTON","The Center for Advanced Reproductive Services at the University of Connecticut Health Center",45.9,35.6,26.3,22.5,7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (91,"CONNECTICUT","GREENWICH","Greenwich Fertility and IVF Center  PC",68.3,44.4,37.1,0,20)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (92,"CONNECTICUT","NEW HAVEN","Yale Fertility Center",44.3,31.6,11.4,14.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (93,"CONNECTICUT","NORWALK","Reproductive Medicine Associates of Connecticut",53.3,34.4,19.3,11.8,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (94,"CONNECTICUT","STAMFORD","New England Fertility Institute",40.3,35.5,18,20.7,6.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (95,"CONNECTICUT","STAMFORD","The Stamford Hospital",9.1,0,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (96,"CONNECTICUT","STAMFORD","Women s Fertility Center  Dr. Nora R. Miller",25,30.8,10,33.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (97,"CONNECTICUT","TRUMBULL","Park Avenue Fertility and Reproductive Medicine",47.2,16.7,16.1,3.3,22.2)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (98,"DELAWARE","NEWARK","Delaware Institute for Reproductive Medicine  PA",18.6,5.7,12.9,14.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (99,"DELAWARE","NEWARK","Reproductive Associates of Delaware",45.2,37.2,14.3,6.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (100,"DISTRICT OF COLUMBIA","WASHINGTON","The A.R.T. Institute of Washington  Inc.  Walter Reed Army Medical Center",41.9,28.9,19.6,16.7,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (101,"DISTRICT OF COLUMBIA","WASHINGTON","Columbia Fertility Associates",48.7,25.8,26.6,12.6,4.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (102,"DISTRICT OF COLUMBIA","WASHINGTON","The George Washington University Medical Faculty Associates",27.1,21,11,6.8,13)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (103,"DISTRICT OF COLUMBIA","WASHINGTON","James A. Simon  MD  PC",null,100,0,33.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (104,"FLORIDA","BOCA RATON","BocaFertility",40.6,50,23.1,8.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (105,"FLORIDA","BOCA RATON","Palm Beach Fertility Center",46.2,25,21.1,28.6,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (106,"FLORIDA","BOYNTON BEACH","Advanced Reproductive Care Center",50,50,14.3,0,100)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (107,"FLORIDA","COOPER CITY","Infertility and Reproductive Medicine of South Broward",40,43.8,16.7,16.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (108,"FLORIDA","FORT MYERS","Southwest Florida Fertility Center  PA",30.8,20,14.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (109,"FLORIDA","FORT MYERS","Specialists in Reproductive Medicine and Surgery  PA",26.1,42.1,23.1,50,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (110,"FLORIDA","GAINESVILLE","University of Florida Women s Health at Magnolia Parke",33.3,33.3,25,20,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (111,"FLORIDA","JACKSONVILLE","Assisted Fertility Program of North Florida",27.8,5.9,8.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (112,"FLORIDA","JACKSONVILLE","Brown Fertility Associates",37.9,42.9,14.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (113,"FLORIDA","JACKSONVILLE","Florida Institute for Reproductive Medicine",45.9,28.4,22.4,7.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (114,"FLORIDA","JACKSONVILLE","Jacksonville Center for Reproductive Medicine",28.9,29.7,13.3,21.4,20)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (115,"FLORIDA","LUTZ","Center for Reproductive Medicine",16.7,12.5,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (116,"FLORIDA","MARGATE","IVF Florida",36.3,25,22,14.6,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (117,"FLORIDA","MELBOURNE","Viera Fertility Center  Fertility and Reproductive Medicine Center for Women",30.4,25,28.6,12.5,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (118,"FLORIDA","MIAMI","Fertility & IVF Center of Miami  Inc.",29.2,27.4,25.6,7.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (119,"FLORIDA","MIAMI","University of Miami Infertility Center",29.7,13.3,16,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (120,"FLORIDA","MIAMI LAKES","Palmetto Fertility Center of South Florida",42.9,27.3,13.3,11.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (121,"FLORIDA","ORLANDO","Center for Reproductive Medicine  PA",46.2,46,18.5,8.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (122,"FLORIDA","ORLANDO","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",28.6,66.7,16.7,100,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (123,"FLORIDA","PENSACOLA","New Leaders in Infertility & Endocrinology  LLC",42.3,26.7,9.7,20,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (124,"FLORIDA","PLANTATION","Fertility & Genetics",47.1,33.3,31.3,8.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (125,"FLORIDA","SARASOTA","Fertility Center and Applied Genetics of Florida  Inc.",43.5,36.8,33.3,33.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (126,"FLORIDA","SOUTH MIAMI","South Florida Institute for Reproductive Medicine",48.8,41.3,23.1,18,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (127,"FLORIDA","TAMPA","Reproductive Health Associates  PA",9.1,27.3,0,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (128,"FLORIDA","TAMPA","The Reproductive Medicine Group",45.7,35.9,17.6,22.2,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (129,"FLORIDA","TAMPA","University of South Florida IVF",25,34.2,26.3,7.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (130,"FLORIDA","WESTON","F.I.R.S.T.  Florida Institute for Reproductive Sciences and Technologies",22.2,14.3,0,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (131,"FLORIDA","WINTER PARK","Fertility Center of Assisted Reproduction & Endocrinology",31.9,16.7,36.4,11.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (132,"GEORGIA","ATLANTA","Atlanta Center for Reproductive Medicine",35.9,27.8,31.8,34.2,12.5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (133,"GEORGIA","ATLANTA","Emory Reproductive Center",70.9,54.3,25.6,33.3,11.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (134,"GEORGIA","ATLANTA","Georgia Reproductive Specialists  LLC",50.4,32.3,16.3,4.2,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (135,"GEORGIA","AUGUSTA","Reproductive Medicine and Infertility Associates",58.3,25,50,null,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (136,"GEORGIA","AUGUSTA","Servy Institute for Reproductive Endocrinology",42.9,0,40,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (137,"GEORGIA","COLUMBUS","Columbus Center for Reproductive Endocrinology and Infertility  LLC",43.5,27.3,18.2,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (138,"GEORGIA","MACON","Central Georgia Fertility Institute",18.2,0,0,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (139,"GEORGIA","SANDY SPRINGS","Reproductive Biology Associates",40.5,31.3,21.7,14.8,6.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (140,"GEORGIA","SAVANNAH","The Georgia Center for Reproductive Medicine",69,30.3,26.7,100,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (141,"HAWAII","HONOLULU","Advanced Reproductive Center of Hawaii",45.2,32.1,12.8,15,16.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (142,"HAWAII","HONOLULU","Advanced Reproductive Medicine & Gynecology of Hawaii  Inc.",57.9,52.6,22.2,25,33.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (143,"HAWAII","HONOLULU","IVF Hawaii",61.1,22.2,13.3,18.8,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (144,"HAWAII","HONOLULU","Pacific In Vitro Fertilization Institute",26.6,27.5,14.9,4,11.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (145,"HAWAII","TRIPLER AMC","Tripler Army Medical Center IVF Institute",28.6,100,25,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (146,"IDAHO","BOISE","Idaho Center for Reproductive Medicine",34.5,23.3,11.6,10,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (147,"ILLINOIS","AURORA","Rush-Copley Center for Reproductive Health",26.5,24.2,19,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (148,"ILLINOIS","BERWYN","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",0,0,null,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (149,"ILLINOIS","CHICAGO","Martin S. Balin  MD  PhD",40,0,37.5,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (150,"ILLINOIS","CHICAGO","Center for Reproductive Medicine & Fertility  The University of Chicago Medical Center",25.3,18.6,7.4,15.4,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (151,"ILLINOIS","CHICAGO","Institute for Human Reproduction (IHR)",36.8,36.1,17.2,10,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (152,"ILLINOIS","CHICAGO","Northwestern University",31.9,30.7,12.7,13.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (153,"ILLINOIS","CHICAGO","River North IVF-Fertility Centers of Illinois",37.3,21.6,19.1,6.1,1.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (154,"ILLINOIS","CHICAGO","University of Illinois at Chicago IVF Program",25,32,25.8,9.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (155,"ILLINOIS","CHICAGO","Women s Health Consultants",43.2,22.2,15.8,9.1,11.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (156,"ILLINOIS","CREST HILL","Center for Reproductive Health Joliet IVF",28.4,27.8,0,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (157,"ILLINOIS","DOWNERS GROVE","Midwest Fertility Center",46.6,26.3,33.3,33.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (158,"ILLINOIS","EVANSTON","The Rinehart Center for Reproductive Medicine",28.6,18,10.9,8.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (159,"ILLINOIS","EVANSTON","The Rinehart-Coulam Center",28.6,26.7,15.4,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (160,"ILLINOIS","GURNEE","Advanced Fertility Center of Chicago",57.7,38.2,43.8,13.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (161,"ILLINOIS","HANOVER PARK","Chicago Infertility Associates  Ltd.",14.3,0,null,null,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (162,"ILLINOIS","HIGHLAND PARK","Highland Park IVF Center",38.1,25.6,18.8,11.5,3.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (163,"ILLINOIS","HINSDALE","Hinsdale Center for Reproduction",37.5,16.7,16.7,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (164,"ILLINOIS","HOFFMAN ESTATES","Reena Jabamoni  MD  SC",27.3,55.6,37.5,null,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (165,"ILLINOIS","HOFFMAN ESTATES","Karande and Associates  SC dba  InVia Fertility Specialists",48.1,32.4,23.6,4.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (166,"ILLINOIS","JOLIET","Reproductive Health Specialists  Ltd.",41.7,25,13.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (167,"ILLINOIS","NAPERVILLE","The Advanced IVF Institute  Charles E. Miller  MD  SC & Associates",42.9,32.5,21.2,13.5,7.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (168,"ILLINOIS","NAPERVILLE","IVF1",32,26.7,25,2.7,12.5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (169,"ILLINOIS","OAK BROOK","Oak Brook Fertility Center",45,27,29.4,15.4,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (170,"ILLINOIS","ROCKFORD","Reproductive Health and Fertility Center",23.3,16.7,18.2,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (171,"ILLINOIS","SKOKIE","North Shore Fertility  SC",18,25,3,5.6,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (172,"ILLINOIS","SPRINGFIELD","Reproductive Endocrinology Associates  SC",25,12.5,27.3,14.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (173,"ILLINOIS","SPRINGFIELD","Southern Illinois University School of Medicine Fertility and IVF Center",70.6,45.5,33.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (174,"ILLINOIS","TINLEY PARK","Seth Levrant  MD  PC  Partners in Reproductive Health",43.4,20,13.6,0,25)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (175,"INDIANA","CARMEL","American Health Network Reproductive Medicine",45.2,25,23.8,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (176,"INDIANA","CARMEL","Jarrett Fertility Group",51.2,31.3,35.5,21.4,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (177,"INDIANA","CARMEL","Midwest Fertility Specialists",36.5,22.1,4.9,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (178,"INDIANA","EVANSVILLE","Advanced Reproduction Institute  LLC  Advanced Fertility Group",34.8,18.8,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (179,"INDIANA","INDIANAPOLIS","Advanced Fertility Group",30.4,30.8,38.5,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (180,"INDIANA","INDIANAPOLIS","Community Reproductive Endocrinology",70,25,28.6,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (181,"INDIANA","INDIANAPOLIS","Family Beginnings  PC",21.5,32.4,20,0,50)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (182,"INDIANA","INDIANAPOLIS","Indiana University Hospital",33.3,33.3,0,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (183,"INDIANA","INDIANAPOLIS","Reproductive Care of Indiana",50.9,30,75,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (184,"INDIANA","NOBLESVILLE","Women s Specialty Health Centers  PC",58.3,66.7,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (185,"IOWA","CLIVE","Mid-Iowa Fertility  PC",50.7,34.5,13.3,16.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (186,"IOWA","IOWA CITY","University of Iowa Hospitals and Clinics  Center for Advanced Reproductive Care",47.3,44.2,36.4,26.3,14.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (187,"KANSAS","OLATHE","Midwest Reproductive Center  PA",45.7,38.9,30.8,0,25)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (188,"KANSAS","OVERLAND PARK","Center for Advanced Reproductive Medicine",30,20,6.7,20,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (189,"KANSAS","OVERLAND PARK","Reproductive Resource Center of Greater Kansas City",40.4,21.2,11.8,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (190,"KANSAS","SHAWNEE MISSION","Reproductive Medicine & Infertility  Shawnee Mission Medical Center",31,5.7,0,20,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (191,"KANSAS","WICHITA","The Center for Reproductive Medicine",38.7,54.5,41.7,16.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (192,"KENTUCKY","LEXINGTON","Bluegrass Fertility Center",37.9,42.1,40,11.1,100)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (193,"KENTUCKY","LEXINGTON","University of Kentucky",0,null,null,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (194,"KENTUCKY","LOUISVILLE","Fertility and Endocrine Associates  Louisville Reproductive Center",41,27.8,9.1,16.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (195,"KENTUCKY","LOUISVILLE","University Women s HealthCare Fertility Center",51.7,28,41.2,14.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (196,"LOUISIANA","BATON ROUGE","A Woman s Center for Reproductive Medicine",40.9,35.3,18.8,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (197,"LOUISIANA","LAFAYETTE","Fertility and Women s Health Center of Louisiana",43.1,26.1,7.1,0,25)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (198,"LOUISIANA","METAIRIE","The Fertility Institute of New Orleans",48.2,34,24.2,15.4,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (199,"LOUISIANA","SHREVEPORT","Center for Fertility and Reproductive Health",48.5,35.3,12.5,50,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (200,"MARYLAND","BALTIMORE","Center for ART at Union Memorial Hospital",17.9,33.3,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (201,"MARYLAND","BALTIMORE","Fertility Center of Maryland",39.6,23.9,9.5,15.4,12.5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (202,"MARYLAND","BALTIMORE","Shady Grove Fertility RSC at GBMC",51.5,40.6,27.4,12.5,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (203,"MARYLAND","LUTHERVILLE","Endrika Hinton  MD",15.4,55.6,66.7,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (204,"MARYLAND","LUTHERVILLE","Johns Hopkins Fertility Center",32.6,24.4,10.2,2.6,5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (205,"MARYLAND","ROCKVILLE","Shady Grove Fertility Reproductive Science Center",47.1,36.2,25.1,16.1,5.4)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (206,"MASSACHUSETTS","BOSTON","Brigham and Women s Hospital Center for Assisted Reproductive Technology",38.3,35.3,23.9,18.3,5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (207,"MASSACHUSETTS","BOSTON","Massachusetts General Hospital Fertility Center",43.6,30.1,28.8,24.2,11.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (208,"MASSACHUSETTS","BOSTON","REI Division at Tufts Medical Center",41.2,24.2,13.8,10,16.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (209,"MASSACHUSETTS","LEXINGTON","Reproductive Science Center",40.7,29.9,19,10.7,5.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (210,"MASSACHUSETTS","READING","Fertility Centers of New England  Inc.  New England Clinics of Reproductive Medicine  Inc.",40.2,25.8,15.8,11.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (211,"MASSACHUSETTS","SPRINGFIELD","Baystate Reproductive Medicine",44.4,40,27.1,16.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (212,"MASSACHUSETTS","STONEHAM","Cardone Reproductive Medicine and Infertility",29.8,12.1,24,20,4.8)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (213,"MASSACHUSETTS","WALTHAM","Boston IVF",32.3,22.9,16.6,14.8,5.6)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (214,"MICHIGAN","ANN ARBOR","Center for Reproductive Medicine  University of Michigan Reproductive Endocrinology and Infertility",31.7,42.9,25,22.2,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (215,"MICHIGAN","BIRMINGHAM","Center for Reproductive Medicine and Surgery  PC",26.7,31,25,16.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (216,"MICHIGAN","BLOOMFIELD HILLS","Advanced Reproductive Medicine and Surgery  PC",47.6,41.2,20,28.6,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (217,"MICHIGAN","BRIGHTON","Gago IVF",37.5,50,18.2,25,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (218,"MICHIGAN","DEARBORN","Michigan Comprehensive Fertility Center",21.1,42.3,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (219,"MICHIGAN","GRAND RAPIDS","Grand Rapids Fertility & IVF  PC",28.6,23.1,25,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (220,"MICHIGAN","GRAND RAPIDS","Michigan Reproductive & IVF Center  PC",37,27.8,14.1,5,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (221,"MICHIGAN","ROCHESTER HILLS","IVF Michigan",42.1,42.1,28.2,10.4,9.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (222,"MICHIGAN","SOUTHFIELD","Wayne State University Physician Group",42.9,35.3,30.8,40,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (223,"MICHIGAN","TROY","Henry Ford Reproductive Medicine",19,0,20,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (224,"MICHIGAN","TROY","Reproductive Medicine Associates of Michigan",45.4,27.5,25.9,0,8.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (225,"MICHIGAN","WARREN","Michigan Center for Fertility and Women s Health  PLC",43.2,53.8,29.4,60,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (226,"MINNESOTA","MAPLE GROVE","The Midwest Center for Reproductive Health  PA",55.6,35,23.1,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (227,"MINNESOTA","MINNEAPOLIS","Center for Reproductive Medicine  Advanced Reproductive Technologies",56.7,46.3,30.2,11.4,28.6)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (228,"MINNESOTA","MINNEAPOLIS","Reproductive Medicine Center",49.1,25.8,27.1,15.8,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (229,"MINNESOTA","ROCHESTER","Mayo Clinic Assisted Reproductive Technologies",35.9,18.8,16.7,33.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (230,"MINNESOTA","WOODBURY","Reproductive Medicine & Infertility Associates",44.3,34.5,28.1,14.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (231,"MISSISSIPPI","JACKSON","Mississippi Fertility Institute",28.4,5.3,25,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (232,"MISSISSIPPI","JACKSON","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",27.3,44.4,25,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (233,"MISSOURI","CHESTERFIELD","Infertility Center of St. Louis  Sherman J. Silber  MD",39.2,28.1,37.5,16.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (234,"MISSOURI","COLUMBIA","Mid-Missouri Reproductive Medicine and Surgery  Inc.",55.1,50,21.4,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (235,"MISSOURI","COLUMBIA","Missouri Center for Reproductive Medicine and Fertility  IVF Embryology Laboratory",6.7,0,50,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (236,"MISSOURI","KANSAS CITY","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",48.7,33.3,28.6,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (237,"MISSOURI","SAINT PETERS","Fertility Partnership",35.7,21.4,37.5,25,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (238,"MISSOURI","ST. LOUIS","Fertility Center at Missouri Baptist Medical Center",48.9,30,27.3,33.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (239,"MISSOURI","ST. LOUIS","The Infertility and Reproductive Medicine Center at Washington University School of Medicine and Barnes-Jewish Hospital",43.9,35,27.1,13,25)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (240,"NEBRASKA","OMAHA","Heartland Center for Reproductive Medicine  PC",45.9,15.2,21.7,0,50)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (241,"NEBRASKA","OMAHA","Nebraska Methodist Hospital REI",43.9,32.1,16,14.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (242,"NEVADA","LAS VEGAS","Fertility Center of Las Vegas",37.9,18,21.5,13,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (243,"NEVADA","LAS VEGAS","Nevada Fertility C.A.R.E.S.",42.3,27.3,17.1,0,11.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (244,"NEVADA","LAS VEGAS","Red Rock Fertility Center",47.6,36,23.8,0,33.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (245,"NEVADA","RENO","The Nevada Center for Reproductive Medicine",39.7,52.6,20,0,100)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (246,"NEW HAMPSHIRE","LEBANON","Dartmouth-Hitchcock Medical Center",45.9,27.5,25.6,6.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (247,"NEW JERSEY","BEDMINSTER","Sher Institute for Reproductive Medicine-New Jersey",44.8,24.2,28.3,4.8,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (248,"NEW JERSEY","EATONTOWN","Reproductive Science Center of New Jersey",42.6,33.3,15,27.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (249,"NEW JERSEY","EDISON","Center for Advanced Reproductive Medicine & Fertility",34.3,29.6,16.2,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (250,"NEW JERSEY","ENGLEWOOD","Dr. Philip Lesorgen  Women s Fertility Center",15.8,0,16.7,0,14.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (251,"NEW JERSEY","ENGLEWOOD CLIFFS","North Hudson I.V.F.  Center for Fertility and Gynecology",57.1,66.7,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (252,"NEW JERSEY","FAIR LAWN","Douglas S. Rabin  MD",16.7,16.7,18.2,66.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (253,"NEW JERSEY","HASBROUCK HEIGHTS","University Reproductive Associates  PC",36,36.1,34.5,5,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (254,"NEW JERSEY","LAKEWOOD","Shore Institute for Reproductive Medicine",32.7,38.9,33.3,33.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (255,"NEW JERSEY","LAWRENCEVILLE","Delaware Valley OBGYN and Infertility Group  Princeton IVF",40.4,34.6,21.7,23.5,12.5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (256,"NEW JERSEY","LAWRENCEVILLE","Princeton Center for Infertility & Reproductive Medicine",46.2,50,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (257,"NEW JERSEY","LITTLE SILVER","East Coast Infertility and IVF",34.8,31.6,22.7,20.8,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (258,"NEW JERSEY","LIVINGSTON","Institute for Reproductive Medicine and Science  Saint Barnabas Medical Center",34.8,32.6,25.1,8.7,5.9)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (259,"NEW JERSEY","MARLTON","Cooper Institute for Reproductive Hormonal Disorders",29.5,16.1,10.6,5.1,2)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (260,"NEW JERSEY","MARLTON","Delaware Valley Institute of Fertility and Genetics",38.7,36,29.4,0,14.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (261,"NEW JERSEY","MARLTON","South Jersey Fertility Center",35.4,22.9,17.5,8.8,7.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (262,"NEW JERSEY","MILLBURN","Diamond Institute for Infertility",35.3,18.9,12.7,12.8,7.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (263,"NEW JERSEY","MORRISTOWN","Reproductive Medicine Associates of New Jersey",60.9,50.4,35.7,21.2,6.8)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (264,"NEW JERSEY","PARAMUS","Valley Hospital Fertility Center",46.7,43.1,20.3,8.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (265,"NEW JERSEY","SOMERSET","IVF New Jersey",44,38.1,33.3,15.6,13.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (266,"NEW JERSEY","VOORHEES","Dr. Louis R. Manara",34,17.9,20,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (267,"NEW JERSEY","WAYNE","North Jersey Fertility Associates  LLC",39.1,25,25,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (268,"NEW JERSEY","WESTWOOD","Fertility Institute of New Jersey and New York",25.3,35.7,9.7,3.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (269,"NEW MEXICO","ALBUQUERQUE","Center for Reproductive Medicine of New Mexico",66.7,43.8,22.6,10,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (270,"NEW YORK","BROOKLYN","The Fertility Institute at New York Methodist Hospital",27.1,27.5,16.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (271,"NEW YORK","BROOKLYN","Genesis Fertility & Reproductive Medicine",43.2,17.2,20.5,8.8,15)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (272,"NEW YORK","BUFFALO","Infertility & IVF Medical Associates of Western New York",36.4,20,11.4,16.7,100)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (273,"NEW YORK","FISHKILL","Hudson Valley Fertility  PLLC",18,21.4,9.4,0,7.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (274,"NEW YORK","FLUSHING","The New York Fertility Center",15.1,19.4,4.9,9.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (275,"NEW YORK","HARTSDALE","Montefiore s Institute for Reproductive Medicine and Health",29.8,39.1,18.2,6.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (276,"NEW YORK","LOUDONVILLE","Albany IVF  Fertility",46.7,36.1,18.2,0,25)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (277,"NEW YORK","MANHASSET","North Shore University Hospital  Center for Human Reproduction",38.1,27.1,21.8,7.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (278,"NEW YORK","MELVILLE","Long Island IVF",48.5,32.9,20.4,14.6,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (279,"NEW YORK","MINEOLA","Reproductive Specialists of New York",33.8,19.7,15.8,9.8,2.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (280,"NEW YORK","MT. KISCO","Westchester Reproductive Medicine",42.9,25,20,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (281,"NEW YORK","NEW YORK","Advanced Fertility Services",23.5,22,12.5,2,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (282,"NEW YORK","NEW YORK","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",27.7,14.3,11.5,7.5,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (283,"NEW YORK","NEW YORK","Batzofin Fertility Services",25,15.4,5.6,7.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (284,"NEW YORK","NEW YORK","Beth Israel Center for Infertility & Reproductive Health",16.4,26.7,29.2,20,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (285,"NEW YORK","NEW YORK","Brooklyn/Westside Fertility Center  Brooklyn Fertility Center",28.6,0,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (286,"NEW YORK","NEW YORK","Columbia University Center for Women s Reproductive Care",36.6,28.3,16.8,7.4,2.6)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (287,"NEW YORK","NEW YORK","IVF New York",0,null,0,null,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (288,"NEW YORK","NEW YORK","Manhattan Reproductive Medicine",34.5,16.7,16.7,100,100)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (289,"NEW YORK","NEW YORK","Medical Offices for Human Reproduction  Center for Human Reproduction (CHR)",28.1,18.8,14.3,5.3,2.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (290,"NEW YORK","NEW YORK","Metropolitan Reproductive Medicine  PC",50,50,0,100,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (291,"NEW YORK","NEW YORK","New Hope Fertility Center",37,34.7,18.7,5.9,3.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (292,"NEW YORK","NEW YORK","New York Fertility Institute",44.4,42.9,23.1,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (293,"NEW YORK","NEW YORK","NYU Fertility Center  New York University School of Medicine",43.9,36,27.6,15.7,5.2)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (294,"NEW YORK","NEW YORK","Offices for Fertility and Reproductive Medicine",52.9,28.6,26.3,14.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (295,"NEW YORK","NEW YORK","Reproductive Endocrinology Associates of St. Luke s Roosevelt Hospital Center",38.7,24,14.1,4.4,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (296,"NEW YORK","NEW YORK","Reproductive Medicine Associates of New York  LLP",47.9,41.4,26.1,18.4,8.9)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (297,"NEW YORK","NEW YORK","Geoffrey Sher  MD  PC",43.2,28.3,17.2,11.1,16.7)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (298,"NEW YORK","NEW YORK","Weill Medical College of Cornell University  The Center for Reproductive Medicine and Infertility",40.5,31.2,23.7,11.9,4.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (299,"NEW YORK","PLAINVIEW","East Coast Fertility",47.3,28.3,25,17.7,6.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (300,"NEW YORK","ROCHESTER","Rochester Fertility Care  PC",37.5,27.8,26.7,0,50)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (301,"NEW YORK","ROCHESTER","Strong Fertility Center",30.4,37.5,33.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (302,"NEW YORK","STATEN ISLAND","Island Reproductive Services",45.5,29,19,0,5.6)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (303,"NEW YORK","SYOSSET","Gold Coast IVF  Reproductive Medicine and Surgery Center",48.4,47.4,36.4,30,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (304,"NEW YORK","SYRACUSE","CNY Fertility Center",30.4,18.8,14.1,5.4,4.8)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (305,"NEW YORK","SYRACUSE","SUNY Upstate Medical University",33.3,0,null,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (306,"NEW YORK","WHITE PLAINS","Westchester Fertility and Reproductive Endocrinology",42.9,52.9,11.8,11.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (307,"NORTH CAROLINA","CARY","North Carolina Center for Reproductive Medicine  The Talbert Fertility Institute",26.7,29.2,18.8,14.3,33.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (308,"NORTH CAROLINA","CHAPEL HILL","University of North Carolina A.R.T. Clinic",35.2,43.5,19.2,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (309,"NORTH CAROLINA","CHARLOTTE","Institute for Assisted Reproduction",38.4,31.7,28,9.4,4.5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (310,"NORTH CAROLINA","CHARLOTTE","Program for Assisted Reproduction  Carolinas Medical Center  CMC Women s Institute",47.6,30.6,17.4,30,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (311,"NORTH CAROLINA","DURHAM","Duke Fertility Center  Duke University Medical Center",46.8,34.7,25,33.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (312,"NORTH CAROLINA","GREENVILLE","East Carolina University",47.4,28.6,23.1,66.7,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (313,"NORTH CAROLINA","HIGH POINT","Premier Fertility Center  High Point Regional Health System",45.9,33.3,28.6,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (314,"NORTH CAROLINA","HUNTERSVILLE","Advanced Reproductive Concepts",45.8,53.3,23.1,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (315,"NORTH CAROLINA","RALEIGH","Carolina Conceptions  PA",47.3,36.3,27.1,27.8,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (316,"NORTH CAROLINA","WINSTON-SALEM","Wake Forest University Center for Reproductive Medicine",50.7,38.9,40.6,30,25)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (317,"NORTH DAKOTA","FARGO","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",27.6,26.3,9.1,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (318,"OHIO","AKRON","Fertility Unlimited  Northeastern Ohio Fertility Center",60,0,14.3,33.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (319,"OHIO","AKRON","Reproductive Gynecology",34,29.3,19.5,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (320,"OHIO","CINCINNATI","Bethesda Center for Reproductive Health & Fertility",37.8,14.7,21.9,11.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (321,"OHIO","CINCINNATI","Center for Reproductive Health",34,13.3,9.1,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (322,"OHIO","CINCINNATI","Institute for Reproductive Health",38.5,31.9,26.2,10,20)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (323,"OHIO","CLEVELAND","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",43.4,31.7,21.5,7.2,5.6)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (324,"OHIO","COLUMBUS","Ohio Reproductive Medicine",42.8,32,25.7,16.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (325,"OHIO","DAYTON","Wright State Physicians Women s Health Care",26.7,33.3,0,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (326,"OHIO","KETTERING","Kettering Reproductive Medicine",32.2,33.3,26.7,10,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (327,"OHIO","TOLEDO","Fertility Center of Northwestern Ohio",30.9,11.1,9.1,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (328,"OKLAHOMA","OKLAHOMA CITY","Henry G. Bennett  Jr.  Fertility Institute",51.9,32.4,24.1,20,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (329,"OKLAHOMA","OKLAHOMA CITY","OU Physicians Reproductive Medicine",52.9,53.3,35.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (330,"OKLAHOMA","TULSA","Tulsa Fertility Center",40.2,26.4,13.3,20,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (331,"OREGON","EUGENE","Fertility Center of Oregon",45,20,20,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (332,"OREGON","PORTLAND","Northwest Fertility Center",46.4,42.9,18.2,33.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (333,"OREGON","PORTLAND","Oregon Reproductive Medicine",56.9,45.2,38.5,15.4,9.1)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (334,"OREGON","PORTLAND","University Fertility Consultants  Oregon Health & Science University",43.6,34.5,28.3,15,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (335,"PENNSYLVANIA","ABINGTON","Toll Center for Reproductive Sciences",36.7,33.7,18.6,13,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (336,"PENNSYLVANIA","ALLENTOWN","Infertility Solutions  PC",18.3,16,27.8,33.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (337,"PENNSYLVANIA","ALLENTOWN","Reproductive Medicine Associates of Pennsylvania",52.3,57.1,31.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (338,"PENNSYLVANIA","BETHLEHEM","Family Fertility Center",41.1,38.9,20,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (339,"PENNSYLVANIA","BRYN MAWR","Main Line Fertility and Reproductive Medicine",46.5,29.4,16.8,12.9,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (340,"PENNSYLVANIA","DANVILLE","Geisinger Medical Center Fertility Program",34.1,40,44.4,16.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (341,"PENNSYLVANIA","HARRISBURG","Advanced Center for Infertility and Reproductive Medicine  RPC",40,33.3,14.3,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (342,"PENNSYLVANIA","HERSHEY","Penn State Milton S. Hershey Medical Center",30.6,56.3,25,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (343,"PENNSYLVANIA","KING OF PRUSSIA","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",52.9,35.9,24.3,5.6,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (344,"PENNSYLVANIA","PHILADELPHIA","Fertility and Gynecology Associates",66.7,40,62.5,33.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (345,"PENNSYLVANIA","PHILADELPHIA","Jefferson IVF",10,0,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (346,"PENNSYLVANIA","PHILADELPHIA","University of Pennsylvania  Penn Fertility Care",33.1,25.7,15.9,11.9,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (347,"PENNSYLVANIA","PITTSBURGH","Jones Institute at West Penn Allegheny Health System",36.4,33.3,25,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (348,"PENNSYLVANIA","PITTSBURGH","Reproductive Health Specialists  Inc.",47.1,39.7,20.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (349,"PENNSYLVANIA","PITTSBURGH","University of Pittsburgh Physicians  Center for Fertility and Reproductive Endocrinology",26.6,23.6,13.7,6.9,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (350,"PENNSYLVANIA","UPLAND","Reproductive Endocrinology and Fertility Center",26.8,18.2,3.2,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (351,"PENNSYLVANIA","WAYNE","Reproductive Science Institute of Suburban Philadelphia",51.3,40.6,11.8,11.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (352,"PENNSYLVANIA","WEST READING","Women s Clinic  Ltd.",42.9,33.3,60,null,33.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (353,"PENNSYLVANIA","YORK","The Fertility Center  LLC",48.9,11.1,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (354,"PUERTO RICO","BAYAMON","Pedro J. Beauchamp  MD",40,25.7,7.7,6.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (355,"PUERTO RICO","CAGUAS","Clinica de Fertilidad HIMA-San Pablo",20,25,25,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (356,"PUERTO RICO","SANTURCE","GREFI  Gynecology  Reproductive Endocrinology & Fertility Institute",0,0,12.5,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (357,"RHODE ISLAND","PROVIDENCE","Women and Infants  Division of Reproductive Medicine and Infertility",41.2,26.1,17.4,12.8,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (358,"SOUTH CAROLINA","GREENVILLE","Piedmont Reproductive Endocrinology Group  PA",57.5,29.6,21.4,0,33.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (359,"SOUTH CAROLINA","GREENVILLE","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",37.2,20,14.3,0,100)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (360,"SOUTH CAROLINA","MOUNT PLEASANT","Southeastern Fertility Center  PA",46.8,32.3,24.1,27.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (361,"SOUTH CAROLINA","WEST COLUMBIA","Advanced Fertility & Reproductive Endocrinology",46.7,45,25,25,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (362,"SOUTH DAKOTA","SIOUX FALLS","Sanford Women s Health",46.4,46.2,36.8,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (363,"TENNESSEE","CHATTANOOGA","Fertility Center  LLC",51.7,23.5,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (364,"TENNESSEE","CHATTANOOGA","Tennessee Reproductive Medicine",48.4,20,50,null,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (365,"TENNESSEE","JOHNSON CITY","Quillen Fertility and Women s Services",50,66.7,16.7,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (366,"TENNESSEE","KNOXVILLE","East Tennessee IVF and Andrology Center",33.3,33.3,25,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (367,"TENNESSEE","KNOXVILLE","Southeastern Fertility Center",14.3,12.5,16.7,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (368,"TENNESSEE","MEMPHIS","Kutteh Ke Fertility Associates of Memphis  PLLC",37.3,40,24.1,15.4,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (369,"TENNESSEE","NASHVILLE","The Center for Reproductive Health",26.2,12.5,16.7,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (370,"TENNESSEE","NASHVILLE","Nashville Fertility Center",41.5,27.5,21,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (371,"TEXAS","AUSTIN","Texas Fertility Center  Drs. Vaughn  Silverberg and Hansard",42.3,33.3,23.5,8.6,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (372,"TEXAS","AUSTIN","Dr. Jeffrey Youngkin  Austin Fertility Center",25,16.7,0,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (373,"TEXAS","BEDFORD","Center for Assisted Reproduction",46.7,27.5,24.7,12.1,11.8)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (374,"TEXAS","DALLAS","Dallas-Fort Worth Fertility Associates",41.1,33.7,23.2,14.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (375,"TEXAS","DALLAS","Fertility and Advanced Reproductive Medicine",20.8,33.3,8.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (376,"TEXAS","DALLAS","Fertility Specialists of Texas  PLLC",57.4,42.1,21.1,40,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (377,"TEXAS","DALLAS","IVF Institute",53.8,50,33.3,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (378,"TEXAS","DALLAS","ReproMed Fertility Center",55,75,50,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (379,"TEXAS","DALLAS","Sher Institute for Reproductive Medicine-Dallas",43.8,33.3,17.1,15.4,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (380,"TEXAS","DALLAS","Texas Center for Reproductive Health",54.8,56.3,26.7,40,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (381,"TEXAS","DESOTO","The Women s Place",0,16.7,0,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (382,"TEXAS","DICKINSON","University Fertility Center",46.2,40,0,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (383,"TEXAS","EL PASO","Southwest Center for Reproductive Health  PA",34.2,36.7,21.4,14.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (384,"TEXAS","FORT SAM HOUSTON","Brooke Army Medical Center",54.3,45.2,29.7,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (385,"TEXAS","FORT WORTH","Fort Worth Fertility  PA",47.7,23.7,21.7,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (386,"TEXAS","FRISCO","Dallas IVF",55.1,38.8,13.2,18.2,33.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (387,"TEXAS","HOUSTON","Advanced Fertility Center of Texas",37.1,60,18.2,12.5,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (388,"TEXAS","HOUSTON","Baylor Family Fertility Program",28.1,21.4,0,15.4,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (389,"TEXAS","HOUSTON","Fertility Specialists of Houston",37,34.1,25,5.6,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (390,"TEXAS","HOUSTON","Houston Fertility Institute",51.5,38.4,34.1,18,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (391,"TEXAS","HOUSTON","Houston Infertility Clinic  Sonja Kristiansen  MD",39.7,32.4,22,10.5,12.5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (392,"TEXAS","HOUSTON","Houston IVF",50.7,54.3,28.4,20.7,14.3)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (393,"TEXAS","IRVING","Advanced Reproductive Care Center of Irving",49.1,55.3,30.8,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (394,"TEXAS","LUBBOCK","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",42.9,50,20,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (395,"TEXAS","LUBBOCK","The Centre for Reproductive Medicine",46.5,60,22.2,33.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (396,"TEXAS","MCALLEN","Reproductive Institute of South Texas",47.4,37.9,13,16.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (397,"TEXAS","PLANO","Presbyterian Hospital Plano ARTS",40.8,34.3,15.2,9.5,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (398,"TEXAS","SAN ANTONIO","Fertility Center of San Antonio",54.5,39.4,21.9,25,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (399,"TEXAS","SAN ANTONIO","Institute for Women s Health  Advanced Fertility Laboratory",22.2,14.3,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (400,"TEXAS","SAN ANTONIO","Perinatal and Fertility Specialists",50,50,50,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (401,"TEXAS","SAN ANTONIO","Reproductive Medicine Associates of Texas  PA",43,34.1,13.8,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (402,"TEXAS","SAN ANTONIO","University of Texas Medicine Women s Health Center",11.8,3.8,36.4,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (403,"TEXAS","THE WOODLANDS","North Houston Center for Reproductive Medicine  PA  (NHCRM)",61.3,50,25,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (404,"TEXAS","WEBSTER","Center of Reproductive Medicine (CORM)",49.5,22.4,12.2,27.3,18.2)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (405,"UTAH","PLEASANT GROVE","Utah Fertility Center",50,14.3,16.7,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (406,"UTAH","SALT LAKE CITY","Utah Center for Reproductive Medicine",51.4,42.6,24.4,22.2,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (407,"UTAH","SANDY","Reproductive Care Center",38.2,36.2,36.1,15.4,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (408,"VERMONT","BURLINGTON","Vermont Center for Reproductive Medicine",24.4,20.6,14.3,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (409,"VIRGINIA","ANNANDALE","Washington Fertility Center",40,33.3,21.9,5.9,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (410,"VIRGINIA","ARLINGTON","Dominion Fertility and Endocrinology",18.8,15.4,9.9,2.9,2.8)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (411,"VIRGINIA","CHARLOTTESVILLE","Reproductive Medicine and Surgery Center of Virginia  PLC",35.4,26,20,33.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (412,"VIRGINIA","FAIRFAX","Genetics & IVF Institute",29.7,25,13.6,13.8,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (413,"VIRGINIA","FAIRFAX","The Muasher Center for Fertility and IVF",23.7,26.9,10,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (414,"VIRGINIA","NORFOLK","Jones Institute for Reproductive Medicine",27.6,27.8,14.8,11.1,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (415,"VIRGINIA","RESTON","Virginia Center for Reproductive Medicine",58.3,48.6,25,17.6,50)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (416,"VIRGINIA","RICHMOND","Fertility Institute of Virginia",45.3,36.7,26.7,8.3,22.2)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (417,"VIRGINIA","RICHMOND","LifeSource Fertility Center",35.1,27.3,25,33.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (418,"VIRGINIA","RICHMOND","The Richmond Center for Fertility and Endocrinology",48.9,40.7,27.3,50,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (419,"VIRGINIA","RICHMOND","University Center for Advanced Reproductive Medicine",20,0,0,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (420,"VIRGINIA","VIRGINIA BEACH","The New Hope Center for Reproductive Medicine",50.6,46.7,21.2,12.5,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (421,"VIRGINIA","WINCHESTER","Francisco M. Irianni  MD",40,33.3,0,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (422,"WASHINGTON","BELLEVUE","Overlake Reproductive Health Inc.  PS",55.9,36.4,16.7,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (423,"WASHINGTON","BELLEVUE","Washington Center for Reproductive Medicine",47.5,17.2,16.7,33.3,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (424,"WASHINGTON","BELLINGHAM","Bellingham IVF  Emmett Branigan  MD",59.3,16.7,0,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (425,"WASHINGTON","KIRKLAND","Northwest Center for Reproductive Sciences",47.5,42.6,29,18.8,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (426,"WASHINGTON","OLYMPIA","Olympia Women s Health",31.8,33.3,16.7,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (427,"WASHINGTON","SEATTLE","Pacific Northwest Fertility and IVF Specialists",42.7,38.8,21.8,11.4,10.5)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (428,"WASHINGTON","SEATTLE","Seattle Reproductive Medicine  Integramed America",53.5,40,28.1,14.3,11.4)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (429,"WASHINGTON","SEATTLE","University Reproductive Care",66.7,50,null,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (430,"WASHINGTON","SPOKANE","The Center for Reproductive Endocrinology and Fertility",75,36.4,36.8,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (431,"WASHINGTON","TACOMA","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",42.9,25,16.7,66.7,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (432,"WASHINGTON","TACOMA","Madigan Army Medical Center",47.1,36,26.1,9.1,25)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (433,"WEST VIRGINIA","CHARLESTON","West Virginia University Fertility Center",33.3,60,37.5,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (434,"WEST VIRGINIA","HUNTINGTON","Center for Advanced Reproductive Medicine",33.3,0,20,null,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (435,"WEST VIRGINIA","MORGANTOWN","West Virginia University Center for Reproductive Medicine",48,9.1,15.4,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (436,"WISCONSIN","GREEN BAY","Aurora Fertility Services-Green Bay  The Women s Center at Aurora BayCare Medical Center",42.9,29.4,13.3,8.3,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (437,"WISCONSIN","LA CROSSE","Gundersen Lutheran Fertility Center",23.5,60,44.4,50,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (438,"WISCONSIN","MIDDLETON","University of Wisconsin-Generations Fertility Care",42.9,18.8,20,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (439,"WISCONSIN","MIDDLETON","Wisconsin Fertility Institute",28.3,11.4,21.1,25,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (440,"WISCONSIN","MILWAUKEE","Reproductive Medicine Center  Froedtert-Medical College",44,39.1,18.2,0,0)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (441,"WISCONSIN","MILWAUKEE","Reproductive Specialty Center",42.9,41.7,30,20,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (442,"WISCONSIN","WAUKESHA","This clinic has closed or reorganized since 2010.  Information on current clinic services and profile therefore is not provided here.  Contact the NASS Help Desk for current information about this clinic.",0,33.3,0,0,null)');
		tx.executeSql('INSERT INTO IVF (OrderID, ClinStateCode, ClinCityCode, CurrClinNameAll,FshNDLvBirthsRate1, FshNDLvBirthsRate2, FshNDLvBirthsRate3, FshNDLvBirthsRate4, FshNDLvBirthsRate5) VALUES (443,"WISCONSIN","WEST ALLIS","Aurora Health Care-Aurora Fertility Services  West Allis",48.1,43.5,50,0,null)');
}



//*************************
// General Functions
//*************************
// Parse select fields to description and sql names
//************************
function parseDescriptions(submitted) {
	var splitstr=new Array();
	for (var x=0;x<submitted.length;x++) {
		splitstr[x]=submitted[x].value.split("~");
		//alert (splitstr[x][0]+" ***** "+splitstr[x][1]);
	}
	// Turn null value into zero
	if (splitstr[7][0]=="") {splitstr[7][0]=0;}
	return splitstr;
}