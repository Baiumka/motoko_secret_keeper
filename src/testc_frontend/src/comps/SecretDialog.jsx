import { useState, useEffect } from 'react';
import { Modal, Button, Form, Nav, Row, Col } from "react-bootstrap";

function SecretDialog({ show, handleClose, handleSave, editedSecret, isLoading }) {
  const [title, setTitle] = useState("");
  const [web, setWeb] = useState("");  
  const [descr, setDescr] = useState("");
   // Ensure it's an array to start with
  const [content, setContent] = useState([""]); 
  const [contentType, setContentType] = useState('Password'); // Default to password
  
  useEffect(() => {
    if (editedSecret) {
      setTitle(editedSecret.title);
      setWeb(editedSecret.web);
      setDescr(editedSecret.descr);
      setContent([""]);
    }
  }, [editedSecret]);

  useEffect(() => {
    if (contentType === "Text" || contentType === "Password") {
      setContent([content.join(" ")]); // Объединяем массив в строку с пробелами
    } else if (contentType === "Phrase") {
      setContent(content[0] ? content[0].split(/\s+/) : [""]); // Разбиваем строку обратно в массив
    }
  }, [contentType]);

  const handleOk = async () => {
    if(contentType == "Phrase")
    {
      setContent(prevItems => {
        // Check if the last element is an empty string before removing it
        if (prevItems[prevItems.length - 1] === "") {
          return prevItems.slice(0, -1); // Remove the last element if it's an empty string
        }
        return prevItems; // If the last element isn't an empty string, do nothing
      });
    }
    const newNote = {
      id: editedSecret ? editedSecret.id : 0,
      title,
      web,
      descr,
      contentType,
      content: content.join(" ")
    };
    handleSave(newNote);

    setTitle("");
    setWeb("");
    setDescr("");
    setContent([""]);    
  };

  const handleContentChange = (e, index) => {
    const updatedContent = [...content];
    updatedContent[index] = e.target.value;
  
    // Если изменённое поле - последнее и оно не пустое, добавляем ещё одно поле
    if (index === updatedContent.length - 1 && e.target.value.trim() !== "") {
      updatedContent.push(""); // Добавляем пустое поле
    }
  
    setContent(updatedContent); // Исправлено: убрали лишний массив
  };
  

  const handlePaste = (e) => {
    if (contentType === 'Phrase') {
      e.preventDefault(); // Prevent the default paste behavior to avoid issues
      const pastedText = e.clipboardData.getData("text");
      const words = pastedText.split(/\s+/); // Split the pasted text into words
      setContent(words);  // Set content as an array of words
    }
  };

  const renderContentField = () => {
    if (contentType === 'Password') {
      return (
        <Form.Control
          type="password"
          placeholder="Enter Content"
          value={content}
          onChange={(e) => setContent([e.target.value])}
        />
      );
    }

    if (contentType === 'Text') {
      return (
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter Content"
          value={content}
          onChange={(e) => setContent([e.target.value])}
        />
      );
    }

    if (contentType === 'Phrase') {
      // Ensure content is always an array
      const contentArray = content.length ? content : [''];
      return (
        <>
          <Row>
            {contentArray.map((word, index) => (
              <Col key={index} md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{index + 1}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={`Enter word ${index + 1}`}
                    value={word}
                    onChange={(e) => handleContentChange(e, index)}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>
        </>
      );
    }
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
          {!editedSecret ? (
          <div>          
            <Form.Group className="mb-3">
              <Form.Label>Content Type</Form.Label>
              <Nav variant="tabs" activeKey={contentType} onSelect={setContentType}>
                <Nav.Item>
                  <Nav.Link eventKey="Password">Password</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="Text">Memo</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="Phrase">Secret Phrase</Nav.Link>
                </Nav.Item>
              </Nav>
            </Form.Group>
            
            <Form.Group className="mb-3" onPaste={handlePaste}>
              <Form.Label>Content</Form.Label>
              {renderContentField()}
            </Form.Group>
          </div>
          ) : (<div></div>)}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleOk}>{isLoading ? <img src="/loading.gif" className='mini-gif'/> : "Save"}</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SecretDialog;
