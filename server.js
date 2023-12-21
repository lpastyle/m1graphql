const  express  =  require('express');
const { graphqlHTTP } = require("express-graphql");
const schema = require("./typedefs.js");
const app  =  express();
const port = 4000;

app.use("/graphql", graphqlHTTP({
     schema: schema.schema,
      graphiql: true
    }));
    
app.listen(port, () => {
    console.log(`GraphQL server running at http://localhost:${port}`);
});
