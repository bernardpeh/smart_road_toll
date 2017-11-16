pragma solidity ^0.4.13;

contract ACL {

    // regulator address
    address admin;

    // contract admin only
    modifier AdminOnly { _; }

    // allow regulator to update his own address
    function changeAdmin(address _new_admin) public AdminOnly() returns (bool success) {}

    function() public { revert(); }

}

contract Driver is ACL {

    bytes32 firstName;
    bytes32 lastName;
    bytes32 driverLicense;
    bool banned;
    uint balance;

    // initialises the user. Could have more attributes.
    function Driver(bytes32 _first_name, bytes32 _last_name, bool _banned) public returns (bool success) {}

    // Allow or disallow driver to drive.
    function setBanned() public AdminOnly() returns (bool success) {}

    // Basically, a selfdestruct()
    function remove() public AdminOnly() returns (bool success) {}

    function() public { revert(); }
}

contract Vehicle is ACL {

    bytes32 rfid;
    bool banned;
    address vehicleOwner;
    uint balance;
    Driver driver;

    mapping (address => Driver) authorisedDrivers;

    // ensure vehicle owner
    modifier VehicleOwnerOnly() { _; }

    // ensure authorised drivers for certain vehicle
    modifier AuthorisedDriversOnly() { _; }

    // Contructor to create the vehicle.
    function Vehicle(bytes32 _rfid, address _vehicle_owner, bool _banned) public returns (bool success) {}

    // allow admin to change vehicle owner
    function changeVehicleOwner(address _new_owner) public AdminOnly() returns (bool success) {}

    // Allow or disallow vehicle to drive on the road
    function setBanned() public AdminOnly() returns (bool success) {}

    // vehicle owner can allow other drivers to drive the vehicle.
    function addDriver(address _new_driver) public VehicleOwnerOnly() returns (bool success) {}

    // vehicle owner can remove other drivers from driving the vehicle.
    function removeDriver(address _driver) public VehicleOwnerOnly() returns (bool success) {}

    // allow drivers to top up the vehicle balance
    function topUp() public AuthorisedDriversOnly() payable returns (bool success) {}

    // get vehicle balance at any point in time
    function getVehicleBalance() public returns (uint balance) {}

    // Basically, a selfdestruct()
    function remove() public AdminOnly() returns (bool success) {}

    function() public { revert(); }

}

contract Toll is ACL {
    uint id;
    uint coordinates;
    // We can get really complicated with fee calculation. Lets just say its a flat fee at certain point in time.
    mapping (uint => uint) fees;

    // constructor
    function Toll(uint _id, uint _coordinates, uint _fee) public returns (bool success) {}

    // set Toll fee at certain point in time
    function setTollFee(uint _datetime, uint _fee) public returns (bool success) {}

    // get toll fee at certain toll point at certain time
    function getTollFee(uint _toll_id, uint _datetime) public returns (uint fee) {}

    // Basically, a selfdestruct()
    function remove() public AdminOnly() returns (bool success) {}

    function() public { revert(); }
}

contract SmartRoadToll {

    Vehicle vehicle;
    Driver driver;
    Toll toll;

    struct Journey {
        address driver;
        bytes32 rfid;
        uint datetime;
        mapping (uint => toll) tollsPassed;
        uint feeTotal;
    }

    mapping (uint => Journey) public bookedJourneys;

    // map vehicle address to driver
    mapping (address => vehicle) public vehicles;

    mapping (uint => Toll) public tolls;

    mapping (address => driver) public drivers;

    // add new Driver to the system
    function registerDriver(bytes32 _first_name, bytes32 _last_name, bool _banned) public AdminOnly() returns (bool success);

    function registerVehicle(bytes32 _rfid, address _vehicle_owner, bool _banned) public AdminOnly() returns (bool success);

    // for users who pre-book, require datetime of travel. Small payment will be deducted automatically from driver balance.
    function bookJourney(bytes32 _rfid, uint _datetime, uint[] _tollsPassed) public returns (uint book_id) {}

    // unbook journey
    function unbookJourney(uint _book_id) public returns (bool success) {}

    // Driver account automatically debited when vehicle passes through the toll.
    // There will also be logic here to automatically update toll fee based on traffic conditions.
    function chargeVehicle(bytes32 _rfid, uint _toll_id, uint _datetime) public returns (bool success) {}

    function() public { revert(); }
}
