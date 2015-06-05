/* global describe, beforeEach, expect, it, fail */

var ConsoleLogger = require('../src/log4js.js').ConsoleLogger;

describe('console-logger', function() {

    var enh, moment, sprintf;

    beforeEach(function resetCounters() {
        moment = require('../bower_components/momentjs/moment.js');
        sprintf = require('../bower_components/sprintf/dist/sprintf.min.js').sprintf;
        enh = new ConsoleLogger(sprintf, moment);
    });
    
    it("should enhance the console globally with current configuration", function() {
        enh.datetimePattern = 'YYYY';
        expectGlobalLog('debug', ['Hello World!'], [moment().year() + '::[global]> ', 'Hello World!']);
        enh.prefixPattern = ':%2$s:';
        expectGlobalLog('debug', ['Hello World!'], [':global:', 'Hello World!']);
        expectGlobalLog('debug', ['Hello World!', 5, { 'this': 'a test'}], [':global:', 'Hello World!', 5, { 'this': 'a test'}]);
        expectGlobalLog('debug', ['Hello %s! %s', 'World', 'yeah!', 5], [':global:', 'Hello World! yeah!', 5]);
    });
    
    it("should provide contextual loggers", function() {
        var enhancedConsole = fakeConsole('warn');
        enh.enhanceLogging(enhancedConsole);
        
        enh.prefixPattern = ':%2$s:';
        var loggerA = enhancedConsole.getLogger('A');
        
        enh.prefixPattern = '>%2$s<';
        var loggerB = enhancedConsole.getLogger('B');
        
        expect(loggerA.warn('Test [%s]', 'A')).toEqual([':A:', 'Test [A]']);
        expect(loggerB.warn('Test [%s]', 'B')).toEqual(['>B<', 'Test [B]']);
    });
    
    it("should work without sprintf and moment", function() {
        enh = new ConsoleLogger(undefined, undefined);
        var enhancedConsole = fakeConsole('warn');
        enh.enhanceLogging(enhancedConsole);
        enh.prefixPattern = '%s:%s:';
        var logger = enhancedConsole.getLogger('dummy');
        
		var dateStr = formatLegacyDatestr();
		
        expect(logger.warn('Hello World! %s', 10)).toEqual([dateStr + '::[dummy]> ', 'Hello World! %s', 10]);
        
        function formatLegacyDatestr() {
    		var d = new Date();
    		var timeStr = new Date().toTimeString().match(/^([0-9]{2}:[0-9]{2}:[0-9]{2})/)[0];
    		return d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + timeStr;
        }
    });
    
    function expectGlobalLog(func, input, output) {
        var c = fakeConsole(func);
        enh.enhanceLogging(c);
        expect(c[func].apply(null, input)).toEqual(output);
    }
    
    function fakeConsole(func) {
        var c = {
            debug: function() {fail('unexpected logging function "debug" invoked');},
            log: function() {fail('unexpected logging function "log" invoked');},
            info: function() {/*don't fail, is used to display inited info*/},
            warn: function() {fail('unexpected logging function "warn" invoked');},
            error: function() {fail('unexpected logging function "error" invoked');}
        };
        c[func] = function() {
            // no fail
        };
        return c;
    }
    
    /*
    console.info('test 1');
    ConsoleLogger.enhanceLogging(console);
    console.info('test 2');
    console.getLogger('local context').info('test 3');
    */
});