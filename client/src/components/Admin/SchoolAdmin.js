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
        }   // note: outside this function, reader.result is null!!!
      }

    //Store ISA document into IPFS and get a fileHash
    const AddtoIPFS = async (event) => {
        event.preventDefault()
            await ipfs.add(buffer,  (error, result) => {
            // fh =   result[0].hash
            fileHash = result[0].hash
            console.log ('fHash at IPFS  ', fileHash,  buffer)
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
        // event.preventDefault()
        let ethereum = window.ethereum;
        // w3 = window.web3;
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

    const StoreStudentInfo = async () => {
        // event.preventdefault()

        await loadBlockChain()
        console.log(web3, contract, account, fh)
        // console.log(w3, cont, acct)
        await contract.methods.storeStudentInfo(account,fileHash).send({from:account})
        // let msg = await contract.methods.storeStudentInfo(account).send({from:account})
        // console.log('after SC  ', msg)
        // contract.events.LogAdditionEvent({})
        // .on('data', event=> console.log(event));

        // let et = await new Promise(resolve=> setTimeout(()=>resolve, 2000));
        // console.log(et)
    }

    const StorePaymentTerms = async (e) => {
        e.preventDefault()
        await loadBlockChain()
        console.log(account, contract)
        console.log(amountRemain,monthsRemain)
        await contract.methods.StorePaymentDetails(account,amountRemain,monthsRemain).send({from:account})
     }

    const RetrieveStudentInfo = async () => {
        // event.preventdefault()
        await loadBlockChain()
        // await contract.methods.getStudentInfo(account).call().then((result)=>
        //      console.log('after SC result ', result))
        console.log("account -- ", account)
        let data = await contract.methods.getStudentInfo(account).call()
        let key=1
        setAcct(acct=>acct=data[key])
        key = 2
        setFH(fh=>fh=data[key])
        setFileHash(fileHash=>fileHash=fh)
        console.log("retrieve info data1", data[1])
        console.log("retrieve info acct", acct)
        console.log("retrieve info fh", fh)
        console.log("retrieve info fileHash", fileHash)
    }

    const VerifySignature = async (event) => {
        event.preventDefault()
        // await loadBlockChain()
        await RetrieveStudentInfo()
        console.log('before verifying', account, contract,fileHash)
        let Certified = await contract.methods.verifyFileHash(account,fileHash).call()
        console.log('certified ', Certified)
        setCert(cert=>cert="")   
        if (Certified>0){
            setCert(cert=>cert=1)    
            console.log('inside certified')
            // setCert(1)    
        } else {setCert(cert=>cert=0)    }
        console.log('cert ', cert)
        
    }

    const handleInputChange = (e) => {
        e.preventDefault()
        if (e.target.name === "amount"){
            setAmountR(e.target.value)
            console.log('amountR `` ',amountRemain)    
        } else {
            setMonthsR(e.target.value)
            console.log('amountR `` ',monthsRemain)
    
        }

    }

    function handleLogout() {
        localStorage.removeItem(ACCESS_TOKEN_NAME)
        // history.pushState({pathname: '/login'})
        // props.history.push('/login')
    }

    return(

    // <div className="grid-container">
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
            {/* <p>Verification: {{cert}?"OK":"FAIL!"}</p> */}
        </footer>
            <div className="ml-auto">
                    <button className="btn btn-danger" onClick={() => handleLogout()}>Logout</button>
            </div>

    </wrapper>
    )
}

export default SchoolAdmin