require("dotenv").config()  // Load env variables
const express = require('express') // bring in express to make our app
const morgan = require('morgan') // nice logger for our request
const methodOverride = require('method-override') // allows us to override post request from our ejs/forms
const mongoose = require('mongoose') // gives us that db connection and cool methods for CRUD to the datas
const PORT = process.env.PORT

const app = express()

//////////////////////////////////////////////
//////// Database Connections
///////////////////////////////////////////////

const DATABASE_URL = process.env.DATABASE_URL
const CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

//Establish our connections
mongoose.connect(DATABASE_URL, CONFIG)

// Log connections events from mongoose
mongoose.connection
    .on("open", ()=> console.log('Mongoose connected'))
    .on("close", ()=> console.log('Disconnected from Mongoose'))
    .on("error", (error)=> console.log('Mongoose error', error))



//////////////////////////////////////////////
//////// Fruits Model
///////////////////////////////////////////////

const { Schema, model } = mongoose // destructuring, grabbing model and Schema off mongoose variable
// mongoose.Schema
// mongoose.model


const fruitsSchema = new  Schema({
    name: String,
    color: String,
    readyToEat: Boolean
})

const Fruit = model('Fruit', fruitsSchema)

const userSchema = new  Schema({
    name: String,
    age: String,
    readyToEat: Boolean
})
const User = model('User', userSchema)


//////////////////////////////////////////////
//////// Middlewares
///////////////////////////////////////////////

app.use(morgan('tiny'))
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))

//////////////////////////////////////////////
//////// Routes
///////////////////////////////////////////////

app.get('/', (req, res) => {
    res.send('Server doing what it should be doing')
})

app.get('/fruits/seed', (req, res) => {

    // define data we want to put in the database
    const startingFruits =  [
        { name: "Orange", color: "orange", readyToEat: false },
        { name: "Grape", color: "purple", readyToEat: false },
        { name: "Banana", color: "orange", readyToEat: false },
        { name: "Strawberry", color: "red", readyToEat: false },
        { name: "Coconut", color: "brown", readyToEat: true },
        { name: "Cherry", color: "red", readyToEat: true },
      ]
      
      // Delete all fruits
      Fruit.deleteMany({}, (err, data) => {

        // Create new fruits once old fruits are deleted
        Fruit.create(startingFruits, (err, createdFruits) =>{
            res.json(createdFruits)
            
        })

      })

})

app.get('/fruits', (req, res) => {

    // Get all fruits from mongo and send them back
    Fruit.find({})
    .then((fruits) => {
        // res.json(fruits)
        res.render('fruits/index.ejs', { fruits })
    })
    .catch(err => console.log(err))

})

app.get('/fruits/new', (req, res) => {
    res.render('fruits/new.ejs')
})

app.post('/fruits', (req, res) => {
    
    req.body.readyToEat = req.body.readyToEat === 'on' ? true : false

    Fruit.create(req.body, (err, createdFruit) =>{
        console.log('created' , createdFruit, err)
        res.redirect('/fruits')
    })
} )

app.get('/fruits/:id', (req, res)=>{

    // Go and get fruit from the database
    Fruit.findById(req.params.id)
    .then((fruit)=> {
        res.render('fruits/show.ejs', {fruit})
    })
})

app.listen(PORT, ()=> console.log(`Who let the dogs out on port: ${PORT}`))