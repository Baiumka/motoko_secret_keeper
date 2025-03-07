import { useContext, useState, useEffect } from 'react';

function SecretCard({secret, handleDelete, handleEdit}) {   
    const [showPassword, setShowPassword] = useState(false);
      
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(secret.content);
    };

    const handleDeleteClick = () => {
        handleDelete(secret.id);
    };

    const handleEditClick = () => {
        handleEdit(secret);
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
          <span className="mx-2">{showPassword ? secret.content : '••••••••'}</span>
          <button variant="outline-secondary" size="sm" onClick={toggleShowPassword}>👁</button>
          <button variant="outline-success" size="sm" className="ms-2" onClick={copyToClipboard}>📋</button>
        </p>
      </div>       

  );
}

export default SecretCard;
