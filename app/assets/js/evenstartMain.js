
// Hide the require javascript message.
$('#javascript-msg').hide();

/*
 * An object to hold the default application settings. 
 * The config.xml file will override the values.
 * The property must be the same as the "id" of the <key> in the config.xml.
 */
var Config = {
	'base_url'	: '',
	'xml'		: 'app/assets/xml/data.xml',
	'resource_dir' : '',
	'debug_mode'	: 'production'
};

var evenstartModel = new EvenstartModel();
evenstartModel.addEventListener('complete', onModelComplete);
evenstartModel.addEventListener('change', update);
evenstartModel.initApp("app/config.xml");
//evenstartModel.load("assets/xml/data.xml");

// After data are loaded, initiate.
function onModelComplete()
{
	console.log('load xml completed.');
	
	$('#search-txt').focus();
	
	var controller = new EvenstartController(evenstartModel);
	controller.addInput($('#search-form #search-txt'));
	
	controller.setFilter('file_type', '#filter-file-type', '#all-file', '.filter-file');
	controller.setFilter('top_level_id' , '#filter-program-type', '#all-program', '.filter-program');
	
	// Perform search on submit.
	$('#search-form').submit(function(event)
	{
		event.preventDefault();
		
		controller.init();
	});
	
	var tags = evenstartModel.getTags();
	var autoComp = new AutoCompletion($('#tag-search'), tags);
	
	// Clear out search box.
	$('#clear-search').click(function(event){
		
		var searchBoxVal = $('#search-txt').val();
		searchBoxVal = $.trim(searchBoxVal);
		if (searchBoxVal != '')
		{
			$('#search-txt').val('');
			$('#search-form').submit();
		}
	});
	
	/*
	 * Display the filters on or off.
	 */
	$('#advance-sort input').click(function(event){
		var $filterWrapper = $('#filter-wrapper');
		
		if ($filterWrapper.hasClass('active'))
		{
			$filterWrapper.removeClass('active');
			$filterWrapper.find('input:checkbox').prop("checked", false);
			// Update search.
			controller.init();
		}
		else
		{
			$filterWrapper.addClass('active');
		}
	});
	
	// Fire off!
	controller.init();
}

// Data refresh
function update()
{
	// Clear out old data
	$("#output tbody tr").remove();
	
	var result = evenstartModel.getResult();
	
	if (result.length == 0) 
	{
		console.log("No Match!!!");
		// Display no result return
		var row = '<tr><td colspan="9"><p>No results were found. Please try a different search.</p></td></tr>';

		$("#output tbody").append(row);
	}
	else 
	{
		var copyArray = result.sort();
		formatResultsBeta(copyArray, 0, 10);
//		formatResults(copyArray, currentMatch, showMatches);
	}
	
	// Hide/Unhide synopsis.
	$('td a').click(function(){
		var $this = $(this);
		var $parent = $this.parent();
		
		if ($this.hasClass('maximize'))
		{
			$('.synopsis', $parent).hide('fast');
			$this.removeClass('maximize');
		}
		else
		{
			$('.synopsis', $parent).show('fast');
			$this.addClass('maximize');
		}
	});
}

/*
 * Convert array into object.
 * 
 * @param results Object to be converted.
 * @param reference
 * @param offset
 */
function formatResultsBeta(results, reference, offset)
{
	var currentRecord = results.length;
	for (var i = 0; i < currentRecord; i++) 
	{
		var divide = results[i].split('|');
		
		var itemObj = {};
		itemObj.name = divide[0];
		itemObj.fileType = divide[1];
		itemObj.location = divide[2];
		itemObj.url = divide[3];
		itemObj.topId = divide[4];
		itemObj.secondId = divide[5];
		itemObj.tag = divide[6];
		itemObj.desc = divide[7];
		itemObj.synopsis = divide[8];
		itemObj.synopsisCont = divide[9];
		
		displayResult(itemObj);
	}
}

/*
 * Translate data into HTML markup and display it.	
 * 
 * @param result An object data provider.
 */
function displayResult(result)
{
	// Only include synopsis content if there's one.
	var synopsisCont = (result.synopsisCont).length ? '<p class="sysnopsis-cont">' + result.synopsisCont + '</p>' : '';
	var synopsis = (result.synopsis).length ? '<a class="btn green-btn" href="#synopsis">Synopsis</a><div class="synopsis"><p>' + result.synopsis + '</p>' + synopsisCont + '</div>' : '';
	
	var fileLocation = Config.resource_dir + result.location;
	fileLocation = cleanUpPath(fileLocation);
	
	var fileType = (result.fileType).toUpperCase();
	var fileTypeClass = '';
	
	switch(fileType)
	{
		case ".WMV" :
			fileTypeClass = 'wmv';
			fileType = "WMV";
		break;
		
		case "URL/FLASH" :
			fileTypeClass = 'fla';
			fileType = "URL/<br />FLA";
		break;
		
		default :
			fileTypeClass = fileType.toLowerCase();
		break;
	}
	
	var row = '<tr>';
	row += '<td class="name"><p><a href="' + fileLocation + '">' + result.name + '</a></p></td>';
	row += '<td><p><a class="icon-btn ' + fileTypeClass + '" href="' + fileLocation + '">' + fileType + '</a></p></td>';
	row += '<td><p>' + result.topId + '</p></td>';
	row += '<td><p>' + result.desc + '</p>' + synopsis + '</td>';
	
//	row += '<td><p>' + result.url + '</p></td>';
//	row += '<td><p>' + result.secondId + '</p></td>';
//	row += '<td><p>' + result.tag + '</p></td>';
//	row += '<td><p>' + result.synopsis  + '</p></td>';
	row += '</tr>';

	$("#output tbody").append(row);
}

/*
 * Convert backslash to forwardslash
 * 
 * @param dataStr String to be converted.
 * 
 * @return String
 */
function cleanUpPath(dataStr)
{
	return dataStr.replace(/\\/g, "/");
}
