pragma solidity ^0.4.13;

contract ACL {

    // regulator address
    address admin;

    // contract admin only
    modifier AdminOnly { _; }

    // allow regulator to update his own address
    function changeAdmin(address _new_admin) public AdminOnly() returns (bool success) {}

}

contract Driver is ACL {

    // driver details like name and license number is stored off-chain for security reasons.

    // decides if driver can drive on road or not.
    bool banned;

    // initialises the user. Could have more attributes if desired.
    function Driver(bool _banned) public {}

    // Allow or disallow driver to drive.
    function setBanned(bool _ban) public AdminOnly() returns (bool success) {}

    // Basically, a selfdestruct()
    function remove() public AdminOnly() returns (bool success) {}

    // able to accept payment
    function () public payable {}
}

contract Vehicle is ACL {

    bytes32 public carPlate;
    bool public banned;
    address public vehicleOwner;
    // the driver at any point in time. Owner has to ensure if its anyone other than himself driving,
    // this var needs to be updated.
    address public driver;
    // needs to be true when trip started. false when trip ended.
    bool public tripStarted;

    mapping (address => Driver) public authorisedDrivers;

    // ensure vehicle owner
    modifier VehicleOwnerOnly() { _; }

    // ensure authorised drivers for certain vehicle
    modifier AuthorisedDriversOnly() { _; }

    // Contructor to create the vehicle.
    function Vehicle(bytes32 _rfid, address _vehicle_owner, bool _banned) public {}

    // allow admin to change vehicle owner
    function changeVehicleOwner(address _new_owner) public AdminOnly() returns (bool success) {}

    // Allow or disallow vehicle to drive on the road
    function setBanned() public AdminOnly() returns (bool success) {}

    // vehicle owner can allow other drivers to drive the vehicle.
    function addAuthorisedDriver(address _new_driver) public VehicleOwnerOnly() returns (bool success) {}

    // vehicle owner can remove other drivers from driving the vehicle.
    function removeAuthorisedriver(address _driver) public VehicleOwnerOnly() returns (bool success) {}

    // vehicle owner to set one authorised driver for the new trip
    function setDriver(address _driver) public VehicleOwnerOnly returns (bool success) {}

    // get driver at any point in time
    function getDriver() public returns (Driver current_driver) {}

    // set trip started and ended
    function setTripStarted(bool _tripStarted) public VehicleOwnerOnly returns (bool started) {}

    // Basically, a selfdestruct()
    function remove() public AdminOnly() returns (bool success) {}

    function() public { revert(); }

}

contract Toll is ACL {

    uint id;
    uint coordinates;
    // We can get really complicated with fee calculation. Lets just say its a flat fee at certain point in time.
    uint fee;

    // constructor
    function Toll(uint _id, uint _coordinates, uint _fee) public {}

    // set Toll fee at certain point in time
    function setTollFee(uint _datetime, uint _fee) public returns (bool success) {}

    // get toll fee at certain toll point at certain time based on some logic.
    function getTollFee(uint _toll_id, uint _datetime) public returns (uint current_fee) {}

    // Basically, a selfdestruct()
    function remove() public AdminOnly() returns (bool success) {}

    function() public { revert(); }
}

contract SmartRoadToll is ACL {

    struct Journey {
        address driver;
        address vehicle;
        uint datetime;
        mapping (uint => Toll) tollsPassed;
        uint feeTotal;
    }

    mapping (uint => Journey) public bookedJourneys;

    // map vehicle address to driver
    mapping (address => Vehicle) public vehicles;

    mapping (uint => Toll) public tolls;

    mapping (address => Driver) public drivers;

    // add new Driver to the system
    function registerDriver(bool _banned) public AdminOnly() returns (address driver_address) {}

    // add new vehicle to the system
    function registerVehicle(bytes32 _rfid, address _vehicle_owner, bool _banned) public AdminOnly() returns (address vehicle_address) {}

    // add new toll to the system
    function registerToll(uint _id, uint _coordinates) public AdminOnly() returns (address toll_address) {}

    // for users who pre-book, require datetime of travel. Small payment will be deducted automatically from driver balance.
    function bookJourney(address _vehicle, address _driver, uint _datetime, uint[] _tollsPassed) public returns (uint book_id) {}

    // unbook journey
    function unbookJourney(uint _book_id) public returns (bool success) {}

    // Driver account automatically debited when vehicle passes through the toll.
    // There will also be logic here to automatically update toll fee based on traffic conditions.
    function payToll(address _vehicle, uint _toll_id, uint _datetime) public returns (bool success) {}

    function() public { revert(); }
}
