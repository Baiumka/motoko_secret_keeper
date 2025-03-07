import { useContext, useState, useEffect } from 'react';
import { SecretContext } from '../context/secretContext';
import { UserContext } from '../context/userContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import SecretDialog from '../comps/SecretDialog';
import SecretCard from '../comps/secretCard';
import {Row, Col} from 'react-bootstrap';

function SecretsList() {
  const { SecretErrorDialog, secrets, deleteSecret, updateSecret, addSecret } = useContext(SecretContext);    
  const {isLogin}  = useContext(UserContext);   
  const [isShowAdd,  setShowAdd] = useState(false);
  const [editedSecret,  setEditedSecret] = useState(null);

  const handlerSaveSecret = async (newSecret) => {    
    if(!editedSecret)
    {
      await addSecret(newSecret);    
    }
    else
    {
      await updateSecret(newSecret);    
    }
    handleCloseClick();
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
                handleEdit={handleEditClick}/>
              </Col>
            ))}
          </Row>
        </div>
        <SecretDialog
            show={isShowAdd}
            handleClose={handleCloseClick}
            handleSave={handlerSaveSecret}     
            editedSecret={editedSecret}           
        />
      </div>) : (<div></div>)}
    {SecretErrorDialog}        
    </div>
  );
}

export default SecretsList;
