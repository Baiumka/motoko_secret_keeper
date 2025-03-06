import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

const ErrorDialog = ({ errorMessage, onClose }) => {
  const [show, setShow] = useState(true);

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  return (
    <Modal show={show} onHide={() => handleClose()}>
    <Modal.Header closeButton>
      <Modal.Title>Error</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Alert variant="danger">{errorMessage}</Alert>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => handleClose()}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
  );
};

export default ErrorDialog;