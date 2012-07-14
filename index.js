/*
* Expression parser
* @autor: anpakddd@gmail.com
* @version: 1.0
* @fileOverview
*	This module parse expression into RPN (reverse polish notation see http://en.wikipedia.org/wiki/Reverse_Polish_notation)
* The expression 
* a || b || c && g || (d && e || f)
* will be parsed into 
* [ {isOperator: false, val:'a'}, 
	{isOperator: false, val:'b'}, 
	{isOperator: true, val:'||'}, 
	{isOperator: false, val:'c'}, 
	{isOperator: true, val:'||'}, 
	{isOperator: false, val:'g'}, 
	{isOperator: true, val:'&&'}, 
	{isOperator: false, val:'d'}, 
	{isOperator: false, val:'e'},
	{isOperator: true, val:'&&'}, 
	{isOperator: false, val:'f'}, 
	{isOperator: true, val:'||'}, 
	{isOperator: true, val:'||'} 
 ] structure 
* that allow us to execute it throught very simple finite state machine.
* Module has method .parse() that takes expression and return cursor object that has simple standart interface:
 	cursor.next()
 	cursor.current()
 	cursor.key()
 	cursor.rewind()
 	cursor.valid()
 	cursor.hasNext()
 	cursor.toArray()
* 
* @example 
* var ExpressionParser = require('expression-parser'),
* 	  expressionParser = new ExpressionParser(conf);

  var doSimpleOperation = function( operator, operand1, operand2 ){
		...
		//some simple logic
		...
		return resultOfoperation
  }
* var stack = [],
*     cursor = expressionParser.parse("a || b || c && g || (d && e || f)");
*
*	do{
*		if(cursor.current().isOperator){
*			stack.push(doSimpleOperation(cursor.current().val, stack.pop().val, stack.pop().val));
*			continue;
*		}
*		stack.push(cursor.current());		
*	}while(cursor.next());
*
*  var result = stack.pop().val;
*/

 var priorities = {
		'(':0, 
		')': 0, 
		'+': 2, 
		'-': 2, 
		'&&': 1, 
		'||': 1, 
		'*': 3, 
		'\\': 3
},
popUpImmediately = {
	'||' : true,
	'&&' : true
},
brackets = {
	'(' : true,
	')'	: true
};

var _M = module.exports = function(conf){
	this.popUpImmediately = popUpImmediately;
	this.priorities = priorities;
	this.brackets = brackets;

	for(var i in conf){
		this[i] = conf[i];
	};
}

var ptp = _M.prototype;

ptp.parse = function(expression, map){

	var env = {
		stack: [],
		reversePolish: []
	},
	matched;

	// cut string by chunk
	// matched values in indexes: 0 - all; 1 - operand, may be with brackets; 2 - operator
	while( matched = expression.match(/^([^|&]+)([()]{2}|[|&]{2})/) ){
		
		env = this._reduceToPolishExpr(env, {operandStr: matched[1], operatorStr: matched[2]});
		// cut matched string from original string
		expression = expression.replace(matched[0], '').trim();
	}
	env = this._reduceToPolishExpr(env, {operandStr: expression});
	expression = '';

	env.reversePolish = env.reversePolish.concat(env.stack.reverse());
	
	return new Cursor(env.reversePolish, this.priorities, map);
}

// like reduce function
ptp._reduceToPolishExpr = function(prev, chunk, callCounter){

	var matchedOperand = (chunk.operandStr && chunk.operandStr.trim()) || null,
		matchedOperator = (chunk.operatorStr && chunk.operatorStr.trim()) || null,
		bracket = null;
		!prev.hasOwnProperty('stack') && (prev.stack = []);
		!prev.hasOwnProperty('reversePolish') && (prev.reversePolish = []);
		!prev.hasOwnProperty('callCounter') && (prev.callCounter = 0);

	// increace the callCounter
	prev.callCounter++;

	// match bracket if exists
	while( bracket = bracketTailMatch(matchedOperand) ){		
		// if bracket exists - delete it from begin or tail string.
		// And push it into stack;
		bracket && prev.stack.push(bracket) && (matchedOperand = matchedOperand.replace(new RegExp('^\\' + bracket + '|\\' + bracket + '$'),''));
	}
	// push matched operator into result
	prev.reversePolish.push(matchedOperand);
	
	if (prev.stack.length){
		var lastElement = prev.stack[prev.stack.length-1];
		// if last element in stack has to pop up immediately then pop up it!
		this.popUpImmediately[lastElement] && prev.reversePolish.push(prev.stack.pop());
		// if detect closing bracket then pop up operators in bracket into reversePolish
		if (lastElement === ')') {
			prev.reversePolish = prev.reversePolish.concat(bracketPop.call(prev.stack).reverse());
			
			lastElement = prev.stack[prev.stack.length-1];
			prev.stack.length && !this.brackets[lastElement] && prev.reversePolish.push(prev.stack.pop());			
		}
	}

	// push operator into prev.stack with priority
	matchedOperator && (prev.stack = pushWithPriority(prev.stack, matchedOperator, this.priorities));
	
	return prev;
}

var pushWithPriority = function (array, element, priorities){
	
	('undefined' === typeof priorities) && (priorities = {'(':1, ')':1, '+': 2, '-': 2, '&&': 2, '||': 2, '*': 3, '\\': 3});

	var tmpStack = [],
	    result = [].concat(array);
	while( priorities[result[result.length - 1]] > priorities[element] ){
		tmpStack.push(result.pop());
	}

	result.push(element);

	return result.concat(tmpStack.reverse());
}

var bracketTailMatch = function(string){
	var bracket = string.match(/[()]/);
	return bracket && bracket[0] || null;
}

var bracketPop = function(){
	var res = ~this.lastIndexOf('(') && this.splice(this.lastIndexOf('(')) || [];
	res.shift();
	(res[res.length-1] === ')') && res.pop();
	return res;
}

var Cursor = function(array, validOperators, map){
	this.reversePolish = array;
	this.position = 0;	
	this.validOperators = validOperators;
	this.map = map || null;
	this._current = this._constructCurrent();
} 

Cursor.prototype = {
	_constructCurrent : function(){
		return {
			isOperator : this.validOperators[this.reversePolish[this.position]] ? true : false,
			val : this.map ? this.map(this.reversePolish[this.position]) : this.reversePolish[this.position]
		}
	},
	current : function()
	{		
		return this._current;
	},
	 
	key : function()
	{		
		return this.position;
	},
	 
	next : function()
	{	
		this.position++;
		if (!this.valid(this.position)) return null;

		this._current = this._constructCurrent();
		
		return this._current;
	},
	 
	rewind : function()
	{		
		this.position = -1;

		return this.next();
	},
	 
	valid : function(position)
	{		
		return (position < this.reversePolish.length) ? true: false;
	},

	toArray: function(){
		return this.reversePolish.map(function(el){
			return {
				isOperator: this.validOperators[el] ? true : false, 
				val: this.map ? this.map(el) : el
			};
		}, this);
	},

	hasNext : function(){
		return this.valid(this.position + 1);
	}
}