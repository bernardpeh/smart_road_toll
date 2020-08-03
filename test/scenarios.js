const Regulator = artifacts.require('./Regulator.sol');
const TollBoothOperator = artifacts.require('./TollBoothOperator.sol');

contract('TollBoothOperator', function(accounts) {

  // instance of Regulator and TollBoothOperator
  var regulator, operator, clearSecret, hashedSecret, clearSecret2, hashedSecret2;

  // owner of regulator
  var regulatorOwner = accounts[0];

  // owner of TollBoothOperator
  var operatorOwner = accounts[1];

  // base price of toll
  var tollBasePrice = 10 ;

  // address of vehicle 1
  var vehicle1 = accounts[2];

  // address of vehicle 2
  var vehicle2 = accounts[3];

  // address of entry booth 1
  var booth1 = accounts[4];

  // address of exit booth 2
  var booth2 = accounts[5];

  beforeEach(async () => {

    regulator = await Regulator.new();

    let tx = await regulator.createNewOperator(operatorOwner, tollBasePrice);
    let operatorAddress = tx.logs[1].args.newOperator;
    // get operator instance
    operator = await TollBoothOperator.at(operatorAddress);
    // unpause operator contract
    await operator.setPaused(0, {from: operatorOwner});
    // operator owner register tooBooths
    await operator.addTollBooth(booth1, {from: operatorOwner});
    await operator.addTollBooth(booth2, {from: operatorOwner});

    // vehicle1 generates hash secret
    clearSecret = '"vehicle1"';
    hashedSecret = await operator.hashSecret(clearSecret);

    // vehicle2 generates hash secret
    clearSecret2 = '"vehicle2"';
    hashedSecret2 = await operator.hashSecret(clearSecret2);

    // let us set all the default multipliers for different vehicle types
    // 1: motorbike => 1x
    await operator.setMultiplier(1, 1, {from: operatorOwner});
    // 2: car => 2x
    await operator.setMultiplier(2, 2, {from: operatorOwner});
    // 3: lorry => 3x
    await operator.setMultiplier(3, 3, {from: operatorOwner});

  });

  describe('Scenario 1: vehicle1 enters booth1 and deposits 10 wei. It exits booth2. Route price equals 10 wei.', () => {
    it('vehicle1 should not get any refund.', async () => {
      // operator contract should have 0 balance in the beginning
      assert.strictEqual(web3.toWei(web3.eth.getBalance(operator.address)).toNumber(), 0, 'operator contract should have 0 balance in the beginning.');

      // operator owner sets routeprice to 10 wei.
      await operator.setRoutePrice(booth1, booth2, 10, { from: operatorOwner });
      // regulator set vehicle type. vehicle1 is type 1
      await regulator.setVehicleType(vehicle1, 1);

      // vehicle1 enters booth1, initiated by vehicle1
      await operator.enterRoad(booth1, hashedSecret, { from: vehicle1, value: 10 });
      // collectedFees should be 0
      let collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(0, collectedFees.toNumber());
      // contract should have 10 wei if everything is successful.
      assert.strictEqual(web3.eth.getBalance(operator.address).toNumber(), 10);

      // vehicle1 exits booth2 with a clear message, initiated by booth2
      let tx = await operator.reportExitRoad(clearSecret, { from: booth2 });
      // should trigger the LogRoadExited log
      assert.strictEqual("LogRoadExited", tx.logs[0].event);

      // collectedFees should have 10 wei
      collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(10, collectedFees.toNumber());
    });
  });

  describe('Scenario 2: vehicle1 enters booth1 and deposits 10 wei. It exits booth2. Route price equals 15 wei.', () => {
    it('vehicle1 should not get any refund.', async () => {
      // operator contract should have 0 balance in the beginning
      assert.strictEqual(web3.toWei(web3.eth.getBalance(operator.address)).toNumber(), 0, 'operator contract should have 0 balance in the beginning.');

      // operator owner sets routeprice to 15 wei.
      await operator.setRoutePrice(booth1, booth2, 15, { from: operatorOwner });
      // regulator set vehicle type. vehicle1 is type 1
      await regulator.setVehicleType(vehicle1, 1);

      // vehicle1 enters booth1, initiated by vehicle1
      await operator.enterRoad(booth1, hashedSecret, { from: vehicle1, value: 10 });
      // collectedFees should be 0
      let collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(0, collectedFees.toNumber());
      // contract should have 10 wei if everything is successful.
      assert.strictEqual(web3.eth.getBalance(operator.address).toNumber(), 10);

      // vehicle1 exits booth2 with a clear message, initiated by booth2
      let tx = await operator.reportExitRoad(clearSecret, { from: booth2 });
      // should trigger the LogRoadExited log
      assert.strictEqual("LogRoadExited", tx.logs[0].event);

      // collectedFees should be 10 wei
      collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(10, collectedFees.toNumber());
    });
  });

  describe('Scenario 3: vehicle1 enters booth1 and deposits 10 wei. It exits booth2. Route price equals 6 wei.', () => {

    it('vehicle1 should get 4 wei refund.', async () => {
      // operator contract should have 0 balance in the beginning
      assert.strictEqual(web3.toWei(web3.eth.getBalance(operator.address)).toNumber(), 0, 'operator contract should have 0 balance in the beginning.');

      // operator owner sets routeprice to 6 wei.
      await operator.setRoutePrice(booth1, booth2, 6, { from: operatorOwner });
      // regulator set vehicle type. vehicle1 is type 1
      await regulator.setVehicleType(vehicle1, 1);

      // vehicle1 enters booth1, initiated by vehicle1
      await operator.enterRoad(booth1, hashedSecret, { from: vehicle1, value: 10 });
      // collectedFees should be 0
      let collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(0, collectedFees.toNumber(), 'collectedFees should be 0 wei upon vehicle1 entry');
      // contract should have 10 wei if everything is successful.
      assert.strictEqual(10, web3.eth.getBalance(operator.address).toNumber(), 'contract should have 10 wei upon vehicle1 entry');

      // vehicle1 exits booth2 with a clear message, initiated by booth2
      let tx = await operator.reportExitRoad(clearSecret, { from: booth2 });
      // should trigger the LogRoadExited log and the correct values
      assert.strictEqual("LogRoadExited", tx.logs[0].event, 'LogRoadExited event should be triggered');
      assert.strictEqual(6, tx.logs[0].args.finalFee.toNumber(), 'finalFee should be 6');
      assert.strictEqual(4, tx.logs[0].args.refundWeis.toNumber(), 'refundWeis should be 4');

      // collectedFees should be 6 wei
      collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(6, collectedFees.toNumber(), 'collectedFees should be 6 wei upon vehicle1 exit');
      // contract balance should be 6 wei
      assert.strictEqual(6, web3.eth.getBalance(operator.address).toNumber(), 'contract balance should be 6 wei upon vehicle1 exit');

    });
  });

  describe('Scenario 4: vehicle1 enters booth1 and deposits 14 wei. It exits booth2. Route price equals 10 wei.', () => {
    it('vehicle1 should get 4 wei refund.', async () => {
      // operator contract should have 0 balance in the beginning
      assert.strictEqual(web3.toWei(web3.eth.getBalance(operator.address)).toNumber(), 0, 'operator contract should have 0 balance in the beginning.');

      // operator owner sets routeprice to 10 wei.
      await operator.setRoutePrice(booth1, booth2, 10, { from: operatorOwner });
      // regulator set vehicle type. vehicle1 is type 1
      await regulator.setVehicleType(vehicle1, 1);

      // vehicle1 enters booth1, initiated by vehicle1
      await operator.enterRoad(booth1, hashedSecret, { from: vehicle1, value: 14 });
      // collectedFees should be 0
      let collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(0, collectedFees.toNumber(), 'collectedFees should be 0 wei upon vehicle1 entry');
      // contract should have 14 wei if everything is successful.
      assert.strictEqual(14, web3.eth.getBalance(operator.address).toNumber(), 'contract should have 14 wei upon vehicle1 entry');

      // vehicle1 exits booth2 with a clear message, initiated by booth2
      let tx = await operator.reportExitRoad(clearSecret, { from: booth2 });
      // should trigger the LogRoadExited log and the correct values
      assert.strictEqual("LogRoadExited", tx.logs[0].event, 'LogRoadExited event should be triggered');
      assert.strictEqual(10, tx.logs[0].args.finalFee.toNumber(), 'finalFee should be 10');
      assert.strictEqual(4, tx.logs[0].args.refundWeis.toNumber(), 'refundWeis should be 4');

      // collectedFees should be 10 wei
      collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(10, collectedFees.toNumber(), 'collectedFees should be 10 wei upon vehicle1 exit');
      // contract balance should be 10 wei
      assert.strictEqual(10, web3.eth.getBalance(operator.address).toNumber(), 'contract balance should be 10 wei upon vehicle1 exit');
    });
  });

  describe('Scenario 5: vehicle1 enters booth1 and deposits 14 wei. It exits booth2. Route price is unknown. Operator owner updates route price to 11 wei.', () => {
    it('vehicle1 should get 3 wei refund.', async () => {
      // operator contract should have 0 balance in the beginning
      assert.strictEqual(web3.toWei(web3.eth.getBalance(operator.address)).toNumber(), 0, 'operator contract should have 0 balance in the beginning.');

      // regulator set vehicle type. vehicle1 is type 1
      await regulator.setVehicleType(vehicle1, 1);

      // vehicle1 enters booth1, initiated by vehicle1
      await operator.enterRoad(booth1, hashedSecret, { from: vehicle1, value: 14 });
      // collectedFees should be 0
      let collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(0, collectedFees.toNumber(), 'collectedFees should be 0 wei upon vehicle1 entry');
      // contract should have 14 wei if everything is successful.
      assert.strictEqual(14, web3.eth.getBalance(operator.address).toNumber(), 'contract should have 14 wei upon vehicle1 entry');

      // vehicle1 exits booth2 with a clear message, initiated by booth2
      let tx = await operator.reportExitRoad(clearSecret, { from: booth2 });
      // should trigger the LogRoadExited log and the correct values
      assert.strictEqual("LogPendingPayment", tx.logs[0].event, 'LogPendingPayment event should be triggered');

      // getPendingPaymentCount should be 1
      let pendingCount = await operator.getPendingPaymentCount(booth1, booth2);
      assert.strictEqual(1, pendingCount.toNumber(), 'There should be 1 pending payment');

      // operator owner set the route price and 1 pending payment automatically cleared.
      tx = await operator.setRoutePrice(booth1, booth2, 11, { from: operatorOwner });

      assert.strictEqual("LogRoadExited", tx.logs[1].event, 'LogRoadExited event should be triggered');
      assert.strictEqual(11, tx.logs[1].args.finalFee.toNumber(), 'finalFee should be 11');
      assert.strictEqual(3, tx.logs[1].args.refundWeis.toNumber(), 'refundWeis should be 3');
      // collectedFees should be 11 wei
      collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(11, collectedFees.toNumber(), 'collectedFees should be 11 wei upon clearing pending payments.');
      // contract balance should be 11 wei
      assert.strictEqual(11, web3.eth.getBalance(operator.address).toNumber(), 'contract balance should be 11 wei upon clearing pending payments.');
    });
  });

  describe('Scenario 6: vehicle1 enters booth1 and deposits 14 wei. It exits booth2 and route price is unknown. vehicle 2 enters booth 1 and deposits 10 wei. It exits booth2 and route price is unknown. Operator owner updates route price to 6 wei.', () => {
    it('vehicle1 should get 8 wei refund and vehicle2 gets 4 wei refund.', async () => {
      // operator contract should have 0 balance in the beginning
      assert.strictEqual(web3.toWei(web3.eth.getBalance(operator.address)).toNumber(), 0, 'operator contract should have 0 balance in the beginning.');

      // regulator set vehicle type. vehicle1 is type 1
      await regulator.setVehicleType(vehicle1, 1);
      // regulator set vehicle type. vehicle2 is type 1
      await regulator.setVehicleType(vehicle2, 1);

      // vehicle1 enters booth1, initiated by vehicle1
      await operator.enterRoad(booth1, hashedSecret, { from: vehicle1, value: 14 });
      // collectedFees should be 0
      let collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(0, collectedFees.toNumber(), 'collectedFees should be 0 wei upon vehicle1 entry');
      // contract should have 14 wei if everything is successful.
      assert.strictEqual(14, web3.eth.getBalance(operator.address).toNumber(), 'contract should have 14 wei upon vehicle1 entry');
      // vehicle1 exits booth2 with a clear message, initiated by booth2
      let tx = await operator.reportExitRoad(clearSecret, { from: booth2 });
      // should trigger the LogRoadExited log and the correct values
      assert.strictEqual("LogPendingPayment", tx.logs[0].event, 'LogPendingPayment event should be triggered');
      // getPendingPaymentCount should be 1
      let pendingCount = await operator.getPendingPaymentCount(booth1, booth2);
      assert.strictEqual(1, pendingCount.toNumber(), 'There should be 1 pending payment');


      // vehicle2 enters booth1, initiated by vehicle2
      await operator.enterRoad(booth1, hashedSecret2, { from: vehicle2, value: 10 });
      // collectedFees should be 0
      collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(0, collectedFees.toNumber(), 'collectedFees should be 0 wei upon vehicle2 entry');
      // contract should have 24 wei if everything is successful.
      assert.strictEqual(24, web3.eth.getBalance(operator.address).toNumber(), 'contract should have 24 wei upon vehicle2 entry');
      // vehicle2 exits booth2 with a clear message, initiated by booth2
      tx = await operator.reportExitRoad(clearSecret2, { from: booth2 });
      // should trigger the LogRoadExited log and the correct values
      assert.strictEqual("LogPendingPayment", tx.logs[0].event, 'LogPendingPayment event should be triggered');
      // getPendingPaymentCount should be 2
      pendingCount = await operator.getPendingPaymentCount(booth1, booth2);
      assert.strictEqual(2, pendingCount.toNumber(), 'There should be 2 pending payments');

      // operator owner set the route price
      tx = await operator.setRoutePrice(booth1, booth2, 6, { from: operatorOwner });
      // 1st pending payment, ie vehicle1 automatically cleared.
      assert.strictEqual("LogRoadExited", tx.logs[1].event, 'LogRoadExited event should be triggered for vehicle1');
      // vehicle1 final fee
      assert.strictEqual(6, tx.logs[1].args.finalFee.toNumber(), 'finalFee for vehicle1 should be 6');
      assert.strictEqual(8, tx.logs[1].args.refundWeis.toNumber(), 'refundWeis for vehicle1 should be 8');

      // someone calls to clear one pending payment.
      tx = await operator.clearSomePendingPayments(booth1, booth2, 1);
      assert.strictEqual("LogRoadExited", tx.logs[0].event, 'LogRoadExited event should be triggered for vehicle2');
      // vehicle2 final fee
      assert.strictEqual(6, tx.logs[0].args.finalFee.toNumber(), 'finalFee for vehicle2 should be 6');
      assert.strictEqual(4, tx.logs[0].args.refundWeis.toNumber(), 'refundWeis for vehicle2 should be 4');

      // total collectedFees should be 12 wei
      collectedFees = await operator.getCollectedFeesAmount();
      assert.strictEqual(12, collectedFees.toNumber(), 'collectedFees should be 11 wei upon clearing pending payments.');
      // contract balance should be 12 wei
      assert.strictEqual(12, web3.eth.getBalance(operator.address).toNumber(), 'contract balance should be 11 wei upon clearing pending payments.');
    });
  });

});

