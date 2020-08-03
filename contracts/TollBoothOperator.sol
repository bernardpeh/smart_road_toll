pragma solidity ^0.4.13;

import "./Regulated.sol";
import "./Owned.sol";
import "./Pausable.sol";
import "./DepositHolder.sol";
import "./TollBoothHolder.sol";
import "./MultiplierHolder.sol";
import "./RoutePriceHolder.sol";
import "./interfaces/TollBoothOperatorI.sol";
import "./SafeMath.sol";
import "./Regulator.sol";

contract TollBoothOperator is Owned, Pausable, DepositHolder, Regulated, TollBoothHolder, MultiplierHolder, RoutePriceHolder, TollBoothOperatorI {

    Regulator regulatorContract;

    function TollBoothOperator(bool _paused, uint _deposit, address _operatorOwner)
        Pausable(_paused)
        Regulated(msg.sender)
        DepositHolder(_deposit)
        public {
        // update rightful owner only if operatorOwner is not the same as initiator
        if (_operatorOwner != msg.sender) {
            setOwner(_operatorOwner);
        }
        regulatorContract = Regulator(getRegulator());
    }

    struct VehicleEntry {
        address vehicle;
        address entryBooth;
        uint depositedWeis;
    }

    // secretHashed => VehicleEntry
    mapping (bytes32 => VehicleEntry) vehicleEntries;

    // actual amt collected when vehicle exit toll
    uint collectedFees;

    // entryBooth => exitBooth => exitSecretClear array
    mapping (address => mapping(address => bytes32[])) pendingPayments;

    using SafeMath for uint;

    /**
     * This provides a single source of truth for the encoding algorithm.
     * @param _secret The secret to be hashed.
     * @return the hashed secret.
     */
    function hashSecret(bytes32 _secret)
        constant
        public
        returns(bytes32 hashed) {

        return keccak256(_secret);
    }

    /**
     * Event emitted when a vehicle made the appropriate deposit to enter the road system.
     * @param vehicle The address of the vehicle that entered the road system.
     * @param entryBooth The declared entry booth by which the vehicle will enter the system.
     * @param exitSecretHashed A hashed secret that when solved allows the operator to pay itself.
     * @param depositedWeis The amount that was deposited as part of the entry.
     */
    event LogRoadEntered(
        address indexed vehicle,
        address indexed entryBooth,
        bytes32 indexed exitSecretHashed,
        uint depositedWeis);

    /**
     * Called by the vehicle entering a road system.
     * Off-chain, the entry toll booth will open its gate up successful deposit and confirmation
     * of the vehicle identity.
     *     It should roll back when the contract is in the `true` paused state.
     *     It should roll back if `entryBooth` is not a tollBooth.
     *     It should roll back if less than deposit * multiplier was sent alongside.
     *     It should be possible for a vehicle to enter "again" before it has exited from the
     *       previous entry.
     * @param _entryBooth The declared entry booth by which the vehicle will enter the system.
     * @param _exitSecretHashed A hashed secret that when solved allows the operator to pay itself.
     *   A previously used exitSecretHashed cannot be used ever again.
     * @return Whether the action was successful.
     * Emits LogRoadEntered.
     */
    function enterRoad(
            address _entryBooth,
            bytes32 _exitSecretHashed)
        public
        payable
        returns (bool success) {

        require(!paused);
        require(tollBooths[_entryBooth]);

        // if hash exists and vehicle not yet exited, allow it to pass
        address vehicle;
        address entryBooth;
        uint depositedWeis;
        (vehicle,  entryBooth,  depositedWeis) = getVehicleEntry(_exitSecretHashed);

        // deposit > deposit * multiplier
        require(msg.value > getDeposit() * multipliers[regulatorContract.getVehicleType(vehicle)]);

        // if vehicle newly entered the booth
        if (depositedWeis == 0 && vehicle == address(0)) {
            vehicleEntries[_exitSecretHashed] = VehicleEntry(msg.sender, _entryBooth, msg.value);
            LogRoadEntered(msg.sender, _entryBooth, _exitSecretHashed, msg.value);
            return true;
        }

        // if a vehicle entered before but not yet exited, allow it to pass
        if (depositedWeis > 0 && vehicle != address(0)) {
            return true;
        }

        // if vehicle exited and use a previously used hash, do not allow.
        if (depositedWeis == 0 && vehicle != address(0)) {
            return false;
        }
    }

    /**
     * @param _exitSecretHashed The hashed secret used by the vehicle when entering the road.
     * @return The information pertaining to the entry of the vehicle.
     *     vehicle: the address of the vehicle that entered the system.
     *     entryBooth: the address of the booth the vehicle entered at.
     *     depositedWeis: how much the vehicle deposited when entering.
     * After the vehicle has exited, `depositedWeis` should be returned as `0`.
     * If no vehicles had ever entered with this hash, all values should be returned as `0`.
     */
    function getVehicleEntry(bytes32 _exitSecretHashed)
        constant
        public
        returns(
            address vehicle,
            address entryBooth,
            uint depositedWeis) {

        VehicleEntry memory e = vehicleEntries[_exitSecretHashed];
        return (e.vehicle, e.entryBooth, e.depositedWeis);
    }

    /**
     * Event emitted when a vehicle exits a road system.
     * @param exitBooth The toll booth that saw the vehicle exit.
     * @param exitSecretHashed The hash of the secret given by the vehicle as it
     *     passed by the exit booth.
     * @param finalFee The toll fee taken from the deposit.
     * @param refundWeis The amount refunded to the vehicle, i.e. deposit - fee.
     */
    event LogRoadExited(
        address indexed exitBooth,
        bytes32 indexed exitSecretHashed,
        uint finalFee,
        uint refundWeis);

    /**
     * Event emitted when a vehicle used a route that has no known fee.
     * It is a signal for the oracle to provide a price for the pair.
     * @param exitSecretHashed The hashed secret that was defined at the time of entry.
     * @param entryBooth The address of the booth the vehicle entered at.
     * @param exitBooth The address of the booth the vehicle exited at.
     */
    event LogPendingPayment(
        bytes32 indexed exitSecretHashed,
        address indexed entryBooth,
        address indexed exitBooth);

    /**
     * Called by the exit booth.
     *     It should roll back when the contract is in the `true` paused state.
     *     It should roll back when the sender is not a toll booth.
     *     It should roll back if the exit is same as the entry.
     *     It should roll back if the secret does not match a hashed one.
     * @param _exitSecretClear The secret given by the vehicle as it passed by the exit booth.
     * @return status:
     *   1: success, -> emits LogRoadExited
     *   2: pending oracle -> emits LogPendingPayment
     */
    function reportExitRoad(bytes32 _exitSecretClear)
        public
        returns (uint status) {

        // valid tollBoth
        require(tollBooths[msg.sender]);

        // contract not paused
        require(!paused);

        address vehicle;
        address entryBooth;
        uint depositedWeis;
        // get hashed value
        bytes32 hashedSecret = hashSecret(_exitSecretClear);
        (vehicle,  entryBooth,  depositedWeis) = getVehicleEntry(hashedSecret);

        // actual fee based on route price
        uint actualFee = routePrices[entryBooth][msg.sender] *  multipliers[regulatorContract.getVehicleType(vehicle)];

        // hashed secret must be valid, meaning an entry must exists
        require(vehicle != address(0));

        // exit booth cannot be same as entry
        require(entryBooth != msg.sender);

        // if the actual fee is not known at the time of exit, the pending payment is recorded,
        // and "base route price required" event is emitted and listened to by the operator's oracle.
        if (actualFee == 0) {
            // this log will be picked up by the oracle
            pendingPayments[entryBooth][msg.sender].push(_exitSecretClear);
            LogPendingPayment(hashedSecret, entryBooth, msg.sender);
            return 2;
        }
        else {
            require(makePayment(actualFee, depositedWeis, vehicle, msg.sender, _exitSecretClear));
            return 1;
        }
    }

    function makePayment(uint _actualFee, uint _depositedWeis, address _vehicle, address _exitBooth, bytes32 _exitSecretClear)
        private
        returns (bool success) {

        bytes32 hashedSecret = hashSecret(_exitSecretClear);
        uint refund;
        uint finalFee;

        // set depositedWeis to 0.
        vehicleEntries[hashedSecret].depositedWeis = 0;

        // if the fee is equal to or higher than the deposit,
        // then the whole deposit is used and no more is asked of the vehicle, now or before any future trip
        if (_actualFee >= _depositedWeis) {
            finalFee = _depositedWeis;
        }
        // if the fee is smaller than the deposit, then the difference is returned to the vehicle.
        else  {
            finalFee = _actualFee;
            refund = _depositedWeis.sub(finalFee);
            // transfer refund
            _vehicle.transfer(refund);
        }

        collectedFees = collectedFees.add(finalFee);
        LogRoadExited(_exitBooth, hashedSecret, _actualFee, refund);
        return true;
    }

    /**
     * @param _entryBooth the entry booth that has pending payments.
     * @param _exitBooth the exit booth that has pending payments.
     * @return the number of payments that are pending because the price for the
     * entry-exit pair was unknown.
     */
    function getPendingPaymentCount(address _entryBooth, address _exitBooth)
        constant
        public
        returns (uint count) {

        return pendingPayments[_entryBooth][_exitBooth].length;
    }

    /**
     * Can be called by anyone. In case more than 1 payment was pending when the oracle gave a price.
     *     It should roll back when the contract is in `true` paused state.
     *     It should roll back if booths are not really booths.
     *     It should roll back if there are fewer than `count` pending payment that are solvable.
     *     It should roll back if `count` is `0`.
     * @param _entryBooth the entry booth that has pending payments.
     * @param _exitBooth the exit booth that has pending payments.
     * @param _count the number of pending payments to clear for the exit booth.
     * @return Whether the action was successful.
     * Emits LogRoadExited as many times as count.
     */
    function clearSomePendingPayments(
            address _entryBooth,
            address _exitBooth,
            uint _count)
        public
        returns (bool success) {

        // if there are no pending payment return false
        if (getPendingPaymentCount(_entryBooth, _exitBooth) == 0) {
            return false;
        }

        require(!paused);

        // valid tollBoths
        require(tollBooths[_entryBooth] && tollBooths[_exitBooth]);

        require(_count > 0);

        // pendingPayments should be at least equal to _count
        require(getPendingPaymentCount(_entryBooth, _exitBooth) >= _count);

        // actual fee based on route price
        uint actualFee;

        // lets clear the payments. need to regulate _count to make sure ops won't be out-of-gas
        // payment might be pending forever if certain reportExitRoad fails for certain secret of certain route.
        for (uint i = 0; i < _count; i++) {
            bytes32 exitSecretClear = pendingPayments[_entryBooth][_exitBooth][i];
            // get hashed value
            bytes32 hashedSecret = hashSecret(exitSecretClear);
            address vehicle;
            address entryBooth;
            uint depositedWeis;
            (vehicle, entryBooth, depositedWeis) = getVehicleEntry(hashedSecret);

            actualFee = routePrices[_entryBooth][_exitBooth] * multipliers[regulatorContract.getVehicleType(vehicle)];

            // actual fee based on route price
            require(makePayment(actualFee, depositedWeis, vehicle, _exitBooth, exitSecretClear));
        }

        // clean up the pendingPayments array and update the new array length
        uint newArrayLength = pendingPayments[_entryBooth][_exitBooth].length.sub(_count);
        for (i = 0; i < newArrayLength; i++) {
            pendingPayments[_entryBooth][_exitBooth][i] = pendingPayments[_entryBooth][_exitBooth][i + _count];
        }
        pendingPayments[_entryBooth][_exitBooth].length = newArrayLength;

        return true;

    }

    /**
     * @return The amount that has been collected through successful payments. This is the current
     *   amount, it does not reflect historical fees. So this value goes back to zero after a call
     *   to `withdrawCollectedFees`.
     */
    function getCollectedFeesAmount()
        constant
        public
        returns(uint amount) {

        return collectedFees;
    }

    /**
     * Event emitted when the owner collects the fees.
     * @param owner The account that sent the request.
     * @param amount The amount collected.
     */
    event LogFeesCollected(
        address indexed owner,
        uint amount);

    /**
     * Called by the owner of the contract to withdraw all collected fees (not deposits) to date.
     *     It should roll back if any other address is calling this function.
     *     It should roll back if there is no fee to collect.
     *     It should roll back if the transfer failed.
     * @return success Whether the operation was successful.
     * Emits LogFeesCollected.
     */
    function withdrawCollectedFees()
        fromOwner()
        public
        returns(bool success) {

        // should roll back if there are no fee to collect.
        require(collectedFees > 0);

        uint tFees = collectedFees;

        // reset collected fees
        collectedFees = 0;

        // send funds
        msg.sender.transfer(tFees);

        // log transaction
        LogFeesCollected(msg.sender, tFees);

        return true;
    }

    /**
     * This function overrides the eponymous function of `RoutePriceHolderI`, to which it adds the following
     * functionality:
     *     - If relevant, it will release 1 pending payment for this route. As part of this payment
     *       release, it will emit the appropriate `LogRoadExited` event.
     *     - In the case where the next relevant pending payment is not solvable, which can happen if,
     *       for instance the vehicle has had wrongly set values in the interim:
     *       - It should release 0 pending payment
     *       - It should not roll back the transaction
     *       - It should behave as if there had been no pending payment, apart from the higher gas consumed.
     *     - It should be possible to call it even when the contract is in the `true` paused state.
     * Emits LogRoadExited if applicable.
     */
    function setRoutePrice(
            address _entryBooth,
            address _exitBooth,
            uint _priceWeis)
        fromOwner()
        public
        returns(bool success) {

        super.setRoutePrice(_entryBooth, _exitBooth, _priceWeis);

        // if not pause, clear pending payment and don't care if its successful or not
        if (!isPaused()) {
            clearSomePendingPayments(_entryBooth, _exitBooth, 1);
        }

        return true;
    }


    /*
     * You need to create:
     *
     * - a contract named `TollBoothOperator` that:
     *     - is `OwnedI`, `PausableI`, `DepositHolderI`, `TollBoothHolderI`,
     *         `MultiplierHolderI`, `RoutePriceHolderI`, `RegulatedI` and `TollBoothOperatorI`.
     *     - has a constructor that takes:
     *         - one `bool` parameter, the initial paused state.
     *         - one `uint` parameter, the initial deposit wei value, which cannot be 0.
     *         - one `address` parameter, the initial regulator, which cannot be 0.
     */
}
