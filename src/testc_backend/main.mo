import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Error "mo:base/Error";
import Bool "mo:base/Bool";
import Time "mo:base/Time";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Nat8 "mo:base/Nat8";
import Hex "./Hex";
import RBTree "mo:base/RBTree";
import Trie "mo:base/Trie";
import List "mo:base/List";

shared({ caller = initializer }) actor class() {
  
  private type List<T> = ?(T, List<T>);
  private type Trie<K, V> = Trie.Trie<K, V>;
  private type Key<K> = Trie.Key<K>;   
  private type Password = Text;
  private type Phrase = [Text];
  private type UserSecret = Trie<User, List<Secret>>;
  
  type User = {
    id: Nat;
    nickname: Text;
    password: Text;
    principal: Principal;      
  };
  private func userEqual(u1 : User, u2 : User) : Bool { u1.principal == u2.principal };
  private func key(u: User) : Key<User> { { hash = Text.hash(Principal.toText(u.principal)); key = u } };

  type SecretType = {
    #Text : Text;
    #Password : Password;
    #Phrase : Phrase;
  };
  
  type Secret = {
    id: Nat;
    title: Text;
    web: Text;
    descr: Text;
    content: SecretType;
  };

  stable var usersSecrets: UserSecret = Trie.empty();
  stable var userIdCounter: Nat = 1;
  stable var secretIdCounter: Nat = 1;

  public shared (msg) func register(nickname: Text, password: Text): async User {
    let callerUser = await getUserByPrinc(msg.caller);
    switch (callerUser) {
      case (?user)
      {              
        throw Error.reject("User already exist");
      };
      case null {
        let newUser = {
          id = userIdCounter;
          nickname = nickname;
          principal = msg.caller;
          password = password;
        };
        
        usersSecrets := Trie.put(usersSecrets, key newUser, userEqual, List.nil<Secret>()).0;
        userIdCounter += 1; 
        return newUser;
      };
    };       
  };

  public shared (msg) func userExist(): async Bool {       
    let callerUser = await getUserByPrinc(msg.caller);     
    switch (callerUser) {
      case (?user) 
      {        
        return true;
      };
      case (null) {      
        return false;
      };      
    }
  };

  public shared (msg) func getUser(password: Text): async User {       
    let callerUser = await getUserByPrinc(msg.caller);     
    switch (callerUser) {
      case (?user) 
      {        
        if(password == user.password)
        {
          return user;
        }
        else
        {
          throw Error.reject("Incorrect password.");
        }
      };
      case (null) {      
        throw Error.reject("User does not exist.");
      };      
    }
  };

  public shared (msg) func addSecret(title: Text, web: Text, descr: Text, content: SecretType): async Secret
  {
    let callerUser = await getUserByPrinc(msg.caller);     
    switch (callerUser) {
      case (?user) 
      {                
          var secretList: ?List<Secret> = Trie.get(usersSecrets, key user, userEqual);
          switch(secretList)
          {
            case (?list)
            {
              let newSecret: Secret = 
              {
                id = secretIdCounter;
                title = title;
                web = web;
                descr = descr;     
                content = content; 
              };
              secretIdCounter += 1;
              let updatedList = List.push<Secret>(newSecret, list);                
              usersSecrets := Trie.put(usersSecrets, key user, userEqual, updatedList).0;
              return newSecret;
            };
            case (null)
            {
              throw Error.reject("User does not exist.");
            };
          }                    
      };
      case (null) {      
        throw Error.reject("User does not exist.");
      };      
    }
  };

  private func getUserByPrinc(caller: Principal) : async ?User {
    for ((user, _) in Trie.iter(usersSecrets)) {  
        if (user.principal == caller) {
            return ?user;  
        }
    };
    return null;  
  };

  public shared (msg) func getUsers(): async List<User> {
    if(msg.caller != initializer)
    {
      throw Error.reject("You has no permition");
    };  
    var userList = List.nil<User>();  
    for ((userKey, _) in Trie.iter(usersSecrets)) {  
        userList := List.push(userKey, userList); 
    };
    return userList;
  };

  public shared (msg) func getCallerSecrets(): async List<Secret> {
    let callerUser = await getUserByPrinc(msg.caller);  
    switch (callerUser) {
      case (?user) 
      {        
        let secretList = Trie.get(usersSecrets, key user, userEqual);
        switch (secretList) {
          case (?list) 
          {  
            return list;
          };
          case (null) {      
            throw Error.reject("User does not exist.");
          };         
        };  
      };
      case (null) {      
        throw Error.reject("User does not exist.");
      };        
    }
  };


  public shared (msg) func getSecrets(): async UserSecret {
    if(msg.caller != initializer)
    {
      throw Error.reject("You has no permition");
    };  
    return usersSecrets;
  };

  public shared (msg) func reset(): async () {
    if(msg.caller != initializer)
    {
      throw Error.reject("You has no permition");
    };  
    usersSecrets := Trie.empty();
  };


  
};

   /* type VETKD_SYSTEM_API = actor {
        vetkd_public_key : ({
            canister_id : ?Principal;
            derivation_path : [Blob];
            key_id : { curve : { #bls12_381_g2 }; name : Text };
        }) -> async ({ public_key : Blob });
        vetkd_derive_encrypted_key : ({
            derivation_path : [Blob];
            derivation_id : Blob;
            key_id : { curve : { #bls12_381_g2 }; name : Text };
            encryption_public_key : Blob;
        }) -> async ({ encrypted_key : Blob });
    };

    let vetkd_system_api : VETKD_SYSTEM_API = actor ("s55qq-oqaaa-aaaaa-aaakq-cai");

    public shared ({ caller }) func symmetric_key_verification_key_for_note() : async Blob {
        let { public_key } = await vetkd_system_api.vetkd_public_key({
            canister_id = null;
            derivation_path = Array.make(Text.encodeUtf8("note_symmetric_key"));
            key_id = { curve = #bls12_381_g2; name = "test_key_1" };
        });
        public_key;
    };

    public shared ({ caller }) func encrypted_symmetric_key_for_note(note_id : Nat, encryption_public_key : Blob) : async Text {
                
        let caller_text = Principal.toText(caller);
        let needNote = Array.find<Task>(tasks, func (task) = task.user == caller_text and task.id == note_iuserKeyd);
        switch(needNote)
        {
          case (?note)
          {
            let buf = Buffer.Buffer<Nat8>(32);
            buf.append(Buffer.fromArray(natToBigEndianByteArray(16, note.id)));
            buf.append(Buffer.fromArray(Blob.toArray(Text.encodeUtf8(note.user))));// HERE must be owner
            let derivation_id = Blob.fromArray(Buffer.toArray(buf)); 

            let { encrypted_key } = await vetkd_system_api.vetkd_derive_encrypted_key({
                derivation_id;
                derivation_path = Array.make(Text.encodeUtf8("note_symmetric_key"));
                key_id = { curve = #bls12_381_g2; name = "test_key_1" };
                encryption_public_key;
            });
            Hex.encode(Blob.toArray(encrypted_key));
          };
          case (null)
        {
          throw Error.reject("Not found "); 
        };
        };
        
    };

    // Converts a nat to a fixed-size big-endian byte (Nat8) array
    private func natToBigEndianByteArray(len : Nat, n : Nat) : [Nat8] {
        let ith_byte = func(i : Nat) : Nat8 {
            assert (i < len);
            let shift : Nat = 8 * (len - 1 - i);
            Nat8.fromIntWrap(n / 2 ** shift);
        };
        Array.tabulate<Nat8>(len, ith_byte);
    };
  */

