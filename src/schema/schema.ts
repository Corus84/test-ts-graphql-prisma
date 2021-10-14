import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLResolveInfo, GraphQLSchema, GraphQLString } from 'graphql';

const dummyBooks = [
    { name: 'Name 1', genre: 'Genre 1', id: '1', authorId: '1' },
    { name: 'Name 2', genre: 'Genre 2', id: '2', authorId: '1' },
    { name: 'Name 3', genre: 'Genre 1', id: '3', authorId: '2' },
    { name: 'Name 4', genre: 'Genre 3', id: '4', authorId: '3' },
    { name: 'Name 5', genre: 'Genre 3', id: '5', authorId: '4' },
    { name: 'Name 6', genre: 'Genre 3', id: '6', authorId: '3' },
    { name: 'Name 7', genre: 'Genre 2', id: '7', authorId: '1' }
];

const dummyAuthors = [
    { name: 'Author 1', age: 25, id: '1' },
    { name: 'Author 2', age: 26, id: '2' },
    { name: 'Author 3', age: 25, id: '3' },
    { name: 'Author 4', age: 29, id: '4' }
];

const authorType: GraphQLObjectType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        books: {
            type: new GraphQLList(bookType),
            resolve(source: any, args: { [argName: string]: any }, context: any, info: GraphQLResolveInfo) {
                return dummyBooks.filter((book) => book.authorId === source?.id);
            }
        }
    })
});

const bookType: GraphQLObjectType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        author: {
            type: authorType,
            resolve(source: any, args: { [argName: string]: any }, context: any, info: GraphQLResolveInfo) {
                return dummyAuthors.find((author) => author.id === source?.authorId);
            }
        }
    })
});

const mutation: GraphQLObjectType = new GraphQLObjectType({
    name: 'mutation',
    fields: {
        addAuthor: {
            type: authorType,
            args: {
                name: { type: GraphQLString },
                age: { type: GraphQLInt }
            },
            resolve(source: any, args: { [argName: string]: any }, context: any, info: GraphQLResolveInfo) {
                const newAuthor = { id: (dummyAuthors.length + 1).toString(), name: args.name, age: args.age };
                dummyAuthors.push(newAuthor);
                return newAuthor;
            }
        },
        addBook: {
            type: bookType,
            args: {
                name: { type: GraphQLString },
                genre: { type: GraphQLString },
                authorId: { type: GraphQLID }
            },
            resolve(source: any, args: { [argName: string]: any }, context: any, info: GraphQLResolveInfo) {
                if (dummyAuthors.find((author) => author.id === args?.authorId) === undefined) {
                    throw new Error('Invalid author id');
                }
                const newBook = { id: (dummyBooks.length + 1).toString(), name: args.name, genre: args.genre, authorId: args.authorId };
                dummyBooks.push(newBook);
                return newBook;
            }
        }
    }
});

const rootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            // The name is important because it can be pluralized for the queries, is the parameter used on it
            type: bookType,
            args: { id: { type: GraphQLID, description: 'Id of the book to retrieve' } },
            resolve(source: any, args: { [argName: string]: any }, context: any, info: GraphQLResolveInfo) {
                return dummyBooks.find((book) => book.id === args?.id);
            }
        },
        books: {
            type: new GraphQLList(bookType),
            args: {
                nameLike: { type: GraphQLString, description: 'Search books with a name like the specified (upper / lower case sensitive)' }
            },
            resolve(source: any, args: { [argName: string]: any }, context: any, info: GraphQLResolveInfo) {
                if (args?.nameLike) {
                    return dummyBooks.filter((book) => book?.name?.includes(args.nameLike)) ?? [];
                }
                return dummyBooks;
            }
        },
        author: {
            type: authorType,
            args: { id: { type: GraphQLID, description: 'Id of the author to retrieve' } },
            resolve(source: any, args: { [argName: string]: any }, context: any, info: GraphQLResolveInfo) {
                return dummyAuthors.find((author) => author.id === args.id);
            }
        },
        authors: {
            type: new GraphQLList(authorType),
            args: {
                nameLike: {
                    type: GraphQLString,
                    description: 'Search authors with a name like the specified (upper / lower case sensitive)'
                }
            },
            resolve(source: any, args: { [argName: string]: any }, context: any, info: GraphQLResolveInfo) {
                if (args?.nameLike) {
                    return dummyAuthors.filter((author) => author?.name?.includes(args.nameLike)) ?? [];
                }
                return dummyAuthors;
            }
        }
    }
});

export const schema = new GraphQLSchema({
    query: rootQuery,
    mutation: mutation
});
