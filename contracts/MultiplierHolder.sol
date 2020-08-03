pragma solidity ^0.4.13;

import "./Owned.sol";
import "./interfaces/MultiplierHolderI.sol";

contract MultiplierHolder is Owned, MultiplierHolderI {

    // vehicleTypes => multiplier
    mapping (uint => uint) multipliers;

    /**
     * Event emitted when a new multiplier has been set.
     * @param sender The account that ran the action.
     * @param vehicleType The type of vehicle for which the multiplier was set.
     * @param multiplier The actual multiplier set.
     */
    event LogMultiplierSet(
        address indexed sender,
        uint indexed vehicleType,
        uint multiplier);

    function MultiplierHolder() public {}

    /**
     * Called by the owner of the TollBoothOperator.
     *   Can be used to update a value.
     *   It should roll back if the vehicle type is 0.
     *   Setting the multiplier to 0 is equivalent to removing it and is acceptable.
     *   It should roll back if the same multiplier is already set to the vehicle type.
     * @param _vehicleType The type of the vehicle being set.
     * @param _multiplier The multiplier to use.
     * @return Whether the action was successful.
     * Emits LogMultiplierSet.
     */
    function setMultiplier(
            uint _vehicleType,
            uint _multiplier)
        fromOwner()
        public
        returns(bool success) {

        // vehicleType cannot be 0
        require(_vehicleType != 0);

        // _multiplier should be different
        require(multipliers[_vehicleType] != _multiplier);

        if (_multiplier == 0) {
            delete multipliers[_vehicleType];
        }
        else {
            multipliers[_vehicleType] = _multiplier;
        }

        LogMultiplierSet(msg.sender, _vehicleType, _multiplier);
        return true;
    }

    /**
     * @param _vehicleType The type of vehicle whose multiplier we want
     *     It should accept a vehicle type equal to 0.
     * @return The multiplier for this vehicle type.
     *     A 0 value indicates a non-existent multiplier.
     */
    function getMultiplier(uint _vehicleType)
        constant
        public
        returns(uint multiplier) {

        return multipliers[_vehicleType];
    }

    /*
     * You need to create:
     *
     * - a contract named `MultiplierHolder` that:
     *     - is `OwnedI` and `MultiplierHolderI`.
     *     - has a constructor that takes no parameter.
     */
}
