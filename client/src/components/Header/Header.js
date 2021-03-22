import React from 'react';
import { withRouter, Link } from "react-router-dom";
import { ACCESS_TOKEN_NAME } from '../../constants/apiConstants';
import 'bootstrap/dist/css/bootstrap.min.css';


const Header = (props) => {
    const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }
    let title = capitalize(props.location.pathname.substring(1,props.location.pathname.length))
    if(props.location.pathname === '/') {
        title = 'Welcome!!!!'
    }
    function renderLogout() {
        console.log("pathname ", props.location.pathname)
        if(props.location.pathname === '/home'){
            return(
                <div className="ml-auto">
                    <button className="btn btn-danger" onClick={() => handleLogout()}>Logout</button>
                </div>
            )
        }
    }
    function handleLogout() {
        localStorage.removeItem(ACCESS_TOKEN_NAME)
        props.history.push('/login')
    }
    return(
        <div>
        <nav className="navBar">
            <div className="row col-12 d-flex justify-content-center text-white">
            <ul>
                <li><Link to='/'>Home</Link></li>
                <li><Link to='SchoolAdmin'>School Admin</Link></li>
                <li><Link to='StudentAdmin'>Student Admin</Link></li>
                <li><Link to='login'>Login</Link></li>
            </ul>
            </div>
        </nav>
             <div>
                  {renderLogout()}             
             </div>
        </div>
    )
}
export default withRouter(Header);