const Regulator = artifacts.require("./Regulator.sol");
const TollBoothOperator = artifacts.require("./TollBoothOperator.sol");

var basePrice = 10;
var operatorOwner = web3.eth.accounts[1];

module.exports = function(deployer) {
  deployer.deploy(Regulator).then( () => {
    Regulator.deployed().then( (ins) => {
      ins.createNewOperator(operatorOwner, basePrice).then( (ins) => {
        let operatorAddress = ins.logs[1].args.newOperator;
        TollBoothOperator.at(operatorAddress).then( (ins) => {
          ins.setPaused(0, {from: operatorOwner});
        });
      });
    });
  });
};
