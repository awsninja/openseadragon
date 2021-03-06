/**
 * @version  OpenSeadragon @VERSION@
 *
 * @fileOverview 
 * <h2>
 * <strong>
 * OpenSeadragon - Javascript Deep Zooming
 * </strong>
 * </h2> 
 * <p>
 * OpenSeadragon is provides an html interface for creating 
 * deep zoom user interfaces.  The simplest examples include deep 
 * zoom for large resolution images, and complex examples include
 * zoomable map interfaces driven by SVG files.
 * </p>
 * 
 * @author <br/>(c) 2011 Christopher Thatcher 
 * @author <br/>(c) 2010 OpenSeadragon Team 
 * @author <br/>(c) 2010 CodePlex Foundation 
 * 
 * <p>
 * <strong>Original license preserved below: </strong><br/>
 * <pre>
 * ----------------------------------------------------------------------------
 * 
 *  License: New BSD License (BSD)
 *  Copyright (c) 2010, OpenSeadragon
 *  All rights reserved.
 * 
 *  Redistribution and use in source and binary forms, with or without 
 *  modification, are permitted provided that the following conditions are met:
 *  
 *  * Redistributions of source code must retain the above copyright notice, this 
 *    list of conditions and the following disclaimer.
 *  
 *  * Redistributions in binary form must reproduce the above copyright notice, 
 *    this list of conditions and the following disclaimer in the documentation 
 *    and/or other materials provided with the distribution.
 * 
 *  * Neither the name of OpenSeadragon nor the names of its contributors may be 
 *    used to endorse or promote products derived from this software without 
 *    specific prior written permission.
 * 
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 *  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE 
 *  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 *  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 *  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 *  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 *  CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 *  POSSIBILITY OF SUCH DAMAGE.
 * 
 * ----------------------------------------------------------------------------
 * </pre>
 * </p>
 **/

 /** 
  * The root namespace for OpenSeadragon.  All utility methods and classes
  * are defined on or below this namespace. The OpenSeadragon namespace will
  * only be defined once even if mutliple versions are loaded on the page in 
  * succession.
  * @namespace 
  * @name OpenSeadragon
  * @exports $ as OpenSeadragon
  */
OpenSeadragon = window.OpenSeadragon || (function(){

    //Taken from jquery 1.6.1
    // [[Class]] -> type pairs
    var class2type = {
        '[object Boolean]':     'boolean',
        '[object Number]':      'number',
        '[object String]':      'string',
        '[object Function]':    'function',
        '[object Array]':       'array',
        '[object Date]':        'date',
        '[object RegExp]':      'regexp',
        '[object Object]':      'object'
    },
    // Save a reference to some core methods
    toString    = Object.prototype.toString,
    hasOwn      = Object.prototype.hasOwnProperty,
    push        = Array.prototype.push,
    slice       = Array.prototype.slice,
    trim        = String.prototype.trim,
    indexOf     = Array.prototype.indexOf;

    return {
        // See test/unit/core.js for details concerning isFunction.
        // Since version 1.3, DOM methods and functions like alert
        // aren't supported. They return false on IE (#2968).
        isFunction: function( obj ) {
            return OpenSeadragon.type(obj) === "function";
        },

        isArray: Array.isArray || function( obj ) {
            return OpenSeadragon.type(obj) === "array";
        },

        // A crude way of determining if an object is a window
        isWindow: function( obj ) {
            return obj && typeof obj === "object" && "setInterval" in obj;
        },

        type: function( obj ) {
            return obj == null ?
                String( obj ) :
                class2type[ toString.call(obj) ] || "object";
        },

        isPlainObject: function( obj ) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window objects don't pass through, as well
            if ( !obj || OpenSeadragon.type(obj) !== "object" || obj.nodeType || OpenSeadragon.isWindow( obj ) ) {
                return false;
            }

            // Not own constructor property must be Object
            if ( obj.constructor &&
                !hasOwn.call(obj, "constructor") &&
                !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.

            var key;
            for ( key in obj ) {}

            return key === undefined || hasOwn.call( obj, key );
        },

        isEmptyObject: function( obj ) {
            for ( var name in obj ) {
                return false;
            }
            return true;
        }

    };

}());

(function( $ ){    

    /**
     * @static
     * @ignore
     */
    $.SIGNAL = "----seadragon----";

    /**
     * Invokes the the method as if it where a method belonging to the object.
     * @param {Object} object 
     * @param {Function} method
     */
    $.delegate = function( object, method ) {
        return function() {
            if ( arguments === undefined )
                arguments = [];
            return method.apply( object, arguments );
        };
    };
    
    /**
     * Taken from jQuery 1.6.1, see the jQuery documentation
     */
    $.extend = function() {
        var options, 
            name, 
            src, 
            copy, 
            copyIsArray, 
            clone,
            target  = arguments[ 0 ] || {},
            length  = arguments.length,
            deep    = false,
            i       = 1;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep    = target;
            target  = arguments[ 1 ] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !OpenSeadragon.isFunction( target ) ) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        if ( length === i ) {
            target = this;
            --i;
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( ( options = arguments[ i ] ) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( OpenSeadragon.isPlainObject( copy ) || ( copyIsArray = OpenSeadragon.isArray( copy ) ) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && OpenSeadragon.isArray( src ) ? src : [];

                        } else {
                            clone = src && OpenSeadragon.isPlainObject( src ) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = OpenSeadragon.extend( deep, clone, copy );

                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

    //The following functions are originally from the Openseadragon Utils 
    //module but have been moved to Openseadragon to avoid the 'Utils' anti-
    //pattern.  Not all of the code is A-grade compared to equivalent functions
    // from libraries like jquery, but until we need better we'll leave those
    //orignally developed by the project.
    
    /**
     * An enumeration of Browser vendors including UNKNOWN, IE, FIREFOX,
     * SAFARI, CHROME, and OPERA.
     * @static
     */
    $.BROWSERS = {
        UNKNOWN:    0,
        IE:         1,
        FIREFOX:    2,
        SAFARI:     3,
        CHROME:     4,
        OPERA:      5
    };

    /**
     * The current browser vendor, version, and related information regarding
     * detected features.  Features include <br/>
     *  <strong>'alpha'</strong> - Does the browser support image alpha 
     *  transparency.<br/>
     * @static
     */
    $.Browser = {
        vendor:     $.BROWSERS.UNKNOWN,
        version:    0,
        alpha:      true
    };

    var ACTIVEX = [
            "Msxml2.XMLHTTP", 
            "Msxml3.XMLHTTP", 
            "Microsoft.XMLHTTP"
        ],  
        FILEFORMATS = {
            "bmp":  false,
            "jpeg": true,
            "jpg":  true,
            "png":  true,
            "tif":  false,
            "wdp":  false
        },
        URLPARAMS = {};

    (function() {
        //A small auto-executing routine to determine the browser vendor, 
        //version and supporting feature sets.
        var app = navigator.appName,
            ver = navigator.appVersion,
            ua  = navigator.userAgent;

        switch( navigator.appName ){
            case "Microsoft Internet Explorer":
                if( !!window.attachEvent && 
                    !!window.ActiveXObject ) {

                    $.Browser.vendor = $.BROWSERS.IE;
                    $.Browser.version = parseFloat(
                        ua.substring( 
                            ua.indexOf( "MSIE" ) + 5, 
                            ua.indexOf( ";", ua.indexOf( "MSIE" ) ) )
                        );
                }
                break;
            case "Netscape":
                if( !!window.addEventListener ){
                    if ( ua.indexOf( "Firefox" ) >= 0 ) {
                        $.Browser.vendor = $.BROWSERS.FIREFOX;
                        $.Browser.version = parseFloat(
                            ua.substring( ua.indexOf( "Firefox" ) + 8 )
                        );
                    } else if ( ua.indexOf( "Safari" ) >= 0 ) {
                        $.Browser.vendor = ua.indexOf( "Chrome" ) >= 0 ? 
                            $.BROWSERS.CHROME : 
                            $.BROWSERS.SAFARI;
                        $.Browser.version = parseFloat(
                            ua.substring( 
                                ua.substring( 0, ua.indexOf( "Safari" ) ).lastIndexOf( "/" ) + 1, 
                                ua.indexOf( "Safari" )
                            )
                        );
                    }
                }
                break;
            case "Opera":
                $.Browser.vendor = $.BROWSERS.OPERA;
                $.Browser.version = parseFloat( ver );
                break;
        }

            // ignore '?' portion of query string
        var query = window.location.search.substring( 1 ),
            parts = query.split('&'),
            part,
            sep,
            i;

        for ( i = 0; i < parts.length; i++ ) {
            part = parts[ i ];
            sep  = part.indexOf( '=' );

            if ( sep > 0 ) {
                URLPARAMS[ part.substring( 0, sep ) ] =
                    decodeURIComponent( part.substring( sep + 1 ) );
            }
        }

        //determine if this browser supports image alpha transparency
        $.Browser.alpha = !( 
            $.Browser.vendor == $.BROWSERS.IE || (
                $.Browser.vendor == $.BROWSERS.CHROME && 
                $.Browser.version < 2
            )
        );

    })();

    //TODO: $.console is often used inside a try/catch block which generally
    //      prevents allowings errors to occur with detection until a debugger
    //      is attached.  Although I've been guilty of the same anti-pattern
    //      I eventually was convinced that errors should naturally propogate in
    //      all but the most special cases.
    /**
     * A convenient alias for console when available, and a simple null 
     * function when console is unavailable.
     * @static
     * @private
     */
    var nullfunction = function( msg ){
            //document.location.hash = msg;
        };

    $.console = window.console || {
        log:    nullfunction,
        debug:  nullfunction,
        info:   nullfunction,
        warn:   nullfunction,
        error:  nullfunction
    };
        
    $.extend( $, {

        /**
         * Returns a DOM Element for the given id or element.
         * @function
         * @name OpenSeadragon.getElement
         * @param {String|Element} element Accepts an id or element.
         * @returns {Element} The element with the given id, null, or the element itself.
         */
        getElement: function( element ) { 
            if ( typeof ( element ) == "string" ) {
                element = document.getElementById( element );
            }
            return element;
        },

        /**
         * Determines the position of the upper-left corner of the element.
         * @function
         * @name OpenSeadragon.getElementPosition
         * @param {Element|String} element - the elemenet we want the position for.
         * @returns {Point} - the position of the upper left corner of the element. 
         */
        getElementPosition: function( element ) {
            var result = new $.Point(),
                isFixed,
                offsetParent;

            element      = $.getElement( element );
            isFixed      = $.getElementStyle( element ).position == "fixed";
            offsetParent = getOffsetParent( element, isFixed );

            while ( offsetParent ) {

                result.x += element.offsetLeft;
                result.y += element.offsetTop;

                if ( isFixed ) {
                    result = result.plus( $.getPageScroll() );
                }

                element = offsetParent;
                isFixed = $.getElementStyle( element ).position == "fixed";
                offsetParent = getOffsetParent( element, isFixed );
            }

            return result;
        },

        /**
         * Determines the height and width of the given element.
         * @function
         * @name OpenSeadragon.getElementSize
         * @param {Element|String} element
         * @returns {Point}
         */
        getElementSize: function( element ) {
            element = $.getElement( element );

            return new $.Point(
                element.clientWidth, 
                element.clientHeight
            );
        },

        /**
         * Returns the CSSStyle object for the given element.
         * @function
         * @name OpenSeadragon.getElementStyle
         * @param {Element|String} element
         * @returns {CSSStyle}
         */
        getElementStyle: function( element ) {
            element = $.getElement( element );

            if ( element.currentStyle ) {
                return element.currentStyle;
            } else if ( window.getComputedStyle ) {
                return window.getComputedStyle( element, "" );
            } else {
                throw new Error( "Unknown element style, no known technique." );
            }
        },

        /**
         * Gets the latest event, really only useful internally since its 
         * specific to IE behavior.  TODO: Deprecate this from the api and
         * use it internally.
         * @function
         * @name OpenSeadragon.getEvent
         * @param {Event} [event]
         * @returns {Event}
         */
        getEvent: function( event ) {
            return event ? event : window.event;
        },

        /**
         * Gets the position of the mouse on the screen for a given event.
         * @function
         * @name OpenSeadragon.getMousePosition
         * @param {Event} [event]
         * @returns {Point}
         */
        getMousePosition: function( event ) {
            var result = new $.Point();

            event = $.getEvent( event );

            if ( typeof( event.pageX ) == "number" ) {
                result.x = event.pageX;
                result.y = event.pageY;
            } else if ( typeof( event.clientX ) == "number" ) {
                result.x = 
                    event.clientX + 
                    document.body.scrollLeft + 
                    document.documentElement.scrollLeft;
                result.y = 
                    event.clientY + 
                    document.body.scrollTop + 
                    document.documentElement.scrollTop;
            } else {
                throw new Error(
                    "Unknown event mouse position, no known technique."
                );
            }

            return result;
        },

        /**
         * Determines the pages current scroll position.
         * @function
         * @name OpenSeadragon.getPageScroll
         * @returns {Point}
         */
        getPageScroll: function() {
            var result  = new $.Point(),
                docElement = document.documentElement || {},
                body    = document.body || {};

            if ( typeof( window.pageXOffset ) == "number" ) {
                result.x = window.pageXOffset;
                result.y = window.pageYOffset;
            } else if ( body.scrollLeft || body.scrollTop ) {
                result.x = body.scrollLeft;
                result.y = body.scrollTop;
            } else if ( docElement.scrollLeft || docElement.scrollTop ) {
                result.x = docElement.scrollLeft;
                result.y = docElement.scrollTop;
            }

            return result;
        },

        /**
         * Determines the size of the browsers window.
         * @function
         * @name OpenSeadragon.getWindowSize
         * @returns {Point}
         */
        getWindowSize: function() {
            var result  = new $.Point(),
                docElement = document.documentElement || {},
                body    = document.body || {};

            if ( typeof( window.innerWidth ) == 'number' ) {
                result.x = window.innerWidth;
                result.y = window.innerHeight;
            } else if ( docElement.clientWidth || docElement.clientHeight ) {
                result.x = docElement.clientWidth;
                result.y = docElement.clientHeight;
            } else if ( body.clientWidth || body.clientHeight ) {
                result.x = body.clientWidth;
                result.y = body.clientHeight;
            } else {
                throw new Error("Unknown window size, no known technique.");
            }

            return result;
        },


        /**
         * Wraps the given element in a nest of divs so that the element can
         * be easily centered.
         * @function
         * @name OpenSeadragon.makeCenteredNode
         * @param {Element|String} element
         * @returns {Element}
         */
        makeCenteredNode: function( element ) {

            var div      = $.makeNeutralElement( "div" ),
                html     = [],
                innerDiv,
                innerDivs;

            element = $.getElement( element );

            //TODO: I dont understand the use of # inside the style attributes
            //      below.  Invetigate the results of the constructed html in
            //      the browser and clean up the mark-up to make this clearer.
            html.push('<div style="display:table; height:100%; width:100%;');
            html.push('border:none; margin:0px; padding:0px;'); // neutralizing
            html.push('#position:relative; overflow:hidden; text-align:left;">');
            html.push('<div style="#position:absolute; #top:50%; width:100%; ');
            html.push('border:none; margin:0px; padding:0px;'); // neutralizing
            html.push('display:table-cell; vertical-align:middle;">');
            html.push('<div style="#position:relative; #top:-50%; width:100%; ');
            html.push('border:none; margin:0px; padding:0px;'); // neutralizing
            html.push('text-align:center;"></div></div></div>');

            div.innerHTML = html.join( '' );
            div           = div.firstChild;

            innerDiv    = div;
            innerDivs   = div.getElementsByTagName( "div" );
            while ( innerDivs.length > 0 ) {
                innerDiv  = innerDivs[ 0 ];
                innerDivs = innerDiv.getElementsByTagName( "div" );
            }

            innerDiv.appendChild( element );

            return div;
        },

        /**
         * Creates an easily positionable element of the given type that therefor
         * serves as an excellent container element.
         * @function
         * @name OpenSeadragon.makeNeutralElement
         * @param {String} tagName
         * @returns {Element}
         */
        makeNeutralElement: function( tagName ) {
            var element = document.createElement( tagName ),
                style   = element.style;

            style.background = "transparent none";
            style.border     = "none";
            style.margin     = "0px";
            style.padding    = "0px";
            style.position   = "static";

            return element;
        },

        /**
         * Ensures an image is loaded correctly to support alpha transparency.
         * Generally only IE has issues doing this correctly for formats like 
         * png.
         * @function
         * @name OpenSeadragon.makeTransparentImage
         * @param {String} src
         * @returns {Element}
         */
        makeTransparentImage: function( src ) {
            var img     = $.makeNeutralElement( "img" ),
                element = null;

            if ( $.Browser.vendor == $.BROWSERS.IE && 
                 $.Browser.version < 7 ) {

                element = $.makeNeutralElement("span");
                element.style.display = "inline-block";

                img.onload = function() {
                    element.style.width  = element.style.width || img.width + "px";
                    element.style.height = element.style.height || img.height + "px";

                    img.onload = null;
                    img = null;     // to prevent memory leaks in IE
                };

                img.src = src;
                element.style.filter =
                    "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" +
                    src + 
                    "', sizingMethod='scale')";

            } else {

                element = img;
                element.src = src;

            }

            return element;
        },

        /**
         * Sets the opacity of the specified element.
         * @function
         * @name OpenSeadragon.setElementOpacity
         * @param {Element|String} element
         * @param {Number} opacity
         * @param {Boolean} [usesAlpha]
         */
        setElementOpacity: function( element, opacity, usesAlpha ) {

            var previousFilter,
                ieOpacity,
                ieFilter;

            element = $.getElement( element );

            if ( usesAlpha && !$.Browser.alpha ) {
                opacity = Math.round( opacity );
            }

            if ( opacity < 1 ) {
                element.style.opacity = opacity;
            } else {
                element.style.opacity = "";
            }

            if ( opacity == 1 ) {
                prevFilter = element.style.filter || "";
                element.style.filter = prevFilter.replace(/alpha\(.*?\)/g, "");
                return;
            }

            ieOpacity = Math.round( 100 * opacity );
            ieFilter  = " alpha(opacity=" + ieOpacity + ") ";

            //TODO: find out why this uses a try/catch instead of a predetermined
            //      routine or at least an if/elseif/else
            try {
                if ( element.filters && element.filters.alpha ) {
                    element.filters.alpha.opacity = ieOpacity;
                } else {
                    element.style.filter += ieFilter;
                }
            } catch ( e ) {
                element.style.filter += ieFilter;
            }
        },

        /**
         * Adds an event listener for the given element, eventName and handler.
         * @function
         * @name OpenSeadragon.addEvent
         * @param {Element|String} element
         * @param {String} eventName
         * @param {Function} handler
         * @param {Boolean} [useCapture]
         * @throws {Error}
         */
        addEvent: function( element, eventName, handler, useCapture ) {
            element = $.getElement( element );

            //TODO: Why do this if/else on every method call instead of just
            //      defining this function once based on the same logic
            if ( element.addEventListener ) {
                element.addEventListener( eventName, handler, useCapture );
            } else if ( element.attachEvent ) {
                element.attachEvent( "on" + eventName, handler );
                if ( useCapture && element.setCapture ) {
                    element.setCapture();
                }
            } else {
                throw new Error(
                    "Unable to attach event handler, no known technique."
                );
            }
        },

        /**
         * Remove a given event listener for the given element, event type and 
         * handler.
         * @function
         * @name OpenSeadragon.removeEvent
         * @param {Element|String} element
         * @param {String} eventName
         * @param {Function} handler
         * @param {Boolean} [useCapture]
         * @throws {Error}
         */
        removeEvent: function( element, eventName, handler, useCapture ) {
            element = $.getElement( element );

            //TODO: Why do this if/else on every method call instead of just
            //      defining this function once based on the same logic
            if ( element.removeEventListener ) {
                element.removeEventListener( eventName, handler, useCapture );
            } else if ( element.detachEvent ) {
                element.detachEvent("on" + eventName, handler);
                if ( useCapture && element.releaseCapture ) {
                    element.releaseCapture();
                }
            } else {
                throw new Error(
                    "Unable to detach event handler, no known technique."
                );
            }
        },

        /**
         * Cancels the default browser behavior had the event propagated all
         * the way up the DOM to the window object.
         * @function
         * @name OpenSeadragon.cancelEvent
         * @param {Event} [event]
         */
        cancelEvent: function( event ) {
            event = $.getEvent( event );

            if ( event.preventDefault ) {
                // W3C for preventing default
                event.preventDefault();
            }
            // legacy for preventing default
            event.cancel = true;
            // IE for preventing default
            event.returnValue = false;
        },

        /**
         * Stops the propagation of the event up the DOM.
         * @function
         * @name OpenSeadragon.stopEvent
         * @param {Event} [event]
         */
        stopEvent: function( event ) {
            event = $.getEvent( event );

            if ( event.stopPropagation ) {
                event.stopPropagation();    // W3C for stopping propagation
            }

            event.cancelBubble = true;      // IE for stopping propagation
        },

        /**
         * Similar to OpenSeadragon.delegate, but it does not immediately call 
         * the method on the object, returning a function which can be called
         * repeatedly to delegate the method. It also allows additonal arguments
         * to be passed during construction which will be added during each
         * invocation, and each invocation can add additional arguments as well.
         * 
         * @function
         * @name OpenSeadragon.createCallback
         * @param {Object} object
         * @param {Function} method
         * @param [args] any additional arguments are passed as arguments to the 
         *  created callback
         * @returns {Function}
         */
        createCallback: function( object, method ) {
            //TODO: This pattern is painful to use and debug.  It's much cleaner
            //      to use pinning plus anonymous functions.  Get rid of this
            //      pattern!
            var initialArgs = [],
                i;
            for ( i = 2; i < arguments.length; i++ ) {
                initialArgs.push( arguments[ i ] );
            }

            return function() {
                var args = initialArgs.concat( [] ),
                    i;
                for ( i = 0; i < arguments.length; i++ ) {
                    args.push( arguments[ i ] );
                }

                return method.apply( object, args );
            };
        },

        /**
         * Retreives the value of a url parameter from the window.location string.
         * @function
         * @name OpenSeadragon.getUrlParameter
         * @param {String} key
         * @returns {String} The value of the url parameter or null if no param matches.
         */
        getUrlParameter: function( key ) {
            var value = URLPARAMS[ key ];
            return value ? value : null;
        },

        /**
         * Makes an AJAX request.
         * @function
         * @name OpenSeadragon.makeAjaxRequest
         * @param {String} url - the url to request 
         * @param {Function} [callback] - a function to call when complete
         * @throws {Error}
         */
        makeAjaxRequest: function( url, callback ) {
            var async   = typeof( callback ) == "function",
                request = null,
                actual,
                i;

            if ( async ) {
                actual = callback;
                callback = function() {
                    window.setTimeout(
                        $.createCallback( null, actual, request ), 
                        1
                    );
                };
            }

            if ( window.ActiveXObject ) {
                //TODO: very bad...Why check every time using try/catch when
                //      we could determine once at startup which activeX object
                //      was supported.  This will have significant impact on 
                //      performance for IE Browsers
                for ( i = 0; i < ACTIVEX.length; i++ ) {
                    try {
                        request = new ActiveXObject( ACTIVEX[ i ] );
                        break;
                    } catch (e) {
                        continue;
                    }
                }
            } else if ( window.XMLHttpRequest ) {
                request = new XMLHttpRequest();
            }

            if ( !request ) {
                throw new Error( "Browser doesn't support XMLHttpRequest." );
            }


            if ( async ) {
                /** @ignore */
                request.onreadystatechange = function() {
                    if ( request.readyState == 4) {
                        request.onreadystatechange = new function() { };
                        callback();
                    }
                };
            }

            try {
                request.open( "GET", url, async );
                request.send( null );
            } catch (e) {
                $.console.log(
                    "%s while making AJAX request: %s",
                    e.name, 
                    e.message
                );

                request.onreadystatechange = null;
                request = null;

                if ( async ) {
                    callback();
                }
            }

            return async ? null : request;
        },


        /**
         * Loads a Deep Zoom Image description from a url or XML string and
         * provides a callback hook for the resulting Document
         * @function
         * @name OpenSeadragon.createFromDZI
         * @param {String} xmlUrl
         * @param {String} xmlString
         * @param {Function} callback
         */
        createFromDZI: function( dzi, callback ) {
            var async       = typeof ( callback ) == "function",
                xmlUrl      = dzi.substring(0,1) != '<' ? dzi : null,
                xmlString   = xmlUrl ? null : dzi,
                error       = null,
                urlParts,
                filename,
                lastDot,
                tilesUrl;


            if( xmlUrl ){
                urlParts = xmlUrl.split( '/' );
                filename = urlParts[ urlParts.length - 1 ];
                lastDot  = filename.lastIndexOf( '.' );

                if ( lastDot > -1 ) {
                    urlParts[ urlParts.length - 1 ] = filename.slice( 0, lastDot );
                }

                tilesUrl = urlParts.join( '/' ) + "_files/";
            }

            function finish( func, obj ) {
                try {
                    return func( obj, tilesUrl );
                } catch ( e ) {
                    if ( async ) {
                        return null;
                    } else {
                        throw e;
                    }
                }
            }

            if ( async ) {
                if ( xmlString ) {
                    window.setTimeout( function() {
                        var source = finish( processDZIXml, parseXml( xmlString ) );
                        // call after finish sets error
                        callback( source, error );    
                    }, 1);
                } else {
                    $.makeAjaxRequest( xmlUrl, function( xhr ) {
                        var source = finish( processDZIResponse, xhr );
                        // call after finish sets error
                        callback( source, error );
                    });
                }

                return null;
            }

            if ( xmlString ) {
                return finish( 
                    processDZIXml,
                    parseXml( xmlString ) 
                );
            } else {
                return finish( 
                    processDZIResponse, 
                    $.makeAjaxRequest( xmlUrl )
                );
            }
        }

    });

    /**
     * @private
     * @inner
     * @function
     * @param {Element} element 
     * @param {Boolean} [isFixed]
     * @returns {Element}
     */
    function getOffsetParent( element, isFixed ) {
        if ( isFixed && element != document.body ) {
            return document.body;
        } else {
            return element.offsetParent;
        }
    };

    /**
     * @private
     * @inner
     * @function
     * @param {XMLHttpRequest} xhr
     * @param {String} tilesUrl
     */
    function processDZIResponse( xhr, tilesUrl ) {
        var status,
            statusText,
            doc = null;

        if ( !xhr ) {
            throw new Error( $.getString( "Errors.Security" ) );
        } else if ( xhr.status !== 200 && xhr.status !== 0 ) {
            status     = xhr.status;
            statusText = ( status == 404 ) ? 
                "Not Found" : 
                xhr.statusText;
            throw new Error( $.getString( "Errors.Status", status, statusText ) );
        }

        if ( xhr.responseXML && xhr.responseXML.documentElement ) {
            doc = xhr.responseXML;
        } else if ( xhr.responseText ) {
            doc = parseXml( xhr.responseText );
        }

        return processDZIXml( doc, tilesUrl );
    };

    /**
     * @private
     * @inner
     * @function
     * @param {Document} xmlDoc
     * @param {String} tilesUrl
     */
    function processDZIXml( xmlDoc, tilesUrl ) {

        if ( !xmlDoc || !xmlDoc.documentElement ) {
            throw new Error( $.getString( "Errors.Xml" ) );
        }

        var root     = xmlDoc.documentElement,
            rootName = root.tagName;

        if ( rootName == "Image" ) {
            try {
                return processDZI( root, tilesUrl );
            } catch ( e ) {
                throw (e instanceof Error) ? 
                    e : 
                    new Error( $.getString("Errors.Dzi") );
            }
        } else if ( rootName == "Collection" ) {
            throw new Error( $.getString( "Errors.Dzc" ) );
        } else if ( rootName == "Error" ) {
            return processDZIError( root );
        }

        throw new Error( $.getString( "Errors.Dzi" ) );
    };

    /**
     * @private
     * @inner
     * @function
     * @param {Element} imageNode
     * @param {String} tilesUrl
     */
    function processDZI( imageNode, tilesUrl ) {
        var fileFormat    = imageNode.getAttribute( "Format" ),
            sizeNode      = imageNode.getElementsByTagName( "Size" )[ 0 ],
            dispRectNodes = imageNode.getElementsByTagName( "DisplayRect" ),
            width         = parseInt( sizeNode.getAttribute( "Width" ) ),
            height        = parseInt( sizeNode.getAttribute( "Height" ) ),
            tileSize      = parseInt( imageNode.getAttribute( "TileSize" ) ),
            tileOverlap   = parseInt( imageNode.getAttribute( "Overlap" ) ),
            dispRects     = [],
            dispRectNode,
            rectNode,
            i;

        if ( !imageFormatSupported( fileFormat ) ) {
            throw new Error(
                $.getString( "Errors.ImageFormat", fileFormat.toUpperCase() )
            );
        }

        for ( i = 0; i < dispRectNodes.length; i++ ) {
            dispRectNode = dispRectNodes[ i ];
            rectNode     = dispRectNode.getElementsByTagName( "Rect" )[ 0 ];

            dispRects.push( new $.DisplayRect(
                parseInt( rectNode.getAttribute( "X" ) ),
                parseInt( rectNode.getAttribute( "Y" ) ),
                parseInt( rectNode.getAttribute( "Width" ) ),
                parseInt( rectNode.getAttribute( "Height" ) ),
                0,  // ignore MinLevel attribute, bug in Deep Zoom Composer
                parseInt( dispRectNode.getAttribute( "MaxLevel" ) )
            ));
        }
        return new $.DziTileSource(
            width, 
            height, 
            tileSize, 
            tileOverlap,
            tilesUrl, 
            fileFormat, 
            dispRects
        );
    };

    /**
     * @private
     * @inner
     * @function
     * @param {Document} errorNode
     * @throws {Error}
     */
    function processDZIError( errorNode ) {
        var messageNode = errorNode.getElementsByTagName( "Message" )[ 0 ],
            message     = messageNode.firstChild.nodeValue;

        throw new Error(message);
    };

    /**
     * Reports whether the image format is supported for tiling in this
     * version.
     * @private
     * @inner
     * @function
     * @param {String} [extension]
     * @returns {Boolean}
     */
    function imageFormatSupported( extension ) {
        extension = extension ? extension : "";
        return !!FILEFORMATS[ extension.toLowerCase() ];
    };

    /**
     * Parses an XML string into a DOM Document.
     * @private
     * @inner
     * @function
     * @name OpenSeadragon.parseXml
     * @param {String} string
     * @returns {Document}
     */
    function parseXml( string ) {
        //TODO: yet another example where we can determine the correct
        //      implementation once at start-up instead of everytime we use
        //      the function.
        var xmlDoc = null,
            parser;

        if ( window.ActiveXObject ) {

            xmlDoc = new ActiveXObject( "Microsoft.XMLDOM" );
            xmlDoc.async = false;
            xmlDoc.loadXML( string );

        } else if ( window.DOMParser ) {

            parser = new DOMParser();
            xmlDoc = parser.parseFromString( string, "text/xml" );
            
        } else {
            throw new Error( "Browser doesn't support XML DOM." );
        }

        return xmlDoc;
    };
    
}( OpenSeadragon ));
