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
      console.log('at Home comp ', props.title)

        const API_BASE_URL = 'https://nv1.herokuapp.com'
        console.log(API_BASE_URL)


        console.log('at home  : access token name', ACCESS_TOKEN_NAME)
        // axios.get(API_BASE_URL+'/user/me', { headers: { 'token': localStorage.getItem(ACCESS_TOKEN_NAME) }})
        // axios.get(API_BASE_URL +'/user', { headers: { 'token': localStorage.getItem(ACCESS_TOKEN_NAME) }})

        // testing
          const token = localStorage.getItem(ACCESS_TOKEN_NAME) ;
          console.log(token)
          if (!token) { 
            console.log("Authentication Failed" )
            redirectToLogin()
          }
          else {
              try {
            const val = jwt.verify(token, "randomString");
            console.log('val', val)
            // req.user = val.user;
            // next();
          } catch (e) {
            console.error(e);
          }
          }
        // testing   :  axios.post  not working as planned

        // axios.post(API_BASE_URL +'/user', { headers: { 'token': localStorage.getItem(ACCESS_TOKEN_NAME) }})
        // .then(function (response) {
        //     if(response.status !== 200){
        //       redirectToLogin()
        //     }
        // })
        // .catch(function (error) {
        //   redirectToLogin()
        // });

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