import { useContext, useState, useEffect } from 'react';

function SecretCard({secret, handleDelete, handleEdit, handleShow}) {   
    
    const [copised, setCopied] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(secret.decrypt);
        setCopied(true);
    };

    const handleDeleteClick = () => {
        handleDelete(secret.id);
    };

    const handleEditClick = () => {
        handleEdit(secret);
    };

    const handleShowClick = () => {
        setLoading(true);
        handleShow(secret);
    };

  return (
    
    <div className="card shadow p-3 mb-3" key={secret.id}>
    <div className="d-flex justify-content-between align-items-center">
      <h3 className="mb-0 d-flex align-items-center">
        {secret.title}        
          <button className="btn btn-danger" onClick={handleDeleteClick}>X</button>
          <button className="btn btn-primary " onClick={handleEditClick}>EDIT</button>       
      </h3>
    </div>
  
    <p>
      <strong>Website: </strong> 
      <a href={`https://${secret.web.replace(",", ".")}`} target="_blank" rel="noopener noreferrer">
        {secret.web.replace(",", ".")}
      </a>
    </p>
  
    <p><strong>Description: </strong> {secret.descr}</p>
  
        {secret.decrypt ? (
          <div className="align-items-center">
            <p className="mb-0 me-2"><strong>Secret: </strong> {secret.decrypt}</p>
            <button className="btn btn-success " onClick={copyToClipboard}>{copised ? "COPIED" : "COPY"}</button>
          </div>
        ) : (
          <button className="btn btn-secondary"  onClick={handleShowClick}>{isLoading ? <img src="/loading.gif" className='mini-gif'/> : "Look Secret"}</button>
        )}
  </div>
  
  

  );
}

export default SecretCard;
