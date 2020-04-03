const { ApolloServer, gql } = require('apollo-server');
const { AuthDirective } = require('./auth-directive');
const { introspectSchema, makeExecutableSchema, makeRemoteExecutableSchema, mergeSchemas, AuthenticationError } = require('graphql-tools');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');

const articles = [
  {
    body: 'Gonna teach you some stuff',
    isPublic: true
  },
  {
    body: 'This is all top secret',
    isPublic: false
  },
];

const contentItems = [
    {
        title: 'Sams Latex Workshop',
        summary: 'A workshop about LaTeX',
        article: articles[0]
    },
    {
        title: 'Top Secret NASA Project',
        summary: 'A top secret article about NASA',
        article: articles[1]
    }
]


// Define schema (collection of type definitions)
const typeDefs = gql`

    directive @auth(
        requires: Role = USER,
    ) on OBJECT

    enum Role {
        USER
        STAFF
    }

    type ContentItem {
        title: String
        summary: String
        article: Article
    }

    type Article @auth {
        body: String 
        isPublic: Boolean
    }

    type Query {
        contentItems: [ContentItem]
        articles: [Article]
    }

`;

// Define resolvers (define the technique for fetching the types defined in our schema)
const resolvers = {
    Query: {
        contentItems: (parent, args, context) => { return contentItems },
        articles: (parent, args, context) => { return articles }
    },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const localSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives: {
        auth: AuthDirective
    }
});


// Set up remote schemas
// Load a remote schema and set up the http-link
getRemoteSchema = async(remoteUri) => {
    try {
        console.log('Loading remote schema:', remoteUri)
        const link = new HttpLink({ uri: remoteUri, fetch });
        const schema = await introspectSchema(link);

        console.log('Loaded remote schema:', remoteUri)
        return makeRemoteExecutableSchema({
            schema,
            link,
        });
    } catch(e) {
        console.error(e);
    }
}

// Set up the schemas and initialize the server
initialize = async () => {

    // Load remote schemas here
    // spacexSchema = await getRemoteSchema('https://api.spacex.land/graphql');
    countriesSchema = await getRemoteSchema('https://countries.trevorblades.com/');

    // Merge all schemas (remote and local) here
    const schema = mergeSchemas({
        schemas: [
            // spacexSchema,
            countriesSchema,
            localSchema
        ],
        mergeDirectives: true
    });

    const server = new ApolloServer({ 
        schema,
        context: ({ req }) => {
            user = { upi: 'skav012' }; // Get session here
            user = null;
            return  { user };
        }
    });

    // The 'listen' method launches a web server.
    server.listen().then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });


}

initialize();