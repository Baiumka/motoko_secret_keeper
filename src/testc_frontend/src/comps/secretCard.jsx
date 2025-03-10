import { useContext, useState, useEffect } from 'react';

function SecretCard({secret, handleDelete, handleEdit, handleShow}) {   

    const copyToClipboard = () => {
        navigator.clipboard.writeText(secret.decrypt);
    };

    const handleDeleteClick = () => {
        handleDelete(secret.id);
    };

    const handleEditClick = () => {
        handleEdit(secret);
    };

    const handleShowClick = () => {
        handleShow(secret);
    };

  return (
    
      <div className="card shadow p-3 mb-3" key={secret.id}>
        <h3>
            {secret.title} 
            <button variant="outline-secondary" size="sm" onClick={handleDeleteClick}>X</button> 
            <button variant="outline-secondary" size="sm" onClick={handleEditClick}>EDIT</button> 
        </h3>
        <p><strong>Website:</strong> {secret.web}</p>
        <p><strong>Description:</strong> {secret.descr}</p>
        <p>
          <strong>Password:</strong>
          <span className="mx-2">
          {secret.decrypt ? (
            <div>
                <p>{secret.decrypt}</p>
                <button variant="outline-success" size="sm" className="ms-2" onClick={copyToClipboard}>COPY</button>
                </div>
            ) 
            : (<button variant="outline-secondary" size="sm" onClick={handleShowClick}>Look secret</button>)}
          </span>
          
          
        </p>
      </div>       

  );
}

export default SecretCard;
