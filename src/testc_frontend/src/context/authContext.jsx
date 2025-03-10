import React, { createContext, useState, useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId} from "declarations/testc_backend";
import * as auth from "../utils/auth_utils";
import { StoicIdentity } from 'ic-stoic-identity';
import { HttpAgent } from "@dfinity/agent";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
  const [authActor, setUserActor] = useState(null); 
  const [provider, setProvider] = useState("");

  
  async function checkPlug() {            
    if(!provider) {        
      console.log("Checking plug");            
      const isConnected = await window.ic.plug.isConnected();                   
      if (isConnected) {    
        setProvider("plug");      
        console.log("Plug is connected");
        await window.ic.plug.createAgent({canisterId});         
        const agent = window.ic.plug.agent;
        await getActorUser({agent: agent});
      }            
    }

  };

  async function checkII() {           
    if(!provider) {
      console.log("Checking II");
      const authClient = await AuthClient.create();
      if(authClient)
      {            
          const isAuthenticated = await authClient.isAuthenticated();                
          if (isAuthenticated) {          
            console.log("isAuthenticated", isAuthenticated);      
            setProvider("ii");                    
            await getActorUser({identity: authClient.getIdentity()});
          }            
      }  
    }
  };

  async function checkAuth() {      
    //authOut();
    await checkII(); 
    //await checkPlug();
    
  };



  useEffect(() => {//main  
    checkAuth();
  }, []);


  const LoginStoic = async() => {
    if(authActor) return;       
    return new Promise(async(resolve, reject) => { 
    const identity = await StoicIdentity.load().then(async identity => {
        const userIdentity = await StoicIdentity.connect();
        return userIdentity;
    });
    const agent = new HttpAgent({identity, host: "https://ic0.app"});
    await getActorUser({agent: agent});
    resolve();
  });
 }


  const LoginPlug = async()  => {    
      if(authActor) return;        
      return new Promise(async(resolve, reject) => { 
        console.log("Start request connect");
        await window.ic.plug.requestConnect({canisterId});
        console.log("Start request agent");
        const agent = window.ic.plug.agent;            
        setProvider("plug");    
        await getActorUser({agent: agent});
        console.log("agent", agent);  
        resolve(agent);    
    });
  }

  const LoginII = async () => {        
    if (authActor) return;    

    return new Promise(async (resolve, reject) => {       
        await LoginIdentity(auth.getIdentityProvider());
        resolve();
    });
};

  const LoginNFID = async () => {
    return new Promise(async (resolve, reject) => {      
      const appName = "secret-keeper-test";
      const appLogo = "https://internetcomputer.org/img/IC_logo_horizontal_white.svg";
      const authPath = "/authenticate/?applicationName=" + appName + "&applicationLogo=" + appLogo + "#authorize";
      const authUrl = "https://nfid.one" + authPath;
  
      await LoginIdentity(authUrl);
      resolve();
    });
  };

  const LoginIdentity = async (provider) => {        
    if (authActor) return;

    const authClient = await AuthClient.create();
    return new Promise((resolve, reject) => {
        authClient.login({
            identityProvider: provider,
            onSuccess: async () => {       
                try {
                    await getActorUser({identity: authClient.getIdentity()});
                    console.log("Auth login success");
                    setProvider("ii");    
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



  const getActorUser = async (options) => {        
    try
    {        
        let newActor;
        if(options.agent)
        {
            newActor = auth.createUserActor({agent: options.agent});
        }
        else if(options.identity)
        {
          newActor = auth.createUserActor({agentOptions: {identity: options.identity}});
        }
        else
        {
          console.error("Have not info abount agent or identity.");
        }
         
                      
        setUserActor(newActor);           
        console.log("Actor created", newActor);         
    } 
    catch (e)
    {
      console.error("Error during getting actor: ", e);
    }
  };
  



  const authOut = async () => {
    const authClient = await AuthClient.create();   
    await authClient.logout();          
    setUserActor(null);             
  };


 

  return (
    <AuthContext.Provider value={{LoginII, LoginPlug, LoginStoic, LoginNFID, authOut, authActor}}>
      {children}
    </AuthContext.Provider>
  );
};