import express from 'express'
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import resourceRoutes from './routes/resourceRoutes.js'

import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 8080;

// test route for checking if server is running
app.get("/", (req, res) => {
    res.status(200).send('Hello world')
});

//middlewares
app.use(cors())
app.use(express.json())
app.use('/api', authRoutes)
app.use('/api', categoryRoutes)
app.use('/api', resourceRoutes)



// *Database connection
mongoose.connect("mongodb+srv://amp_user:XGL1tlzb3CJwdovc@cluster0.vwrd1.mongodb.net/fileshare?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(value => console.log('Connected to db'));


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})