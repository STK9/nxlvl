import React, { useState, useEffect, useContext} from 'react';
import '../../App.css';
import {UserContext} from '../../Context/GVar.js';
import ISA from '../../abis/ISA.json'
import Web3 from 'web3'
import {API_BASE_URL, ACCESS_TOKEN_NAME} from '../../constants/apiConstants';
import tokenabi from './tokenabi.json'


const StudentAdmin = () => {
    let {fileHash, setFileHash} = useContext(UserContext)
    let {web3} = useContext(UserContext)
    let {account} = useContext(UserContext)
    let {contract} = useContext(UserContext)

  //local states
    let [payment, SetPayment] = useState(0)
    let [balPaym, setBalPay] = useState()


     // listen to change of metamask account 
     useEffect(() => {
        async function listenMMAccount() {
        window.ethereum.on("accountsChanged", async function() {
            if(web3.web3 !== 1) {    // already initiated Web3 & Blockchain connection
            loadBlockChain()
            } 
        });
        }
        listenMMAccount();
    }, []); 

    const loadBlockChain =  async () => {
        // event.preventDefault()
        let ethereum = window.ethereum;
        web3 = window.web3;
        console.log("w3--- ",  web3)
        if (typeof ethereum !== 'undefined') {
            await ethereum.enable();
            web3 = new Web3(ethereum)
            const accounts = await web3.eth.getAccounts()
            account = accounts[0]
            const networkId = await web3.eth.net.getId()
            const networkData = ISA.networks[networkId]
            if(networkData){
              const abi = ISA.abi
              const address = networkData.address
            contract = await new web3.eth.Contract(abi,address)
              console.log('contract===  ', contract)
            } else {
              window.alert('smart contract not deployed to the detected network')
            }
        } else if (typeof web3 !== 'undefined') {
            web3 =  Web3(web3.currentProvider)
          } else {
              web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER))
            }
      }

    const GetISADoc = async () => {
        // e.preventDefault()
        await loadBlockChain()
        // get IPFS docu for cross checking by Student
        let result = await contract.methods.getStudentInfo(account).call()
        let key = 2
        console.log('hash  ', result[key])        
        fileHash = result[key]
        console.log('fhash ===' , fileHash)       
        let filename = "https://ipfs.infura.io/ipfs/"+fileHash
        // let filename = "https://ipfs.infura.io/ipfs/"+result[key]
        console.log("ISA doc", filename)
        handleDownloadDoc(filename)
    }

    const handleDownloadDoc = (fileName) => {
        // Downloads the file
        console.log(fileName, fileHash)
            fetch(fileName)
                .then(response => {
                    response.blob().then(blob => {
                        let url = window.URL.createObjectURL(blob);
                        let a = document.createElement('a');
                        a.href = url;
                        a.download = 'ISA Document';
                        a.click();
                    });
                    //window.location.href = response.url;
            });
        }
    
    const SignISA = async () => {
        // event.preventDefault
        await loadBlockChain()
        let result = await contract.methods.getStudentInfo(account).call()
        account = result[1]
        fileHash = result[2]        
        // Sign into SC
        await contract.methods.storeFileHash(fileHash).send({from: account})
    }

    const GetPaymentDetails = async(e) => {
        e.preventDefault()
        await loadBlockChain()
        console.log('contract', contract, account)
        let data = await contract.methods.getPaymentDetails(account).call()
        let key = 0
        setBalPay(balPaym=>balPaym=data[key])
    }

    const MakePayment = async (event) => {
        event.preventDefault()
        const tokenAbi = tokenabi;
        let ethereum = window.ethereum;
        web3 = window.web3;
        await ethereum.enable();
        web3 = new Web3(ethereum)
        console.log("w3--- ",  web3)
        const contractAddr = '0x5279c92BFCa9bA98650635E96B14Ec17b8AD39A7'
        const daiiToken = await new web3.eth.Contract(tokenAbi, contractAddr)
        // console.log('daiiToken ', daiiToken)
        // const senderAddress ='0x2a78a2a62dB7D210Ef33285bF9331D6a28e37ADa'

        let senderAddress = ""
        // await web3.eth.getAccounts().then(e => 
        //     { console.log((e[0])) })
        let addr =await web3.eth.getAccounts()   //sender's address
 
        const receiverAddress = '0xb507590428b9eDD48dEba569B790624b0FE013b4'

        let data =await daiiToken.methods.balanceOf(addr[0]).call()
        console.log('data  ', data)
        var str = web3.utils.fromWei(data);
            console.log('str  ', str)

        console.log('payment  ',payment)
        daiiToken.methods
        .transfer(receiverAddress, web3.utils.toWei(payment))
        .send({ from: addr[0] }, function (err, res) {
          if (err) {
            console.log("An error occured", err)
            return
          }
          console.log("Hash of the transaction: " + res)
        })

        await loadBlockChain()
        await contract.methods.makePayment(payment).send({from:account})
        

    }

    const handleInputChange = e => {
        e.preventDefault()
        SetPayment(e.target.value)
    }

    function handleLogout() {
        localStorage.removeItem(ACCESS_TOKEN_NAME)
        // history.pushState({pathname: '/login'})
        // props.history.push('/login')
    }

 


    return(
        <wrapper>
            <article>
                <button onClick={GetISADoc}>Get ISA document</button>
                <a href={`https://ipfs.infura.io/ipfs/${fileHash}`}
                    download={`https://ipfs.infura.io/ipfs/${fileHash}`.saveAsFileName}>
                </a>
            </article>
            <article>
                <button onClick={GetPaymentDetails}>Get Payment Details </button>
                <p>Balance Payments: {balPaym}</p>
            </article>
            <article>
                <button onClick={SignISA}>Sign ISA </button>        
            </article>
            <footer>
                <form onSubmit={MakePayment}>
                <label> Make Payment
                    <input type='text' name="amount" placeholder= "100" onChange={handleInputChange} />
                </label>
                <input type='submit' value="Submit" />
                </form>
            </footer>
            <div className="ml-auto">
                    <button className="btn btn-danger" onClick={() => handleLogout()}>Logout</button>
            </div>

        </wrapper>
    )   
}
export default StudentAdmin