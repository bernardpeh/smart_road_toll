import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import TollBoothOperatorContract from '../build/contracts/TollBoothOperator.json'
import ConsoleLogHTML from 'console-log-html'

class TollBooth extends Component {

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

  handleExitRoad(e) {
    // dont submit the form.
    e.preventDefault();
    let tollBoothOperatorContract = document.getElementById("tollBoothOperatorContract").value;
    let tollBooth = document.getElementById("tollBooth").value;
    let plainHash = document.getElementById("plainHash").value;

    let exitRoadLog = document.getElementById("exitRoadLog");
    exitRoadLog.innerHTML = 'Please wait...';
    ConsoleLogHTML.connect(exitRoadLog);

    // reportExitRoad
    this.state.tollBoothOperatorInstance.at(tollBoothOperatorContract).then((ins) => {
      // res is the encrypted hash
      ins.reportExitRoad(plainHash, { from: tollBooth, gas: 500000}).then((res) => {
        exitRoadLog.innerHTML = '';
        res.logs.forEach( log => {
          console.log(log);
        })
      }).catch((error) => {
        exitRoadLog.innerHTML = '';
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
          <h2>Step 4.1: Report Vehicle Exit</h2>
          <form onSubmit={this.handleExitRoad.bind(this)}>
            <label>TollBooth Address: </label>
            <select id="tollBooth" name="tollBooth">
              <option value="0x772ff6c576a3d8ad54f0f6e5558c7e0895a58968">TollBooth 1 - 0x772ff6c576a3d8ad54f0f6e5558c7e0895a58968</option>
              <option value="0x31204f76910c0082cd271e02e41e131c43846e51">TollBooth 2 - 0x31204f76910c0082cd271e02e41e131c43846e51</option>
            </select>
            <br/>
            <label>Secret Hash: </label>
            <input type="text" size="50" id="plainHash" name="plainHash" placeholder="secret code (bytes32)" /><br/>
            <label>Entry Deposit: </label>
            <input className="submit-button" type="submit" />
          </form>

          <ul id="exitRoadLog" className="log"></ul>
        </div>

      </div>
    );
  }
}

export default TollBooth;
