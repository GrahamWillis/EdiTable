(function($) {
	
	// Table plugin
    $.widget("rsr.edittable", {
    	
    	vars: {
            identifiers: [],
            defaultSort: [],
            filterids: [],
            sortids: [],
            sortfunc: null,
            filterfunc: null
        },

        options: {
            data: [],
            columns: [],
            stripe: null
        },

        _setOption: function(key, value) {
            this.options[key] = value;
            this._update();
        },

        _create: function() {
        },

        // Data setter and getter
        data: function(data) {
            if (data === undefined) {
                return this.options.data;
            } else {
                this.options.data = data;
            }
        },

        // Columns setter and getter
        columns: function(columns) {
            if (columns === undefined) {
                return this.options.columns;
            } else {
                this.options.columns = columns;
            }
        },
        
        // Write headers
        writeHeaders: function() {
          	 var _edittable = this;
           	 var l_hdrrow;
           	 _edittable.element.children('thead').children('tr').remove();
           	 _edittable.element.prepend($('<thead>'));
           	 _edittable.element.children('thead').append($('<tr>'));
           	 $.each(_edittable.options.columns, function(colidx, column) {
           	     if (!column.hidden) {
           	     	_edittable.element.children('thead').children('tr').append($('<th/>').html('<div>' + column.header + '</div>'));
           	     }
           	     if (column.identifier) {
           	    	 _edittable.vars.identifiers.push(column.attribute);
           	     }
           	     if (column.defaultSort) {
           	    	 _edittable.vars.defaultSort.push(column.attribute);
           	     }
           	 });
           	 
           	 // Check the identifier and default sort 
           	 if (_edittable.vars.identifiers.length > 1) {
           	     throw "The edittable may only have one identifier";
           	 }
           	 
           	 if (_edittable.vars.defaultSort.length > 1) {
           	     throw "The edittable may only have one identifier";
           	 }
           	 
           	 // In the absence of a default sort set the identifier
           	 if (_edittable.vars.identifiers.length == 1 && _edittable.vars.defaultSort.length == 0) {
           		_edittable.vars.defaultSort = _edittable.vars.identifiers;
           	 }
           	 
     		 if (!_edittable._isInSort('__' + _edittable.vars.defaultSort[0], 'asc')) {
    			_edittable._addToSort('__' + _edittable.vars.defaultSort[0], 'asc');
    		 }     	 
     		 
           	 _edittable.element.children('thead').append($('<tr>'));
             $.each(_edittable.options.columns, function(colidx, column) {
            	if (!column.hidden) {
            		if (column.searchable) {
            			var l_srch = '<input class="header" id="' + '__' + column.attribute + '" style="float:left"></input>';
            			if (column.sortable) {
            				_edittable.element.children('thead').children('tr').last().append($('<th/>')
            						.html(l_srch + '<span id="' + '__' + column.attribute + '" style="float:right" class="ui-icon ui-icon-triangle-2-n-s"></span>'));
            			} else {
            				_edittable.element.children('thead').children('tr').last().append($('<th/>').html(l_srch));
            			}
            		} else if (column.selectable) {
            			var l_srch = '<select class="header" id="' + '__' + column.attribute + '" style="float:left"></select>';
            			if (column.sortable) {
            				_edittable.element.children('thead').children('tr').last().append($('<th/>')
            						.html(l_srch + '<span id="' + '__' + column.attribute + '" style="float:right" class="ui-icon ui-icon-triangle-2-n-s"></span>'));
            			} else {
            				_edittable.element.children('thead').children('tr').last().append($('<th/>').html(l_srch));
            			}
            			var l_uniq = _edittable._uniqueValue(column.attribute);
            			$('select#__' + column.attribute).append($('<option>').html(''));
            			for (var i = 0; i < l_uniq.length; i++) {
            				$('select#__' + column.attribute).append($('<option>').html(l_uniq[i]));
            			}
            		} else {
            			if (column.sortable) {
            				_edittable.element.children('thead').children('tr').last().append($('<th/>')
            						.html('<span id="' + '__' + column.attribute + '" style="float:right" class="ui-icon ui-icon-triangle-2-n-s"></span>'));
            			} else {
            				_edittable.element.children('thead').children('tr').last().append($('<th/>'));
            			}
            		}
            	}
            });
             
           	_edittable._postRender();
        },
        
        // Write data in data into table
        fill: function() {
        	var _edittable = this;
        	_edittable._createSortFunction();
        	_edittable._createFilterFunction();
        	_edittable.options.data.sort(_edittable.vars.sortfunc);
            _edittable.element.children('tbody').children('tr').remove();            
            $.each(_edittable.options.data, function(rowidx, rowdata) {
            	if (_edittable.vars.filterfunc(rowdata)) {
            		_edittable.element.append(_edittable._create_row(rowdata));
            	}
            });
            _edittable._stripe();            
        },
                
        _create_row: function(rowdata) {
            var _edittable = this;
            var l_regexg = new RegExp("`([a-z0-9\.]+)`", "gi");
            var row = $('<tr/>');
            $.each(_edittable.options.columns, function(colidx, column) {
            	
            	var l_hide = false;
            	
            	// Evaluate hideIfTrue
            	if (column.hideIfTrue) {
            		 var l_match = null;
            		 var l_hideIfTrue = column.hideIfTrue;
                     while((l_match = l_regexg.exec(column.hideIfTrue)) !== null) {
                     	var l_eval = 'rowdata.' + l_match[1];
                     	var l_val = eval(l_eval);
                     	l_hideIfTrue = l_hideIfTrue.replace(l_match[0], l_val || '');
                     }
                     try {
                    	 l_hide = eval(l_hideIfTrue);
                     } catch(e) {
                    	 // Evaluate undefined as false 
                    	 l_hide = true;
                     }
            	}
            	
            	if (l_hide) {
            		row.append($('<td/>').html(''));
            	} else {
            	
	            	// Write out attribute 
	                if (column.attribute && !column.html) {
	                    var l_eval = 'rowdata.' + column.attribute;
	                    try {
	                    	var l_html = eval(l_eval);
	                    	if (!column.hidden) {                        
	                    		row.append($('<td/>').html(_edittable._stripHTML(l_html)));
	                    	} else {
	                    		row.append($('<td/>').html(_edittable._stripHTML(l_html)).hide());
	                    	}
	                    	if (column.identifier) {  
	                    		row.attr('id', l_html);
	                    	}
	                    } catch (e) {
	                        row.append($('<td/>').html('undefined'));
	                    }
	                } 
	                
	                // Write out evaluated HTML
	                else if (column.html) {
	                    var l_match = null;
	                    var l_html = column.html;
	                    while((l_match = l_regexg.exec(column.html)) !== null) {
	                    	var l_eval = _edittable._stripHTML('rowdata.' + l_match[1]);
	                    	try {
	                            var l_val = eval(l_eval);
	                            l_html = l_html.replace(l_match[0], l_val || '');
	                        } catch (e) {
	                        	l_html = l_html.replace(l_match[0], 'undefined');
	                        }
	                    }
	                    row.append($('<td/>').html(l_html));
	                }
	                
            	}
            });
            return (row);
        },
        
        prepend: function(rowdata) {
        	var _edittable = this;
        	_edittable.element.prepend(_edittable._create_row(rowdata));
        	_edittable._stripe();
        	_edittable.options.data.unshift(rowdata);
        },
        
        append: function(rowdata) {
        	var _edittable = this;
        	_edittable.element.append(_edittable._create_row(rowdata));
        	_edittable._stripe();
        	_edittable.options.data.push(rowdata);
        },
        
        addSorted: function(rowdata) {
        	var _edittable = this;
        	_edittable.options.data.push(rowdata);
        	_edittable.fill();
        }, 
        
        remove: function(id) {
        	var _edittable = this;
        	_edittable.element.children('tbody').children('tr[id="' + id + '"]').remove();
        	_edittable._stripe();
        	if (_edittable.vars.identifiers.length == 1) {
        		_edittable._deleteDataItem(_edittable.vars.identifiers[0], id);	
        	}
        },
        
        _stripe: function() {
        	var _edittable = this;
            if (_edittable.options.stripe != null) {
            	_edittable.element.children('tbody').children('tr').css('background-color','');
            	_edittable.element.children('tbody').children('tr:even').css('background-color', _edittable.options.stripe);
            }
        },
        
        _postRender: function() {
        	var _edittable = this;
        	
        	_edittable.element.children('thead').children('tr').children('th').css('vertical-align', 'top').css('text-align', 'left');
        	
        	var _srt = _edittable.element.children('thead').children('tr').children('th').children('span').css('vertical-align', 'bottom');
        	_srt.each(function(index, value) {
        		var _l = $(this);
        		_l.on('click', null, { col: _l.attr('id'), that: _edittable } , _edittable._sortClick );
        	});
        	
        	var _sch = _edittable.element.children('thead').children('tr').children('th').children('input');
        	_sch.each(function(index, value) {
        		var _l = $(this);
        		_l.on('input', null, { col: _l.attr('id'), that: _edittable }, _edittable._filter );
        	});
        	
        	var _sel = _edittable.element.children('thead').children('tr').children('th').children('select');
        	_sel.each(function(index, value) {
        		var _l = $(this);
        		_l.on('change', null, { col: _l.attr('id'), that: _edittable } , _edittable._filter );
        	});
        	
        	$(document).keydown(function(e) {        		
        	    if(e.which == 27){
        	    	for (var i = 0; i < _edittable.vars.filterids.length; i++) {
                		$('#__' +  _edittable.vars.filterids[i].column).val(null);
        	    	}
        	    	_edittable.vars.filterids = [];
        	    	_edittable.fill();
        	    }
        	});
        },
                
        _uniqueValue: function(attribute) {
        	var _edittable = this;
        	var l_duplicates = [];
    	    for (var i = 0; i < _edittable.options.data.length; i++) {
    	    	var _val = '_edittable.options.data[i].' +  attribute;
    	    	l_duplicates.push(eval(_val));
    	    }
        	return unique(l_duplicates);
        },
                
        _deleteDataItem: function(identifier, value) {
        	var _edittable = this;
    	    for (var i = 0; i < _edittable.options.data.length; i++) {
    	    	var _val = '_edittable.options.data[i].' +  identifier;
    	        if (eval(_val) == value) {
    	        	_edittable.options.data.splice(i, 1);
    	            return;
    	        }
    	    }
        },
        
        _filter: function(event) {
        	var _t = $(this);
        	var _edittable = event.data.that;
        	var _id = event.data.col;
        	if(_t.val() && !_edittable._isInFilter(_id)) {
        		_edittable._addToFilter(_id);        		
        	} else if (!_t.val() && _edittable._isInFilter(_id)) {
        		_edittable._removeFromFilter(_id); 
        	}
        	_edittable.fill();
        },
        
        _sortClick: function(event) {
        	var _t = $(this);
        	var _edittable = event.data.that;
        	var _id = event.data.col;
        	if (_t.hasClass('ui-icon-triangle-2-n-s')) {
        		_t.removeClass('ui-icon-triangle-2-n-s');
        		_t.addClass('ui-icon-triangle-1-n');
        		_edittable._addToSort(_id, 'asc');
        		_edittable._removeFromSort('__' + _edittable.vars.defaultSort[0], 'asc');
        	} else if (_t.hasClass('ui-icon-triangle-1-n')) {
        		_t.removeClass('ui-icon-triangle-1-n');
        		_t.addClass('ui-icon-triangle-1-s');
        		_edittable._removeFromSort(_id, 'asc');
        		_edittable._addToSort(_id, 'desc');
        	} else if (_t.hasClass('ui-icon-triangle-1-s')) {
        		_t.removeClass('ui-icon-triangle-1-s');
        		_t.addClass('ui-icon-triangle-2-n-s');
        		_edittable._removeFromSort(_id, 'desc');
        		if (!_edittable._isInSort('__' + _edittable.vars.defaultSort[0], 'asc')) {
        			_edittable._addToSort('__' + _edittable.vars.defaultSort[0], 'asc');
        		}
        	}
        	_edittable.fill();
        },
        
        _addToSort: function(col, dir) {
        	var _edittable = this;
        	_edittable.vars.sortids.push({ column: col.substring(2), direction: dir });
        },
        
        _removeFromSort: function(col, dir) {
        	var _edittable = this;
        	for (var i = 0; i < _edittable.vars.sortids.length; i++) {
    	        if (_edittable.vars.sortids[i].column == col.substring(2) && _edittable.vars.sortids[i].direction == dir) {
    	        	_edittable.vars.sortids.splice(i, 1);
    	            return;
    	        }
    	    }
        },
        
        _isInSort: function(col, dir) {
        	var _edittable = this;
        	for (var i = 0; i < _edittable.vars.sortids.length; i++) {
    	        if (_edittable.vars.sortids[i].column == col.substring(2) && _edittable.vars.sortids[i].direction == dir) {
    	            return true;
    	        }
    	    }
        	return false;
        },
        
        _addToFilter: function(col) {
        	var _edittable = this;
        	_edittable.vars.filterids.push({ column: col.substring(2) });
        },
        
        _removeFromFilter: function(col) {
        	var _edittable = this;
        	for (var i = 0; i < _edittable.vars.filterids.length; i++) {
    	        if (_edittable.vars.filterids[i].column == col.substring(2)) {
    	        	_edittable.vars.filterids.splice(i, 1);
    	            return;
    	        }
    	    }
        },
        
        _isInFilter: function(col) {
        	var _edittable = this;
        	for (var i = 0; i < _edittable.vars.filterids.length; i++) {
    	        if (_edittable.vars.filterids[i].column == col.substring(2)) {
    	            return true;
    	        }
    	    }
        	return false;
        },
        
        _createSortFunction: function() {
        	var _edittable = this;
        	var _decl = '';
        	var _body = '';
        	for (var i= 0; i < _edittable.vars.sortids.length; i++) {
        		_decl += 'var a' + i + ';\n';
        		_decl += 'var b' + i + ';\n';
        		
        		_decl += 'if (typeof a.' + _edittable.vars.sortids[i].column + ' === "string") {\n';        		
        		_decl += '  a' + i + ' = a.' + _edittable.vars.sortids[i].column + '.toLowerCase();\n';
        		_decl += '} else {\n';
        		_decl += '  a' + i + ' = a.' + _edittable.vars.sortids[i].column + ';\n';
        		_decl += '}\n';
        		
        		_decl += 'if (typeof b.' + _edittable.vars.sortids[i].column + ' === "string") {\n';        		
        		_decl += '  b' + i + ' = b.' + _edittable.vars.sortids[i].column + '.toLowerCase();\n';
        		_decl += '} else {\n';
        		_decl += '  b' + i + ' = b.' + _edittable.vars.sortids[i].column + ';\n';
        		_decl += '}\n';

        		_body += 'if (a' + i + ' != null && b' + i + ' == null) return ' + (_edittable.vars.sortids[i].direction == "asc" ? '-1' : '1') + ';\n';
        		_body += 'if (a' + i + ' == null && b' + i + ' != null) return ' + (_edittable.vars.sortids[i].direction == "asc" ? '1' : '-1') + ';\n';
        		_body += 'if (a' + i + ' != null && b' + i + ' != null) {\n';
        		
        		_body += '  if (typeof a' + i + ' === "string" && typeof b' + i + ' === "string") {\n';        	
        		if (_edittable.vars.sortids[i].direction == "asc") {
        			_body += '    var comp = a' + i + '.localeCompare(b' + i + ');\n';
        		} else {
        			_body += '    var comp = b' + i + '.localeCompare(a' + i + ');\n';
        		}
        		_body += '    if (comp != 0) return comp;\n';
        		
        		_body += '  } else {\n';
        		_body += '    if (a' + i + ' < b' + i + ') return ' + (_edittable.vars.sortids[i].direction == "asc" ? '-1' : '1') + ';\n';
        		_body += '    if (a' + i + ' > b' + i + ') return ' + (_edittable.vars.sortids[i].direction == "asc" ? '1' : '-1') + ';\n';
        		_body += '  }\n';
        		_body += '}\n';
        		
        	}
        	_body += 'return 0;';
        	//console.log(_decl + _body);
        	_edittable.vars.sortfunc = new Function('a', 'b', _decl + _body);
        	
        },
        
        _createFilterFunction: function() {
        	var _edittable = this;
        	var _decl = '';
        	var _body = '';
        	for (var i = 0; i < _edittable.vars.filterids.length; i++) {
        		if ($('#__' +  _edittable.vars.filterids[i].column).get(0).tagName === 'INPUT') {
            		var l_input = $('input#__' +  _edittable.vars.filterids[i].column).val();
	        		var l_input = l_input.toUpperCase();
	            	_body += 'if ( rowdata.' + _edittable.vars.filterids[i].column + '.toString().toUpperCase().indexOf( \'' + l_input + '\' ) < 0) { \n';
	            	_body += '  return false; \n';
	            	_body += '}\n'; 
        		} else if ($('#__' +  _edittable.vars.filterids[i].column).get(0).tagName === 'SELECT') {
        			var l_select = $('select#__' +  _edittable.vars.filterids[i].column).val();
        			_body += 'if ( rowdata.' + _edittable.vars.filterids[i].column + ' !==  \'' + l_select + '\' ) { \n';
            		_body += '  return false; \n';
            		_body += '}\n';
        		}        		
        	}
        	_body += 'return true;';
        	console.log(_decl + _body);
        	_edittable.vars.filterfunc = new Function('rowdata', _decl + _body);
        },
        
        _stripHTML : function(str) {
        	return(sanitze.HTMLEscape(str));
        }
        
    });
    

	function unique(array) {
         return $.grep(array, function(el, index) {
             return index === $.inArray(el, array);
         });
    }
})(jQuery);