const graphql = require("graphql");
const sqlite3 = require('sqlite3').verbose();

//create a database if no exists
const database = new sqlite3.Database("./fisher-fans.db");

//create an SQLite table to insert users
const createUserTable = () => {
    const  query  =  `
        CREATE TABLE IF NOT EXISTS users (
        id integer PRIMARY KEY,
        name text,
        email text,
        address text,
        zipcode integer,
        license number )`;

    return  database.run(query);
}

//create an SQLite table to insert boats
const createBoatTable = () => {
    const  query  =  `
        CREATE TABLE IF NOT EXISTS boats (
        id integer PRIMARY KEY,
        name text,
        description text,
        type text,
        length number,
        power integer )`;

    return  database.run(query);
}

//call each function to init the SQLite tables
createUserTable();
createBoatTable();


//create graphql User object
const UserType = new graphql.GraphQLObjectType({
    name: "User",
    fields: {
        id: { type: graphql.GraphQLID },
        name: { type: graphql.GraphQLString },
        email: { type: graphql.GraphQLString },
        address: { type: graphql.GraphQLString },
        zipcode: { type: graphql.GraphQLInt },
        license: { type: graphql.GraphQLInt }        
    }
});

const BoatTypeEnum = new graphql.GraphQLEnumType({
    name: "BoatTypeEnum",
    values: {
        YATCH: { value: 'yatch' },
        CABIN: { value: ' cabin' },
        CATAMARAN: { value: 'catamaran' },
        SAILBOAT: { value: 'sailboat' },
        JETSKI: { value: 'jetski ' },
        CANOE: { value: 'canoe' }
    }
})

//create graphql Boat object
const BoatType = new graphql.GraphQLObjectType({
    name: "Boat",
    fields: {
        id: { type: graphql.GraphQLID },
        name: { type: graphql.GraphQLString },
        description: { type: graphql.GraphQLString },
        type: { type: BoatTypeEnum },
        length: { type: graphql.GraphQLFloat },
        power: { type: graphql.GraphQLInt }        
    }
});



// create a graphql query to select all and by id
var queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
        //first query to select all users
        users: {
            type: graphql.GraphQLList(UserType),
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    // raw SQLite query to select from table
                    database.all("SELECT * FROM users;", function(err, rows) {  
                        if(err){
                            reject([]);
                        }
                        resolve(rows);
                    });
                });
            }
        },
        //second query to select by id
        user:{
            type: UserType,
            args:{
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }               
            },
            resolve: (root, {id}, context, info) => {
                return new Promise((resolve, reject) => {
                
                    database.all("SELECT * FROM users WHERE id = (?);",[id], function(err, rows) {                           
                        if(err){
                            reject(null);
                        }
                        resolve(rows[0]);
                    });
                });
            }
        },
        boats: {
            type: graphql.GraphQLList(BoatType),
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    // raw SQLite query to select from table
                    database.all("SELECT * FROM boats;", function(err, rows) {  
                        if(err){
                            reject([]);
                        }
                        resolve(rows);
                    });
                });
            }
        },
        boat:{
            type: BoatType,
            args:{
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }               
            },
            resolve: (root, {id}, context, info) => {
                return new Promise((resolve, reject) => {
                    database.all("SELECT * FROM boats WHERE id = (?);",[id], function(err, rows) {                           
                        if(err){
                            reject(null);
                        }
                        resolve(rows[0]);
                    });
                });
            }
        }
    }
});

//mutation type is a type of object to modify data (INSERT,DELETE,UPDATE)
var mutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
      //mutation for creacte
      createUser: {
        //type of object to return after create in SQLite
        type: UserType,
        //argument of mutation createUser to get from request
        args: {
          name: {
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
          },
          email:{
              type: new graphql.GraphQLNonNull(graphql.GraphQLString)
          },
          address:{
              type: new graphql.GraphQLNonNull(graphql.GraphQLString)
          },
          zipcode:{
              type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
          },
          license:{
            type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
          }
        },
        resolve: (root, {name, email, address, zipcode, license}) => {
            return new Promise((resolve, reject) => {
                //raw SQLite to insert a new user in user table
                database.run('INSERT INTO users (name, email, address, zipcode, license) VALUES (?,?,?,?,?);', [name, email, address, zipcode, license], (err) => {
                    if(err) {
                        reject(null);
                    }
                    database.get("SELECT last_insert_rowid() as id", (err, row) => {
                        
                        resolve({
                            id: row["id"],
                            name: name,
                            email: email,
                            address:address,
                            zipcode: zipcode,
                            license: license
                        });
                    });
                });
            })
        }
      },
      //mutation for update
      updateUser: {
        //type of object to return afater update in SQLite
        type: graphql.GraphQLString,
        //argument of mutation updateUser to get from request
        args:{
            id:{
                type: new graphql.GraphQLNonNull(graphql.GraphQLID)
            },
            name: {
                type: new graphql.GraphQLNonNull(graphql.GraphQLString)
            },
            email:{
                  type: new graphql.GraphQLNonNull(graphql.GraphQLString)
            },
            address:{
                  type: new graphql.GraphQLNonNull(graphql.GraphQLString)
            },
            zipcode:{
                  type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
            },
            license: {
                  type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
            }             
        },
        resolve: (root, {id, name, email, address, zipcode, license}) => {
            return new Promise((resolve, reject) => {
                // raw SQLite to update a users in user table
                database.run('UPDATE users SET name = (?), email = (?), address = (?), zipcode = (?), license = (?) WHERE id = (?);', [name, email, address, zipcode, license, id], (err) => {
                    if(err) {
                        reject(err);
                    }
                    resolve(`User #${id} updated`);
                });
            })
        }
      },

      //mutation for delete
      deleteUser: {
         //type of object resturn after delete in SQLite
        type: graphql.GraphQLString,
        args:{
            id:{
                type: new graphql.GraphQLNonNull(graphql.GraphQLID)
            }               
        },
        resolve: (root, {id}) => {
            return new Promise((resolve, reject) => {
                //raw query to delete from user table by id
                database.run('DELETE from users WHERE id =(?);', [id], (err) => {
                    if(err) {
                        reject(err);
                    }
                    resolve(`user #${id} deleted`);                    
                });
            })
        }
      },

      createBoat: {
        //type of object to return after create in SQLite
        type: BoatType,
        //argument of mutation createBoat to get from request
        args: {
          name: {
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
          },
          description:{
              type: new graphql.GraphQLNonNull(graphql.GraphQLString)
          },
          type:{
              type: new graphql.GraphQLNonNull(BoatTypeEnum)
          },
          length:{
              type: new graphql.GraphQLNonNull(graphql.GraphQLFloat)
          },
          power:{
            type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
          }
        },
        resolve: (root, {name, description, type, length, power}) => {
            return new Promise((resolve, reject) => {
                //raw SQLite to insert a new user in user table
                database.run('INSERT INTO boats (name, description, type, length, power) VALUES (?,?,?,?,?);', [name, description, type, length, power], (err) => {
                    if(err) {
                        reject(null);
                    }
                    database.get("SELECT last_insert_rowid() as id", (err, row) => {
                        
                        resolve({
                            id: row["id"],
                            name: name,
                            description: description,
                            type: type,
                            length: length,
                            power: power
                        });
                    });
                });
            })
        }
      },

      //mutation for update
      updateBoat: {
        //type of object to return afater update in SQLite
        type: graphql.GraphQLString,
        //argument of mutation updateBoat to get from request
        args:{
            id:{
                type: new graphql.GraphQLNonNull(graphql.GraphQLID)
            },
            name: {
                type: new graphql.GraphQLNonNull(graphql.GraphQLString)
            },
            description:{
                  type: new graphql.GraphQLNonNull(graphql.GraphQLString)
            },
            type:{
                  type: new graphql.GraphQLNonNull(BoatTypeEnum)
            },
            length:{
                  type: new graphql.GraphQLNonNull(graphql.GraphQLFloat)
            },
            power: {
                  type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
            }             
        },
        resolve: (root, {id, name, description, type, length, power}) => {
            return new Promise((resolve, reject) => {
                // raw SQLite to update a users in user table
                database.run('UPDATE boats SET name = (?), description = (?), type = (?), length = (?), power = (?) WHERE id = (?);', [name, description, type, length, power, id], (err) => {
                    if(err) {
                        reject(err);
                    }
                    resolve(`Boat #${id} updated`);
                });
            })
        }
      },

      //mutation for delete
      deleteBoat: {
        //type of object return after delete in SQLite
       type: graphql.GraphQLString,
       args:{
           id:{
               type: new graphql.GraphQLNonNull(graphql.GraphQLID)
           }               
       },
       resolve: (root, {id}) => {
           return new Promise((resolve, reject) => {
               //raw query to delete from boats table by id
               database.run('DELETE from boats WHERE id =(?);', [id], (err) => {
                   if(err) {
                       reject(err);
                   }
                   resolve(`boat #${id} deleted`);                    
               });
           })
       }
     }

    }
});

//define schema with user object, queries, and muÒtation 
const schema = new graphql.GraphQLSchema({
    query: queryType,
    mutation: mutationType 
});

//export schema to use on index.js
module.exports = {
    schema
}