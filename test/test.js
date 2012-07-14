var ExpressionParser = require('..');

exports.testIsConstructor = function (test) {
    test.equal(typeof ExpressionParser, 'function');

    test.done();
};

exports.testParse = function (test) {
    var labelExpr = "c && g || ((d && e && df || k) || f) && c",
        expressionParser = new ExpressionParser();

    var cursor = expressionParser.parse(labelExpr);

    test.equal(typeof cursor, 'object');
    test.deepEqual(cursor.toArray(),[
    	{ isOperator: false, val: 'c' },
    	{ isOperator: false, val: 'g' },
    	{ isOperator: true, val: '&&' },
    	{ isOperator: false, val: 'd' },
    	{ isOperator: false, val: 'e' },
    	{ isOperator: true, val: '&&' },
    	{ isOperator: false, val: 'df' },
    	{ isOperator: true, val: '&&' },
    	{ isOperator: false, val: 'k' },
    	{ isOperator: true, val: '||' },
    	{ isOperator: false, val: 'f' },
    	{ isOperator: true, val: '||' },
    	{ isOperator: true, val: '||' },
    	{ isOperator: false, val: 'c' },
    	{ isOperator: true, val: '&&' }
    	]);

    test.done();
};

exports.testCursorNext = function (test) {
    var labelExpr = "c && g || ((d && e && df || k) || f) && c",
        expressionParser = new ExpressionParser();

    var cursor = expressionParser.parse(labelExpr);

    test.equal(typeof cursor, 'object');
    var rpn = cursor.toArray();
    var i=0;
    do{
		test.deepEqual(cursor.current(),rpn[i]);
		i++;
    }while(cursor.next());

    test.done();
};

exports.testCursorRewind = function (test) {
    var labelExpr = "c && g || ((d && e && df || k) || f) && c",
        expressionParser = new ExpressionParser();

    var cursor = expressionParser.parse(labelExpr);

    test.equal(typeof cursor, 'object');
    var rpn = cursor.toArray();
    var i=0;
    do{
		test.deepEqual(cursor.current(),rpn[i]);
		i++;
    }while(cursor.next());
    
    test.equal(cursor.key(), rpn.length);
    test.deepEqual(cursor.rewind(), rpn[0]);
    test.equal(cursor.key(), 0);

    test.done();
};

exports.testCursorHasNext = function (test) {
    var labelExpr = "c && g || ((d && e && df || k) || f) && c",
        expressionParser = new ExpressionParser();

    var cursor = expressionParser.parse(labelExpr);

    test.equal(typeof cursor, 'object');
    var rpn = cursor.toArray();
    var i = 0;
    while(i < rpn.length-1){
    	test.strictEqual(cursor.hasNext(), true);    
    	i++;
    	cursor.next();
    }

    test.strictEqual(cursor.hasNext(), false);    
    test.deepEqual(cursor.rewind(), rpn[0]);
    test.equal(cursor.hasNext(), true);;

    test.done();
};

exports.testParseRealExpression = function (test) {
    var labelExpr = "(http://url/type#a || http://url/type#b) && (http://url/type#c || http://url/type#d)";
        expressionParser = new ExpressionParser();

    var cursor = expressionParser.parse(labelExpr);

    test.equal(typeof cursor, 'object');
    test.deepEqual(cursor.toArray(),[
    	{ isOperator: false, val: 'http://url/type#a' },
    	{ isOperator: false, val: 'http://url/type#b' },
    	{ isOperator: true, val: '||' },
    	{ isOperator: false, val: 'http://url/type#c' },
    	{ isOperator: false, val: 'http://url/type#d' },
    	{ isOperator: true, val: '||' },    	
    	{ isOperator: true, val: '&&' }    	
    	]);	

    test.done();
};