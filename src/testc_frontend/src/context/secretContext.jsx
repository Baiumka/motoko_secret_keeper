import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./authContext";
import { UserContext } from "./userContext";
import useErrorDialog from '../hooks/useErrorDialog';
import defaultSecrets from "../utils/defaultSecrets";

export const SecretContext = createContext();
export const SecretProvider = ({ children }) => {
  
  const {authActor} = useContext(AuthContext);  
  const {isLogin, cookies} = useContext(UserContext);  
  const [secrets, setSecrets] = useState([]);
  const [showError, SecretErrorDialog] = useErrorDialog();

  useEffect(() => {
      async function getSecrets()  {
        console.log("getSecrets", isLogin);
        if (isLogin) {        
          console.log("fix login ", cookies.password);
          authActor.getCallerSecrets(String(cookies.password)).then((secrets) => {  
              console.log("Secrets",secrets);      
              setSecrets(secrets);
          })
          .catch((error) => {      
              showError("Get Secret Errpr: " + error.message);            
          });    
        } 
        else
        {          
          setSecrets([]);
        }
      };
    
      getSecrets();
    }, [isLogin]); 

  const addSecret = async(newSecret) =>
  {            
    return new Promise((resolve, reject) => {
      authActor.addSecret(
        String(cookies.password), 
        String(newSecret.title), 
        String(newSecret.web), 
        String(newSecret.descr), 
        { Text: String(newSecret.content) })
      .then((addedSecret) => {        
        console.log("Added: ", addedSecret);     
        setSecrets([addedSecret, ...secrets]);    
        resolve(addedSecret);  
      })
      .catch((error) => {      
        showError(error.message);
        reject(error);
      });
    });
  };

  const deleteSecret = async(secretID) =>
    {            
      return new Promise((resolve, reject) => {
        authActor.deleteSecret(String(cookies.password), secretID).then(() => {        
          console.log("Success delete. ");   
          setSecrets(secrets.filter(secret => secret.id !== secretID));     
          resolve(true);  
        })
        .catch((error) => {      
          showError(error.message);
          reject(error);
        });
      });
    };

    const updateSecret = async(newSecret) =>
      {            
        return new Promise((resolve, reject) => {
          authActor.updateSecret(
            String(cookies.password),
            newSecret.id, 
            String(newSecret.title), 
            String(newSecret.web), 
            String(newSecret.descr), 
            { Text: String(newSecret.content) })
          .then(() => {        
            console.log("Updated secret: ", newSecret);     
            setSecrets(oldSecret => 
              oldSecret.map(secret => 
                secret.id === newSecret.id ? {...secret, ...newSecret} : secret
              )
            );
            resolve(newSecret);  
          })
          .catch((error) => {      
            showError(error.message);
            reject(error);
          });
        });
      };

  


  return (
    <SecretContext.Provider value={{secrets, SecretErrorDialog, deleteSecret, updateSecret, addSecret}}>
      {children}      
    </SecretContext.Provider>
    
  );
};