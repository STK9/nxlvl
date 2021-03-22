import React,{ useEffect } from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import SchoolAdmin from '../Admin/SchoolAdmin'
import StudentAdmin from '../Admin/StudentAdmin'
import '../../App.css';
import axios from 'axios'
const jwt = require("jsonwebtoken");

const Home = (props) => {

    useEffect(() => {

        const API_BASE_URL = 'https://nv1.herokuapp.com'
          const token = localStorage.getItem(ACCESS_TOKEN_NAME) ;
          if (!token) { 
            redirectToLogin()
          }
          else {
              try {
            const val = jwt.verify(token, "randomString");
          } catch (e) {
               console.error(e);
          }
          }
      })

    function redirectToLogin() {
    props.history.push('/login');
    }

    return(
      <main>
      <div className="header"></div>
        <Switch>
            <Route exact path ='/' component={Home} />
            <Route exact path ='/SchoolAdmin' component={SchoolAdmin} />
            <Route exact path ='/StudentAdmin' component={StudentAdmin} />
            <Route exact path ='/login' component={props.title} />
        </Switch>
  </main>
    )
}

export default withRouter(Home);