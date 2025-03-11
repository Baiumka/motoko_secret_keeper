import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./authContext";
import { UserContext } from "./userContext";
import useErrorDialog from '../hooks/useErrorDialog';
import defaultSecrets from "../utils/defaultSecrets";
import {CryptoService} from '../utils/crypto';

export const SecretContext = createContext();
export const SecretProvider = ({ children }) => {
  
  const {authActor} = useContext(AuthContext);  
  const {isLogin, principal, requestPassword} = useContext(UserContext);  
  const [secrets, setSecrets] = useState([]);
  const [showError, SecretErrorDialog] = useErrorDialog();
  const [cryptoService, SetCryptoService] = useState(null);

  useEffect(() => {
      async function getSecrets()  {
        if (isLogin) {                  
          const password = await requestPassword();
          authActor.getCallerSecrets(String(password)).then(async(secrets) => {                 
              setSecrets(secrets);
              SetCryptoService(new CryptoService(authActor));              
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
    return new Promise(async (resolve, reject) => {
      const password = await requestPassword();   
      authActor.getNextId().then(async(id) => {   
        const encryptContent = await cryptoService.encrypt(password, id, principal, newSecret.content);      
        authActor.addSecret(
          String(password), 
          String(newSecret.title), 
          String(newSecret.web), 
          String(newSecret.descr), 
          encryptContent)
        .then((addedSecret) => {        
          setSecrets([addedSecret, ...secrets]);    
          resolve(addedSecret);  
        })
        .catch((error) => {      
          showError(error.message);
          reject(error);
        });
      });
    });
  };

  const showSecret = async (secret) => {
    return new Promise(async (resolve, reject) => {
      try {
        const password = await requestPassword();
        const decryptedSecret = await cryptoService.decrypt(password, secret.id, principal, secret.content);

        setSecrets((prevSecrets) =>
          prevSecrets.map((s) =>
           s.id === secret.id ? { ...s, decrypt: decryptedSecret } : s
         )
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
};

  const deleteSecret = async(secretID) =>
    {            
      return new Promise(async(resolve, reject) => {
        const password = await requestPassword();
        authActor.deleteSecret(String(password), secretID).then(() => {        
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
        return new Promise(async(resolve, reject) => {
          const password = await requestPassword();
          authActor.updateSecret(
            String(password),
            newSecret.id, 
            String(newSecret.title), 
            String(newSecret.web), 
            String(newSecret.descr))
          .then(() => {           
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
    <SecretContext.Provider value={{secrets, SecretErrorDialog, deleteSecret, updateSecret, addSecret, showSecret}}>
      {children}      
    </SecretContext.Provider>
    
  );
};