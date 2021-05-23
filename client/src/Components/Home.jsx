import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import getWeb3 from "../getWeb3";
import Doc2eth from "../contracts/Doc2eth.json";
import Footer from "./Footer";

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const Home = () => {
  const [isConnected, setConnected] = useState(null);
  const history = useHistory();
  const [open, setOpen] = useState(false);



  useEffect(() => {
    //setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    const currentAddress = window.ethereum.selectedAddress;
    if (currentAddress) {
      setConnected(true);
      console.log("useEffect");
      //history.push("/dashboard");
    } else {
      setConnected(false);
    }
  });



  const authHandler = async () => {
    try {
      //modified 
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Doc2eth.networks[networkId];


      const instance = new web3.eth.Contract(
        Doc2eth.abi,
        deployedNetwork && deployedNetwork.address
      );

      let allusers = [];

      console.log("authHandler "+accounts[0]);
      
              
            
      

        /*
        const adduser = await instance.methods
          .addUser(
            "service one",
            "Vizla",
            accounts[0]
          )
          .send({ from: accounts[0] });*/
        console.log("user added "+accounts[0]);
       
      
      
      const usersCount =  instance.methods.getCountusers().call();

      for (var userIndex = 0; userIndex < usersCount; userIndex++) {
        const USER = instance.methods.getAllUserInfo(userIndex).call();
        
        allusers.push(USER);

      }

      for (var uuserIndex = 0; uuserIndex < allusers.length; uuserIndex++) {
        console.log(allusers[uuserIndex]);

      }

      const userExists = allusers.some(user => user.uaddress === accounts[0]);
      if(userExists) {
         console.log(" exist "+accounts[0]);
         history.push("/dashboard");
         
      }else{

            console.log(" Please add your wallet address to the network "+accounts[0]);
            history.push("/register");
             
            
            
        
      }

      
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };


  if (isConnected === null || isConnected === true) {
      return <h1>Connecting...</h1>;
    } else if (isConnected === false) {
      return (
        <div className="home">
          <div className="bar"></div>
          <div className="mainholder">
            <div className="title">
              <i className="fab fa-ethereum fa-spin"></i> DOC2ETH
            </div>
            <div className="sub-text">Decentralized & Secured data files transfer and storage.</div>
            <button className="login-btn" onClick={authHandler}>
              Metamask Login
            </button>
          </div>
          <Footer />
        </div>
      );
    }
  
};

export default Home;
