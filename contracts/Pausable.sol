pragma solidity ^0.4.13;

import "./Owned.sol";
import "./interfaces/PausableI.sol";

contract Pausable is Owned, PausableI {

    bool paused;

    /**
     * Event emitted when a new paused state has been set.
     * @param sender The account that ran the action.
     * @param newPausedState The new, and current, paused state of the contract.
     */
    event LogPausedSet(address indexed sender, bool indexed newPausedState);


    modifier whenPaused() {
        require(paused == true);
        _;
    }

    modifier whenNotPaused() {
        require(paused == false);
        _;
    }

    function Pausable(bool _paused) public {
        paused = _paused;
    }

    /**
     * Sets the new paused state for this contract.
     *     It should roll back if the caller is not the current owner of this contract.
     *     It should roll back if the state passed is no different from the current.
     * @param _newState The new desired "paused" state of the contract.
     * @return Whether the action was successful.
     * Emits LogPausedSet.
     */
    function setPaused(bool _newState) fromOwner() returns(bool success) {
        require(_newState != paused);
        LogPausedSet(msg.sender, _newState);
        paused = _newState;
        return true;
    }

    /**
     * @return Whether the contract is indeed paused.
     */
    function isPaused() constant returns(bool isIndeed) {
        return paused;
    }

    /*
     * You need to create:
     *
     * - a contract named `Pausable` that:
     *     - is a `OwnedI` and a `PausableI`.
     *     - has a modifier named `whenPaused` that rolls back the transaction if the
     * contract is in the `false` paused state.
     *     - has a modifier named `whenNotPaused` that rolls back the transaction if the
     * contract is in the `true` paused state.
     *     - has a constructor that takes one `bool` parameter, the initial paused state.
     */
}
