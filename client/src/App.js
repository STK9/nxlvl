import React, {useState} from 'react';
import './App.css';
import Header from './components/Header/Header';
import LoginForm from './components/LoginForm/LoginForm';
import Home from './components/Home/Home';
import PrivateRoute from './utils/PrivateRoute';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import {UserContext} from "./Context/GVar"
import SchoolAdmin from './components/Admin/SchoolAdmin';
import StudentAdmin from './components/Admin/StudentAdmin';

const  App = () =>{
  const [title, updateTitle] = useState(null);
  const [errorMessage, updateErrorMessage] = useState(null);

  let [fileHash, setFileHash] = useState(0x0)
  let [web3, setWeb3] = useState({web3:1})
  let [contract, setContract] = useState({contract:2})
  let [account, setAccount] = useState(0)
  let [studentId, setStudentId ]=  useState(0)


  return (
    <Router>
    <div className="App">
      <Header title={title}/>
        <div className="container d-flex align-items-center flex-column">
          <Switch>
              <UserContext.Provider value={{fileHash, setFileHash, web3, setWeb3, 
                contract, setContract, account, setAccount, studentId, setStudentId}}>
                    <Route path="/login">
                      <LoginForm showError={updateErrorMessage} updateTitle={updateTitle}/>
                    </Route>
                    <PrivateRoute path="/home">
                      <Home />
                    </PrivateRoute>
                    <PrivateRoute path="/schooladmin">
                      <SchoolAdmin />
                    </PrivateRoute>
                    <PrivateRoute path="/studentadmin">
                      <StudentAdmin />
                    </PrivateRoute>

              </UserContext.Provider>
          </Switch>
        </div>
    </div>
    </Router>
  );
}

export default App;
