const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000


//  middlware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oq7uvoj.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function run() {
    try {
        const userCollection = client.db('old-market').collection('user')

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