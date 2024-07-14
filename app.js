async function loadContractDetails() {
    try {
        const contractABI = await (await fetch('contractABI.json')).json();
        const contractAddress = await (await fetch('contractAddress.txt')).text().trim();

        const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545");
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        return { web3, contract };
    } catch (error) {
        console.error('Error loading contract details:', error);
        throw error;
    }
}

async function createRecord() {
    try {
        const { web3, contract } = await loadContractDetails();
        const accounts = await web3.eth.getAccounts();
        const documentHash = document.getElementById("documentHash").value;
        const title = document.getElementById("title").value;

        contract.methods.createRecord(documentHash, title).send({ from: accounts[0] })
            .on('receipt', receipt => {
                console.log('Record created:', receipt);
            })
            .on('error', error => {
                console.error('Error creating record:', error);
            });
    } catch (error) {
        console.error('Error in createRecord:', error);
    }
}

async function transferOwnership() {
    try {
        const { web3, contract } = await loadContractDetails();
        const accounts = await web3.eth.getAccounts();
        const recordId = document.getElementById("recordId").value;
        const newOwner = document.getElementById("newOwner").value;

        contract.methods.transferOwnership(recordId, newOwner).send({ from: accounts[0] })
            .on('receipt', receipt => {
                console.log('Ownership transferred:', receipt);
            })
            .on('error', error => {
                console.error('Error transferring ownership:', error);
            });
    } catch (error) {
        console.error('Error in transferOwnership:', error);
    }
}

async function getRecord() {
    try {
        const { web3, contract } = await loadContractDetails();
        const recordId = document.getElementById("getRecordId").value;

        contract.methods.getRecord(recordId).call()
            .then(record => {
                const recordDetails = `
                    <p>ID: ${record.id}</p>
                    <p>Document Hash: ${record.documentHash}</p>
                    <p>Title: ${record.title}</p>
                    <p>Owner: ${record.owner}</p>
                    <p>Timestamp: ${new Date(record.timestamp * 1000).toLocaleString()}</p>
                `;
                document.getElementById("recordDetails").innerHTML = recordDetails;
            })
            .catch(error => {
                console.error('Error getting record:', error);
            });
    } catch (error) {
        console.error('Error in getRecord:', error);
    }
}

