const Web3 = require('web3');
const fs = require('fs-extra');
const solc = require('solc');

// Connect to local Ethereum node (Ganache)
const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
const web3 = new Web3(provider);

// Check connection
web3.eth.net.isListening()
    .then(() => console.log('Connected to the Ethereum network'))
    .catch(e => console.log('Something went wrong', e));

// Read the Solidity contract
const source = fs.readFileSync('contracts/LegalRecords.sol', 'utf8');
const input = {
    language: 'Solidity',
    sources: {
        'LegalRecords.sol': {
            content: source
        }
    },
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        },
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode']
            }
        }
    }
};

// Compile the contract using the specified version
const compiled = JSON.parse(solc.compile(JSON.stringify(input), { import: function (path) { return { contents: fs.readFileSync(path, 'utf8') }; } }));
const abi = compiled.contracts['LegalRecords.sol'].LegalRecords.abi;
const bytecode = compiled.contracts['LegalRecords.sol'].LegalRecords.evm.bytecode.object;

(async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Accounts:', accounts);

    const contract = new web3.eth.Contract(abi);

    contract.deploy({ data: bytecode })
        .send({ from: accounts[0], gas: 1500000, gasPrice: '30000000000' })
        .then((instance) => {
            console.log('Contract deployed at address', instance.options.address);
            fs.writeFileSync('contractAddress.txt', instance.options.address);
            fs.writeFileSync('contractABI.json', JSON.stringify(abi));
        })
        .catch((error) => {
            console.error('Error deploying contract:', error);
        });
})();



