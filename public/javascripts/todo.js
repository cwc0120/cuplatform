"use strict";
$(window).load(function() {
	var editing = false;
	$('span.edit').click(function() {
		if (!editing) {
			var input = $("<input>", {
				val: $(this).text(),
				type: 'text',
				name: 'content'
			});
			$(this).replaceWith(input);
			input.select();
			editing = true;
		}
	});

	$('form.edit').submit(function() {
		event.preventDefault();
		$.ajax({
			url: '/todo/' + $(this).attr('id'),
			type: 'put',
			datatype: 'json',
			data: {
				content: $(this).find('input[name="content"]').val()
			},
			success: function(res) {
				window.location = res.redirectTo;
			}
		});
	});

	$('button.delete').click(function() {
		$.ajax({
			url: '/todo/' + $(this).attr('id'),
			type: 'delete',
			datatype: 'json',
			success: function(res) {
				window.location = res.redirectTo;
			}
		});
	});
});