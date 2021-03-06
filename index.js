const { ApolloServer, gql } = require('apollo-server');
const { RESTDataSource } = require('apollo-datasource-rest');
const { createApolloFetch } = require('apollo-fetch');


// Apollo Library for querying other GraphQL endpoints
const apolloFetch = createApolloFetch({
  uri: 'https://api.spacex.land/graphql',
});

// Example data (replace with endpoint etc)
const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

const articles = [
  {
    title: 'Sams Latex Workshop',
    summary: 'A workshop about LaTeX',
    body: 'Gonna teach you some stuff',
    isPublic: true
  },
  {
    title: 'Top Secret NASA Project',
    summary: 'A top secret article about NASA',
    body: 'This is all top secret',
    isPublic: false
  },
];

getArticles = () => {
    return [{
        title: 'test',
        summary: 'lol',
        body: 'lel',
        isPublic: true
    }]
}

// Define schema (collection of type definitions)
const typeDefs = gql`
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

    "This Book type defines the queryable fields for every book in our data source."
    type Book {
        """
        The title of the book
        This is **markdown based** documentation.
        """
        title: String

        """
        The person who *wrote* the book.
        """
        author: String
    }

    type Post {
        title: String
        body: String
        author: [String]
    }

    # Hub test
    type Article {
        title: String
        summary: String
        body: String
        isPublic: Boolean
    }

    # Stuff in an existing GraphQL endpoint test
    type Launch {
        mission_name: String
    }

    # The Query type defines exactly which GraphQL queries (i.e., read operations) clients can execute against your data graph. It resembles an object type, but its name is always Query.
    # Each field of the Query type defines the name and return type of a different supported query. The Query type for our example schema might resemble the following:e
    type Query {
        books: [Book]
        articles: [Article]
        launches: [Launch]
    }



    # Define Mutations here
    type Mutation {
        addBook(title: String, author: String): Book,
        createPost(post: PostAndMediaInput): Post
    }

    # Define any inputs here
    # Inputs can be re-used across diffrent mutations etc
    # These can also be annotated (this info is exposed to GraphQL-enabled tools)
    input PostAndMediaInput {
        "A Main title for the post"
        title: String
        "The text body of the post"
        body: String
        "A list of URLs to render in the post"
        mediaUrls: [String]
    }
`;

 
// Define resolvers (define the technique for teching the types defined in our schema)
const resolvers = {
    Query: {
        books: () => books,
        articles: () => getArticles(),
        launches: async (_source, _args, { dataSources} ) => {
            return dataSources.spacexAPI.getLaunches();
        }
    },
};


// Create our Apollo server instance

// Note: If your server is deployed to an environment where NODE_ENV is set to production, GraphQL Playground and introspection will be disabled by default. To enable them, you'll need to explicitly set playground: true and introspection: true within the options to ApolloServer's constructor.

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ 
    typeDefs,
    resolvers,
    dataSources: () => { // These can now be accessed inside the resolvers
        return { 
            spacexAPI: new SpacexAPI() 
        };
    },
});

// The 'listen' method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});


// Method to call external GraphQL API/return response
// https://www.apollographql.com/docs/apollo-server/data/data-sources/
callExternal = (url, query) => {
    return "external data";
}


/*
This might be handy ITS PART OF THE REQUEST NOT THE HEADERS@!!:

    class PersonalizationAPI extends RESTDataSource {
    willSendRequest(request) {
        request.params.set('api_key', this.context.token);
    }
    }
*/
class SpacexAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://api.spacex.land/graphql';
    }

    async getLaunches() {

        // return this.get('/', )
        // return [{ mission_name: 'example launch' }];
        
        // Proof of concept but apolloFetch is deprecated, don't use
        // Use the RESTDataSource as above
        return await apolloFetch({
            query: `{ 
                launches {
                    mission_name
                }
            }`,
        })
        .then(res => [...res.data.launches]);
                
    };
}

