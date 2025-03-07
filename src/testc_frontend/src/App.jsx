import MainPage from './pages/MainPage';
import { UserProvider } from "./context/userContext";
import { AuthProvider } from "./context/authContext";
import { SecretProvider } from "./context/secretContext";
import React from 'react';
function App() {

  /*const try_encrypt = async () => {    
    if(userActor)
    {
      userActor.register("Baiumka").then((newUser) => {
        console.log("User ", newUser);
        userActor.addTask("NewTask", "Descrrrrrrr", 2).then((newTask) => {
        console.log("newTask ", newTask);
        const service = new CryptoService(userActor);
        service.encryptWithNoteKey(newTask.id, newTask.descr, newTask.user).then((result) => {
          console.log(result);
        });
      });  
      });
    }
    else
    {
      console.warn("UserActor is null");
    }
 }*/
    return (
      <main>
        <AuthProvider>
          <UserProvider>            
            <SecretProvider>
              <MainPage/>  
            </SecretProvider>
          </UserProvider>
        </AuthProvider>
       </main>
    );
}

export default App;
