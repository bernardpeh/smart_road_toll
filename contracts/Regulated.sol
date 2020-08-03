pragma solidity ^0.4.13;

import "./interfaces/RegulatedI.sol";

contract Regulated is RegulatedI {

    address regulator;

    /**
     * Event emitted when a new regulator has been set.
     * @param previousRegulator The previous regulator of the contract.
     * @param newRegulator The new, and current, regulator of the contract.
     */
    event LogRegulatorSet(
        address indexed previousRegulator,
        address indexed newRegulator);

    /**
     * Constructor
     * @param _regulator address of regulator.
     */
    function Regulated(address _regulator) public {
        require(_regulator != address(0));
        regulator = _regulator;
    }

    /**
     * Sets the new regulator for this contract.
     *     It should roll back if any address other than the current regulator of this contract
     *       calls this function.
     *     It should roll back if the new regulator address is 0.
     *     It should roll back if the new regulator is the same as the current regulator.
     * @param _newRegulator The new desired regulator of the contract.
     * @return Whether the action was successful.
     * Emits LogRegulatorSet.
     */
    function setRegulator(address _newRegulator)
        public
        returns(bool success) {

        require(msg.sender == regulator);
        require(_newRegulator != address(0));
        require(_newRegulator != regulator);
        LogRegulatorSet(regulator, _newRegulator);
        regulator = _newRegulator;
        return true;
    }

    /**
     * @return The current regulator.
     */
    function getRegulator()
    constant
    public
    returns(RegulatorI regulatorI) {
        return RegulatorI(regulator);
    }

    /*
     * You need to create:
     *
     * - a contract named `Regulated` that:
     *     - is a `RegulatedI`.
     *     - has a constructor that takes one `address` parameter, the initial regulator, which cannot be 0.
     */
}
