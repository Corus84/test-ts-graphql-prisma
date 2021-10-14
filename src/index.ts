import express, { Express } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { schema } from './schema/schema';

async function startServer(): Promise<void> {
    const server = new ApolloServer({ schema });
    const app: Express = express();
    await server.start();
    server.applyMiddleware({ app });

    app.listen({ port: 3000 }, () => console.log(`🚀 Server ready at http://localhost:3000${server.graphqlPath}`));
}

startServer();
