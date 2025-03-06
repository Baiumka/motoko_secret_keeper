import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./authContext";
import useErrorDialog from '../hooks/useErrorDialog';

export const UserContext = createContext();

const DEFAULT_GUEST_NAME = "Guest";
const DEFAULT_PRINCIPAL = "xxxx-xxxx-xxxx-xxxx";

export const UserProvider = ({ children }) => {
  
  const {authActor, makeAuth, authOut} = useContext(AuthContext);  

  const [isLogin, setIsLogin] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [username, setUserName] = useState("");
  const [principal, setPrincipal] = useState("");
  const [showError, UserErrorDialog] = useErrorDialog();


  useEffect(() => {
    async function fetchUser()  {
      if (authActor) {
        await getUserInfo();
      } else {
        fillEmptyUser();
      }
    };
  
    fetchUser();
  }, [authActor]); 

  const fillEmptyUser = () => {
    setIsLogin(false);
    setIsNewUser(false);
    setUserName(DEFAULT_GUEST_NAME);
    setPrincipal(DEFAULT_PRINCIPAL);
  }; 

  const fillUser = (newUser) => {
    setIsLogin(true);
    setIsNewUser(false);
    setUserName(newUser.nickname);
    setPrincipal(newUser.principal.toText());
  }; 

  const getUserInfo = async() =>
  {
    authActor.getUser().then((newUser) => {   
      if (newUser.length === 0) {     
        setIsNewUser(true);                      
      } else {             
        fillUser(newUser[0]);  
      }
    })
    .catch((error) => {      
      showError(error.message);
      fillEmptyUser();
    });     
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
    <UserContext.Provider value={{isLogin, username, principal, login, logout, register, isNewUser, UserErrorDialog }}>
      {children}      
    </UserContext.Provider>
    
  );
};