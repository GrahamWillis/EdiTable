(function($) {
	$.widget("custom.rsrautobox", $.ui.autocomplete, {
		_create: function() {
			console.log('Create: ' + this.element);	
			this.element.on('blur', function(event) {
				console.log('blur' + $(this).val());
				$(this).children('.ui-menu-item').each(function() {
					var item = $(this).data('item.autocomplete');
				});
			});		        
			this._superApply(arguments);
		}
	});
})(jQuery);