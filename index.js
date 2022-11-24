const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000


//  middlware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oq7uvoj.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function run() {
    try {
        const CategoryCollection = client.db('old-market').collection('Category')

        const ProductsCollection = client.db('old-market').collection('allproducts')

        const userCollection = client.db('old-market').collection('user')


        app.get('/categoris', async (req, res) => {
            const query = {}
            const catagoris = await CategoryCollection.find(query).toArray();
            res.send(catagoris)
        })

        // app.get('/category/:id', async (req, res) => {

        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) }

        //     const result = await CategoryCollection.findOne(query)
        //     console.log(result)
        //     res.send(result)


        // })
        app.get('/categoris/:id', async (req, res) => {

            const id = req.params.id;
            const query = { category_id: id }

            const result = await ProductsCollection.find(query).toArray()
            console.log(result)
            res.send(result)


        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const result = await userCollection.insertOne(user);
            res.send(result)
        })


    }
    finally {



    }

}
run()






app.get('/', (req, res) => {
    res.send('ami chai na bari gari ar ')
})
app.listen(port, () => {
    console.log(`this server is running on ${port}`)
})