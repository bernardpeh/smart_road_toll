pragma solidity ^0.4.13;

contract SmartRoadToll {

    struct Vehicle {
        address owner;
        address[] authorisedDrivers;
        uint balance;
    }

    struct Toll {
        uint id;
        uint fee;
    }

    struct bookJourney {
        address driver;
        address rfid;
        uint datetime;
        mapping (uint => toll) tollsPassed;
        uint feeTotal;
    }

    // map rfid to driver
    mapping (address => Vehicle) public vehicles;

    mapping (uint => BookJourney) public bookedJourneys;

    modifier VehicleOwnerOnly {}

    // Vehicle owner must allow other drivers to drive the vehicle.
    function registerToDrive(address _rfid) VehicleOwnerOnly() returns (bool) {}

    // for users who pre-book, require datetime of travel and small down payment from existing acct
    function bookJourney(address _rfid, uint _datetime, uint[] _tollsPassed) returns (bool) {}

    // Driver account automatically debited when vehicle passes through the toll.
    function makePayment(address _rfid) returns (bool) {}

    // get toll fee at certain toll point at certain time
    function getTollFee(uint id, uint _datetime) {}

    // allow drivers to top up the vehicle balance
    function topUp(address _rfid) payable returns (bool) {}

    function () {}
}
