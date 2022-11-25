const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_PAYMENT)
const port = process.env.PORT || 5000


//  middlware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { Stripe } = require('stripe')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oq7uvoj.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function run() {
    try {
        const CategoryCollection = client.db('old-market').collection('Category')

        const ProductsCollection = client.db('old-market').collection('allproducts')

        const bookingCollection = client.db('old-market').collection('booking')

        const PaymentCollection = client.db('old-market').collection('payment')

        const userCollection = client.db('old-market').collection('user')

        // get 3 category data
        app.get('/categoris', async (req, res) => {
            const query = {}
            const catagoris = await CategoryCollection.find(query).toArray();
            res.send(catagoris)
        })
        // get 3 category data
        app.get('/categorisBrand', async (req, res) => {
            const query = {}
            const catagoris = await CategoryCollection.find(query).project({ brand: 1 }).toArray();
            res.send(catagoris)
        })

        // get getegorywise data
        app.get('/categoris/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                category_id: id
            }
            const result = await ProductsCollection.find(query).toArray()
            res.send(result)

        })

        //  product booking
        app.post('/booking', async (req, res) => {
            const book = req.body;
            const booking = await bookingCollection.insertOne(book)
            res.send(booking)

        })

        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.findOne(query)
            res.send(result)


        })

        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price

            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                'payment_method_types': [
                    "card"
                ]
            });
            res.send({
                clientSecrete: paymentIntent.client_secret

            })
        })

        app.post('/payment', async (req, res) => {
            const payment = req.body;
            const result = await PaymentCollection.insertOne(payment);
            const id = payment.bookingId;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    paid: true,
                    tranjactionId: payment.tranjactionId
                }

            }
            const update = await bookingCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        // my ordsers
        app.get('/booking', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const alreadyBooking = await bookingCollection.find(query).toArray()
            res.send(alreadyBooking)
        })

        // get alll users
        app.get('/users', async (req, res) => {
            const query = {}
            const allusers = await userCollection.find(query).toArray()
            res.send(allusers)
        })

        // get alll sellers
        app.get('/users/:role', async (req, res) => {
            const role = req.params.role
            const query = { role: role }

            const allsellers = await userCollection.find(query).toArray()
            res.send(allsellers)


        })

        // get all buyers
        app.get('/users/:role', async (req, res) => {
            const role = req.params.role
            const query = { role: role }

            const allsellers = await userCollection.find(query).toArray()
            res.send(allsellers)


        })


        // admin banano id dore
        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        // check admin email
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }

            const user = await userCollection.findOne(query)

            res.send({ isAdmin: user?.role === 'admin' })
        })

        // new user information
        app.post('/users', async (req, res) => {
            const user = req.body;

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