var AutoCompletion = function($input, data)
{
	var $autocomplete = $('<ul class="autocomplete"></ul>').hide().insertAfter($input);
	var selectedTags = new Array();
	var selectedItem = null;	
	var setSelectedItem = function(item) 
	{
		selectedItem = item;
		if (selectedItem === null) 
		{
			$autocomplete.hide();
			return;
		}
		
		if (selectedItem < 0) 
		{
			selectedItem = 0;
		}
		
		if (selectedItem >= $autocomplete.find('li').length) 
		{
			selectedItem = $autocomplete.find('li').length - 1;
		}
		
		$autocomplete.find('li').removeClass('selected').eq(selectedItem).addClass('selected');
		$autocomplete.show();
	};
	
	var populateSearchField = function() {
		var value = $autocomplete.find('li').eq(selectedItem);
		console.log('value : ' + value);
		setSelectedItem(null);
	};
	
	var events = {
		'change' : null
	}
	
	this.addEventListener = function(event, handler)
	{
		events[event] = handler;
	}
	
	/*
	 * Get selected tags.
	 * 
	 * @return Array 
	 */
	this.getTags = function()
	{
		return selectedTags;
	}
	
	// Remove browser autocomplete.
	$input.attr('autocomplete', 'off')
	
	// Initiate after every key up.
	$input.keyup(function(event) 
	{
		if (event.keyCode > 40 || event.keyCode == 8) {
			// Keys with codes 40 and below are special
			// (enter, arrow keys, escape, etc.).
			// Key code 8 is backspace.

			var results = searchTag(this.value);
		
			//		console.log(results);
			if (results.length) 
			{
				$autocomplete.empty();

				$.each(results, function(index, term) {
					$('<li></li>').text(term)
					.appendTo($autocomplete).mouseover(function() {
						setSelectedItem(index);
					}).click(function() {
						addTag(term);
						$autocomplete.hide();
					});
				});
			
				//			$autocomplete.show();
				setSelectedItem(0);
			}
			else
			{
				setSelectedItem(null);
			}
		}
		else if (event.keyCode == 38 && selectedItem !== null) {
			// User pressed up arrow.
			setSelectedItem(selectedItem - 1);
			event.preventDefault();
		}
		else if (event.keyCode == 40 && selectedItem !== null) {
			// User pressed down arrow.
			setSelectedItem(selectedItem + 1);
			event.preventDefault();
		}
		else if (event.keyCode == 27 && selectedItem !== null) {
			// User pressed escape key.
			setSelectedItem(null);
		}
	}).keypress(function(event) {
		if (event.keyCode == 13 && selectedItem !== null) {
			// User pressed enter key.
			populateSearchField();
			event.preventDefault();
		}
	}).blur(function(event) {
		setTimeout(function() {
			setSelectedItem(null);		// User pressed down arrow.
//			setSelectedItem(selectedItem + 1);
//			event.preventDefault();
		}, 250);
	});
	
	function searchTag(entry)
	{
		var findings = new Array(0);
		var compareString = entry.toUpperCase();
		
		for(var tag in data)
		{
			var compareElement  = tag.toUpperCase();
			var refineElement  = compareElement.substring(0,compareElement.length);
			if (refineElement.indexOf(compareString) != -1) 
			{
				findings.push(tag);
			}
		}
		
		return findings; 
	}
	
	function addTag(tag)
	{
		selectedTags.push(tag);
		console.log("Add tag : " + tag);
	}
}
