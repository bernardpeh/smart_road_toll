import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import TollBoothOperatorContract from '../build/contracts/TollBoothOperator.json'
import ConsoleLogHTML from 'console-log-html'


class TollBoothOperator extends Component {

  constructor(props) {
    super(props)
    this.state = {
      web3: null,
      tollBoothOperatorInstance: null,
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

  handleSetTollBooth(e) {
    // dont submit the form.
    e.preventDefault()
    let tollBooth = document.getElementById("tollBooth").value;
    let tollBoothOperatorContract = document.getElementById("tollBoothOperatorContract").value;
    let tollBoothOperatorOwner = document.getElementById("tollBoothOperatorOwner").value;
    let tollBoothLog = document.getElementById("tollBoothLog");
    tollBoothLog.innerHTML = 'Please wait...';
    ConsoleLogHTML.connect(tollBoothLog);

    this.state.tollBoothOperatorInstance.at(tollBoothOperatorContract).then((ins) => {
      ins.addTollBooth(tollBooth, {from: tollBoothOperatorOwner}).then( (res) => {
        tollBoothLog.innerHTML = '';
        console.log(res.logs[0]);
      }).catch( (error) =>  {
        tollBoothLog.innerHTML = '';
        console.error(error);
      })
    })
  }

  handleSetRoutePrice(e) {
    // dont submit the form.
    e.preventDefault()
    let entryBooth = document.getElementById("entryBooth").value;
    let exitBooth = document.getElementById("exitBooth").value;
    let routePrice = document.getElementById("routePrice").value;
    let tollBoothOperatorContract = document.getElementById("tollBoothOperatorContract").value;
    let tollBoothOperatorOwner = document.getElementById("tollBoothOperatorOwner").value;

    let routePriceLog = document.getElementById("routePriceLog");
    routePriceLog.innerHTML = 'Please wait...';
    ConsoleLogHTML.connect(routePriceLog);

    this.state.tollBoothOperatorInstance.at(tollBoothOperatorContract).then((ins) => {
      ins.setRoutePrice(entryBooth, exitBooth, routePrice, {from: tollBoothOperatorOwner}).then( (res) => {
        routePriceLog.innerHTML = '';
        console.log(res.logs[0]);
      }).catch( (error) =>  {
        routePriceLog.innerHTML = '';
        console.error(error);
      })
    })
  }

  handleSetMultiplier(e) {
    // dont submit the form.
    e.preventDefault()
    let vehicleType = document.getElementById("vehicleType").value;
    let multiplier = document.getElementById("multiplier").value;
    let tollBoothOperatorContract = document.getElementById("tollBoothOperatorContract").value;
    let tollBoothOperatorOwner = document.getElementById("tollBoothOperatorOwner").value;

    let multiplierLog = document.getElementById("multiplierLog");
    multiplierLog.innerHTML = 'Please wait...';
    ConsoleLogHTML.connect(multiplierLog);

    this.state.tollBoothOperatorInstance.at(tollBoothOperatorContract).then((ins) => {
      ins.setMultiplier(vehicleType, multiplier,  {from: tollBoothOperatorOwner}).then( (res) => {
        multiplierLog.innerHTML = '';
        console.log(res.logs[0]);
      }).catch( (error) =>  {
        multiplierLog.innerHTML = '';
        console.error(error);
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
          <h2>Step 2.1: Add TollBooth</h2>
          <form onSubmit={this.handleSetTollBooth.bind(this)}>
            <label>TollBooth Address: </label>
            <select id="tollBooth" name="tollBooth">
              <option value="0x772ff6c576a3d8ad54f0f6e5558c7e0895a58968">TollBooth 1 - 0x772ff6c576a3d8ad54f0f6e5558c7e0895a58968</option>
            <option value="0x31204f76910c0082cd271e02e41e131c43846e51">TollBooth 2 - 0x31204f76910c0082cd271e02e41e131c43846e51</option>
            </select>
            <br/>
            <input className="submit-button" type="submit" />
          </form>

          <ul id="tollBoothLog" className="log"></ul>
        </div>

        <div className="section">
          <h2>Step 2.2: Add Route Price</h2>
          <form onSubmit={this.handleSetRoutePrice.bind(this)}>
            <label>Entry Toll Booth</label>
            <select id="entryBooth" name="entryBooth">
              <option value="0x772ff6c576a3d8ad54f0f6e5558c7e0895a58968">TollBooth 1 - 0x772ff6c576a3d8ad54f0f6e5558c7e0895a58968</option>
              <option value="0x31204f76910c0082cd271e02e41e131c43846e51">TollBooth 2 - 0x31204f76910c0082cd271e02e41e131c43846e51</option>
            </select><br/>
            <label>Exit Toll Booth</label>
            <select id="exitBooth" name="exitBooth">
              <option value="0x772ff6c576a3d8ad54f0f6e5558c7e0895a58968">TollBooth 1 - 0x772ff6c576a3d8ad54f0f6e5558c7e0895a58968</option>
              <option value="0x31204f76910c0082cd271e02e41e131c43846e51">TollBooth 2 - 0x31204f76910c0082cd271e02e41e131c43846e51</option>
            </select><br/>
            <label>Set actual route price</label>
            <input type="text" size="50" name="routePrice" id="routePrice" placeholder="enter actual route price in wei" /><br/>
            <input className="submit-button" type="submit" />
          </form>

          <ul id="routePriceLog" className="log"></ul>
        </div>

        <div className="section">
          <h2>Step 2.3: Set Multiplier</h2>
          <form onSubmit={this.handleSetMultiplier.bind(this)}>
            <label>Vehicle Type</label>
            <select id="vehicleType" name="vehicleType">
              <option value="1">1 - Motorbike</option>
              <option value="2">2 - Car</option>
              <option value="3">3 - Lorry</option>
            </select><br/>
            <label>Set Multiplier</label>
            <input type="text" size="50" name="multiplier" id="multiplier" placeholder="enter multiplier in integer" /><br/>
            <input className="submit-button" type="submit" />
          </form>

          <ul id="multiplierLog" className="log"></ul>
        </div>

      </div>
    );
  }
}

export default TollBoothOperator;
