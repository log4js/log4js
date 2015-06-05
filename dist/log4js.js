(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global require, module, exports */
var LoggingEnhancer = require('../bower_components/better-logging-base/dist/logging-enhancer.min').LoggingEnhancer;

(function() {
    'use strict';

    var ConsoleLogger = function(sprintf, moment) {
        var self = this;

        var logEnhancer = new LoggingEnhancer(sprintf, moment);

        this.logLevels = logEnhancer.logLevels;
        this.LEVEL = logEnhancer.LEVEL;

        this.datetimePattern = 'LLL'; // default datetime stamp pattern, overwrite in config phase
        this.datetimeLocale = 'en';

        var hasWindow = typeof window !== 'undefined';
        this.datetimeLocale = (hasWindow && (window.navigator.userLanguage || window.navigator.language)) || 'en';

        this.prefixPattern = '%s::[%s]> '; // default prefix pattern, overwrite in config phase

        // keep originals for global logging (else context loggers have double output)
        var logDebug, logLog, logInfo, logWarn, logError;

        this.enhanceLogging = function(console) {
            if (!logDebug) {
                logDebug = console.debug;
                logLog = console.log;
                logInfo = console.info;
                logWarn = console.warn;
                logError = console.error;
            }

            // override global logging functions to add at least a timestamp
            console.trace = logEnhancer.enhanceLogging(bind(console.debug), logEnhancer.LEVEL.TRACE, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);
            console.debug = logEnhancer.enhanceLogging(bind(console.debug), logEnhancer.LEVEL.DEBUG, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);
            console.log = logEnhancer.enhanceLogging(bind(console.log), logEnhancer.LEVEL.INFO, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);
            console.info = logEnhancer.enhanceLogging(bind(console.info), logEnhancer.LEVEL.INFO, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);
            console.warn = logEnhancer.enhanceLogging(bind(console.warn), logEnhancer.LEVEL.WARN, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);
            console.error = logEnhancer.enhanceLogging(bind(console.error), logEnhancer.LEVEL.ERROR, 'global', self, self.datetimePattern, self.datetimeLocale, self.prefixPattern);

            console.getLogger = function(context) {
                var logger = {
                    trace: logEnhancer.enhanceLogging(bind(logDebug), logEnhancer.LEVEL.TRACE, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern),
                    debug: logEnhancer.enhanceLogging(bind(logDebug), logEnhancer.LEVEL.DEBUG, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern),
                    log: logEnhancer.enhanceLogging(bind(logLog), logEnhancer.LEVEL.INFO, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern),
                    info: logEnhancer.enhanceLogging(bind(logInfo), logEnhancer.LEVEL.INFO, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern),
                    warn: logEnhancer.enhanceLogging(bind(logWarn), logEnhancer.LEVEL.WARN, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern),
                    error: logEnhancer.enhanceLogging(bind(logError), logEnhancer.LEVEL.ERROR, context, self, self.datetimePattern, self.datetimeLocale, self.prefixPattern)
                };
                return logger;
            };

            // check optional dependencies
            if (!sprintf) {
                console.warn('[console-logger] sprintf.js not found: https://github.com/alexei/sprintf.js, using fixed layout pattern "%s::[%s]> "');
            }
            if (!moment) {
                console.warn('[console-logger] moment.js not found: http://momentjs.com, using non-localized simple Date format');
            }
            
            var logger = logEnhancer.enhanceLogging(bind(logInfo), logEnhancer.LEVEL.INFO, 'console-logger', this, this.datetimePattern, this.datetimeLocale, this.prefixPattern);
            logger('logging enhancer initiated');
        };
    };

    // manage dependency exports
    if (typeof module !== 'undefined') {
        module.exports.ConsoleLogger = ConsoleLogger;
    }
    else if (typeof exports !== 'undefined') {
        exports.ConsoleLogger = ConsoleLogger;
    }
    else if (typeof window === 'undefined') {
        throw new Error('unable to expose ConsoleLogger: no module, exports object and no global window detected');
    }

    if (typeof window !== 'undefined') {
        window.consoleLogger = new ConsoleLogger(window.sprintf, window.moment);
    }

    function bind(func) {
        return function() {
            func.apply(console, arguments);
        };
    }
}());
},{"../bower_components/better-logging-base/dist/logging-enhancer.min":2}],2:[function(require,module,exports){
!function(){"use strict";var n=function(n,e){var t=this;this.LEVEL={TRACE:4,DEBUG:3,INFO:2,WARN:1,ERROR:0,OFF:-1},this.enhanceLogging=function(o,r,i,u,l,f,a){function c(n,e,o){function r(n,e){if(n){if(void 0!==e.logLevels[n])return e.logLevels[n];if(-1!==n.indexOf("."))return r(n.substring(0,n.lastIndexOf(".")),e)}return void 0!==e.logLevels["*"]?e.logLevels["*"]:t.LEVEL.TRACE}return e>t.LEVEL.OFF&&e<=r(n,o)}function s(e,o,r,i,u){function l(e){var o="undefined"!=typeof n,r=o&&e.length>=2&&"string"==typeof e[0]&&-1!==e[0].indexOf("%");if(r)try{var i=t.countSprintfHolders(e[0]);i>0&&(e[0]=n.apply(null,e),e.splice(1,i))}catch(u){e.unshift(u)}return e}var f=d(o,r,i,u),a=l([].slice.call(e));return[f].concat([].slice.call(a))}function d(t,o,r,i){var u="";if("undefined"!=typeof e)u=e().locale(r).format(o);else{var l=new Date,f=(new Date).toTimeString().match(/^([0-9]{2}:[0-9]{2}:[0-9]{2})/)[0];u=l.getDate()+"-"+(l.getMonth()+1)+"-"+l.getFullYear()+" "+f}return"undefined"!=typeof n?n(i,u,t):u+"::["+t+"]> "}return u.logLevels=u.logLevels||[],function(){if(c(i,r,u)){var n=s(arguments,i,l,f,a);return o.apply(null,n),n}return null}},t.countSprintfHolders=function(e){function t(n){return function(){r=Math.max(r,n)}}var o=/\x25\([a-zA-Z0-9_]+\)[b-fijosuxX]/.test(e);if(o)return 1;var r=0;return n(e,t(1),t(2),t(3),t(4),t(5),t(6),t(7),t(8),t(9),t(10)),r}};if("undefined"!=typeof module)module.exports.LoggingEnhancer=n;else if("undefined"!=typeof exports)exports.LoggingEnhancer=n;else{if("undefined"==typeof window)throw new Error("unable to expose LoggingEnhancer: no module, exports object and no global window detected");window.loggingEnhancer=new n(window.sprintf,window.moment)}}();
},{}]},{},[1]);
