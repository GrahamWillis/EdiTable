var sanitze = (function() {

	var HTMLCodec = [{
        chr: 60, 
        str: '&lt;'
    }, {
        chr: 62, 
        str: '&gt;'
    }, {
        chr: 34, 
        str: '&quot;'
    }, {
        chr: 38, 
        str: '&amp;'
    }, {
        chr: 39, 
        str: '&#x27;'
    }, {
        chr: 47, 
        str: '&#x2F;'
    }];

	var isInCodec = function(c) {
        for (var i = 0; i < HTMLCodec.length; i++) {
            if (HTMLCodec[i].chr === c) {
                return HTMLCodec[i].str;
            }
        }
        return null;
    };

    return {
        HTMLEscape: function(str) {

            if (str == null) return null;
            if (typeof(str) === 'undefined') return;

            var obj = str.toString();
            outStr = '';

            for (var i = 0; i < obj.length; i++) {
                var r = isInCodec(obj.charCodeAt(i));
                outStr += (r == null ? obj.charAt(i) : r);
            }
            
            return outStr;
        }
    }
})();