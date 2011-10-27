$('table.sortable').each(function() {
	var $table = $(this);

	$('th', $table).each(function(column) {
		if ($(this).is('.sort-alpha'))
		{
			$(this).find('a').click(function(){ return false; })
			$(this).addClass('clickable').hover(function()
			{
				$(this).addClass('hover');
			}, function(){
				$(this).removeClass('hover');
			}).click(function() {

				$(this).parent().find('th').removeClass('active');
				$(this).addClass('active');

				var rows = $table.find('tbody > tr').get();

				$.each(rows, function(index, row)
				{
					row.sortKey = $(row).children('td').eq(column).text().toUpperCase();
				});

				rows.sort(function(a, b)
				{
					if (a.sortKey < b.sortKey) return -1;
					if (a.sortKey > b.sortKey) return 1;
					return 0;
				});

				$.each(rows, function(index, row) {
					$table.children('tbody').append(row);
					row.sortKey = null;
				});
			});
		}
	});
});