import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./authContext";
import { UserContext } from "./userContext";
import useErrorDialog from '../hooks/useErrorDialog';
import defaultSecrets from "../utils/defaultSecrets";
import {CryptoService} from '../utils/crypto';
import { decrypt } from "dotenv";

export const SecretContext = createContext();
export const SecretProvider = ({ children }) => {
  
  const {authActor} = useContext(AuthContext);  
  const {isLogin, principal, requestPassword} = useContext(UserContext);  
  const [secrets, setSecrets] = useState([]);
  const [showError, SecretErrorDialog] = useErrorDialog();
  const [cryptoService, SetCryptoService] = useState(null);

  useEffect(() => {
      async function getSecrets()  {
        console.log("getSecrets", isLogin);
        if (isLogin) {                  
          const password = await requestPassword();
          console.log("fix login ", password);
          authActor.getCallerSecrets(String(password)).then(async(secrets) => {  
              console.log("Secrets",secrets);                    
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
          console.log("Added: ", addedSecret);     
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

      //const kek = await cryptoService.encrypt(2, principal, "1234567890ab13");
      //console.log(kek);
      //const kek2 = await cryptoService.decrypt(2, principal, kek);
      //console.log(kek2);   

      try {
        const password = await requestPassword();
        const decryptedSecret = await cryptoService.decrypt(password, secret.id, principal, secret.content);
        console.log("Decrypted Secret:", decryptedSecret);

        setSecrets((prevSecrets) =>
          prevSecrets.map((s) =>
           s.id === secret.id ? { ...s, decrypt: decryptedSecret } : s
         )
        );
        resolve();
      } catch (error) {
        console.error("Decryption error:", error);
        reject(error);
      }
    });
};

  const deleteSecret = async(secretID) =>
    {            
      return new Promise(async(resolve, reject) => {
        const password = await requestPassword();
        authActor.deleteSecret(String(password), secretID).then(() => {        
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
        return new Promise(async(resolve, reject) => {
          const password = await requestPassword();
          authActor.updateSecret(
            String(password),
            newSecret.id, 
            String(newSecret.title), 
            String(newSecret.web), 
            String(newSecret.descr))
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
    <SecretContext.Provider value={{secrets, SecretErrorDialog, deleteSecret, updateSecret, addSecret, showSecret}}>
      {children}      
    </SecretContext.Provider>
    
  );
};