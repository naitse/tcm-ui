define(function () {
	
String.prototype.trunc = function(n,useWordBoundary){
       var toLong = this.length>n,
           s_ = toLong ? this.substr(0,n-1) : this;
       s_ = useWordBoundary && toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
       return  toLong ? s_ + '...' : s_;
    };

Object.defineProperty(Object.prototype, "equals", {
    enumerable: false,
    value: function (obj) {
        var p;
        if (this === obj) {
            return true;
        }

        // some checks for native types first

        // function and sring
        if (typeof(this) === "function" || typeof(this) === "string" || this instanceof String) { 
            return this.toString() === obj.toString();
        }

        // number
        if (this instanceof Number || typeof(this) === "number") {
            if (obj instanceof Number || typeof(obj) === "number") {
                return this.valueOf() === obj.valueOf();
            }
            return false;
        }

        // null.equals(null) and undefined.equals(undefined) do not inherit from the 
        // Object.prototype so we can return false when they are passed as obj
        if (typeof(this) !== typeof(obj) || obj === null || typeof(obj) === "undefined") {
            return false;
        }

        function sort (o) {
            var result = {};

            if (typeof o !== "object") {
                return o;
            }

            Object.keys(o).sort().forEach(function (key) {
                result[key] = sort(o[key]);
            });

            return result;
        }

        if (typeof(this) === "object") {
            if (Array.isArray(this)) { // check on arrays
                return JSON.stringify(this) === JSON.stringify(obj);                
            } else { // anyway objects
                for (p in this) {
                    if (typeof(this[p]) !== typeof(obj[p])) {
                        return false;
                    }
                    if ((this[p] === null) !== (obj[p] === null)) {
                        return false;
                    }
                    switch (typeof(this[p])) {
                    case 'undefined':
                        if (typeof(obj[p]) !== 'undefined') {
                            return false;
                        }
                        break;
                    case 'object':
                        if (this[p] !== null 
                                && obj[p] !== null 
                                && (this[p].constructor.toString() !== obj[p].constructor.toString() 
                                        || !this[p].equals(obj[p]))) {
                            return false;
                        }
                        break;
                    case 'function':
                        if (this[p].toString() !== obj[p].toString()) {
                            return false;
                        }
                        break;
                    default:
                        if (this[p] !== obj[p]) {
                            return false;
                        }
                    }
                };

            }
        }

        // at least check them with JSON
        return JSON.stringify(sort(this)) === JSON.stringify(sort(obj));
    }
});




});