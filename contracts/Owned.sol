pragma solidity ^0.4.13;

import "./interfaces/OwnedI.sol";

contract Owned is OwnedI {

    address owner;

    /**
     * Event emitted when a new owner has been set.
     * @param previousOwner The previous owner, who happened to effect the change.
     * @param newOwner The new, and current, owner the contract.
     */
    event LogOwnerSet(address indexed previousOwner, address indexed newOwner);


    modifier fromOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
     * constructor
     */
    function Owned() public {
        owner = msg.sender;
    }

    /**
     * Sets the new owner for this contract.
     *     It should roll back if the caller is not the current owner.
     *     It should roll back if the argument is the current owner.
     *     It should roll back if the argument is a 0 address.
     * @param _newOwner The new owner of the contract
     * @return Whether the action was successful.
     * Emits LogOwnerSet.
     */
    function setOwner(address _newOwner) fromOwner() public returns(bool success) {
        require(_newOwner != owner);
        require(_newOwner != address(0));
        LogOwnerSet(owner, _newOwner);
        owner = _newOwner;
        return true;
    }

    /**
     * @return The owner of this contract.
     */
    function getOwner() constant public returns(address currentOwner) {
        return owner;
    }

    /*
     * You need to create:
     *
     * - a contract named `Owned` that:
     *     - is a `OwnedI`.
     *     - has a modifier named `fromOwner` that rolls back the transaction if the
     * transaction sender is not the owner.
     *     - has a constructor that takes no parameter.
     */
}
