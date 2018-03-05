import React, { Component } from 'react';
import {BigNumber} from 'bignumber.js';
import FixedSupplyTokenContract from '../build/contracts/FixedSupplyToken.json';
import getWeb3 from './utils/getWeb3';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  // davidAddr = "0x297dBaD33f22Cc20d8a6e21cf6a77E8f36615238";

  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      transferAmount: '',
      fixedSupplyTokenInstance: '',
      defaultAccount: '',
      transferToAddress: '',
      newBalance: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeAddr = this.handleChangeAddr.bind(this);
    this.onSubmit= this.onSubmit.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
    const contract = require('truffle-contract')
    const fixedSupplyToken = contract(FixedSupplyTokenContract)
    fixedSupplyToken.setProvider(this.state.web3.currentProvider)
    fixedSupplyToken.defaults({from: this.state.web3.eth.coinbase})

    console.log("this.state.web3.currentProvider", this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on FixedSupplyToken.
    // Get accounts.const {fixedSupplyTokenInstance} = this.state;
    this.state.web3.eth.getAccounts((error, accounts) => {
        this.setState(web3 => ({
          ...web3,
          defaultAccount:this.state.web3.eth.accounts[0]
        }))
      fixedSupplyToken.deployed().then((instance) => {
        this.setState({fixedSupplyTokenInstance: instance});
        // this.state.fixedSupplyTokenInstance.transfer("0x57529B1F235aC9356e478E66BCb2a4594D16DD10", 1);
        this.state.fixedSupplyTokenInstance.totalSupply().then( (result) => { 
          let k = new BigNumber(result).valueOf();
          console.log("k = new BigNumber(result).valueOf() ", k);
          return k }).then(
        this.state.fixedSupplyTokenInstance.balanceOf(accounts[0]).then((result) => {
          let myTokens = new BigNumber(result).valueOf();
          console.log("myTokens", myTokens);
        }));
        // Stores a given value, 5 by default.
        return this.state.fixedSupplyTokenInstance.set(5, {from: accounts[0]})
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return this.state.fixedSupplyTokenInstance.get.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result.c[0] })
      })
    })
  }

  handleChange(event) {
    console.log("event", event.target.value)
    this.setState({transferAmount: event.target.value})
  }

  handleChangeAddr(event) {
    console.log("event", event.target.value)
    this.setState({transferToAddress: event.target.value})
  }
  onSubmit(event){
    event.preventDefault();
    this.state.web3.eth.getAccounts((error, accounts) => {
      console.log("this.state.transferToAddress", this.state.transferToAddress)
      console.log("this.state.transferAmount", this.state.transferAmount)
      this.state.fixedSupplyTokenInstance.transfer(this.state.transferToAddress, this.state.transferAmount);
      this.state.fixedSupplyTokenInstance.balanceOf(accounts[0]).then((result) => {
        let myTokens = new BigNumber(result).valueOf();
        console.log("myTokens", myTokens);
      });

      this.state.fixedSupplyTokenInstance.balanceOf(this.state.transferToAddress).then((result) => {
        let account2 = new BigNumber(result).valueOf();
        console.log("account2", account2);
        this.setState({newBalance: account2});
      });
      let k = this.state.fixedSupplyTokenInstance.totalSupply.call().then(function(value) {
        return new BigNumber(value).valueOf();
    })
      console.log("totalSupply", k);

  })}

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <p>If your contracts compiled and migrated successfully, below will show a stored value of 5 (by default).</p>
              <p>(give it some time)</p>
              <p>The stored value is: {this.state.storageValue}</p>
            </div>
          </div>
          <hr/>
          <form onSubmit={this.onSubmit}>
            <h4>Transfer Token</h4>
            <label>Address to transfer to (as a hexadecimal)</label><br/>
            <input  type="text" value={this.state.transferToAddress} onChange={this.handleChangeAddr}/><br/>
            <hr/>
            <label>
              How many tokens to transfer
            </label><br />
            <input type="text" value={this.state.transferAmount} onChange={this.handleChange}/><br/>
            <hr/>
            <button>Transfer Tokens</button><br/>
          </form>
          <div>
            <hr/>
            <h4>New Balance: {this.state.newBalance}</h4>
          </div>
        </main>
      </div>
    );
  }
}

export default App
