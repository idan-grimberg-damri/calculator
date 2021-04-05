
// Calculator object.
let Calculator = {
    add:      (x, y) => { return x + y },
    subtract: (x, y) => { return x - y },
    multiply: (x, y) => { return x * y },
    divide:   (x, y) => { return (y !== 0 ? x / y : alert("Can't divide by zero.")) },
    operate:  (op, x, y) => { return Calculator[op](x, y); }
}
// All states in the calculator finite state diagram.
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

const digitClass = 'digit', opClass = 'op', evalCalss = 'evaluation', decPointClass = 'dec-point',
    resetClass = 'reset', deleteClass = 'delete';

const container = document.querySelector('.container');
const screen = container.querySelector('#screen');

container.addEventListener('click', onClick, false);

// Handle UI clicks.
function onClick(event) {
    let shouldDisplay;
    switch (event.target.className) {
        case digitClass: shouldDisplay = handleDigitClick(event.target.textContent); break;
        case opClass: shouldDisplay = handleOpClick(event.target.id); break;
        case evalCalss: shouldDisplay = handleEvaluationClick(); break;
        case decPointClass: shouldDisplay = handleDecPointClick(); break;
        case resetClass: shouldDisplay = handleResetClick(); break;
        case deleteClass: shouldDisplay = handledeleteClick(); break;
        default: shouldDisplay = false;
    }
    // If the user clicked on a valid button in the current state of the computation then update the display.
    if (shouldDisplay)
        screen.textContent = screenVal;

}
/**
 * Handle the case where the user want to delete the last character in the display.
 * @returns true if the display will update, false otherwise .
 */
function handledeleteClick() {
    if (screenVal === '')
        return false;
    // If the last character is a decimal point then now the user can use decimal point again,
    // since we are deleting the current decimal point and there can be only one decimal point in the display.
    if (screenVal[screenVal.length - 1] === '.')
        canUseDecimalPoint = true;
    // Get al the display value except the last character. 
    screenVal = screenVal.slice(0, -1);
    // true if the current last character is a decimal point.
    isLastCharDecPoint = screenVal[screenVal.length - 1] === '.';
    // Act according to the current state.
    switch (currState) {
        case States.decPointStart:
        case States.decPointFirstNumInstance:
        case States.decPointEvaluation:
            currState = States.firstNumInstance;
            break;

        case States.decPointFirstOpInstance:
        case States.decPointSecondOpInstance:
                currState = States.secondNumInstance;
                break;

        case States.firstNumInstance:
            if (isLastCharDecPoint)
                currState = States.decPointFirstNumInstance;
            break;

        case States.firstOpInstance:
            currState = States.firstNumInstance;
            if (screenVal.includes('.')) { 
                canUseDecimalPoint = false;
                if (isLastCharDecPoint)
                    currState = States.decPointFirstNumInstance;

            }
            break;
        
        case States.secondNumInstance:
            if (isLastCharDecPoint)
                currState = States.decPointSecondNumInstance;
            break;
        
        case States.secondOpInstance:
        case States.evaluation:
            screenVal = '0';
            currState = States.start;
            break;

    }

    return true;
}
/**
 * Handle the case where the user clicks on a digit.
 * @returns true if the display will update, false otherwise.
 * @param {String} digitStr The digit that the user clicked on.
 */
function handleDigitClick(digitStr) {
    // You can't append digits with a leading zero.
    if (screenVal === '0' && (currState === States.firstNumInstance || currState === States.secondNumInstance))    
            return false;
     
    // Append to the display the user's input.
    screenVal += digitStr;
    // true if the curren state is not representing a decimal point state, false otherwise.
    // If the currentState is not a decimal point state then handle this case.
    let wasInNonDecPointState = handleNonDecPointStates(digitStr);
    if (!wasInNonDecPointState)
        handleDecPointStates();

    return true;
}
/**
 * Handle the case where the user clicks on a digit and the current state is not a decimal point state.
 * @returns true if the current state represents a state that is not a decimal point state.
 * @param {String} digitStr The digit that the user clicked on.
 */
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

/**
 * Handle the case where the user clicks on a digit and the current state represents a decimal point state.
 */
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

/**
 * Handle the case where the user clicks on a an operation.
 * @returns true if the display will update, false otherwise.
 * @param {String} digitStr The digit that the user clicked on.
 */
function handleOpClick(opId) {
    if (isEmptyScreen())
        return false;

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
/**
 * Handle the case where the user clicks on the equals button.
 * @returns true if the display will update, false otherwise.
 */
function handleEvaluationClick() {
    if (currState === States.secondNumInstance && !isEmptyScreen()) {
        currState = States.evaluation;
        evaluate();
        canUseDecimalPoint = true;
        return true;
    }

    return false;
}
/**
 * Handle the case where the user clicks on the reset button.
 * @returns true since we always need to the update the display if t he user pressed the reset button.
 */
function handleResetClick() {
    currState = States.start;
    screenVal = '0';
    return true;
}
/**
 * Handle the case where the user clicks on a decimal point .
 * @returns true if the display will update, false otherwise.
 */
function handleDecPointClick() {
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
/**
 * Perform the current operation on the current operands.
 * @returns true if the display will update, false otherwise.
 */
function evaluate() {
    screenVal = Calculator.operate(currOp, parseFloat(secondOperand), parseFloat(screenVal));
    // If the current display is not a number.
    if (isNaN(screenVal)) {
        screenVal = '0';
        currState = States.start;
        return false;

    }

    screenVal = parseFloat(screenVal.toFixed(3)).toString();
    return true;

}
/**
 * @returns true if the display is empty, false otherwise.
 */
function isEmptyScreen() {
    return screenVal === '';
}