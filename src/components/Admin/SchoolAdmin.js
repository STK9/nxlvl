import React, { useState,useContext, useEffect} from 'react';
import '../../App.css';
import {UserContext} from '../../Context/GVar.js';
import {API_BASE_URL, ACCESS_TOKEN_NAME} from '../../constants/apiConstants';
import ISA from '../../abis/ISA.json'
import Web3 from 'web3'

const SchoolAdmin = () => {
    let {fileHash, setFileHash} = useContext(UserContext)
    let {web3} = useContext(UserContext)
    let {account} = useContext(UserContext)
    let {contract} = useContext(UserContext)

  //local states
    let [fh, setFH] = useState(0x0)        // fileHash
    let [cert, setCert]  = useState("---")     // certified if correct copy
    let [acct, setAcct] = useState()        // account
    let [amountRemain, setAmountR] = useState(0);    //how much more to pay
    let [monthsRemain, setMonthsR] = useState(0);    // how many more months to go

    const ipfsClient = require ('ipfs-http-client')
    const ipfs = ipfsClient({ host: 'ipfs.infura.io', port:5001,protocol:'https', apiPath:'/api/v0'})

    // for IPFS
    let [buffer, setbuffer] = useState('')

    // Capture file selected, converted into machine format
    const captureFile = (event) => {      
        event.preventDefault()            
        const file = event.target.files[0]
        const reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = ()=> {
            setbuffer(buffer=>buffer=Buffer(reader.result))
        }  
      }

    //Store ISA document into IPFS and get a fileHash
    const AddtoIPFS = async (event) => {
        event.preventDefault()
            await ipfs.add(buffer,  (error, result) => {
            // fh =   result[0].hash
            fileHash = result[0].hash
            if(error){
                console.error(error)
            }
        })
    }

    // listen to change of metamask account 
    useEffect(() => {
        async function listenMMAccount() {
        window.ethereum.on("accountsChanged", async function() {
            if(web3.web3 !== 1) {    // already initiated Web3 & Blockchain connection
                await loadBlockChain()
            } 
        });
        }
        listenMMAccount();
    }, []); 

    // const loadBlockChain =  async (event) => {
    const loadBlockChain =  async () => {
        // event.prevenDefault()
        let ethereum = window.ethereum;
        web3 = window.web3;
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
            } else {
              window.alert('smart contract not deployed to the detected network')
            }
        } else if (typeof web3 !== 'undefined') {
            web3 =  Web3(web3.currentProvider)
          } else {
              web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER))
            }
      }

    const StoreStudentInfo = async () => {
        await loadBlockChain()
        await contract.methods.storeStudentInfo(account,fileHash).send({from:account})

    }

    const StorePaymentTerms = async (e) => {
        e.preventDefault()
        await loadBlockChain()
        await contract.methods.StorePaymentDetails(account,amountRemain,monthsRemain).send({from:account})
     }

    const RetrieveStudentInfo = async () => {
        await loadBlockChain()
        let data = await contract.methods.getStudentInfo(account).call()
        let key=1
        setAcct(acct=>acct=data[key])
        key = 2
        setFH(fh=>fh=data[key])
        setFileHash(fileHash=>fileHash=fh)
    }   

    const VerifySignature = async (event) => {
        event.preventDefault()
        await RetrieveStudentInfo()
        let Certified = await contract.methods.verifyFileHash(account,fileHash).call()
        setCert(cert=>cert="")   
        if (Certified>0){
            setCert(cert=>cert=1)    
        } else {setCert(cert=>cert=0)    }
    }

    const handleInputChange = (e) => {
        e.preventDefault()
        if (e.target.name === "amount"){
            setAmountR(e.target.value)
        } else {
            setMonthsR(e.target.value)
        }
    }

    function handleLogout() {
        localStorage.removeItem(ACCESS_TOKEN_NAME)
    }

    return(

    <wrapper>
        <article>
            Load ISA Document 
            <form onSubmit={AddtoIPFS}>
                <input type='file'  onChange={captureFile} />
                <input type='submit'  value='Store into IPFS' /> 
            </form>      
        </article>
        <article>        
            <button onClick={StoreStudentInfo}>Create New Student Account</button>
        </article>
        
        <article>        
            <button onClick={RetrieveStudentInfo}>Retrieve Account</button>
            <p>Student address: {acct}</p>
        </article>
        
        <article>        
            <form onSubmit={StorePaymentTerms}>
                <label> Store Payment Details
                    <input type='text' name="amount" placeholder= "5000" onChange={handleInputChange} />
                    <input type='text' name="months" placeholder="60" onChange={handleInputChange} />
                </label>
                <input type='submit' value="Submit" />
            </form>
        </article>
        
        <footer>        
            <button onClick={VerifySignature}>Verify Signature</button>
            <p>Verification: {cert}</p>   
        </footer>
            <div className="ml-auto">
                    <button className="btn btn-danger" onClick={() => handleLogout()}>Logout</button>
            </div>

    </wrapper>
    )
}

export default SchoolAdmin