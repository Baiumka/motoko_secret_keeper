import { useContext, useState, useEffect } from 'react';
import { SecretContext } from '../context/secretContext';
import { UserContext } from '../context/userContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import SecretDialog from '../comps/SecretDialog';
import SecretCard from '../comps/secretCard';
import {Row, Col} from 'react-bootstrap';

function SecretsList() {
  const { SecretErrorDialog, secrets, deleteSecret, updateSecret, addSecret, showSecret } = useContext(SecretContext);    
  const {isLogin}  = useContext(UserContext);   
  const [isShowAdd,  setShowAdd] = useState(false);
  const [editedSecret,  setEditedSecret] = useState(null);
  const [isLoadingAdd, setIsLoadingAdd] = useState(false);

  const handlerSaveSecret = async (newSecret) => {    
    setIsLoadingAdd(true);
    if(!editedSecret)
    {
      await addSecret(newSecret);    
    }
    else
    {
      await updateSecret(newSecret);    
    }
    handleCloseClick();
    setIsLoadingAdd(false);
  };

  const handelDelete = async (secretID) => {        
    await deleteSecret(secretID);
  };

  const handleEditClick = async (secret) => {        
    setEditedSecret(secret);
    setShowAdd(true);  
  };

  const handleAddClick = async () => {        
    setEditedSecret(null);
    setShowAdd(true);    
  };

  const handleCloseClick = async () => {        
    setEditedSecret(null);
    setShowAdd(false);    
  };

  const handlerShowClick = async (secret) => {        
    await showSecret(secret);    
  };



  return (
    <div className="container align-items-center">
      {isLogin ? (
      <div>        
        <div className="md-12">
          <Row >
            <Col md={6}>                
                <button className='card btn big' onClick={handleAddClick}>+</button>              
            </Col>
            {secrets.map(secret => (              
              <Col md={6} key={secret.id}>
              <SecretCard
                secret={secret}
                handleDelete={handelDelete}
                handleEdit={handleEditClick}
                handleShow={handlerShowClick}/>
              </Col>
            ))}
          </Row>
        </div>
        <SecretDialog
            show={isShowAdd}
            handleClose={handleCloseClick}
            handleSave={handlerSaveSecret}     
            editedSecret={editedSecret}     
            isLoading={isLoadingAdd}      
        />
      </div>) : (<div></div>)}
    {SecretErrorDialog}        
    </div>
  );
}

export default SecretsList;
