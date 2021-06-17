import React, { Component } from "react";
import Home from "./Components/Home";
import Dashboard from "./Components/Dashboard";
import Register from "./Components/Register";
import ViewerDoc from "./Components/DocViewer";
import { Route, BrowserRouter as Router } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { positions, Provider,transitions } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

const GlobalStyle = createGlobalStyle`
  * {
   box-sizing:border-box;
   padding:0;
   margin:0;
   
  }

  body{
    background-color:#ebf9fc;
    font-family: 'Helvetica';
  }
`;
const options = {
  timeout: 2000,
  position: positions.TOP_CENTER,
  offset: '30px',
  transition: transitions.FADE,

};

class App extends Component {
  render() {
    return (
      <>
        <Provider template={AlertTemplate} {...options}>
          <GlobalStyle />
          <Router>
            <Route exact path="/" component={Home} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/register" component={Register} />
            <Route path="/docviewer" component={ViewerDoc} />
          </Router>
        </Provider>
      </>
    );
  }
}

export default App;
