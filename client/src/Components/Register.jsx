import React, { useEffect, useState} from "react";
import { useHistory } from "react-router-dom";
import { useAlert } from "react-alert";
import { Textbox } from 'react-inputs-validation';
//components and utilities import
import getWeb3 from "../getWeb3";
import Doc2eth from "../contracts/Doc2eth.json";
import Footer from "./Footer";


const Register = () => {
const alert = useAlert();  
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
const history = useHistory();
useEffect(() => {
  const address = window.ethereum.selectedAddress;
  if (address === null) {
    history.push("/");
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

  const RegisterHandler = async(_service,_firstname,_lastname,_adress) => {
    try {

      const adduser = await state.contract.methods
          .addUser(
            _service,
            _firstname,
            _lastname,
            _adress
          ).send({ from: state.accounts[0] });
      
       
       
       alert.success(_firstname+" "+_lastname+ ",Your Information are added sucessfully");
       history.push("/");
       
    } catch (error) {

      alert.error("Failed to load web3, accounts, or contract. Check console for details!");
      history.push("/");
      console.error(error);
    }
  };
    
  return (
    <div className="home">
      <div className="bar"></div>
      <div className="title-register v-center">
          <i className="fas fa-address-book fa-1x"></i> DOC2ETH
        </div>
      <div className="mainholder">
        
        <div className="add-to-network  v-center">
          <div className="add-form">
            <div className="head-con">Register To Wallets Book</div>
            <div>
              <Textbox
                  attributesInput={{ // Optional.
                    id: 'servicename',
                    name: 'Service',
                    type: 'text',
                    placeholder: 'Place your service name',
                    className : 'a-input',
                    
                  }}

                onChange={(name,e) => {
                  setAddUser({
                    ...showAddUser,
                    servicename: e.target.value.replace(/[^a-zA-Z\s]/g,""),
                  });
                }}
                value={showAddUser.servicename}
                onBlur={(e) => {console.log(e)}}
                className="a-input"
                validationOption={{
                    name: 'Service',
                    check: true, 
                    required: true 
                  }}

              />
              <Textbox
                attributesInput={{ // Optional.
                    id: 'firstname',
                    name: 'First name',
                    type: 'text',
                    placeholder: 'Place your first name',
                    className : 'a-input',

                  }}
                onChange={(name,e) => {
                  setAddUser({
                    ...showAddUser,
                    firstname: e.target.value.replace(/[^a-zA-Z\s]/g,""),
                  });
                }}
                value= {showAddUser.firstname}
                onBlur={(e) => {console.log(e)}}
                validationOption={{
                    name: 'Firs tname',
                    check: true, 
                    required: true 
                  }}
                
              />
              <Textbox
                attributesInput={{ // Optional.
                    id: 'lastname',
                    name: 'Last name',
                    type: 'text',
                    placeholder: 'Place your last name',
                    className : 'a-input',
                    
                  }}
                onChange={(name,e) => {
                  setAddUser({
                    ...showAddUser,
                    lastname: e.target.value.replace(/[^a-zA-Z\s]/g,""),
                  });
                }}
                value={showAddUser.lastname}
                onBlur={(e) => {console.log(e)}}
                validationOption={{
                    name: 'Last name',
                    check: true, 
                    required: true 
                  }}

                
              />
            </div>
            <div>
              <div className="j-center flex">
                <div
                  onClick={() => {
                   
                    if(showAddUser.servicename==="" ||showAddUser.firstname==="" ||showAddUser.lastname===""){
                       alert.show( 'Please ,fill all the input fields or remove speciale caracters');

                    }else{
                      console.log("clicked register @ wallet "+state.accounts[0]);
                      RegisterHandler(showAddUser.servicename,showAddUser.firstname,showAddUser.lastname,state.accounts[0]);
                    }
                    

                    setAddUser({
                      ...showAddUser,
                      servicename: "",
                      firstname: "",
                      lastname:"",
                      
                    });
                  }}
                  className="s-btn"
                  type="submit"
                >
                  Add
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
