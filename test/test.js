var ExpressionParser = require('..');

// var labelExpr = "(http://data.rian.ru/person#putin+vladimir || http://data.rian.ru/person#medvedev+dmitrij) && (http://data.rian.ru/location#g.+Moskva || http://data.rian.ru/location#Moskovskaja+oblastj)";
// var labelExpr = "(http%3A%2F%2Fdata.rian.ru%2Fperson%23putin%2Bvladimir%20%7C%7C%20http%3A%2F%2Fdata.rian.ru%2Fperson%23medvedev%2Bdmitrij)%20%26%26%20http%3A%2F%2Fdata.rian.ru%2Flocation%23g.%2BMoskva%20%7C%7C%20http%3A%2F%2Fdata.rian.ru%2Flocation%23Moskovskaja%2Boblastj";
// var labelExpr = "http%3A%2F%2Fdata.rian.ru%2Flocation%23g.%2BMoskva%20%7C%7C%20http%3A%2F%2Fdata.rian.ru%2Flocation%23Moskovskaja%2Boblastj%20%26%26%20(http%3A%2F%2Fdata.rian.ru%2Fperson%23putin%2Bvladimir%20%7C%7C%20http%3A%2F%2Fdata.rian.ru%2Fperson%23medvedev%2Bdmitrij)";

var ExpressionParser = require('..');

exports.testIsConstructor = function (test) {
    test.equal(typeof ExpressionParser, 'function');

    test.done();
};

exports.testParse = function (test) {
    var labelExpr = "c && g || ((d && e && df || k) || f) && c",
    // var labelExpr = "c && g || (d && e) && c",
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
    // var labelExpr = "c && g || (d && e) && c",
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
    // var labelExpr = "c && g || (d && e) && c",
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
    // var labelExpr = "c && g || (d && e) && c",
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
    var labelExpr = "(http://data.rian.ru/person#putin+vladimir || http://data.rian.ru/person#medvedev+dmitrij) && (http://data.rian.ru/location#g.+Moskva || http://data.rian.ru/location#Moskovskaja+oblastj)";
    // var labelExpr = "c && g || (d && e) && c",
        expressionParser = new ExpressionParser();

    var cursor = expressionParser.parse(labelExpr);

    test.equal(typeof cursor, 'object');
    test.deepEqual(cursor.toArray(),[
    	{ isOperator: false, val: 'http://data.rian.ru/person#putin+vladimir' },
    	{ isOperator: false, val: 'http://data.rian.ru/person#medvedev+dmitrij' },
    	{ isOperator: true, val: '||' },
    	{ isOperator: false, val: 'http://data.rian.ru/location#g.+Moskva' },
    	{ isOperator: false, val: 'http://data.rian.ru/location#Moskovskaja+oblastj' },
    	{ isOperator: true, val: '||' },    	
    	{ isOperator: true, val: '&&' }    	
    	]);	

    test.done();
};