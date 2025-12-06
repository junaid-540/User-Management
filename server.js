const express = require ('express');
const app = express();
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const path = require('path');
const connectDB = require('./db/connectDB');
const session = require('express-session');
const nocache = require('nocache');
const hbs = require('hbs')
const flash = require('connect-flash');


app.use(session({
    secret:'mysecretkey',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:1000*60*60
    }
}))
app.use(nocache());




app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(express.static('public'));


app.set('views',path.join(__dirname,'views'));
app.set('view engine','hbs')

app.use(flash())

//hbs cannot accept arithmatic value so you have to create a custom inc helper or function 
hbs.registerHelper('inc',function(value){
    return parseInt(value)+1
})


app.use('/user',userRoutes);
app.use('/admin',adminRoutes);







app.get('/',(req,res)=>{
    res.render('user/login');
})



connectDB()




app.listen(3000,()=>console.log("server running on http://localhost:3000/"))