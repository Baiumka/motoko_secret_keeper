import React, { createContext, useState, useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, createActor } from "declarations/testc_backend";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [identity, setIdentity] = useState(null);
  const [authActor, setUserActor] = useState(null); 
  
  useEffect(() => {//main

    async function checkAuth() {       
      const authClient = await AuthClient.create();
      if(authClient)
      {            
          const isAuthenticated = await authClient.isAuthenticated();                
          if (isAuthenticated) {          
            console.log("isAuthenticated", isAuthenticated);                      
              await getActorUser();
          }            
          else
          {
            console.log("Waiting for auth");
          }
      }  
    };
  

    checkAuth();
  }, []);

  
  const makeAuth = async () => {        
    if (authActor) return;

    const authClient = await AuthClient.create();

    return new Promise((resolve, reject) => {
        authClient.login({
            identityProvider: getIdentityProvider(),
            onSuccess: async () => {       
                try {
                    await getActorUser();
                    console.log("Auth login success");
                    resolve();  // Сообщаем, что логин завершился
                } catch (error) {
                    console.error("Error in getActorUser:", error);
                    reject(error);
                }
            },
            onError: (err) => {
                console.error("Auth failed:", err);
                reject(err);
            }
        });
    });
};

  const getActorUser = async () => {        
    try
    {        
        const authClient = await AuthClient.create(); 
        const newIdentity = authClient.getIdentity();     
        const newActor = createActor(canisterId, {
                          agentOptions: {
                             identity: newIdentity,
                           },
              });                   
        setIdentity(newIdentity);
        setUserActor(newActor);   
        console.log("Actor created");         
    }
    catch (e)
    {
      console.error("Error during getting actor: ", e);
    }
  };

  const authOut = async () => {
      const authClient = await AuthClient.create();   
      await authClient.logout();      
      setIdentity(null);
      setUserActor(null);             
  };


  const getIdentityProvider = () => {
    let idpProvider;
    // Safeguard against server rendering
    if (typeof window !== "undefined") {
      const isLocal = process.env.DFX_NETWORK == "local";
      // Safari does not support localhost subdomains
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isLocal && isSafari) {
        idpProvider = `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`;
      } else if (isLocal) {
        idpProvider = `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;
      }
      else
      {
        idpProvider = `https://identity.ic0.app/#authorize`;
      }
    }
    return idpProvider;
  };  

  return (
    <AuthContext.Provider value={{makeAuth, authOut, authActor}}>
      {children}
    </AuthContext.Provider>
  );
};