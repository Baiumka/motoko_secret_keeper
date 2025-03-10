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
import Iter "mo:base/Iter";
import Prelude "mo:base/Prelude";

shared({ caller = initializer }) actor class() {
  
  private type List<T> = ?(T, List<T>);
  private type Trie<K, V> = Trie.Trie<K, V>;
  private type Key<K> = Trie.Key<K>;   
  private type UserSecret = Trie<User, List<Secret>>;
  
  type User = {
    id: Nat;
    nickname: Text;
    password: Text;
    principal: Principal;      
  };

  type PublicUser = {
    id: Nat;
    nickname: Text;    
    principal: Principal;      
  };

  private func userEqual(u1 : User, u2 : User) : Bool { u1.principal == u2.principal };
  private func key(u: User) : Key<User> { { hash = Text.hash(Principal.toText(u.principal)); key = u } };

  type Secret = {
    id: Nat;
    title: Text;
    web: Text;
    descr: Text;
    content: Text;
  };

  var usersSecrets: UserSecret = Trie.empty();
  var userIdCounter: Nat = 1;
  var secretIdCounter: Nat = 1;

  stable var usersSecretsStable: UserSecret = Trie.empty();
  stable var userIdCounterStable: Nat = 1;
  stable var secretIdCounterStable: Nat = 1;

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

  public shared (msg) func getUser(): async PublicUser {       
    let callerUser = await getUserByPrinc(msg.caller);     
    switch (callerUser) {
      case (?user) 
      {           
        let publicUser: PublicUser =
        {
          id = user.id;
          nickname = user.nickname;
          principal = user.principal;
        };    
        return publicUser;              
      };
      case (null) {      
        throw Error.reject("User does not exist.");
      };      
    }
  };

  public query func getNextId(): async (Nat) {       
    return secretIdCounter;
  };

  public shared (msg) func addSecret(password: Text, title: Text, web: Text, descr: Text, content: Text): async Secret
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
              if(password == user.password)
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
              }
              else
              {
                throw Error.reject("Wrong password");
              }              
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

  public shared (msg) func updateSecret(password: Text, id: Nat, title: Text, web: Text, descr: Text): async ()
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
              if(password == user.password)
              {                            
                let updatedList:List<Secret> = List.map<Secret, Secret>(
                  list,
                  func(secret) {
                    if (secret.id == id) {
                      {                
                        id = secret.id;
                        title = title;
                        descr = descr;
                        web = web;
                        content = secret.content;
                      };
                    } else {
                      secret;
                    };
                  }
                );              
                usersSecrets := Trie.put(usersSecrets, key user, userEqual, updatedList).0;                 
              }
              else
              {
                throw Error.reject("Wrong password");
              }              
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

  public shared (msg) func deleteSecret(password: Text, id: Nat): async ()
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
              if(password == user.password)
              {
                let updatedList = List.filter<Secret>(list, func n { n.id != id });
                usersSecrets := Trie.put(usersSecrets, key user, userEqual, updatedList).0;
              }
              else
              {
                throw Error.reject("Wrong password");
              }              
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

  public shared (msg) func whoami(): async Text
  {
    return Principal.toText(msg.caller);
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

  public shared (msg) func getCallerSecrets(password: Text): async [Secret] {
    let callerUser = await getUserByPrinc(msg.caller);  
    switch (callerUser) {
      case (?user) 
      {        
        let secretList = Trie.get(usersSecrets, key user, userEqual);
        switch (secretList) {
          case (?list) 
          {  
            if(password == user.password)
            {
              return List.toArray(list);
            }
            else
            {
              throw Error.reject("Wrong password");
            }
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


  


   type VETKD_SYSTEM_API = actor {
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

    public shared ({ caller }) func app_vetkd_public_key(password: Text) : async Blob {
      let callerUser = await getUserByPrinc(caller);        
        switch(callerUser)
        {
          case (?user)
          {
            if(user.password == password)
            {
            let { public_key } = await vetkd_system_api.vetkd_public_key({
                canister_id = null;
                derivation_path = Array.make(Text.encodeUtf8("note_symmetric_key"#user.password));
                key_id = { curve = #bls12_381_g2; name = "test_key_1" };
            });
            return public_key;
            }
            else
            {
              throw Error.reject("Incorrect password.");
            }
          };
          case (null)
          {
            throw Error.reject("User does not exist.");
          }
        };
    };

    public shared ({ caller }) func encrypted_symmetric_key_for_caller(password: Text, secretID: Nat, encryption_public_key : Blob) : async Text {
        let callerUser = await getUserByPrinc(caller);        
        switch(callerUser)
        {
          case (?user)
          {
            if(user.password == password)
            {
            let caller_text = Principal.toText(caller);                
            let buf = Buffer.Buffer<Nat8>(32);
            buf.append(Buffer.fromArray(natToBigEndianByteArray(16, secretID)));
            buf.append(Buffer.fromArray(Blob.toArray(Text.encodeUtf8(caller_text))));// HERE must be owner
            let derivation_id = Blob.fromArray(Buffer.toArray(buf)); 

            let { encrypted_key } = await vetkd_system_api.vetkd_derive_encrypted_key({
                derivation_id;
                derivation_path = Array.make(Text.encodeUtf8("note_symmetric_key"#user.password));
                key_id = { curve = #bls12_381_g2; name = "test_key_1"};
                encryption_public_key;
            });
            return Hex.encode(Blob.toArray(encrypted_key));
            }
            else
            {
              throw Error.reject("Incorrect password.");
            }
          };
          case (null)
          {
            throw Error.reject("User does not exist.");
          }
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

    system func preupgrade() {
        Debug.print("Starting pre-upgrade hook...");
        usersSecretsStable := usersSecrets;
        userIdCounterStable := userIdCounter;
        secretIdCounterStable := secretIdCounter;
        Debug.print("pre-upgrade finished.");
    };

   
    system func postupgrade() {
        Debug.print("Starting post-upgrade hook...");
        usersSecrets := usersSecretsStable;
        userIdCounter := userIdCounterStable;
        secretIdCounter := secretIdCounterStable;
        usersSecretsStable:=Trie.empty();
        Debug.print("post-upgrade finished.");
    };
  

};