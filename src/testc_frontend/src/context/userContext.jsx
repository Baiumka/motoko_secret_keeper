import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./authContext";
import useErrorDialog from '../hooks/useErrorDialog';
import { useCookies } from "react-cookie";

export const UserContext = createContext();

const DEFAULT_GUEST_NAME = "Guest";
const DEFAULT_PRINCIPAL = "xxxx-xxxx-xxxx-xxxx";

export const UserProvider = ({ children }) => {
  
  const {authActor, makeAuth, authOut} = useContext(AuthContext);  

  const [isLogin, setIsLogin] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isWaitingPassword, setIsWaitigPassword] = useState(false);
  const [username, setUserName] = useState(DEFAULT_GUEST_NAME);
  const [principal, setPrincipal] = useState(DEFAULT_PRINCIPAL);
  const [showError, UserErrorDialog] = useErrorDialog();
  const [cookies, setCookie, removeCookie] = useCookies(["password"]);


  useEffect(() => {
    async function fetchUser()  {
      if (authActor) {        
        authActor.userExist().then((exist) => {        
          if(exist)
          {
            if(!cookies.password)
            {
              setIsWaitigPassword(true);
            }
            else
            {              
              getUserInfo(cookies.password);
            }
          }
          else
          {
              setIsNewUser(true);
          }     
        })
        .catch((error) => {      
          showError(error.message);
        });           
      } 
    };
  
    fetchUser();
  }, [authActor]); 

  const fillEmptyUser = () => {
    setIsLogin(false);
    setIsNewUser(false);
    setIsWaitigPassword(false);
    setUserName(DEFAULT_GUEST_NAME);
    setPrincipal(DEFAULT_PRINCIPAL);
    removeCookie("password");
  }; 

  const fillUser = (newUser) => {
    setIsLogin(true);
    setIsNewUser(false);
    setIsWaitigPassword(false);
    setUserName(newUser.nickname);
    setPrincipal(newUser.principal.toText());
    setCookie("password", newUser.password, { path: "/", maxAge: 3600 });
  }; 

  const getUserInfo = async(password) =>
  {
    authActor.getUser(String(password)).then((newUser) => {        
      fillUser(newUser);        
    })
    .catch((error) => {      
      showError(error.message);
      fillEmptyUser();
      logout();
    });     
  };

  const enterPassword = async (password) => {
    try
    {
      await getUserInfo(password);
    }
    catch (error)
    {
      showError(error);
    }
  }; 

  const login = async () => {
    try
    {
      await makeAuth();
    }
    catch (error)
    {
      showError(error);
    }
  }; 
  const logout = async () => {
    try
    {
      await authOut();
      fillEmptyUser();
    }
    catch (error)
    {
      showError(error);
    }
  }; 
  
  const register = async (newName, newPass) => {        
      authActor.register(newName, newPass).then((newUser) => {   
        fillUser(newUser);       
      })
      .catch((error) => {      
        showError(error.message);
      });          
  }; 



  return (
    <UserContext.Provider value={{isLogin, username, principal, login, logout, register, isNewUser, UserErrorDialog, isWaitingPassword, enterPassword }}>
      {children}      
    </UserContext.Provider>
    
  );
};