import {useState } from 'react';
import { Modal, Button, Form } from "react-bootstrap";

function NicknameModal({ show, handleClose, handleSave }) {
        const [nickname, setNickname] = useState("");
        const [password, setPassword] = useState("");
      
        return (
          <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
              <Modal.Title>Enter your nickname</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
              <Form.Group controlId="nicknameInput">
                  <Form.Label>Nickname</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="passwordInput">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="***********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>              
              <Button variant="success" onClick={() => handleSave(nickname, password)}>
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>
        );
    }

    export default NicknameModal;