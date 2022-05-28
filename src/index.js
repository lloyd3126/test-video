import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import './index.css';

import Demo1 from './Demo1';
import Demo2 from './Demo2/Demo2';
import Login from './Login/Login';
import Register from './Register/Register';
import Reset from './Reset/Reset';
import Dashboard from './Dashboard/Dashboard';

import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="demo2">
          <Route path="login" element={<Login />}/>
          <Route path="register" element={<Register />}/>
          <Route path="reset" element={<Reset />}/>
          <Route path="dashboard" element={<Dashboard />}/>
          
          <Route path="ducument" >
            <Route path=":docId" element={<Demo2 />} />
          </Route>
        </Route>
        <Route path="/demo1" element={<Demo1 />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
