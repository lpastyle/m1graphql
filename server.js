const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema')

// Definir le schema 
const typeDef = `
  type Query {
    greeting: String
  }
`

// Implémenter un resolver
const  resolver = {
    Query : {
       greeting: () => 'Hello GraphQL !!'
    }
 }

// Rassembler le schema au resolver   
const executableSchema = makeExecutableSchema({
     typeDefs:typeDef,
     resolvers:resolver
})

// Créer une application ExpressJS
const app = express();

// Configurer le point de terminaison GraphQL
app.use('/graphql', graphqlHTTP({
  schema: executableSchema,
  graphiql: true, // Activer l'interface graphique interactive pour tester les requêtes
}));

// Démarrer le serveur sur le port 9000
const port = 9000;
app.listen(port, () => {
  console.log(`Serveur GraphQL en cours d'exécution sur http://localhost:${port}/graphql`);
});