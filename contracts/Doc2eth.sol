pragma solidity ^0.5.3;

contract Doc2eth{
    
    string public name = 'Doc2eth';
    
    //File structure attributes
    struct File {
        string fileId;
        string fileHash;
        uint fileSize;
        string fileType;
        string fileName;
        uint uploadTime;
    }

    struct User{
      string service;
      string firstname;
      string lastname;
      address userwallet;

    }


    //get all the current user files hashes that have been uploaded by the current user
    mapping(address => File[]) public users;
    // get all shared files hashes that have been shared to the current user
    mapping(address => File[]) public shares;

    
    // all users 
    User[] public allUsers;
      //envent on file upload action

     event FileUploaded(
        string fileId,
        string fileHash,
        uint fileSize,
        string fileType,
        string fileName,
        uint uploadTime
  );
      //event on file sharing action
       event FileShareUploaded(
        string fileId,
        string fileHash,
        uint fileSize,
        string fileType,
        string fileName,
        uint uploadTime
  );
        event UserAdded(
        string service,
        string firstname,
        string lastname,
        address userwallet
  );
  
  constructor() public {
  }
  //add new user info
  function addUser(string memory _service,string memory _firstname,string memory _lastname,address _userwallet) public payable returns(string memory userservice,string memory ufirstname,string memory ulastname,address uaddress) {
    require(bytes(_service).length > 0,"Invalid Service Name");
    require(bytes(_firstname).length > 0,"Invalid First Name");
    require(bytes(_lastname).length > 0,"Invalid Last Name");
          
    allUsers.push(User(_service,_firstname,_lastname,_userwallet));
    userservice=_service;
    ufirstname=_firstname;
    ulastname=_lastname;
    uaddress=_userwallet;

    emit UserAdded(_service,_firstname,_lastname,_userwallet);
    
  }

   function getCountusers() public view returns(uint){
      
    return allUsers.length;
  }
  //get all user info by index
  function getAllUserInfo(uint _index) public view returns
  (string memory userservice,string memory ufirstname,string memory ulastname,address uaddress) {
      

      require(_index>=0);
      User memory tmp = allUsers[_index];
      userservice=tmp.service;
      ufirstname=tmp.firstname;
      ulastname=tmp.lastname;
      uaddress=tmp.userwallet;
        
  }
 

   // function of uplading a file  
  function uploadFile(address _address,string memory _fileId,string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName) public returns(string memory,string memory,uint, string memory,string memory,uint) {

    require(bytes(_fileHash).length > 0,"Invalid File Hash");
    require(bytes(_fileId).length > 0,"Invalid File ID");
    require(bytes(_fileType).length > 0,"Invalid File Type");
    require(bytes(_fileName).length > 0,"Invalid Service Name");
    require(_address != address(0),"Invalid address");
    require(_fileSize>0,"Invalid File Size");
    
    users[_address].push(File(_fileId,_fileHash, _fileSize, _fileType, _fileName, now));


    emit FileUploaded(_fileId,_fileHash, _fileSize, _fileType, _fileName,now);


    uint length = users[_address].length;

    File memory file = users[_address][length-1];
      
    return (file.fileId,file.fileHash,file.fileSize,file.fileType,file.fileName,file.uploadTime);
  }
  
  function getCount(address _address) public view returns(uint){
      
    return users[_address].length;
  }
  //return files of current user

  function getFilesofUser(uint _index, address _address)
  public view returns(string memory,string memory,uint, string memory,string memory,uint) {
      
      
      require(_index>=0);
      
      File memory file = users[_address][_index];
      
      return (file.fileId,file.fileHash,file.fileSize,file.fileType,file.fileName,file.uploadTime);
    
  }
    //remove file hash from the blockchain
    function removeHash(string memory _fileId, address _address) public {
      
         File[] storage f = users[_address];
  
         for (uint i = 0; i < f.length; i++) {
             if (keccak256(abi.encodePacked(f[i].fileId)) == keccak256(abi.encodePacked(_fileId))) {
              
               delete users[_address][i];
                 
             }
             
         }
  }
  //share file
  function uploadShareFile(address _to,string memory _fileId,string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName) public returns(string memory,string memory,uint, string memory,string memory,uint) {

    require(bytes(_fileHash).length > 0,"Invalid File Hash");
    require(bytes(_fileId).length > 0,"Invalid File ID");
    require(bytes(_fileType).length > 0,"Invalid File Type");
    require(bytes(_fileName).length > 0,"Invalid Service Name");
    require(_to!=address(0),"Invalid receiver address");
    require(_fileSize>0,"Invalid File Size");
    
    shares[_to].push(File(_fileId,_fileHash, _fileSize, _fileType, _fileName, now));


    emit FileShareUploaded(_fileId,_fileHash, _fileSize, _fileType, _fileName,now);


    uint length = shares[_to].length;

    File memory file = shares[_to][length-1];
      
    return (file.fileId,file.fileHash,file.fileSize,file.fileType,file.fileName,file.uploadTime);
  }

  //get the number of shared files

  function getShareCount(address _address) public view returns(uint){
      
    return shares[_address].length;
  }
  
  function getShareFilesofUser(uint _index,address _address) public view returns(string memory,string memory,uint, string memory,string memory,uint) {
      
      
      require(_index>=0);
      
      File memory file = shares[_address][_index];
      
      return (file.fileId,file.fileHash,file.fileSize,file.fileType,file.fileName,file.uploadTime);
    
  }
    // remove hash of a shred files for current user in the blockchain
  function removeShareHash(string memory _fileId,address _address) public {
      
         File[] storage f = shares[_address];
  
         for (uint i = 0; i < f.length; i++) {
             if (keccak256(abi.encodePacked(f[i].fileId)) == keccak256(abi.encodePacked(_fileId))) {
              
               delete shares[_address][i];
                 
             }
             
         }
  }

    
}