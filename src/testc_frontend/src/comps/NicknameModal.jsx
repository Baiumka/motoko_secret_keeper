import {useState } from 'react';
import { Modal, Button, Form } from "react-bootstrap";

export const MODE_REGISTER = 0;
export const MODE_LOGIN = 1;

function NicknameModal({ show, handleClose, handleReg, handleLogin, mode }) {
        const [nickname, setNickname] = useState("");
        const [password, setPassword] = useState("");
      
        return (
          <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
              <Modal.Title>LogIn</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                {mode == MODE_REGISTER ? (                  
              <Form.Group controlId="nicknameInput">
                  <Form.Label>Nickname</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />                 
                </Form.Group>
                 ) : (
                  <div></div>
                  ) }
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
              <Button variant="success" onClick={mode == MODE_REGISTER ? ( () =>handleReg(nickname, password)) : (() => handleLogin(password))}>
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>
        );
    }

    export default NicknameModal;