
let Calculator = {
    add: (x, y) => { return x + y },
    subtract: (x, y) => { return x - y },
    multiply: (x, y) => { return x * y },
    divide: (x, y) => { return (y !== 0 ? x / y : alert("Can't divide by zero.")) },
    operate: (op, x, y) => { return Calculator[op](x, y); }
}

let States = {
    start: 'S',
    firstNumInstance: 'N1',
    secondNumInstance: 'N2',
    firstOpInstance: 'O1',
    secondOpInstance: 'O2',
    evaluation: 'E',
    decPointStart: 'DP1',
    decPointFirstNumInstance: 'DP2',
    decPointFirstOpInstance: 'DP3',
    decPointSecondNumInstance: 'DP4',
    decPointSecondOpInstance: 'DP5',
    decPointEvaluation: 'DP6',
}

let screenVal = '', secondOperand = '', currOp = '', currState = States.start, canUseDecimalPoint = true;
const digitClass = 'digit', opClass = 'op', evalCalss = 'evaluation', decPointClass = 'dec-point', otherClass = 'other';
const container = document.querySelector('.container');
const screen = container.querySelector('#screen');

container.addEventListener('click', onClick, false);

function onClick(event) {
    let shouldDisplay;
    switch (event.target.className) {
        case digitClass: shouldDisplay = handleDigitClick(event.target.textContent); break;
        case opClass: shouldDisplay = handleOpClick(event.target.id); break;
        case evalCalss: shouldDisplay = handleEvaluation(); break;
        case decPointClass: shouldDisplay = handleDecPoint(); break;
        case otherClass: shouldDisplay = handleOtherClick(event.target.id); break;
        default: shouldDisplay = false;
    }
    if (shouldDisplay)
        screen.textContent = screenVal;

}

function handleDigitClick(digitStr) {
    if (screenVal === '0' && screenVal.length === 1 && (currState === States.firstNumInstance || currState === States.secondNumInstance))
        return false;

    screenVal += digitStr;

    let wasInNonDecPointState = handleNonDecPointStates(digitStr);
    if (!wasInNonDecPointState)
        handleDecPointStates();

    return true;
}
function handleNonDecPointStates(digitStr) {
    switch (currState) {
        case States.start:
        case States.evaluation:
            screenVal = digitStr;
            // Transition to next state.
            currState = States.firstNumInstance;
            break;

        case States.firstOpInstance:
        case States.secondOpInstance:
            // Because in the caller we updated screenVal. However, in this case the updated value is not suitable.
            secondOperand = screenVal.slice(0, -1);
            screenVal = digitStr;
            currState = States.secondNumInstance;
            break;

        case States.firstNumInstance:
        case States.secondNumInstance:
            break;

        default: return false;
    }

    return true;
}


function handleDecPointStates() {
    switch (currState) {
        case States.decPointStart:
        case States.decPointFirstNumInstance:
        case States.decPointEvaluation:
            currState = States.firstNumInstance;
            break;

        case States.decPointFirstOpInstance:
        case States.decPointSecondOpInstance:
        case States.decPointSecondNumInstance:
            currState = States.secondNumInstance;
            break;
    }
}

function handleOpClick(opId) {
    let shouldUpdateScreen = false, isEvalSucceeded = true, prevDecPointUsedVal = canUseDecimalPoint;
    canUseDecimalPoint = true;
    // TODO - Highlight op button
    switch (currState) {
        case States.firstNumInstance:
            currOp = opId;
            currState = States.firstOpInstance;
            break;
        case (States.secondNumInstance):
            isEvalSucceeded = evaluate()
            shouldUpdateScreen = true;
        // No break
        case (States.evaluation):
            if (isEvalSucceeded) {
                currOp = opId;
                currState = States.secondOpInstance;
            }
        default: canUseDecimalPoint = prevDecPointUsedVal;

    }

    return shouldUpdateScreen;
}

function handleEvaluation() {
    if (currState === States.secondNumInstance) {
        currState = States.evaluation;
        evaluate();
        canUseDecimalPoint = true;
        return true;
    }

    return false;
}

function handleOtherClick(otherId) {
    if (otherId === 'reset') {
        currState = States.start;
        screenVal = '0';
        return true;
    }
    return false;
}

function handleDecPoint() {
    if (!canUseDecimalPoint)
        return false;

    canUseDecimalPoint = !canUseDecimalPoint;

    let prevScreenVal = screenVal;
    screenVal = '0.';

    switch (currState) {
        case States.start:
            currState = States.decPointStart;
            break;
        case States.firstNumInstance:
            currState = States.decPointFirstNumInstance;
            screenVal = prevScreenVal + '.';
            break;
        case States.firstOpInstance:
            secondOperand = prevScreenVal;
            currState = States.decPointFirstOpInstance;
            break;
        case States.secondNumInstance:
            screenVal = prevScreenVal + '.';
            currState = States.decPointSecondNumInstance;
            break;
        case States.secondOpInstance:
            secondOperand = prevScreenVal;
            currState = States.decPointSecondOpInstance;
            break;
        case States.evaluation:
            currState = States.decPointEvaluation;
            break;
        default:
            screenVal = prevScreenVal;
            return false;

    }

    return true;
}

function evaluate() {
    screenVal = Calculator.operate(currOp, parseFloat(secondOperand), parseFloat(screenVal));

    if (isNaN(screenVal)) {
        screenVal = '0';
        currState = States.start;
        return false;

    }

    screenVal = parseFloat(screenVal.toFixed(3));
    return true;

}
