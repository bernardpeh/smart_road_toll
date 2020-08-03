import React, { Component } from 'react';

class Home extends Component {
  render() {
    return (
      <div>
        <p>
        This is only a proof of concept for the road toll project. It is created with <a href="https://github.com/truffle-box/react-box" target="_blank">react-box</a>. Its meant to work with testrpc only with instantaneous transaction results. To work in a live chain, more javascript is needed to handle the wait for transactions to be included in the blockchain. The frontend has lots of room for improvement in terms of usability and efficiency.
        </p>
      <p>Go through the menu steps in sequential order. Start with <a href="/#/Regulator">1. Regulator</a>
      </p>
        <strong>Regulator Owner:</strong>
        <ul>
          <li>Set vehicle types.</li>
          <li>Add new TollBoothOperator.</li>
        </ul>
        <strong>TollBoothOperator Owner:</strong>
        <ul>
          <li>Add Toll Booth</li>
          <li>Add route prices</li>
          <li>Set multipliers</li>
        </ul>
        <strong>Vehicle:</strong>
        <ul>
          <li>See basic balance</li>
          <li>Make an entry deposit.</li>
          <li>See history of its entry / exit</li>
        </ul>
        <strong>Toll Booth:</strong>
        <ul>
          <li>Report a vehicle exit</li>
          <li>Be informed on the status of the refund or of the pending payment of the vehicle reported</li>
        </ul>
      </div>
    );
  }
}

export default Home;
