import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import TollBoothOperatorContract from '../build/contracts/TollBoothOperator.json'
import ConsoleLogHTML from 'console-log-html'


class Vehicle extends Component {

  constructor(props) {
    super(props)
    this.state = {
      web3: null,
      tollBoothOperatorInstance: null,
      vehicleAccountBalanceLog: null,
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      const contract = require('truffle-contract')
      const c = contract(TollBoothOperatorContract)
      c.setProvider(this.state.web3.currentProvider)
      this.setState({tollBoothOperatorInstance: c})
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  getVehicleAccountBalance(e) {
    // dont submit the form.
    e.preventDefault()
    let web3 = this.state.web3;
    let vehicle = document.getElementById('vehicle').value;
    let log = document.getElementById("vehicleAccountBalanceLog");
    log.innerHTML = web3.fromWei(web3.eth.getBalance(vehicle).toNumber()) + ' Ether';
  }

  handleEnterRoad(e) {
    // dont submit the form.
    e.preventDefault();
    let tollBoothOperatorContract = document.getElementById("tollBoothOperatorContract").value;
    let entryVehicle = document.getElementById("entryVehicle").value;
    let entryDeposit = document.getElementById("entryDeposit").value;
    let tollBooth = document.getElementById("tollBooth").value;
    let plainHash = document.getElementById("plainHash").value;

    let enterRoadLog = document.getElementById("enterRoadLog");
    enterRoadLog.innerHTML = 'Please wait...';
    ConsoleLogHTML.connect(enterRoadLog);

    this.state.tollBoothOperatorInstance.at(tollBoothOperatorContract).then((ins) => {
      ins.hashSecret(plainHash).then((res) => {
        return res
      }).then((res) => {
        // res is the encrypted hash
        ins.enterRoad(tollBooth, res, { from: entryVehicle, value: entryDeposit, gas: 500000}).then((res) => {
          enterRoadLog.innerHTML = '';
          console.log(res.logs);
        }).catch((error) => {
          enterRoadLog.innerHTML = '';
          console.error(error);
        })
      })
    })
  }

  handleSeeEntryLog(e) {
    // dont submit the form.
    e.preventDefault()
    let tollBoothOperatorContract = document.getElementById("tollBoothOperatorContract").value;

    let entryLog = document.getElementById("entryLog");
    entryLog.innerHTML = 'Please wait...';
    ConsoleLogHTML.connect(entryLog);

    this.state.tollBoothOperatorInstance.at(tollBoothOperatorContract).then((ins) => {
      ins.LogRoadEntered({}, {fromBlock: 0, toBlock: 'latest'}).get( (err,res) => {
        entryLog.innerHTML = '';
        res.forEach( log => {
          console.log(log);
        });
      })
    })
  }

  handleSeeExitLog(e) {
    // dont submit the form.
    e.preventDefault()
    let tollBoothOperatorContract = document.getElementById("tollBoothOperatorContract").value;

    let exitLog = document.getElementById("exitLog");
    exitLog.innerHTML = 'Please wait...';
    ConsoleLogHTML.connect(exitLog);

    this.state.tollBoothOperatorInstance.at(tollBoothOperatorContract).then((ins) => {
      ins.LogRoadExited({}, {fromBlock: 0, toBlock: 'latest'}).get( (err,res) => {
        exitLog.innerHTML = '';
        res.forEach( log => {
          console.log(log);
          ins.LogRoadEntered({}, {fromBlock: 0, toBlock: 'latest'}).get( (err1,res1) => {
            res1.forEach( log1 => {
              if (log1.args.exitSecretHashed == log.args.exitSecretHashed) {
                // exitLog += 'Entry booth: '+log1.args.entryBooth+', Exit booth: '+log.args.exitBooth+', Vehicle: '+log1.args.vehicle+', Final Fee: '+log.args.finalFee+', Refund: '+log.args.refundWeis+'<br/>';
              }
            })
          })
        });
      })
    })
  }

  render() {
    return (
      <div>
        <p>
          <label>TollBoothOperator Contract Address:</label>
          <input size="50" type="text" id="tollBoothOperatorContract" name="tollBoothOperatorContract" placeholder="Paste Operator Contract address generated from step 1.2" /><br/>
        </p>
        <p>
        <label>TollBoothOperator Owner Address:</label>
        <select id="tollBoothOperatorOwner" name="tollBoothOperatorOwner">
          <option value="0x9b72ee15fa2d60666ef0347cde3c99438854b27b">TollBoothOperator 1 - 0x9b72ee15fa2d60666ef0347cde3c99438854b27b</option>
          <option value="0x786966540fa6643c77aa28cc4f28dd7c9adfc88a">TollBoothOperator 2 - 0x786966540fa6643c77aa28cc4f28dd7c9adfc88a</option>
        </select>
        </p>

        <div className="section">
          <h2>Step 3.1: Get Vehicle Account Balance</h2>
          <form onSubmit={this.getVehicleAccountBalance.bind(this)}>
            <label>Vehicle Address: </label>
            <select id="vehicle" name="vehicle">
              <option value="0x028a966c9680f941faf58a9f293167280b6b1764">vehicle 1 - 0x028a966c9680f941faf58a9f293167280b6b1764</option>
            <option value="0xe18a29128d7336d6e3561a122e58fd9cc840b5fc">vehicle 2 - 0xe18a29128d7336d6e3561a122e58fd9cc840b5fc</option>
            </select>
            <br/>
            <input className="submit-button" type="submit" />
          </form>

          <ul id="vehicleAccountBalanceLog" className="log"></ul>
        </div>

        <div className="section">
          <h2>Step 3.2: Vehicle Enters Road Toll</h2>
          <form onSubmit={this.handleEnterRoad.bind(this)}>
            <label>Vehicle Address: </label>
            <select id="entryVehicle" name="entryVehicle">
              <option value="0x028a966c9680f941faf58a9f293167280b6b1764">vehicle 1 - 0x028a966c9680f941faf58a9f293167280b6b1764</option>
              <option value="0xe18a29128d7336d6e3561a122e58fd9cc840b5fc">vehicle 2 - 0xe18a29128d7336d6e3561a122e58fd9cc840b5fc</option>
            </select>
            <br/>
            <label>Entry TollBooth Address: </label>
            <select id="tollBooth" name="tollBooth">
              <option value="0x772ff6c576a3d8ad54f0f6e5558c7e0895a58968">TollBooth 1 - 0x772ff6c576a3d8ad54f0f6e5558c7e0895a58968</option>
            <option value="0x31204f76910c0082cd271e02e41e131c43846e51">TollBooth 2 - 0x31204f76910c0082cd271e02e41e131c43846e51</option>
            </select><br/>
            <label>Secret Hash (Unique for each vehicle): </label>
            <input type="text" size="50" id="plainHash" name="plainHash" placeholder="secret code (bytes32)" /><br/>
            <label>Entry Deposit: </label>
            <input type="text" size="50" id="entryDeposit" name="entryDeposit" placeholder="entry deposit in wei (integer only)" /><br/>
            <input className="submit-button" type="submit" />
          </form>

          <ul id="enterRoadLog" className="log"></ul>
        </div>

        <div className="section">
          <h2>Step 3.3: See Vehicle Log</h2>
          <form onSubmit={this.handleSeeEntryLog.bind(this)}>
            <br/>
            <input className="submit-button" type="submit" value="See Vehicle ENTRY Log"/>
          </form>
          <ul id="entryLog" className="log"></ul>

          <form onSubmit={this.handleSeeExitLog.bind(this)}>
            <br/>
            <input className="submit-button" type="submit" value="See Vehicle EXIT Log"/>
          </form>
          <ul id="exitLog" className="log"></ul>
        </div>

      </div>
    );
  }
}

export default Vehicle;
