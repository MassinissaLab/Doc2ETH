import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import getWeb3 from "../getWeb3";
import Footer from "./Footer";

const Home = () => {
  const [isConnected, setConnected] = useState(null);
  const [isMobile, setMobile] = useState(false);

  const history = useHistory();

  useEffect(() => {
    setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    const currentAddress = window.ethereum.selectedAddress;
    if (currentAddress) {
      setConnected(true);
      history.push("/dashboard");
    } else {
      setConnected(false);
    }
  });

  const authHandler = async () => {
    try {
      const web3 = await getWeb3();

      history.push("/dashboard");
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  if (isMobile) {
    if (isConnected === null || isConnected === true) {
      return <h1>Connecting...</h1>;
    } else if (isConnected === false) {
      return (
        <div className="home">
          <div className="bar"></div>
          <div className="mainholder">
            <div className="title">
              <i class="fab fa-ethereum"></i> DOC2ETH
            </div>
            <div className="sub-text">Decentralized & Secured data files transfer and storage.</div>
            <br />
            <div className="sub-text">
              Web App not compatible with your device. Please open on Desktop
            </div>
          </div>
          <Footer />
        </div>
      );
    }
  } else {
    if (isConnected === null || isConnected === true) {
      return <h1>Connecting...</h1>;
    } else if (isConnected === false) {
      return (
        <div className="home">
          <div className="bar"></div>
          <div className="mainholder">
            <div className="title">
              <i class="fab fa-ethereum fa-spin"></i> DOC2ETH
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
  }
};

export default Home;
