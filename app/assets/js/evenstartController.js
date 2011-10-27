
var EvenstartController = function(model)
{
	var me = this;
	var esModel = model;
	var filterClasses = new Array();
	var filterLayers = new Array();
	var filterObjs = new Array();
	
	var $searchBox = null;
	
	/*
	 * Add an input element for searching.
	 * 
	 * @param $input A jQuery element.
	 */
	this.addInput = function($input)
	{
		$searchBox = $input;
	}
	
	/*
	 * Gather all search entries and filters and initiate a search.
	 */
	this.init = function()
	{
		// Get the search box value.
		getSearchQuery();
		// Retrieve all filters
		collectFilters();
		// Initiate search.
		esModel.initSearch();
	}
	
	/*
	 * Define a filter layer.
	 * 
	 * @param parent The parent of the element.
	 * @param allElem Element that select all.
	 * @param classes The Classes to be search for.
	 */
	this.setFilter = function(filter, parent, allElem, classes)
	{
		filterClasses.push(classes);
		
		var filterObj = {
			'filter_type' : filter, 
			'filter_term' : '',
			'parent' : parent, 
			'all' : allElem, 
			'classes' : classes
		};
		
		filterObjs.push(filterObj);
		
		$(allElem).change(function()
		{
			if (this.checked)
			{
				$(classes, parent).each(function()
				{
					this.checked = 'checked';
				});
				
				me.init();
			}
		});
		
		$(classes, parent).change(function()
		{
			me.init();
		});
	}
			
	/*
	 * Get all the filter.
	 */
	function collectFilters()
	{
		// Clear out the oldies.
		filterLayers = new Array();
		
		for (var i = 0; i < filterObjs.length; i++)
		{
			var filterObj = filterObjs[i];
			var filter = getFilter(filterObj);
			if (filter.length)
			{
				filterLayers.push(filterObj['filter_type'] + '|' + filter);
			}
		}
		
		esModel.applyFilters(filterLayers);
 	}
	
	/*
	 * Collect filter from the checkbox.
	 * 
	 * @return filters - Array
	 */
	function getFilter(obj)
	{
		var parent = obj.parent;
		var elemClass = obj.classes;
		var allElem = obj.all;
		
		var filters = new Array();
		
		var total = $(elemClass, parent).length;
		var checkedNum = $(elemClass + ":checked", parent).length;
		// If all is not checked get the ones that's checked 
		if (checkedNum != total)
		{
			$(elemClass + ":checked", parent).each(function(){
				
				filters.push(this.value);
			});
			
			$(allElem, parent).prop("checked", false);
		}
		
		return filters;
	}
	
	function getSearchQuery()
	{
		// Check if $searchBox is null.
		var value = $searchBox ? $searchBox.val() : '';
		// Check if value is valid.
		var query = value == '' ? 0 : value;
		esModel.search(query);
	}
}