import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, IndexLink, hashHistory } from 'react-router';
import Home from './home'
import Regulator from './Regulator';
import Vehicle from './Vehicle';
import TollBoothOperator from './TollBoothOperator';
import TollBooth from './TollBooth';
import ConsoleLogHTML from 'console-log-html'

import './css/index.css';

class App extends Component{

  componentWillMount() {
    ConsoleLogHTML.DEFAULTS.error = "red";
    ConsoleLogHTML.DEFAULTS.log = "green";
  }

  render() {
    return (
    <div className="container">
      <div className="header">
        <ul className="menu">
          <li> <IndexLink to="/" activeClassName="selected"> Home </IndexLink> </li>
          <li> <IndexLink to="/Regulator" activeClassName="selected"> 1. Regulator </IndexLink> </li>
          <li> <IndexLink target="_blank" to="/TollBoothOperator" activeClassName="selected"> 2. Toll Booth Operator </IndexLink> </li>
          <li> <IndexLink target="_blank" to="/Vehicle" activeClassName="selected"> 3. Vehicle </IndexLink> </li>
          <li> <IndexLink target="_blank" to="/TollBooth" activeClassName="selected"> 4. Toll </IndexLink> </li>
        </ul>
      </div>

      <div className="accounts">
        <strong>Accounts used in this project for easy copy and paste (see README.md for installation):</strong>
        <p>
        (0) 0x293da2ded324c4f5e335fe75f17afd1801736b21 - Regulator Owner <br/>
        (1) 0x028a966c9680f941faf58a9f293167280b6b1764 - Vehicle 1 <br/>
        (2) 0xe18a29128d7336d6e3561a122e58fd9cc840b5fc - Vehicle 2 <br/>
        (3) 0x772ff6c576a3d8ad54f0f6e5558c7e0895a58968 - Toll Booth 1 <br/>
        (4) 0x31204f76910c0082cd271e02e41e131c43846e51 - Toll Booth 2 <br/>
        (5) 0x9b72ee15fa2d60666ef0347cde3c99438854b27b - TollBoothOperator Owner 1 <br/>
        (6) 0x786966540fa6643c77aa28cc4f28dd7c9adfc88a - TollBoothOperator Owner 2
        </p>
      </div>
      <div className="content">
        {this.props.children}
      </div>
    </div>
  )
  }
}

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="/Regulator" component={Regulator} />
      <Route path="/TollBoothOperator" component={TollBoothOperator} />
      <Route path="/Vehicle" component={Vehicle} />
      <Route path="/TollBooth" component={TollBooth} />
    </Route>
  </Router>,
  document.getElementById('root')
);
