import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import RegulatorContract from '../build/contracts/Regulator.json'
import TollBoothOperatorContract from '../build/contracts/TollBoothOperator.json'
import ConsoleLogHTML from 'console-log-html'

class Regulator extends Component {

  constructor(props) {
    super(props)
    this.state = {
      web3: null,
      regulatorInstance: null,
      tollBoothOperatorInstance: null,
      regulatorOwner: '0x293da2ded324c4f5e335fe75f17afd1801736b21',
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
      let contract = require('truffle-contract')
      let c = contract(RegulatorContract)
      c.setProvider(this.state.web3.currentProvider)
      this.setState({regulatorInstance: c.deployed()})

      c = contract(TollBoothOperatorContract)
      c.setProvider(this.state.web3.currentProvider)
      this.setState({tollBoothOperatorInstance: c})
    })
    .catch(() => {
      console.error('Error finding web3.')
    })
  }

  handleSetVehicle(e) {
    // dont submit the form.
    e.preventDefault()
    let vehicle = document.getElementById("vehicle").value;
    let vehicleType = document.getElementById("vehicleType").value;
    let vehicleLog = document.getElementById('vehicleLog');
    vehicleLog.innerHTML = 'Please wait...';
    ConsoleLogHTML.connect(vehicleLog);

    this.state.regulatorInstance.then((ins) => {
      ins.setVehicleType(vehicle, vehicleType, {from: this.state.regulatorOwner}).then( (res) => {
        vehicleLog.innerHTML = '';
        console.log(res.logs)
      }).catch( (error) =>  {
        vehicleLog.innerHTML = '';
        console.error(error)
      })
    })
  }

  handleCreateNewOperator(e) {
    // dont submit the form.
    e.preventDefault()
    let operatorOwner = document.getElementById("operatorOwner").value;
    let basePrice = document.getElementById("basePrice").value;
    let operatorAddress = '';
    let operatorLog = document.getElementById("operatorLog");
    operatorLog.innerHTML = 'Please wait...';
    ConsoleLogHTML.connect(operatorLog);

    this.state.regulatorInstance.then((ins) => {
      ins.createNewOperator(operatorOwner, basePrice, {from: this.state.regulatorOwner, gas: 2000000}).then( res => {
        // return operator Address
        operatorLog.innerHTML = '';
        res.logs.forEach( item => {
          console.log(item);
        })
        operatorAddress = res.logs[1].args.newOperator;
        document.getElementById('instructions').innerHTML = 'New TollBoothOperator created. Contract Address: <strong>'+ operatorAddress +'</strong> (Copy this and reuse it in the rest of the steps)';
        return operatorAddress
      }).then( (operatorAddress) => {
        // unpause contract
        this.state.tollBoothOperatorInstance.at(operatorAddress).then((ins1) => {
          ins1.setPaused(0, {from: operatorOwner}).then( res => {
            console.log(res.logs);
          })
        })
      }).catch( (error) =>  {
        operatorLog.innerHTML = '';
        console.error(error);
      })
    })
  }

  render() {
    return (
      <div>
        <p>
          Regulator Owner: {this.state.regulatorOwner}
        </p>

        <div className="section">
          <h2>Step 1.1: Set Vehicle Type</h2>
          <form onSubmit={this.handleSetVehicle.bind(this)}>
            <label>Vehicle Address</label>
            <select id="vehicle" name="vehicle">
              <option value="0x028a966c9680f941faf58a9f293167280b6b1764">vehicle 1 - 0x028a966c9680f941faf58a9f293167280b6b1764</option>
              <option value="0xe18a29128d7336d6e3561a122e58fd9cc840b5fc">vehicle 2 - 0xe18a29128d7336d6e3561a122e58fd9cc840b5fc</option>
            </select>
            <label>Type: </label>
            <select id="vehicleType" name="vehicleType">
              <option value="0">0 - Unregister</option>
              <option value="1">1 - Motorbike</option>
              <option value="2">2 - Car</option>
              <option value="3">3 - Lorry</option>
            </select><br/>
            <input className="submit-button" type="submit" />
          </form>

          <ul id="vehicleLog" className="log">{this.state.setVehicleLog}</ul>
        </div>

        <div className="section">
          <h2>Step 1.2: Add New TollBooth Operator</h2>
          <form onSubmit={this.handleCreateNewOperator.bind(this)}>
            <label>Operator Owner Address</label>
            <select id="operatorOwner" name="operatorOwner">
              <option value="0x9b72ee15fa2d60666ef0347cde3c99438854b27b">TollBoothOperator 1 - 0x9b72ee15fa2d60666ef0347cde3c99438854b27b</option>
              <option value="0x786966540fa6643c77aa28cc4f28dd7c9adfc88a">TollBoothOperator 2 - 0x786966540fa6643c77aa28cc4f28dd7c9adfc88a</option>
            </select>

            <label>Toll Base Price: </label>
            <input type="text" id="basePrice" name="basePrice" placeholder="in wei (integers only)"/><br/>
            <input className="submit-button" type="submit" />
          </form>
          <div id="instructions"></div>
          <ul id="operatorLog" className="log"></ul>
        </div>

      </div>
    );
  }
}

export default Regulator;
