## Installation

* Make sure vagrant virtual machine is up and running

```
// IN parent host, Install dependencies
npm install
```

### 1. Starting Testrpc

```
// ssh into vm and run testrpc
vagrant ssh
// start_testrpc.sh is a wrapper for testrpc
./DAPPS/scripts/start_testrpc.sh
```

### 2. Running Mocha Test

* Make sure testrpc is running in step 1.

```
// in vm
truffle test
```

### 3. Deployment

* Make sure testrpc is running in step 1.

```
// in vm
truffle migrate --reset
```

## 4. Running DAPP

* Make sure testrpc is running in step 1.

* Make sure contracts are deployed in step 3.

* No metamask required to make life simple.

```
// In parent host terminal
npm run start 
// website available at http://localhost:3000
```

### Project Requirements

* See [project requirements](REQUIREMENTS.md)

### Resources

* [Truffle React Box](https://github.com/truffle-box/react-box)
