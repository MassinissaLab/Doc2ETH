import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import Popover from "react-awesome-popover";
import Blockies from "react-blockies";
//components and utilities import
import getWeb3 from "../getWeb3";
import Doc2eth from "../contracts/Doc2eth.json";
import Footer from "./Footer";


const Register = () => {
const [showAddUser, setAddUser] = useState({
  servicename: "",
  firstname: "",
  lastname:"",
});
const [state, setstate] = useState({
  accounts: null,
  web3: null,
  contract: null,
});

useEffect(() => {
  const address = window.ethereum.selectedAddress;
  if (address === null) {
    //history.push("/");
  }
  setup();

},[]);

 const setup = async () => {
    try {
      const _web3 = await getWeb3();

      const waccounts = await _web3.eth.getAccounts();
      const networkId = await _web3.eth.net.getId();
      const deployedNetwork = Doc2eth.networks[networkId];

      const instance = new _web3.eth.Contract(
        Doc2eth.abi,
        deployedNetwork && deployedNetwork.address
      );
      
      setstate({
        ...state,
        contract:instance,
        accounts:waccounts,
        web3:_web3,
      });


      
    } catch (e) {
      console.log(e);
    }
  };

  const RegisterHandler = (_service,_firstname,_adress) => {
    try {
      //modified 
      /*
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Doc2eth.networks[networkId];
      const instance = new web3.eth.Contract(Doc2eth.abi,deployedNetwork && deployedNetwork.address);
      */
      console.log("register @ wallet "+state.accounts[0]);

      
      
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
    
  return (
    <div className="home">
      <div className="bar"></div>
      <div className="mainholder">
        <div className="share-to v-center">
          <div className="share-form">
            <div className="head-con">Register to network</div>
            <div>
              <input
                onChange={(e) => {
                  setAddUser({
                    ...showAddUser,
                    servicename: e.target.value,
                  });
                }}
                className="a-input"
                type="text"
                placeholder="Service name"
                name="service"
              />
              <input
                onChange={(e) => {
                  setAddUser({
                    ...showAddUser,
                    firstname: e.target.value,
                  });
                }}
                className="a-input"
                type="text"
                placeholder="firstname"
                name="firstname"
              />
              <input
                onChange={(e) => {
                  setAddUser({
                    ...showAddUser,
                    latname: e.target.value,
                  });
                }}
                className="a-input"
                type="text"
                placeholder="lastname"
                name="lasttname"
              />
            </div>
            <div>
              <div className="j-center flex">
                <div
                  onClick={() => {
                    //AddUser(showAddUser.servicename,showAddUser.firstname,showAddUser.lastname,state.accounts[0]);
                   // RegisterHandler();
                    //console.log("register @ wallet "+state.accounts[0]);
                    console.log(showAddUser.servicename+"|"+showAddUser.firstname+"|"+showAddUser.lastname+"|"+state.accounts[0]);


                    setAddUser({
                      ...showAddUser,
                      servicename: "",
                      firstname: "",
                      lastname:"",
                      
                    });
                  }}
                  className="s-btn"
                >
                  Add
                </div>
                <div
                  onClick={() => {
                    setAddUser({
                      ...showAddUser,
                      servicename: "",
                      firstname: "",
                      lastname:"",
                      
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
      </div>
    <Footer />
  </div>
    );
};
export default Register;
