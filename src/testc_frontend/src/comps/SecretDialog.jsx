import {useState, useEffect } from 'react';
import { Modal, Button, Form } from "react-bootstrap";


function SecretDialog({ show, handleClose, handleSave, editedSecret}) {

  const [title, setTitle] = useState("");
  const [web, setWeb] = useState("");  
  const [descr, setDescr] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if(editedSecret)
    {
      setTitle(editedSecret.title);
      setWeb(editedSecret.web);
      setDescr(editedSecret.descr);
      setContent(editedSecret.content);
    }
  }, [editedSecret]); 
  
  const handleOk = async () => {
    const newNote =
    {
      id: (editedSecret ? editedSecret.id : 0),
      title: title,
      web: web,
      descr: descr,
      content: content
    };
    handleSave(newNote);
  };

    return (
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editedSecret ? "Edit Secret" : "Add New Secret"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter title" 
                value={title}  
                onChange={(e) => setTitle(e.target.value)}
                />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter website" 
                value={web} 
                onChange={(e) => setWeb(e.target.value)}
                />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Enter description" 
                value={descr} 
                onChange={(e) => setDescr(e.target.value)}
                />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Enter Content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                 />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleOk}>Save</Button>
        </Modal.Footer>
      </Modal>
    );
    }

    export default SecretDialog;