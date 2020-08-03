pragma solidity ^0.4.13;

import "./Owned.sol";
import "./TollBoothHolder.sol";
import "./interfaces/RoutePriceHolderI.sol";

contract RoutePriceHolder is Owned, TollBoothHolder, RoutePriceHolderI {

    // entry => exit => price
    mapping(address => mapping (address => uint)) routePrices;

    function RoutePriceHolder() public {}

    /**
     * Event emitted when a new price has been set on a route.
     * @param sender The account that ran the action.
     * @param entryBooth The address of the entry booth of the route set.
     * @param exitBooth The address of the exit booth of the route set.
     * @param priceWeis The price in weis of the new route.
     */
    event LogRoutePriceSet(
        address indexed sender,
        address indexed entryBooth,
        address indexed exitBooth,
        uint priceWeis);

    /**
     * Called by the owner of the RoutePriceHolder.
     *     It can be used to update the price of a route, including to zero.
     *     It should roll back if the caller is not the owner of the contract.
     *     It should roll back if one of the booths is not a registered booth.
     *     It should roll back if entry and exit booths are the same.
     *     It should roll back if either booth is a 0x address.
     *     It should roll back if there is no change in price.
     * @param _entryBooth The address of the entry booth of the route set.
     * @param _exitBooth The address of the exit booth of the route set.
     * @param _priceWeis The price in weis of the new route.
     * @return Whether the action was successful.
     * Emits LogPriceSet.
     */
    function setRoutePrice(
            address _entryBooth,
            address _exitBooth,
            uint _priceWeis)
        fromOwner()
        public
        returns(bool success) {

        require(tollBooths[_entryBooth] && tollBooths[_exitBooth]);
        require(_entryBooth != _exitBooth);
        require(_entryBooth != address(0) && _exitBooth != address(0));
        require(routePrices[_entryBooth][_exitBooth] != _priceWeis);
        LogRoutePriceSet(msg.sender, _entryBooth, _exitBooth, _priceWeis);
        routePrices[_entryBooth][_exitBooth] = _priceWeis;

        return true;

    }

    /**
     * @param _entryBooth The address of the entry booth of the route.
     * @param _exitBooth The address of the exit booth of the route.
     * @return priceWeis The price in weis of the route.
     *     If the route is not known or if any address is not a booth it should return 0.
     *     If the route is invalid, it should return 0.
     */
    function getRoutePrice(
            address _entryBooth,
            address _exitBooth)
        constant
        public
        returns(uint priceWeis) {

        return routePrices[_entryBooth][_exitBooth];
    }

    /*
     * You need to create:
     *
     * - a contract named `RoutePriceHolder` that:
     *     - is `OwnedI`, `TollBoothHolderI`, and `RoutePriceHolderI`.
     *     - has a constructor that takes no parameter.
     */
}
