pragma solidity ^0.4.13;

import "./TollBoothOperator.sol";
import "./Owned.sol";
import "./interfaces/RegulatorI.sol";

contract Regulator is Owned, RegulatorI {

    /**
     * uint VehicleType:
     * 0: not a vehicle, absence of a vehicle
     * 1 and above: is a vehicle.
     * For instance:
     *   1: motorbike
     *   2: car
     *   3: lorry
     */
    // address => vehicleType
    mapping (address => uint) vehicleTypes;

    mapping (address => bool) tollBoothOperators;

    /**
     * Event emitted when a new vehicle has been registered with its type.
     * @param sender The account that ran the action.
     * @param vehicle The address of the vehicle that is registered.
     * @param vehicleType The VehicleType that the vehicle was registered as.
     */
    event LogVehicleTypeSet(
        address indexed sender,
        address indexed vehicle,
        uint indexed vehicleType);

    function Regulator() public {}

    /**
     * Called by the owner of the regulator to register a new vehicle with its VehicleType.
     *     It should roll back if the caller is not the owner of the contract.
     *     It should roll back if the arguments mean no change of state.
     *     It should roll back if a 0x vehicle address is passed.
     * @param _vehicle The address of the vehicle being registered. This may be an externally
     *   owned account or a contract. The regulator does not care.
     * @param _vehicleType The VehicleType of the vehicle being registered.
     *    passing 0 is equivalent to unregistering the vehicle.
     * @return Whether the action was successful.
     * Emits LogVehicleTypeSet
     */
    function setVehicleType(address _vehicle, uint _vehicleType)
        fromOwner()
        public
        returns(bool success) {

        require(_vehicle != address(0));
        require(vehicleTypes[_vehicle] != _vehicleType);
        vehicleTypes[_vehicle] = _vehicleType;
        LogVehicleTypeSet(msg.sender, _vehicle, _vehicleType);
        return true;
    }

    /**
     * @param _vehicle The address of the registered vehicle.
     * @return The VehicleType of the vehicle whose address was passed. 0 means it is not
     *   a registered vehicle.
     */
    function getVehicleType(address _vehicle)
        constant
        public
        returns(uint vehicleType) {

        return vehicleTypes[_vehicle];
    }

    /**
     * Event emitted when a new TollBoothOperator has been created and registered.
     * @param sender The account that ran the action.
     * @param newOperator The newly created TollBoothOperator contract.
     * @param owner The rightful owner of the TollBoothOperator.
     * @param depositWeis The initial deposit amount set in the TollBoothOperator.
     */
    event LogTollBoothOperatorCreated(
        address indexed sender,
        address indexed newOperator,
        address indexed owner,
        uint depositWeis);

    /**
     * Called by the owner of the regulator to deploy a new TollBoothOperator onto the network.
     *     It should roll back if the caller is not the owner of the contract.
     *     It should start the TollBoothOperator in the `true` paused state.
     *     It should roll back if the rightful owner argument is the current owner of the regulator.
     * @param _owner The rightful owner of the newly deployed TollBoothOperator.
     * @param _deposit The initial value of the TollBoothOperator deposit.
     * @return The address of the newly deployed TollBoothOperator.
     * Emits LogTollBoothOperatorCreated.
     */
    function createNewOperator(
            address _owner,
            uint _deposit)
        fromOwner()
        public
        returns(TollBoothOperatorI newOperator) {

        require(_owner != getOwner());
        TollBoothOperator operator = new TollBoothOperator(true, _deposit, _owner);

        tollBoothOperators[operator] = true;
        LogTollBoothOperatorCreated(msg.sender, operator, _owner, _deposit);
        return operator;

    }

    /**
     * Event emitted when a TollBoothOperator has been removed from the list of approved operators.
     * @param sender The account that ran the action.
     * @param operator The removed TollBoothOperator.
     */
    event LogTollBoothOperatorRemoved(
        address indexed sender,
        address indexed operator);

    /**
     * Called by the owner of the regulator to remove a previously deployed TollBoothOperator from
     * the list of approved operators.
     *     It should roll back if the caller is not the owner of the contract.
     *     It should roll back if the operator is unknown.
     * @param _operator The address of the contract to remove.
     * @return Whether the action was successful.
     * Emits LogTollBoothOperatorRemoved.
     */
    function removeOperator(address _operator)
        fromOwner()
        public
        returns(bool success) {

        require(tollBoothOperators[_operator]);
        delete tollBoothOperators[_operator];
        LogTollBoothOperatorRemoved(msg.sender, _operator);
        return true;
    }

    /**
     * @param _operator The address of the TollBoothOperator to test.
     * @return Whether the TollBoothOperator is indeed approved.
     */
    function isOperator(address _operator)
        constant
        public
        returns(bool indeed) {

        return tollBoothOperators[_operator];
    }

    /*
     * You need to create:
     *
     * - a contract named `Regulator` that:
     *     - is `OwnedI` and `RegulatorI`.
     *     - has a constructor that takes no parameter.
     */
}
