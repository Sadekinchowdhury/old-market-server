const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_PAYMENT)
const port = process.env.PORT || 5000


//  middlware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const { Stripe } = require('stripe')

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oq7uvoj.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorize acess')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {

        if (err) {
            return res.status(401).send({ message: 'forribideen' })
        }
        req.decoded = decoded;

        next();
    })

}



function run() {
    try {
        const CategoryCollection = client.db('old-market').collection('Category')

        const ProductsCollection = client.db('old-market').collection('allproducts')

        const bookingCollection = client.db('old-market').collection('booking')

        const PaymentCollection = client.db('old-market').collection('payment')

        const addVCollection = client.db('old-market').collection('Advirtise')

        const userCollection = client.db('old-market').collection('user')
        const reviewCollection = client.db('old-market').collection('review')
        const cartCollection = client.db('old-market').collection('cart')


        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            console.log(user)


            if (user) {
                const token = jwt.sign({ email }, process.env.JWT_KEY, { expiresIn: '30D' })
                return res.send({ accesTocken: token })
            }

            res.status(401).send({ accestokken: '' })
        })


        // review
        app.post('/review', async (req, res) => {
            const query = req.body
            const result = await reviewCollection.insertOne(query)
            res.send(result)
        })
        app.get('/review/:id', async (req, res) => {
            const id = req.params.id
            const query = { reviewId: id }
            const result = await reviewCollection.find(query).toArray()
            res.send(result)
        })

        app.delete('/review/:id/:email', async (req, res) => {
            const { id, email } = req.params
            const query = { $or: [{ _id: id }, { userEmail: email }] };
            const result = await reviewCollection.deleteMany(query)

            res.send(result)
        })


        // get 3 category data
        app.get('/categoris', async (req, res) => {
            const query = {}
            const catagoris = await CategoryCollection.find(query).toArray();
            res.send(catagoris)
        })

        // get category data
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

        // every card details page
        app.get('/card_details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ProductsCollection.findOne(query)
            res.send(result)

        })
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await ProductsCollection.insertOne(product)
            res.send(result)
        })

        app.put('/products', async (req, res) => {
            const product = req.body
            const result = await ProductsCollection.insertOne(product)

            res.send(result)
        })
        // all products
        app.get('/products', async (req, res) => {
            const query = {}
            const result = await ProductsCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/products', async (req, res) => {
            const email = req.query.email;

            const query = { email: email }

            const product = await ProductsCollection.find(query).toArray()
            res.send(product)
        })


        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ProductsCollection.deleteOne(query)
            res.send(result)
        })

        //  product booking
        app.post('/booking', async (req, res) => {
            const book = req.body;
            // const query = {
            //     email: book.email,

            // }
            // const alreadyBooking = await bookingCollection.find(query).toArray()
            // if (alreadyBooking.length > 1) {
            //     const message = `already booking on ${book.itemname}`
            //     return res.send({ acknowledged: false, message })

            // }
            const booking = await bookingCollection.insertOne(book)
            res.send(booking)

        })

        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.findOne(query)
            res.send(result)


        })
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
            res.send(result)


        })

        app.get('/booking/sales/today', async (req, res) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            try {
                const pipeline = [
                    {
                        $match: {
                            soldDate: { $gte: today },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalSoldToday: { $sum: '$total' },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            totalSoldToday: 1,
                        },
                    },
                ];
                const result = await bookingCollection.aggregate(pipeline).toArray();
                res.json(result);
            } catch (err) {
                console.error('আজকের বিক্রয়ের তথ্য প্রাপ্ত করতে সমস্যা:', err);
                res.status(500).json({ error: 'আজকের বিক্রয়ের তথ্য প্রাপ্ত করতে সমস্যা' });
            }
        });


        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body

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
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    paid: true,
                    tranjactionId: payment.tranjactionId
                }

            }
            const update = await bookingCollection.updateOne(filter, updateDoc, options)


            res.send(result)
        })


        // app.put('/product/:id', async (req, res) => {

        //     const id = req.params.id

        //     const filter = { _id: ObjectId(id) }
        //     const options = { upsert: true }
        //     const updateDoc = {
        //         $set: {
        //             paid: true

        //         }

        //     }
        //     const update = await ProductsCollection.updateOne(filter, updateDoc, options);

        //     res.send(update)
        // })

        // my ordsers
        app.get('/booking', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const alreadyBooking = await bookingCollection.find(query).toArray()

            res.send(alreadyBooking)
        })


        // cart
        app.post('/cart', async (req, res) => {
            const query = req.body;
            const result = await cartCollection.insertOne(query)

            res.send(result)
        })

        // cart
        app.get('/booking/:email', async (req, res) => {
            const email = req.params.email;
            const query = { bookingEmail: email }
            const result = await bookingCollection.find(query).toArray()

            res.send(result)
        })

        // app.delete('/booking/:id:email', async (req, res) => {
        //     const { id, email } = req.params
        //     console.log(id, email)
        //     const query = { _id: ObjectId(id), bookingEmail: email }
        //     console.log(query)
        //     const result = await bookingCollection.deleteOne(query)
        //     res.send(result)
        // })
        app.put('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const update = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    cart: update.cartAdd,
                    quantity: update.cart,
                    bookingEmails: update.bookingEmail,

                }
            }
            const result = await bookingCollection.updateMany(filter, updateDoc, options)
            res.send(result)
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

        app.get('/users/:role', async (req, res) => {
            const role = req.params.role
            const query = { role: role }

            const allsellers = await userCollection.find(query).toArray()
            res.send(allsellers)


        })
        app.get('/user', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const products = await userCollection.findOne(query)
            res.send(products);
        })





        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })

        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    verify: true
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        app.put('/user/:id', async (req, res) => {
            const id = req.params.id;
            const update = req.body
            const { name, phone, zip, city, country, adress1, adress2, image } = update
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name, phone, zip, city, country, adress1, adress2, image
                }
            }
            const result = await userCollection.updateMany(filter, updateDoc, options)
            console.log(result)
            res.send(result)
        })

        // app.put('/user/:email', async (req, res) => {
        //     const email = req.params.email
        //     const update = req.body
        //     console.log(update)
        //     const filter = { email: email };
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: {
        //             name: update.name


        //         }
        //     }
        //     const result = await userCollection.updateOne(filter, updateDoc, options);
        //     console.log(result)
        //     res.send(result);
        // })


        // get all buyers
        app.get('/users/:role', async (req, res) => {
            const role = req.params.role
            const query = { role: role }

            const allsellers = await userCollection.find(query).toArray()
            res.send(allsellers)


        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }

            const user = await userCollection.findOne(query)


            res.send({ isSeller: user?.role === 'seller' })
        })

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }

            const user = await userCollection.findOne(query)


            res.send({ isSeller: user?.role === 'buyer' })
        })

        app.get('/user', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await userCollection.findOne(query);
            res.send(result);
        })
        app.get('/user/:email', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await userCollection.findOne(query);
            res.send(result);
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
            console.log(user)
            const result = await userCollection.insertOne(user);
            res.send(result)
        })


        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    soldStatus: 'true'
                }
            }
            const result = await ProductsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })




        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    advertise: 'true'
                }
            }
            const result = await ProductsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        // app.get('/product/advertise/', async (req, res) => {
        //     const result = await ProductsCollection.find({ advertise: true }).toArray()
        //     res.send(result);
        // })

        app.get('/product', async (req, res) => {
            const { advirtise } = req.query
            const query = {
                advirtise: true
            };
            console.log(query)
            const category = await ProductsCollection.find(query).toArray();
            res.send(category)
        })

        app.get('/product/:email', async (req, res) => {
            const email = req.params.email
            const query = {
                email: email
            };
            const category = await ProductsCollection.find(query).toArray();
            res.send(category)
        })
        app.get('/advertise/product', async (req, res) => {
            const query = {
                advertise: 'true'
            };
            const category = await ProductsCollection.find(query).toArray();
            res.send(category)
        })

        // app.put('/advirtise/:id', async (req, res) => {
        //     const add = req.body;
        //     console.log(add)
        //     const id = req.query.id

        //     const filter = {
        //         _id: ObjectId(id)
        //     }
        //     const options = { upsert: true }
        //     const updateDoc = {
        //         $set: add
        //     }
        //     const result = await addVCollection.updateOne(filter, updateDoc, options)
        //     res.send(result)
        // })


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