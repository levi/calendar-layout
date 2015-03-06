(function() {
    "use strict";
    /**
     * Brings an environment as close to ECMAScript 5 compliance
     * as is possible with the facilities of erstwhile engines.
     *
     * Annotated ES5: http://es5.github.com/ (specific links below)
     * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
     * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
     */

    //
    // Function
    // ========
    //

    // ES-5 15.3.4.5
    // http://es5.github.com/#x15.3.4.5

    function Empty() {}

    if (!Function.prototype.bind) {
        Function.prototype.bind = function bind(that) { // .length is 1
            // 1. Let Target be the this value.
            var target = this;
            // 2. If IsCallable(Target) is false, throw a TypeError exception.
            if (typeof target != "function") {
                throw new TypeError("Function.prototype.bind called on incompatible " + target);
            }
            // 3. Let A be a new (possibly empty) internal list of all of the
            //   argument values provided after thisArg (arg1, arg2 etc), in order.
            // XXX slicedArgs will stand in for "A" if used
            var args = slice.call(arguments, 1); // for normal call
            // 4. Let F be a new native ECMAScript object.
            // 11. Set the [[Prototype]] internal property of F to the standard
            //   built-in Function prototype object as specified in 15.3.3.1.
            // 12. Set the [[Call]] internal property of F as described in
            //   15.3.4.5.1.
            // 13. Set the [[Construct]] internal property of F as described in
            //   15.3.4.5.2.
            // 14. Set the [[HasInstance]] internal property of F as described in
            //   15.3.4.5.3.
            var bound = function () {

                if (this instanceof bound) {
                    // 15.3.4.5.2 [[Construct]]
                    // When the [[Construct]] internal method of a function object,
                    // F that was created using the bind function is called with a
                    // list of arguments ExtraArgs, the following steps are taken:
                    // 1. Let target be the value of F's [[TargetFunction]]
                    //   internal property.
                    // 2. If target has no [[Construct]] internal method, a
                    //   TypeError exception is thrown.
                    // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                    //   property.
                    // 4. Let args be a new list containing the same values as the
                    //   list boundArgs in the same order followed by the same
                    //   values as the list ExtraArgs in the same order.
                    // 5. Return the result of calling the [[Construct]] internal
                    //   method of target providing args as the arguments.

                    var result = target.apply(
                        this,
                        args.concat(slice.call(arguments))
                    );
                    if (Object(result) === result) {
                        return result;
                    }
                    return this;

                } else {
                    // 15.3.4.5.1 [[Call]]
                    // When the [[Call]] internal method of a function object, F,
                    // which was created using the bind function is called with a
                    // this value and a list of arguments ExtraArgs, the following
                    // steps are taken:
                    // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                    //   property.
                    // 2. Let boundThis be the value of F's [[BoundThis]] internal
                    //   property.
                    // 3. Let target be the value of F's [[TargetFunction]] internal
                    //   property.
                    // 4. Let args be a new list containing the same values as the
                    //   list boundArgs in the same order followed by the same
                    //   values as the list ExtraArgs in the same order.
                    // 5. Return the result of calling the [[Call]] internal method
                    //   of target providing boundThis as the this value and
                    //   providing args as the arguments.

                    // equiv: target.call(this, ...boundArgs, ...args)
                    return target.apply(
                        that,
                        args.concat(slice.call(arguments))
                    );

                }

            };
            if(target.prototype) {
                Empty.prototype = target.prototype;
                bound.prototype = new Empty();
                // Clean up dangling references.
                Empty.prototype = null;
            }
            // XXX bound.length is never writable, so don't even try
            //
            // 15. If the [[Class]] internal property of Target is "Function", then
            //     a. Let L be the length property of Target minus the length of A.
            //     b. Set the length own property of F to either 0 or L, whichever is
            //       larger.
            // 16. Else set the length own property of F to 0.
            // 17. Set the attributes of the length own property of F to the values
            //   specified in 15.3.5.1.

            // TODO
            // 18. Set the [[Extensible]] internal property of F to true.

            // TODO
            // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
            // 20. Call the [[DefineOwnProperty]] internal method of F with
            //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
            //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
            //   false.
            // 21. Call the [[DefineOwnProperty]] internal method of F with
            //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
            //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
            //   and false.

            // TODO
            // NOTE Function objects created using Function.prototype.bind do not
            // have a prototype property or the [[Code]], [[FormalParameters]], and
            // [[Scope]] internal properties.
            // XXX can't delete prototype in pure-js.

            // 22. Return F.
            return bound;
        };
    }

    // Shortcut to an often accessed properties, in order to avoid multiple
    // dereference that costs universally.
    // _Please note: Shortcuts are defined after `Function.prototype.bind` as we
    // us it in defining shortcuts.
    var call = Function.prototype.call;
    var prototypeOfArray = Array.prototype;
    var prototypeOfObject = Object.prototype;
    var slice = prototypeOfArray.slice;
    // Having a toString local variable name breaks in Opera so use _toString.
    var _toString = call.bind(prototypeOfObject.toString);

    // Check failure of by-index access of string characters (IE < 9)
    // and failure of `0 in boxedString` (Rhino)
    var boxedString = Object("a"),
        splitString = boxedString[0] != "a" || !(0 in boxedString);

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function forEach(fun /*, thisp*/) {
            var object = toObject(this),
                self = splitString && _toString(this) == "[object String]" ?
                    this.split("") :
                    object,
                thisp = arguments[1],
                i = -1,
                length = self.length >>> 0;

            // If no callback function or if callback is not a callable function
            if (_toString(fun) != "[object Function]") {
                throw new TypeError(); // TODO message
            }

            while (++i < length) {
                if (i in self) {
                    // Invoke the callback function with call, passing arguments:
                    // context, property value, property key, thisArg object
                    // context
                    fun.call(thisp, self[i], i, object);
                }
            }
        };
    }

    // ES5 15.4.4.14
    // http://es5.github.com/#x15.4.4.14
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
    if (!Array.prototype.indexOf || ([0, 1].indexOf(1, 2) != -1)) {
        Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
            var self = splitString && _toString(this) == "[object String]" ?
                    this.split("") :
                    toObject(this),
                length = self.length >>> 0;

            if (!length) {
                return -1;
            }

            var i = 0;
            if (arguments.length > 1) {
                i = toInteger(arguments[1]);
            }

            // handle negative indices
            i = i >= 0 ? i : Math.max(0, length + i);
            for (; i < length; i++) {
                if (i in self && self[i] === sought) {
                    return i;
                }
            }
            return -1;
        };
    }

    //
    // Util
    // ======
    //

    // ES5 9.4
    // http://es5.github.com/#x9.4
    // http://jsperf.com/to-integer

    function toInteger(n) {
        n = +n;
        if (n !== n) { // isNaN
            n = 0;
        } else if (n !== 0 && n !== (1/0) && n !== -(1/0)) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
        return n;
    }

    // ES5 9.9
    // http://es5.github.com/#x9.9
    var toObject = function (o) {
        if (o == null) { // this matches both null and undefined
            throw new TypeError("can't convert "+o+" to object");
        }
        return Object(o);
    };
}).call(this);