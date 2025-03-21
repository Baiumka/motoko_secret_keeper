import { get, set } from 'idb-keyval';
import {ActorSubclass} from "@dfinity/agent";
import {_SERVICE} from '../../../declarations/testc_backend/testc_backend.did.js';
import * as vetkd from "ic-vetkd-utils";

type BackendActor = ActorSubclass<_SERVICE>;
export class CryptoService {
  constructor(private actor: BackendActor) {
    
  }

  // The function encrypts data with the note-id-specific secretKey.
  public async encrypt(password:string, note_id: bigint, owner: string, data: string) {    
    await this.fetch_note_key_if_needed(password,note_id, owner);
    const note_key: CryptoKey = await get([note_id.toString(), owner]) as CryptoKey;

    const data_encoded = Uint8Array.from([...data].map(ch => ch.charCodeAt(0))).buffer
    // The iv must never be reused with a given key.
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      note_key,
      data_encoded
    );

    const iv_decoded = String.fromCharCode(...new Uint8Array(iv));
    const cipher_decoded = String.fromCharCode(...new Uint8Array(ciphertext));
    return iv_decoded + cipher_decoded;
  }

  // The function decrypts the given input data with the note-id-specific secretKey.
  public async decrypt(password:string, note_id: bigint, owner: string, data: string) {
    await this.fetch_note_key_if_needed(password,note_id, owner);
    const note_key: CryptoKey = await get([note_id.toString(), owner]) as CryptoKey;
    

    if (data.length < 13) {
      throw new Error('wrong encoding, too short to contain iv');
    }
    
    const iv_decoded = data.slice(0, 12);
    const cipher_decoded = data.slice(12);
    const iv_encoded = Uint8Array.from([...iv_decoded].map(ch => ch.charCodeAt(0))).buffer;
    const ciphertext_encoded = Uint8Array.from([...cipher_decoded].map(ch => ch.charCodeAt(0))).buffer;

    let decrypted_data_encoded = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv_encoded
      },
      note_key,
      ciphertext_encoded
    );
    const decrypted_data_decoded = String.fromCharCode(...new Uint8Array(decrypted_data_encoded));
    console.log(decrypted_data_decoded);
    return decrypted_data_decoded;
  }

  private async fetch_note_key_if_needed(password:string, note_id: bigint, owner: string) {
    if (!await get([note_id.toString(), owner])) {
      const seed = window.crypto.getRandomValues(new Uint8Array(32));      
      const tsk = new vetkd.TransportSecretKey(seed);
      
      const ek_bytes_hex = await this.actor.encrypted_symmetric_key_for_caller(password, note_id, tsk.public_key());
      const pk_bytes_hex = await this.actor.app_vetkd_public_key(password);

      const note_id_bytes: Uint8Array = bigintTo128BitBigEndianUint8Array(note_id);
      const owner_utf8: Uint8Array = new TextEncoder().encode(owner);
      let derivation_id = new Uint8Array(note_id_bytes.length + owner_utf8.length);
      derivation_id.set(note_id_bytes);
      derivation_id.set(owner_utf8, note_id_bytes.length);

      const aes_256_gcm_key_raw = tsk.decrypt_and_hash(
        hex_decode(ek_bytes_hex),
        hex_decode2(pk_bytes_hex),
        derivation_id,
        32,
        new TextEncoder().encode("aes-256-gcm")
      );
      const note_key: CryptoKey = await window.crypto.subtle.importKey("raw", aes_256_gcm_key_raw, "AES-GCM", false, ["encrypt", "decrypt"]);
      await set([note_id.toString(), owner], note_key)
    }
  }
}

const hex_decode = (hexString: string): Uint8Array => 
  Uint8Array.from(hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

const hex_decode2 = (input: number[] | Uint8Array): Uint8Array => 
  new Uint8Array(input);

const hex_encode = (bytes: Uint8Array): string =>
  Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');

// Inspired by https://coolaj86.com/articles/convert-js-bigints-to-typedarrays/
function bigintTo128BitBigEndianUint8Array(bn: bigint): Uint8Array {
  var hex = BigInt(bn).toString(16);

  // extend hex to length 32 = 16 bytes = 128 bits
  while (hex.length < 32) {
    hex = '0' + hex;
  }

  var len = hex.length / 2;
  var u8 = new Uint8Array(len);

  var i = 0;
  var j = 0;
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j + 2), 16);
    i += 1;
    j += 2;
  }

  return u8;
}
