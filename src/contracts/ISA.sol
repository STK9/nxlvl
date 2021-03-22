//SPDX-License-Identifier: MIT
pragma solidity >0.7.0;

contract ISA {
    // the owner of the contract
    address owner;

    // a circuit breaker to stop the contract
    bool public contractStatus;

    // (School will) Map Student's Address to ISA agreement (represented as IPFS Hash)
    // mapping(address => string ) private Agreements;

    //Map Address to Uint256, whereyby this Uint256 is from Mapping Hash to Uint256
    // School loads ISA into IPFS. Student retrieve ISA from IPFS with the filehash
    // given by the School. Verify/Agrees and 'SIGN' - block.number capture into 
    // the below mapping
    mapping(address => mapping(string => uint256)) private hashes;
    // eg 0x1234 => ( QM3f => 32)
    //    WalletAdrr => (FileHash => Block.number)

    
    // (School will) store Student's Id & Student's address
    struct StudentInfo {
        uint16 studentId;  // use this to link to external SQL database
        address studentAddr;  
        string fileHash; // ISA document
        bool status;    // actively servicing contract: No: not started/ended
    }
    uint16 public StudentIdCounter;

    StudentInfo[100] Students;  // Interim solution, Dynmanic array of struct doesn't work, need to make
                                // contract upgradeable for future expansion
    
    //Map Student's address to his Payment details
    struct Payment {
        uint256 Bal_Amount; //how much more to paid?
        uint256 Bal_Months;  // how many payments left to go?
    }
    mapping(address => Payment) Payments;

    // an event to be emitted when a new hash has been added
    event LogAdditionEvent(
        address indexed stampper,
        uint256 blockNumber,
        string hash
    );

    //event for a new Payment made
    event LogPaymentEvent(
        address indexed StudentAddr,
        uint256 indexed Amount,
        uint256 indexed block
    );

    // checks if the msg.sender is the owner of the contract
    modifier ownerOnly() {
        require(msg.sender == owner, "You must be the owner!");
        _;
    }

    // checks if Student's record already exists
    modifier StudentExist(address _Address, string memory _fileHash) {
        bool exist= false;
        for (uint16 i=1; i<StudentIdCounter+1; i++) {
                if (Students[i].studentAddr == _Address){
                        exist = true;
                        // break;
            }}        
        require(exist==false, "Student's record exist");
        _;
    }

    // stopInEmergency
    // modifier stopInEmergency {
    //     require(contractStatus, "The contract is down currently!");
    //     _;
    // }

    constructor()  {
        /// set the owner as the contract deployer
        owner = msg.sender;
        // array[0] : dummy
        Students[0].studentId= 0;
        Students[0].studentAddr = owner;
        Students[0].fileHash = '';
        Students[0].status = false;
        StudentIdCounter = 1;   // Start StudentId from 1;  '0' is a dummy record
        contractStatus = true;  
    }

    // Qualified Student registered  key info (id,addr, ISA status) into smart contract
    function storeStudentInfo(address _Address, string memory _fileHash) public StudentExist(_Address,  _fileHash) { 
            Students[StudentIdCounter].studentId = StudentIdCounter;
            Students[StudentIdCounter].studentAddr = _Address;
            Students[StudentIdCounter].fileHash = _fileHash;
            Students[StudentIdCounter].status = false;
            StudentIdCounter += 1;
    
            // emit LogAdditionEvent(msg.sender, block.number, _hash);
            emit LogAdditionEvent(msg.sender, block.number, "stored student info");
    }

    // Display Student's info : Id
    function getStudentInfo(address _Address) public view returns (uint16, address,string memory){
        for (uint16 i=1; i<StudentIdCounter+1; i++) {
            if (Students[i].studentAddr == _Address){
                return (Students[i].studentId, Students[i].studentAddr,Students[i].fileHash);
            }
        }
        address temp= address(0);
        return (65000, temp, "No record"); // no record found
    }


    // School stores Student's ISA payments terms, and update status to true
    // when student has found a job with salary > 30k
    function StorePaymentDetails(address _Address, uint256 _Amount, uint256 _Mths) public returns (bytes32){
        if(Payments[_Address].Bal_Amount != 0){
            return "Record already exists";
        }
        Payments[_Address].Bal_Amount = _Amount;
        Payments[_Address].Bal_Months = _Mths;
        return "Payment terms uploaded";
    }
    
    
    // Student makes periodic payments
    // reduce his balance loans and periods of repayment
    function makePayment(uint256 _amount) payable public {
        require(msg.sender.balance> _amount, "insufficient fund");
        Payments[msg.sender].Bal_Amount -= _amount;
        Payments[msg.sender].Bal_Months -= 1;

        emit LogPaymentEvent(msg.sender,_amount, block.number);
    }
    
    
    // Retrieve Payments details - latest balances
    function getPaymentDetails(address _Addr) public view returns(uint256, uint256){
        return (Payments[_Addr].Bal_Amount, Payments[_Addr].Bal_Months);
        // return (Payments[msg.sender].Bal_Amount, Payments[msg.sender].Bal_Months);
        
    }

    
    // Student Sign by storing IPFS Hash with Block number
     function storeFileHash(string memory fileHash) public  {
        require(
            hashes[msg.sender][fileHash] == 0,
            "This hash has been stored previously!"
        );

        hashes[msg.sender][fileHash] = block.number;

        emit LogAdditionEvent(msg.sender, block.number, fileHash);
    }


    //  @notice Verifies if the hash exists
    // @param stampper The address of the stampper
    // @param hash The hash to be stored
    // @return the block number of a hash if it exists in the contract's state
    // or returns 0
    function verifyFileHash(address StudentAddr, string memory fHash)
        public
        view
        // stopInEmergency
        returns (uint256)
    {
        return hashes[StudentAddr][fHash];
        // return Agreements[stampper];
    }


    /// @notice Enable/Disable contract functionality (a circuit breaker)
    /// @param _contractStatus The new circuit breaker state
    // function updateContractStatus(bool _contractStatus) public ownerOnly {
    //     contractStatus = _contractStatus;

    //     emit LogContractStatusUpdated(_contractStatus);
    // }

    // }
}

