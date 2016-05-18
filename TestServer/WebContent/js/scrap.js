function exampleClosureForm(arg1, arg2){
    var localVar = 8;
    function exampleReturned(innerArg){
        return ((arg1 + arg2)/(innerArg + localVar));
    }
    /* return a reference to the inner function defined as -
       exampleReturned -:-
    */
    return exampleReturned;
}

var globalVar = exampleClosureForm(2, 4);

var x = globalVar(8);

alert(x);