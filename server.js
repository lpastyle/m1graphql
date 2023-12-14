const  express  =  require('express');
const { graphqlHTTP } = require("express-graphql");
const schema = require("./typedefs.js");
const  app  =  express();

app.use("/graphql", graphqlHTTP({
     schema: schema.schema,
      graphiql: true
    }));

app.listen(9000, () => {
    console.log("GraphQL server running at http://localhost:9000.");
});
