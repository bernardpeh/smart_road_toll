pragma solidity ^0.4.13;

import "./Owned.sol";
import "./interfaces/TollBoothHolderI.sol";

contract TollBoothHolder is Owned, TollBoothHolderI {

    mapping (address => bool) tollBooths;

    /**
     * Event emitted when a toll booth has been added to the TollBoothOperator.
     * @param sender The account that ran the action.
     * @param tollBooth The toll booth just added.
     */
    event LogTollBoothAdded(
        address indexed sender,
        address indexed tollBooth);

    function TollBoothHolder() public {}

    /**
     * Called by the owner of the TollBoothOperator.
     *     It should roll back if the caller is not the owner of the contract.
     *     It should roll back if the argument is already a toll booth.
     *     It should roll back if the argument is a 0x address.
     *     When part of TollBoothOperatorI, it should be possible to add toll booths even when
     *       the contract is paused.
     * @param _tollBooth The address of the toll booth being added.
     * @return Whether the action was successful.
     * Emits LogTollBoothAdded
     */
    function addTollBooth(address _tollBooth)
        fromOwner()
        public
        returns(bool success) {

        require(_tollBooth != address(0));
        require(tollBooths[_tollBooth] == false);
        tollBooths[_tollBooth] = true;
        LogTollBoothAdded(msg.sender, _tollBooth);
        return true;
    }

    /**
     * @param _tollBooth The address of the toll booth we enquire about.
     * @return Whether the toll booth is indeed part of the operator.
     */
    function isTollBooth(address _tollBooth)
        constant
        public
        returns(bool isIndeed) {

        return tollBooths[_tollBooth];
    }

    /**
     * Event emitted when a toll booth has been removed from the TollBoothOperator.
     * @param sender The account that ran the action.
     * @param tollBooth The toll booth just removed.
     */
    event LogTollBoothRemoved(
        address indexed sender,
        address indexed tollBooth);

    /**
     * Called by the owner of the TollBoothOperator.
     *     It should roll back if the caller is not the owner of the contract.
     *     It should roll back if the argument has already been removed.
     *     It should roll back if the argument is a 0x address.
     *     When part of TollBoothOperatorI, it should be possible to remove toll booth even when
     *       the contract is paused.
     * @param _tollBooth The toll booth to remove.
     * @return Whether the action was successful.
     * Emits LogTollBoothRemoved
     */
    function removeTollBooth(address _tollBooth)
        fromOwner()
        public
        returns(bool success) {

        require(_tollBooth != address(0));
        require(tollBooths[_tollBooth] == true);
        delete tollBooths[_tollBooth];
        LogTollBoothRemoved(msg.sender, _tollBooth);

        return true;
    }

    /*
     * You need to create:
     *
     * - a contract named `TollBoothHolder` that:
     *     - is `OwnedI`, `TollBoothHolderI`.
     *     - has a constructor that takes no parameter.
     */
}
