// Definir le schema de l'API
const typeDef = `
  type Query {
    greeting: String
  }
`

// Implémenter le resolver
const  resolver = {
    Query : {
       greeting: () => 'Hello GraphQL !!'
    }
 }

// Rassembler le schema et le resolver  
const { makeExecutableSchema } = require('@graphql-tools/schema')
const executableSchema = makeExecutableSchema({
     typeDefs:typeDef,
     resolvers:resolver
})

// Créer une application ExpressJS
const express = require('express');
const app = express();

// Configurer le point de terminaison GraphQL
const { graphqlHTTP } = require('express-graphql');
app.use('/graphql', graphqlHTTP({
  schema: executableSchema,
  graphiql: true, // Activer l'interface graphique interactive pour tester les requêtes
}));

// Démarrer le serveur sur le port 9000
const port = 9000;
app.listen(port, () => {
  console.log(`Serveur GraphQL en cours d'exécution sur http://localhost:${port}/graphql`);
});