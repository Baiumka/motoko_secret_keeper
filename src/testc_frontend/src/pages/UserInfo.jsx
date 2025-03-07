import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/userContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import NicknameModal, {MODE_REGISTER, MODE_LOGIN} from "../comps/NicknameModal";


function UserInfo() {
  const { login, logout, isLogin, username, principal, isNewUser, register, UserErrorDialog, isWaitingPassword, enterPassword } = useContext(UserContext);    
  const handleLogin = async () => {
    try
    {
      await login();      
    }
    catch (e)
    {
      showError(e);
    }
  };

  const handleLogout = async () => {
    try
    {
      await logout();
    }
    catch (e)
    {
      showError(e);
    }
  };

  const handleRegister = async (name, password) => {
    try
    {
      await register(name, password);
    }
    catch (e)
    {
      showError(e);
    }
  };

  const handlePassword = async (password) => {
    try
    {
      await enterPassword(password);
    }
    catch (e)
    {
      showError(e);
    }
  };

  return (
    <div className="user-container">    
        <div className="user-card">
        <div>                    
         
          <NicknameModal
            show={isWaitingPassword}
            handleClose={handleLogout}
            handleReg={handleRegister}
            handleLogin={handlePassword}
            mode = {MODE_LOGIN}
          />
          <NicknameModal
            show={isNewUser}
            handleClose={handleLogout}
            handleReg={handleRegister}
            handleLogin={handlePassword}
            mode ={MODE_REGISTER}
          />
          {UserErrorDialog}
        </div>
          <h2 className="user-title">Password Keeper</h2>
          <p className="user-info">Username: <span>{username}</span></p>
          <p className="user-info">Principal: <span>{principal}</span></p>
          {isLogin ? (
            <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
          ) : (
            <button className="btn login-btn" onClick={handleLogin}>Login</button>
          )}
        </div>       
    </div>
  );
}

export default UserInfo;
