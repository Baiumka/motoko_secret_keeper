import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/userContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import NicknameModal, {MODE_REGISTER, MODE_LOGIN} from "../comps/NicknameModal";
import SecretsList from './SecretsList';

function MainPage() {
  const { login, logout, isLogin, username, principal, isNewUser, register, UserErrorDialog, isWaitingPassword, enterPassword } = useContext(UserContext);    

  const handleLogin = async (authType) => {
    try
    {
      console.log("start login");
      await login(authType);      
      console.log("end login");
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
          <p className="user-info user-princ">Principal: <span>{principal}</span></p>
          {isLogin ? (
            <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
          ) : (
            <div>
            <button className="btn login-btn" onClick={() => handleLogin("ii")}>Login (Interntet Identity)</button>
            <button className="btn login-btn" onClick={() => handleLogin("plug")}>Login (Plug Wallet)</button>
            <button className="btn login-btn" onClick={() => handleLogin("nfid")}>Login (NFID)</button>
            <button className="btn login-btn" onClick={() => handleLogin("Stoic")}>Login (Stoic)</button>
            </div>
          )}
          <img className="logo col" src="/logo2.svg" alt="DFINITY logo"/>
        </div>  
        <SecretsList/>             
    </div>
    
  );
}

export default MainPage;
