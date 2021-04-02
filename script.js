let Calculator = {
    add:      (x,y) => {return x + y},
    subtract: (x,y) => {return x - y},
    multiply: (x,y) => {return x * y},
    divide:   (x,y) => {return (y !== 0 ?  x / y : alert("Can't divide by zero."))}, 
    operate:  (op, x, y) => {return Calculator[op](x,y);} 
}

let States = {
    start: 'S',
    firstNumInstance: 'N1',
    secondNumInstance: 'N2',
    firstOpInstance: 'O1',
    secondOpInstance: 'O2',
    evaluation: 'E',
    
}

let screenVal = '', secondOperand = '', currOp = '', currState = States.start;
const digitClass = 'digit', opClass = 'op', evalCalss = 'evaluation', otherClass = 'other'; 
const container = document.querySelector('.container');
const screen = container.querySelector('#screen');
 
container.addEventListener('click', onClick, false);

function onClick(event){
    let shouldDisplay;
    switch (event.target.className){
        case digitClass: shouldDisplay = handleDigitClick(event.target.textContent);   break;
        case opClass:    shouldDisplay = handleOpClick(event.target.id);               break;
        case evalCalss:  shouldDisplay = handleEvaluation();                           break;
        case otherClass: shouldDisplay = handleOtherClick(event.target.id);            break;
        default: shouldDisplay = false;
    }
    if (shouldDisplay)
        screen.textContent = screenVal;
        
}

function handleDigitClick(digitStr){
    switch(currState){
        case States.start:
        case States.evaluation:
            screenVal = digitStr;
            // Transition to next state.
            currState = States.firstNumInstance; 
            break;
        
        case States.firstNumInstance:
        case States.secondNumInstance:
            // The only action here is to append the digit to the current screen value
            screenVal += digitStr;
            break;
        
        case States.firstOpInstance:
        case States.secondOpInstance:
            secondOperand = screenVal;    
            screenVal = digitStr;
            currState = States.secondNumInstance;
            break;
        
        default: return false;
    }
    
    return true;
}

function handleOpClick(opId){
    let shouldUpdateScreen = false;
    let isEvalSucceeded = true;
    // TODO - Highlight op button
    switch (currState){
        case States.firstNumInstance:
            currOp = opId;
            currState = States.firstOpInstance;
            break;
        case (States.secondNumInstance):
            isEvalSucceeded = evaluate()
            shouldUpdateScreen = true;
            // No break
        case (States.evaluation):
            if (isEvalSucceeded){
                currOp = opId;
                currState = States.secondOpInstance;
            }
            
    }
    
    return shouldUpdateScreen;
}

function handleEvaluation(){
    if (currState === States.secondNumInstance){
        currState = States.evaluation;
        evaluate();
        return true;
    }

    return false;
}

function handleOtherClick(otherId){
    if (otherId === 'reset'){
        currState = States.start;
        screenVal = '0';
        return true;
    }
    return false;
}



function evaluate(){
    screenVal = Calculator.operate(currOp, parseInt(secondOperand), parseInt(screenVal));
    
    if (isNaN(screenVal)){
        screenVal = '0';
        currState = States.start;
        return false;
        
    }

    return true;

}
