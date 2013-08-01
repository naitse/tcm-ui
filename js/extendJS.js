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

Date.daysBetween = function( date1, date2 ) {
  //Get 1 day in milliseconds
  var one_day=1000*60*60*24;

  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = date2_ms - date1_ms;
    
  // Convert back to days and return
  return Math.round(difference_ms/one_day); 
};

Date.bizdays= function(d1, d2){
 
    var wd1= d1.getDay();
    var wd2= d2.getDay();
 
    var interval= Math.abs(d1-d2);
    var days= Math.floor(interval/8.46e7);
    var tem= days%7;
    var weeks= Math.floor(days/7);
    if(wd1== 6) tem-= 2;
    else if(wd1== 0) tem-= 1;
    if(wd2== 0) tem-= 1;
 
    return weeks*5+tem;
};

String.guidGenerator= function() {
  var buf = new Uint16Array(8);
   window.crypto.getRandomValues(buf);
   var S4 = function(num) {
     var ret = num.toString(16);
     while(ret.length < 4){
       ret = "0"+ret;
     };
     return ret;
   };
  return (S4(buf[0])+S4(buf[1])+"-"+S4(buf[2])+"-4"+S4(buf[3]).substring(1)+"-y"+S4(buf[4]).substring(1)+"-"+S4(buf[5])+S4(buf[6])+S4(buf[7]));
};