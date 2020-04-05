const { ApolloServer, gql } = require('apollo-server');
const { introspectSchema, makeExecutableSchema, makeRemoteExecutableSchema, mergeSchemas, AuthenticationError } = require('graphql-tools');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');

// Set up remote schemas
// Load a remote schema and set up the http-link
getRemoteSchema = async(remoteUri, headers) => {
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
    countriesSchema = await getRemoteSchema('https://countries.trevorblades.com/');

    // Merge all schemas (remote and local) here
    const schema = mergeSchemas({
        schemas: [
            countriesSchema,
        ],
        mergeDirectives: true,
        resolvers: [
                custom => { return { Query: {
                    countries: (root, args, context, info) => {

                        // If the user is signed in, simply forward request
                        if(context.user) {
                            return info.mergeInfo.delegateToSchema({
                                schema: countriesSchema,
                                operation: 'query',
                                fieldName: 'countries',
                                args,
                                context,
                                info
                            });
                        } 

                        // If the user is not signed, forward request with additional filtering arguments
                        else {
                            return info.mergeInfo.delegateToSchema({
                                schema: countriesSchema,
                                operation: 'query',
                                fieldName: 'countries',
                                args: {
                                    filter: {code: {eq: "AZ" }}
                                }, 
                                context,
                                info
                            });
                        }
                    }
                }
            }
            }
        ]
    });

    const server = new ApolloServer({ 
        schema,
        context: ({ req }) => {
            user = { upi: 'skav012' }; // Get session here
            user = null;
            return  { user };
        },
    });

    // The 'listen' method launches a web server.
    server.listen().then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });


}

initialize();