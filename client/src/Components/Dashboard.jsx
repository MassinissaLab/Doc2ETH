import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import Popover from "react-awesome-popover";
import Blockies from "react-blockies";
//components and utilities import
import usdb from "../media/UnivBlida.png"
import ifeg from "../media/logo_ifeg.png"
import getWeb3 from "../getWeb3";
import Doc2eth from "../contracts/Doc2eth.json";
import { ipfs } from "../ipfs.util";
import Footer from "./Footer";
import { generateUID,aesKeyiv,encryptAES,decryptAES,mergearrays,urlBlob} from "../utilities";
import {
  Wrapper,
  Light,
  Container,
  Heading,
  FileUpload,
  TopBar,
  Align,
  FileList,
  File,
  Holder,
  SearchHolder,
  AlignCenter,
  SmallButton,
  Info,
  Bar,
  Account,
  Flex, 
} from "../Styles";
const crypto = require('crypto');


const Dashboard = () => {
  const hiddenFileInput = useRef();
  const history = useHistory();

  const [state, setstate] = useState({
    accounts: null,
    web3: null,
    contract: null,
    reader: null,
    buffer: null,
    type: null,
    shareSuccess: "",
    name: null,
    key : null,
    iv : null,
    ipfsError: null,
    loading: false,
  });

  const [allUsers, setUsers] = useState({
    infousers: [],
    currentuser: [],
  });

  const [fileData, setFiles] = useState({
    files: [],
  });

  const [sharedFiles, setSharedFiles] = useState({
    files: [],
  });
  const [showShareModal, setShareModal] = useState({
    show: false,
    address: "",
    file: null,
  });
  const [searchState, setSearch] = useState({
    searchActive: false,
    searchFiles: [],
  });

  useEffect(() => {
    const address = window.ethereum.selectedAddress;

    if (address === null) {
      history.push("/");
    }
    setup();
  }, []);

  const setup = async () => {
    try {
      const web3 = await getWeb3();

      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Doc2eth.networks[networkId];

      const instance = new web3.eth.Contract(
        Doc2eth.abi,
        deployedNetwork && deployedNetwork.address
      );

      await setstate({
        ...state,
        contract: instance,
        accounts,
        web3,
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getData();
    
  }, [state.contract,allUsers.currentuser,allUsers.infousers]);

  const cancelUpload = () => {
    console.log("cancel upload");
    setstate({
      ...state,
      reader: null,
      buffer: null,
      name: null,
      type: null,
      key : null,
      iv : null,
    });
  };
  const getData = async () => {
    const { accounts,web3, contract } = state;
    if (contract) {
      const filesCount = await contract.methods
        .getCount(window.ethereum.selectedAddress)
        .call();

      const usersCount =  await contract.methods.getCountusers().call();

      let files = [];
      let shareFiles = [];
      let listusers = [];
      let theuser = [];


      for (var fileIndex = 0; fileIndex < filesCount; fileIndex++) {
        const FILE = await contract.methods
          .getFilesofUser(fileIndex, window.ethereum.selectedAddress)
          .call();
        if (FILE[0] !== "") {
          files.push(FILE);
        }
      }

      const filesShareCount = await contract.methods
        .getShareCount(window.ethereum.selectedAddress)
        .call();

      for (var fileIndex = 0; fileIndex < filesShareCount; fileIndex++) {
        const FILE = await contract.methods
          .getShareFilesofUser(fileIndex, window.ethereum.selectedAddress)
          .call();
        if (FILE[0] !== "") {
          shareFiles.push(FILE);
        }
      }



     for (var userIndex = 0; userIndex < usersCount; userIndex++) {
        const USER = await contract.methods.getAllUserInfo(userIndex).call();
        const uad = web3.utils.toChecksumAddress(window.ethereum.selectedAddress);
        //console.log("current= "+uad);;
        if(USER[3]!== uad){
          listusers.push(USER);
          //console.log("user "+userIndex+": "+USER[3]);
        }else{
          theuser.push(USER);
          //console.log("currentuser: "+theuser[0][3]);
        }
        
      }
 

      //console.log("SHARED FILE", shareFiles);
      setUsers({
        ...allUsers,
        infousers: listusers,
        currentuser: theuser,
      });
      setSharedFiles({
        ...shareFile,
        files: shareFiles,
      });
      setFiles({
        ...fileData,
        files,
      });


    }
  };

  const handleSubmit = async () => {
    const { accounts, contract } = state;

    console.log("IPFS UPLOAD");
    //console.log(state.buffer);
    setstate({
      ...state,
      loading: true,
    });

    try {

      console.log("Buffer ",state.buffer);
      const enbuffer = await encryptAES(state.buffer,state.key,state.iv);
      const fbuffer = await Buffer.from(enbuffer,'base64');
      
      console.log("Buffer encryptAES",fbuffer);

      console.log('File Type:', state.type);

      const res = await ipfs.add(fbuffer);

      console.log("IPFS RESPONSE OF UPLOAD", res);

      
      const FILE_ID = generateUID();
      const FILE_HASH = res.path;
      const FILE_SIZE = res.size;
      const FILE_KEY = state.key+state.iv;
      console.log('key concat :',FILE_KEY);
      //decryption ipfs
      /*
      const ipfsPath = '/ipfs/'+res.path;
      const chunks = []
        for await (const chunk of ipfs.cat(ipfsPath)) {
          chunks.push(chunk);
      }
      const ebuf = await mergearrays(chunks);
      console.log("Merged ",ebuf);
      const content = await decryptAES(ebuf,state.key,state.iv);
      const buff = Buffer.from(content, 'base64');
      console.log('DECRYPTION --------');
      console.log('key:', state.key, 'iv:', state.iv);
      console.log('content:', content.length);
      console.log("Buffer decrypted AES",buff);
      console.log('File Type:', state.type);
      const blob = new Blob([buff],{type:state.type});
      const srcBlob = await window.URL.createObjectURL(blob);
      await window.open(srcBlob);
      */

   
      const uploadedFile = await contract.methods
        .uploadFile(
          window.ethereum.selectedAddress,
          FILE_ID,
          FILE_HASH,
          FILE_SIZE,
          state.type,
          state.name,
          FILE_KEY
        )
        .send({ from: accounts[0] });

      const uploadedFileDetails = uploadedFile.events.FileUploaded.returnValues;

      //Building file object to add to state with all attributs
      let newAddedFile = {};
      newAddedFile[0] = uploadedFileDetails.fileId;
      newAddedFile[1] = uploadedFileDetails.fileHash;
      newAddedFile[4] = uploadedFileDetails.fileName;
      newAddedFile[2] = uploadedFileDetails.fileSize;
      newAddedFile[3] = uploadedFileDetails.fileType;
      

      const newFilesArray = [newAddedFile, ...fileData.files];
      
      console.log(newFilesArray);
      setFiles({
        ...fileData,
        files: newFilesArray,
      });

     
      // reset the component state of file upload
      setstate({
        ...state,
        buffer: null,
        name: null,
        type: null,
        key : null,
        iv : null,
        loading: false,
      });
    } catch (error) {
      setstate({
        ...state,
        ipfsError: "IPFS Upload Error",
        loading: false,
      });
      console.log("ERROR IPFS", error);
    }
  };

  const handleOnChange = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const file = e.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    //reader.readAsDataURL(file);
    reader.onloadend = () => convertToBuffer(reader,file.type, file.name);
  };

  const convertToBuffer = async (reader, type, name) => {
    const buffer = await Buffer.from(reader.result);

    const  { key, iv } = await aesKeyiv();
    console.log("AES key & IV = ",{ key, iv });

    setstate({
      ...state,
      reader,
      buffer,
      type,
      name,
      key,
      iv,
    });
  };

  const retreiveFile = async (ipfshash,ftype,fname) => {
      const { accounts, contract } = state;
      const ipfsPath = '/ipfs/'+ipfshash;
      //const FKEY = await contract.methods.getFilekey(fileIndex, window.ethereum.selectedAddress).call();

      

      const filesCount = await contract.methods
        .getCount(window.ethereum.selectedAddress)
        .call();


      var FKEY='';


      for (var fileIndex = 0; fileIndex < filesCount; fileIndex++) {
        const FILE = await contract.methods
          .getFilesofUser(fileIndex, window.ethereum.selectedAddress)
          .call();
        if (FILE[1] === ipfshash) {
          FKEY = await contract.methods.getFilekey(fileIndex, window.ethereum.selectedAddress).call();
        }
      }
      console.log(FKEY);
      console.log(fname,ftype);
      
      var aeskey = FKEY.slice(0,32);
      var aesiv = FKEY.slice(32,48)
      
      const chunks = []
        for await (const chunk of ipfs.cat(ipfsPath)) {
          chunks.push(chunk);
      }
      const ebuf = await mergearrays(chunks);
      console.log("Merged ",ebuf);
      
      const content = await decryptAES(ebuf,aeskey,aesiv);
      const buff = Buffer.from(content, 'base64');
      console.log('DECRYPTION --------');
      console.log('key:', aeskey, 'iv:', aesiv);
      console.log("Buffer decrypted AES",buff);
      
      const blob = new Blob([buff],{type:ftype});
      const srcBlob = await window.URL.createObjectURL(blob);
      await window.open(srcBlob);
      
      
  };


  const removeFile = async (fileId, type) => {
    const { accounts, contract } = state;

    if (type === "file") {
      const uploadedFile = await contract.methods
        .removeHash(fileId, window.ethereum.selectedAddress)
        .send({ from: accounts[0] });

      console.log(uploadedFile);

      const newFileList = fileData.files.filter((e) => e[0] !== fileId);

      setFiles({
        ...fileData,
        files: newFileList,
      });
    }

    if (type === "share") {
      const uploadedFile = await contract.methods
        .removeShareHash(fileId, window.ethereum.selectedAddress)
        .send({ from: accounts[0] });

      console.log(uploadedFile);

      const newFileList = sharedFiles.files.filter((e) => e[0] !== fileId);

      setSharedFiles({
        ...sharedFiles,
        files: newFileList,
      });
    }
  };

  const shareFile = async (file, to_address) => {
    const { accounts, contract } = state;

    console.log("Share File");

    setstate({
      ...state,
      loading: true,
    });

    try {
      const FILE_ID = generateUID();
      const FILE_HASH = file[1];
      const FILE_SIZE = file[2];

      const uploadedFile = await contract.methods
        .uploadShareFile(
          to_address,
          FILE_ID,
          FILE_HASH,
          FILE_SIZE,
          file[3],
          file[4]
        )
        .send({ from: accounts[0] });
      console.log(uploadedFile);
      const uploadedFileDetails =
        uploadedFile.events.FileShareUploaded.returnValues;

      //Building file object with its parameters to add to state
      let newAddedFile = {};
      newAddedFile[0] = uploadedFileDetails.fileId;
      newAddedFile[1] = uploadedFileDetails.fileHash;
      newAddedFile[2] = uploadedFileDetails.fileSize;
      newAddedFile[3] = uploadedFileDetails.fileType;
      newAddedFile[4] = uploadedFileDetails.fileName;
      

      const newFilesArray = [newAddedFile, ...fileData.files];
      console.log(newFilesArray);

      // reset the component state of file upload to empty all temporary parameters
      setstate({
        ...state,
        reader: null,
        buffer: null,
        name: null,
        type: null,
        shareSuccess: "File Successfuly shared.",
        loading: false,
      });

      setTimeout(() => {
        setstate({
          ...state,
          shareSuccess: "",
        });
      }, 2000);
    } catch (error) {
      setstate({
        ...state,
        shareSuccess: "Error occured.",
        ipfsError: "Share Error",

        loading: false,
      });
      console.log("Share Error", error);
      setTimeout(() => {
        setstate({
          ...state,
          shareSuccess: "",
        });
      }, 2000);
    }
  };

  const Files = () => {
    if (searchState.searchActive) {
      return searchState.searchFiles.length > 0 ? (
        searchState.searchFiles.map((e, index) => {
          const fileName = e[4];
          let fileIcon;
          if (fileName.endsWith("pdf")) {
            fileIcon = "fas fa-file-pdf fa-5x primary-bis";
          } else if (fileName.endsWith("jpg") || fileName.endsWith("jpeg")|| fileName.endsWith("png")) {
            fileIcon = "fas fa-file-image fa-5x primary-bis";
          } else if (fileName.endsWith("ppt") || fileName.endsWith("pptx")) {
            fileIcon = "fas fa-file-powerpoint fa-5x primary-bis";
          } else if (fileName.endsWith("doc") || fileName.endsWith("docx")) {
            fileIcon = "fas fa-file-word fa-5x primary-bis";
          }else if (fileName.endsWith("txt")) {
            fileIcon = "fas fa-file-alt fa-5x primary-bis";
          }else if (fileName.endsWith("zip")|| fileName.endsWith("rar")) {
            fileIcon = "fas fa-file-archive fa-5x primary-bis";
          }
          return (
            <File key={index}>
              <div className="file-content">
                <div className="part-top">
                  <div>
                    <i className={fileIcon}></i>
                  </div>
                </div>
                <div className="part-bottom flex">
                  <div className="ml-2 w-sm">
                    <p
                      onClick={() =>
                        //window.open(`https://gateway.ipfs.io/ipfs/${e[1]}`)
                        retreiveFile(e[1],e[3],e[4])
                      }
                    >
                      <i className="fas fa-download primary"></i>
                    </p>
                  </div>
                  <div className="center w-lg">
                    <p>
                      {e[4].length > 15 ? `${e[4].slice(0, 15)}...` : e[4]}
                    </p>
                  </div>
                  <div className="w-sm">
                    <p
                      onClick={() =>
                        setShareModal({
                          ...showShareModal,
                          file: e,
                          show: true,
                        })
                      }
                    >
                      <i className="fas fa-share-alt share-b"></i>
                    </p>
                  </div>
                  <div className="ml-2 w-sm">
                    <p onClick={() => removeFile(e[0], "file")}>
                      <i className="fas fa-trash trash-b"></i>
                    </p>
                  </div>
                </div>
              </div>
            </File>
          );
        })
      ) : (
        <div className="center no-files">
          <div>
            <i className="far fa-folder-open light-primary"></i>
          </div>
          <div>
            <p className="small-font">No files</p>
          </div>
        </div>
      );
    } else {
      return fileData.files.length > 0 ? (
        fileData.files
          .map((e, index) => {
            const fileName = e[4];
            let fileIcon;
            if (fileName.endsWith("pdf")) {
            fileIcon = "fas fa-file-pdf fa-5x primary-bis";
            } else if (fileName.endsWith("jpg") || fileName.endsWith("jpeg")|| fileName.endsWith("png")) {
              fileIcon = "fas fa-file-image fa-5x primary-bis";
            } else if (fileName.endsWith("ppt") || fileName.endsWith("pptx")) {
              fileIcon = "fas fa-file-powerpoint fa-5x primary-bis";
            } else if (fileName.endsWith("doc") || fileName.endsWith("docx")) {
              fileIcon = "fas fa-file-word fa-5x primary-bis";
            }else if (fileName.endsWith("txt")) {
              fileIcon = "fas fa-file-alt fa-5x primary-bis";
            }else if (fileName.endsWith("zip")|| fileName.endsWith("rar")) {
              fileIcon = "fas fa-file-archive fa-5x primary-bis";
            }
            return (
              <File key={index}>
                <div className="file-content">
                  <div className="part-top">
                    <div>
                      <i className={fileIcon}></i>
                    </div>
                  </div>
                  <div className="part-bottom flex">
                    <div className="ml-2 w-sm">
                      <p
                        onClick={() =>
                          //window.open(`https://gateway.ipfs.io/ipfs/${e[1]}`)
                          retreiveFile(e[1],e[3],e[4])
                          
                        }
                      >
                        <i className="fas fa-download primary"></i>
                      </p>
                    </div>
                    <div className="center w-lg">
                      <p>
                        {e[4].length > 15 ? `${e[4].slice(0, 15)}...` : e[4]}
                      </p>
                    </div>
                    <div className="w-sm">
                      <p
                        onClick={() =>
                          setShareModal({
                            ...showShareModal,
                            file: e,
                            show: true,
                          })
                        }
                      >
                        <i className="fas fa-share-alt share-b"></i>
                      </p>
                    </div>
                    <div className="ml-2 w-sm">
                      <p onClick={() => removeFile(e[0], "file")}>
                        <i className="fas fa-trash trash-b"></i>
                      </p>
                    </div>
                  </div>
                </div>
              </File>
            );
          })
          .reverse()
      ) : (
        <div className="center no-files">
          <div>
            <i className="fas fa-folder-open light-primary"></i>
          </div>
          <div>
            <p className="small-font">No files</p>
          </div>
        </div>
      );
    }
  };
  const sharedFilestoUser = () => {
    return sharedFiles.files.length > 0 ? (
      sharedFiles.files
        .map((e, index) => {
          const fileName = e[4];
          let fileIcon;
          if (fileName.endsWith("pdf")) {
            fileIcon = "fas fa-file-pdf fa-5x primary-bis";
          } else if (fileName.endsWith("jpg") || fileName.endsWith("jpeg")|| fileName.endsWith("png")) {
            fileIcon = "fas fa-file-image fa-5x primary-bis";
          } else if (fileName.endsWith("ppt") || fileName.endsWith("pptx")) {
            fileIcon = "fas fa-file-powerpoint fa-5x primary-bis";
          } else if (fileName.endsWith("doc") || fileName.endsWith("docx")) {
            fileIcon = "fas fa-file-word fa-5x primary-bis";
          }else if (fileName.endsWith("txt")) {
            fileIcon = "fas fa-file-alt fa-5x primary";
          }else if (fileName.endsWith("zip")|| fileName.endsWith("rar")) {
            fileIcon = "fas fa-file-archive fa-5x primary-bis";
          }
          return (
            <File key={index}>
              <div className="file-content">
                <div className="part-top">
                  <div>
                    <i className={fileIcon}></i>
                  </div>
                </div>
                <div className="part-bottom flex">
                  <div className="ml-2 w-sm">
                    <p
                      onClick={() =>
                        window.open(`https://gateway.ipfs.io/ipfs/${e[1]}`)
                      }
                    >
                      <i className="fas fa-download primary"></i>
                    </p>
                  </div>
                  <div className="center w-lg">
                    <p>
                      {e[4].length > 15 ? `${e[4].slice(0, 15)}...` : e[4]}
                    </p>
                  </div>
                  <div className="w-sm">
                    <p
                      onClick={() =>
                        setShareModal({
                          ...showShareModal,
                          file: e,
                          show: true,
                        })
                      }
                    >
                      <i className="fas fa-share-alt share-b"></i>
                    </p>
                  </div>
                  <div className="ml-2 w-sm">
                    <p onClick={() => removeFile(e[0], "share")}>
                      <i className="fas fa-trash trash-b"></i>
                    </p>
                  </div>
                </div>
              </div>
            </File>
          );
        })
        .reverse()
    ) : (
      <div className="center no-files">
        <div>
          <i className="fas fa-folder-open light-primary"></i>
        </div>
        <div>
          <p className="small-font">No files</p>
        </div>
      </div>
    );
  };
  const searchHandler = (e) => {
    const fileName = e.target.value.toLowerCase();
    console.log(fileName);
    const newFiles = fileData.files.filter((e) => e[4].includes(fileName));
    if (fileName === "") {
      setSearch({ searchActive: false, searchFiles: [] });
    } else {
      setSearch({ searchActive: true, searchFiles: newFiles });
    }
  };

  const getDateString = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toDateString();
  };

  return (
    <div>
      {showShareModal.show && (
        <div className="share-to v-center">
          <div className="share-form">
            <div className="head-con">Share to</div>
            <div>
                <select className="a-input" defaultValue ="choose" onChange={(e) => {
                                setShareModal({...showShareModal,
                                  address: e.target.value,
                                  })
                                }}>
          <option  value="choose" disabled  hidden>Please Choose a receiver...</option>
                {allUsers.infousers.map((userinfos) => (
                  <option className="md-vlist" value={userinfos.uaddress}>{userinfos.userservice}{" | "}{userinfos.ufirstname}{" "}{userinfos.ulastname}</option>
                ))}
            </select>

            </div>
            <div>
              <div className="j-center flex">
                <div
                  onClick={() => {
                    console.log("Shared to : "+showShareModal.address);
                    shareFile(showShareModal.file, showShareModal.address);

                    setShareModal({
                      ...showShareModal,
                      show: false,
                      file: null,
                      address: "",
                    });
                  }}
                  className="s-btn"
                >
                  Share
                </div>
                <div
                  onClick={() => {
                    setShareModal({
                      ...showShareModal,
                      show: false,
                    });
                  }}
                  className="c-btn"
                >
                  Cancel
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {state.shareSuccess ? (
        <div className="sticker v-center">
          <div>
            <p>{state.shareSuccess}</p>
          </div>
        </div>
      ) : null}
      <Bar>
        <Flex>
          <div>
            <p>
              <i className="fab fa-ethereum "></i> Doc2eth |{" "}
              <Light> Decentralized & Secured data files transfer and storage. </Light>
            </p>
          </div>
          <div>
              <img className="usdb-logo" src={usdb} alt="USDB1 logo"/>
              {" "}
              <img className="ifeg-logo" src={ifeg} alt="IFEG logo"/>
          </div>
        </Flex>
      </Bar>
      <Wrapper></Wrapper>

      <input
        style={{ display: "none" }}
        ref={hiddenFileInput}
        type="file"
        onChange={handleOnChange}
      />

      {state.buffer && state.loading === false ? (
        <div className="cancel hover" onClick={cancelUpload}>
          <i className="fas fa-times fa-3x"></i>
        </div>
      ) : null}

      <FileUpload>
        {state.loading ? (
          <div>
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        ) : !state.buffer ? (
          <div onClick={() => hiddenFileInput.current.click()}>
            <i className="fa fa-plus" aria-hidden="true"></i>
          </div>
        ) : (
          <div onClick={() => handleSubmit()}>
            <i className="fa fa-file-upload" aria-hidden="true"></i>
          </div>
        )}
      </FileUpload>
      <Container>
        <TopBar>
          <Account>
            <Align>
              <div>
                <Blockies
                  seed={window.ethereum.selectedAddress}
                  size={9}
                  scale={10}
                  color="#dfe"
                  bgcolor="#ffe"
                  className="identicon"
                  spotcolor="#000"
                />
              </div>
              <AlignCenter>
                <Popover action="hover" overlayColor="rgba(0,0,0,0)">
                  <div>
                   
                     {allUsers.currentuser.map(infou => ( <Info key="currentuser">{infou.userservice}{" | "}{infou.ufirstname}{" "}{infou.ulastname}</Info>))}
                   
                  </div>
                  <div className="sm">
                    <Info>{window.ethereum.selectedAddress}</Info>
                  </div>
                </Popover>
              </AlignCenter>
            </Align>
          </Account>

          <Holder className="flex center">
            <Align className="v-center">
              <div>
                <div className="md display">
                  <i className="fas fa-file md-v"></i>{" "}
                  <p>{fileData.files.length} Files</p>
                </div>
              </div>
            </Align>
            <Align className="v-center">
              <div>
              </div>
            </Align>
          </Holder>
        </TopBar>
        <SearchHolder>
          <div>
            {" "}
            <Heading>My Data Files</Heading>
          </div>
          <div className="flex ">
            <div>
              <input
                type="text"
                className="search"
                placeholder="Search for a file ..."
                onChange={searchHandler}
              />
            </div>
          </div>
        </SearchHolder>
        <FileList>{Files()}</FileList>
        <SearchHolder>
          <div>
            {" "}
            <Heading>Shared Data Files</Heading>
          </div>
          <div className="flex "></div>
        </SearchHolder>
        <FileList>{sharedFilestoUser()}</FileList>
      </Container>
      <Footer />
    </div>
  );
};

export default Dashboard;