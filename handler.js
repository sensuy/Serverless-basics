import AWS from 'aws-sdk';
import express from 'express';
import serverless from 'serverless-http';


const app = express();

const USERS_TABLE = process.env.USERS_TABLE;

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

app.get('/users/:userId', async (req, res) => {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: req.params.userId,
        },
    };

    try {
        const { Item } = await dynamoDbClient.get(params).promise();
        if (Item) {
            const { userId, name, email } = Item;
            res.json({ userId, name, email });
        } else {
            res.status(404).json({ error: 'Could not find user with provided "userId"' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not retrieve user' });
    }
});

app.post('/users', async (req, res) => {
    const { userId, name, email } = req.body;
    if (typeof userId !== 'string') {
        res.status(400).json({ error: '"userId" must be a string' });
    } else if (typeof name !== 'string') {
        res.status(400).json({ error: '"name" must be a string' });
    } else if (typeof email !== 'string') {
        res.status(400).json({ error: '"email" must be a string' });
    }

    const params = {
        TableName: USERS_TABLE,
        Item: {
            userId,
            name,
            email,
        },
    };

    try {
        await dynamoDbClient.put(params).promise();
        return res.json({ userId, name, email });
    } catch (error) {
        return res.status(500).json({ error: 'Could not create user' });
    }
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
    });
});


export const handler = serverless(app);