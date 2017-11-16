# Blockchain in Toll Roads

## Introduction

Road toll is created to reduce traffic jams. People are less likely to travel on certain roads if they have to pay. There could be complex forumalae to calculate the toll fee such as type of vehicle, day and time of travel, number of passengers...etc. 

Road toll Implementation can be quite varied, from human (manual) tolls to fully automated tolls using technology like [RFID](https://en.wikipedia.org/wiki/Radio-frequency_identification)

Assuming a country uses RFID devices for road toll. The way it works is:

* All vehicles will have a RFID device installed when the vehicle is first purchased. The RFID ID is linked to a carplate in the regulator's central database.

* Driver tops up a cash card and inserts the card into the device when driving.

* When the vehicle passes the toll, the card value is automatically deducted based on some business rules decided by the Toll.

* If the card does not have enough credit when passing the toll, the vehicle owner will be penalised.


## Problem:

* Driver is usually not aware of actual toll charges as regulation keeps changing.

* Topping up cash card can be troublesome.

* Cash card can be misplaced or stolen.

* Driver does not know if toll is charging correctly. Driver has to trust the regulator as there is currently no way for the driver to access his own toll ledger.

* Traffic is equally bad most of the time as the toll fee is too low and not responsive to traffic conditions. Regulator could have made the fees higher but it applies to everyone and it gets political.

## Possible Solution:

* A permissionless blockchain to track all transactions for all vehicles passing through the toll.

* Driver deposit credit to his own account inside a smart contract. Once the vehicle passes the toll, driver's account is automatically debited inside the contract. It works very much like the cash card but without the card and cannot be stolen.

* The smart contract allows user to check any toll fee at any point in time.

* The fee is responsive to traffic conditions based on the number of vehicles between 2 toll points every minute, ie fees will be higher when there is a traffic jam and lower when traffic is low.

* The smart contract allows user to pre-book a journey early. Driver pay a small fee and lock in the date/time of travel to get better toll rates. This will allow better traffic distribution throughout the day (refer to the diagram below).

* It is possible to integrate the blockchain into a GPS device. This will provide a good UI for driver to calculate the the toll charges for the journey as well. 

* Having a **Smart Toll System** as mentioned above is very computational demanding and expensive using traditional centralised system.

![Smart Toll](images/smart_toll.jpg)

## An Example

* A new truck is manufactured. The regulator registers the truck in the Smart Toll Contract. Let's say the truck is given a unique vehicle address called 0xSATOSHI. This address is embedded into the rfid device of the truck. Together with this address, details of the truck such as manufactured date, type, model...etc is stored in an off-chain system.

* Sam bought the truck and is now the owner of the new truck.

* Sam's sensitive details such as name, date of birth, license number, contact number and address is kept off-chain. The regulator creates a new account address in the blockchain and associates it to the off-chain account. Let's say Sam's unique on-chain account address is 0xSAM.

* In the smart contract, the regulator associates 0xSAM to be the rightful owner of vehicle 0xSATOSHI.

* Sam tops up his account in the blockchain.

* Sam starts driving. When the truck passes through the toll, Sam's account "0xSAM" is auto debited.