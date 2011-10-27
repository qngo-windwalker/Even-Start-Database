var EvenstartModel = function()
{
	// Define global variables
	// 
	// Subscribers to the model's events. 
	var listeners = {};
	
	var searchEntry = 0;
	
	// Items to be search
	var items = new Array();
	var filters = new Array();
	var result = new Array();
	var tags = new Array();
	
	/*
	 * Initiate the application.
	 * 
	 * @param url - The path to the config file.
	 */
	this.initApp = function(url)
	{
		load(url, processConfig);
	}
	
	this.initSearch = function()
	{
		updateSearch();
	}
	
	/* 
	 * Add an entry to search.
	 * 
	 * @param entry - string
	 */
	this.search = function(entry)
	{
		searchEntry = entry;
	}

	this.applyFilters = function(filterLayers)
	{
		filters = filterLayers;
	}
	
	/*
	 * Get the result from the search.
	 * 
	 * @return object
	 */
	this.getResult = function()
	{
		return result;
	}
	
	/*
	 * Get a list of tags.
	 * 
	 * @return array
	 */
	this.getTags = function()
	{
		return tags;
	}
	
	/*
	 * Subscribes to receive notification from the model of an event.
	 *	
	 * @param type - The type of event.	
	 * @param fn - The handler that processes the event.
	 */
	this.addEventListener = function (type, fn)
	{
		type = type || 'any';
		if (typeof listeners[type] === "undefined")
		{
			listeners[type] = [];
		}
		
		listeners[type].push(fn);
	}
	
	/*
	 * Remove a listener from the dispatcher object.
	 * 
	 * @param type - The type of event.
	 * @param fn - The listener to remove.
	 */
	this.removeEventListener = function (type, fn)
	{
		new visitSubscribers('unsubscribe', fn, type);
	}
	
	/*
	 * Dispatches event to any subscriber.
	 * 
	 * @param type - The type of event.
	 */
	var dispatchEvent = function(type, listener)
	{
		 new visitSubscribers('publish', listener, type);
	};
	
	/*
	 * Process subscribers and determine their action.
	 * 
	 * @param action -  publish or unsubcribe.
	 */
	var visitSubscribers = function (action, arg, type)
	{
		var pubtype = type || 'any', myListeners = listeners[pubtype], max = myListeners.length;
		for (var i = 0; i < max; i += 1)
		{
			if (action === 'publish') 
			{
				myListeners[i](arg);
			}
			else
			{
				if (myListeners[i] === arg)
				{
					myListeners.splice(i, 1);
				}
			}
		}
	};
	
	/*
	 * Create a new search process with search entry and apply all filters.
	 */
	function updateSearch()
	{
		// Start with fresh copy.
		var filteredItems = items;
		
		if (filters.length)
		{
			for (var i = 0; i < filters.length; i++)
			{
				var filter = filters[i];
				filteredItems = filterItem(filter, filteredItems);
			}
		}
		
		// If there's entry to search then search else skip it.
		if (searchEntry) convertString(searchEntry, filteredItems);
		else verifyManage(filteredItems);
	}

	// Put the search terms in an array and
	// and call appropriate search algorithm
	function convertString(reentry, filteredItems)
	{
		var searchArray = reentry.split(" ");
		allowAny(searchArray, filteredItems);
	}
	
	// Define a function to perform a search that requires
	// a match of any of the terms the user provided
	function allowAny(t, filteredItems) 
	{
		var findings = new Array(0);
		for (var i = 0; i < filteredItems.length; i++) 
		{
			var compareElement  = filteredItems[i].toUpperCase();
			// Break up the element for conditional searching.
			var subElement = compareElement.split('|');
			var itemName = subElement[0];
			var itemDesc = subElement[7];
			var itemSynop = subElement[8];
			var itemSynopCont = subElement[9];
			
			var refineElement = itemName + ' ' + itemDesc +  ' ' + itemSynop +  ' ' + itemSynopCont;

			for (var j = 0; j < t.length; j++) 
			{
				var compareString = t[j].toUpperCase();
				
				var pattern = new RegExp(compareString + " ");
//				var pattern = /\/compareString:\w*$/;
				
				if (pattern.test(refineElement))
				{
//					console.log("Element Match : " + refineElement);
					findings[findings.length] = filteredItems[i];
					break;
				}
				
//				if (refineElement.indexOf(compareString) != -1)
//				{
////					console.log("Element Match : " + refineElement);
//					findings[findings.length] = filteredItems[i];
//					break;
//				}
			}
		}

		verifyManage(findings);
	}

	// Define a function to perform a search that requires
	// a match of all terms the user provided
	function requireAll(t, filteredItems)
	{
		var findings = new Array();
		for (var i = 0; i < filteredItems.length; i++) 
		{
			var allConfirmation = true;
			var allString       = filteredItems[i].toUpperCase();
			console.log('allString : ' + allString);
			var refineAllString = allString.substring(0,allString.indexOf('|HTTP'));
			console.log('refinedAllString : ' + refineAllString);

			for (var j = 0; j < t.length; j++) 
			{
				var allElement = t[j].toUpperCase();
				if (refineAllString.indexOf(allElement) == -1)
				{
					allConfirmation = false;
					continue;
				}
			}
			
			if (allConfirmation) 
			{
				findings[findings.length] = filteredItems[i];
			}
		}
		
		verifyManage(findings);
	}
	
	function filterItem(filterInfos, itemsArray)
	{
		console.log("Initiate filtering : " + filterInfos);
		// Separate the type from the terms.
		var subFilter = filterInfos.split('|');
		var filterType = subFilter[0];
		var filters = subFilter[1].split(',');
		
		var findings = new Array(0);

		for (var i = 0; i < itemsArray.length; i++) 
		{
			var compareElement = itemsArray[i].toUpperCase();
			var subElement = compareElement.split('|');
			
			switch(filterType)
			{
				case 'file_type' :
					compareElement = subElement[1];
				break;
				
				case 'top_level_id' :
					compareElement = subElement[4];
				break;
			}
			
//			console.log("compareElement : " + compareElement);
			var refineElement = compareElement;

			for (var j = 0; j < filters.length; j++) 
			{
				var compareString = filters[j].toUpperCase();
//				console.log("compareString : " + compareString);
//				var firstIndex = compareElement.indexOf('|' + compareString + '|') + 1;
//	//			console.log("firstIndex : " + firstIndex);
//				var secIndex = compareElement.indexOf('|' + compareString + '|') + 4;
//				var refineElement = compareElement.substring(firstIndex, secIndex);
	//			console.log("refineElement : " + refineElement);
				if (refineElement.indexOf(compareString) != -1) 
				{
//					console.log("Element Match : " + refineElement);
					findings[findings.length] = itemsArray[i];
					break;
				}
			}
		}
		return findings;
	}
	
	/*
	 * Parse the config file and load the data.
	 */
	var processConfig = function(xml)
	{
		var xmlRows = xml.getElementsByTagName('key');

		for (var r = 0; r < xmlRows.length; r++)
		{
			 var key = xmlRows[r];
			 var id = key.attributes[0].value;
			 var val = key.attributes[1].value;
			 // Append to the Config object.
			 Config[id] = val;
		}

		load(Config.xml, processXML);
	};
	
	/*
	 * Perform an ajax call and call the success handler.
	 * 
	 * @param url String
	 * @param func The handler after loading is successfully completed.
	 */
	function load(url, func)
	{
		$.ajax(
		{
			type: "GET",
			url: url,
			dataType: "xml",
			error: function(jqXHR, textStatus, errorThrow)
			{
				console.log("Error loading XML");
			},
			success: func
		});
	}

	// Determine whether the search was successful
	// If so print the results; if not, indicate that, too
	function verifyManage(resultSet) 
	{
		result = resultSet;
		
		dispatchEvent('change');
	}
	
	/*
	 * Convert XML into an array and separate each element by a vertical bar.
	 * 
	 * @param xml 
	 */
	var processXML = function(xml)
	{
		$(xml).find("item").each(function()
		{
			var $this = $(this);
			var delimiter = '|';

			var name = $this.find('name').text();
			var fileType = $this.find('file_type').text();
			var location = $this.find('location').text();
			var url = $this.find('url').text();
			// topId = program
			var topId = $this.find('top_level_id').text();
			var secondId = $this.find('second_level_id').text();
			var tag = $this.find('tag').text();
			var desc = $this.find('desc').text();
			var synopsis = $this.find('synopsis').text();
			var synopsisCont = $this.find('synopsis_cont').text();

			var itemStr = String(name);
			itemStr += delimiter + String(fileType);
			itemStr += delimiter + String(location);
			itemStr += delimiter + String(url);
			itemStr += delimiter + String(topId);
			itemStr += delimiter + String(secondId);
			itemStr += delimiter + String(tag);
			itemStr += delimiter + String(desc);
			itemStr += delimiter + String(synopsis);
			itemStr += delimiter + String(synopsisCont);

			collectTag(tag);
			items.push(itemStr);

//			displayResult(itemObj);
		});
		
		result = items;
		
		dispatchEvent('complete');
	};
	
	/*
	 * Split string into tag separated by a comma. Then count its number of usage.
	 */
	function collectTag(tagStr)
	{
		// Check if the string is not empty.
		if(tagStr.length)
		{
			var tagArray = tagStr.split(',');
			
			for(var i = 0; i < tagArray.length; i++ )
			{
				var tag = tagArray[i];
				tag = $.trim(tag);
				
				// Check if it's not blank.
				if (tag.length)
				{
					// Check if it's already existed. If so then increment its usage.
					var num = tags[tag] ? tags[tag] + 1 : 1;
					tags[tag] = num;
				}
			}
		}
	}
};
