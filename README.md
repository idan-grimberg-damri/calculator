Left to:
* Handle Deletion.
* style.

The solution is based on this finite state diagram that I built for this project:

![calculator finite state diagram](https://i.imgur.com/Y24XDUj.png)


States
-
S :  Start.

D1:  First operand instance.

O1:  First operator instance.

D2:  Second operand instance.

O2:  Second operator instance.

E:   Evalutation.

DPi : User entered a decimal point at the state before DPi (1 <= i <= 6).

Actions (User is pressing on a button)
-
d:  Digit .

dp: Decimal point.

op: Operator.

=:  Evaluate.

Notes
-
* I didn't show the 'Delete' action explicitly in the diagram since all we need to do is getting back to the previous state while restoring\changing relevant data.
* There can be also a 'Zero' state between the starting state and the first operand instance state to handle the case where you can't append digits to zero. 
However, I handled this case artificially in the source code.
* In addition to the previous note, I handled other cases artifficially in the source code to avoid adding more states. For example, if the user is in state  N1 and his actions are **dp, d, dp** then the input is not valid, therefore I handled this case artifficially in the source code.

