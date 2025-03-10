import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./authContext";
import useErrorDialog from '../hooks/useErrorDialog';


export const UserContext = createContext();

const DEFAULT_GUEST_NAME = "Guest";
const DEFAULT_PRINCIPAL = "xxxx-xxxx-xxxx-xxxx";

export const UserProvider = ({ children }) => {
  
  const {authActor, LoginStoic, LoginII, LoginNFID, LoginPlug, authOut} = useContext(AuthContext);  

  const [isLogin, setIsLogin] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isWaitingPassword, setIsWaitigPassword] = useState(false);
  const [passwordPromise, setPasswordPromise] = useState(null);
  const [username, setUserName] = useState(DEFAULT_GUEST_NAME);
  const [principal, setPrincipal] = useState(DEFAULT_PRINCIPAL);
  const [showError, UserErrorDialog] = useErrorDialog();

  useEffect(() => {
    async function fetchUser()  {
      if (authActor) {                    
        authActor.userExist().then(async (exist) => {        
          if(exist)
          {              
              await getUserInfo();
          }
          else
          {
              setIsNewUser(true);
          }     
        })
        .catch((error) => {      
          showError("Fethicng user data error: " + error);
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
  }; 

  const fillUser = async (newUser) => {
    setIsLogin(true);
    setIsNewUser(false);
    setIsWaitigPassword(false);
    setUserName(newUser.nickname);
    setPrincipal(newUser.principal.toText());    
  }; 

  const getUserInfo = async() =>
  {        
    authActor.getUser().then((newUser) => {        
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
      if (passwordPromise) {
        passwordPromise(password);
        setIsWaitigPassword(false);
        setPasswordPromise(null);
      }
      
    }
    catch (error)
    {
      showError(error);
    }
  }; 

  const requestPassword = () => {
    return new Promise((resolve) => {
      setPasswordPromise(() => resolve);
      setIsWaitigPassword(true);
    });
  };
  
  const login = async (authType) => {
    console.log("lpgin", authType);
    try
    {
      switch(authType)
      {
        case "ii":
          await LoginII();
          break;
        case "nfid":
          await LoginNFID();
          break;
        case "Stoic":
          await LoginStoic();
          break;
        case "plug":
          console.log("LoginPlug");
          await LoginPlug();
          console.log("LoginPlugEND");
          break;
        default:
          showError("Unknown login type");
      }
      
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
    <UserContext.Provider value={{isLogin, username, principal, login, logout, register, isNewUser, UserErrorDialog, isWaitingPassword, enterPassword, requestPassword }}>
      {children}      
    </UserContext.Provider>
    
  );
};