import { VetKD } from 'ic-vetkd-utils';

async function encryptNote(noteId, content) {
    // Step 1: Get the public key for verification
    const publicKey = await backend.app_vetkd_public_key([]);
  
    // Step 2: Create a transport key pair
    const { publicKey: tpk, secretKey: tsk } = await VetKD.createKeyPair();
  
    // Step 3: Get the encrypted symmetric key from the backend
    const encryptedSymmetricKey = await backend.encrypted_symmetric_key_for_caller(tpk);
  
    // Step 4: Decrypt the symmetric key
    const symmetricKey = await VetKD.decryptSymmetricKey(tsk, encryptedSymmetricKey, publicKey);
  
    // Step 5: Derive an AES key for this specific note
    const aesKey = await VetKD.deriveAesGcmKey(symmetricKey, noteId);
  
    // Step 6: Encrypt the note content
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedContent = encoder.encode(content);
    
    const encryptedContent = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      aesKey,
      encodedContent
    );
  
    // Return the encrypted content and IV for storage
    return {
      encryptedContent: new Uint8Array(encryptedContent),
      iv: iv
    };
  }