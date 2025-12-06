const userModal  = require('../model/userModal');
// const userSchema  = require('../model/userModal');
const bcrypt = require('bcrypt');
const saltRounds = 10;




const registerUser = async(req,res) =>{

    try{

        const {username,email,password} = req.body;

        const user = await userModal.findOne({email});

        if(user) {
            
            return res.render('user/register',{
                msg:'user already exists',
                type:'error'
            });
        
        }
        const hashedPassword = await bcrypt.hash(password,saltRounds)

        const newUser = new userModal({
            email,
            password : hashedPassword,
            username
        })

        await newUser.save()
                //this is the normal way//
        // return res.render('user/login',{
        //     loginmsg:'Please login',
        //     type:'success'
        // });
        
        return res.redirect('/user/login?success=true')


    }catch(error){

        console.error("Register Error: ",error);
        res.render('user/register',{msg:'Something Went Wrong'});

    }
}


const logout = (req,res)=>{
    req.session.destroy();
   res.redirect('/user/login');
  
}


const login = async (req,res) =>{
    try {
        
        console.log(req.body)

        const {email,password} = req.body;

        const user = await userModal.findOne({email})

        if(!user) return res.render('user/login',{msg:"User does not exist"});
        
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch) return res.render('user/login',{msg:'Incorrect password'})

        req.session.user = {
            id : user._id,
            username : user.username,
            email : user.email
        };

        res.redirect('/user/home');


    } catch (error) {
        console.error("Login Error: ",error);
        res.render('user/login',{msg:'Something Went Wrong'});

    }
}


const loadRegister = (req,res) =>{
    if(req.session.user){
        return res.redirect('/user/home'); //this will prevent accessing register when already logged in
    }
    res.render('user/register');
}

const loadLogin = (req,res) =>{
    console.log(req.session.user);
    if(req.session.user){
        return res.redirect('/user/home')
    }
    const success = req.query.success === 'true';
    res.render('user/login',{
        msg:"",
        loginmsg:success?"User Created Successfully": "",
        type:success?"success":""
    });
}

const loadHome = (req,res)=>{
    const user = req.session.user;
    res.render('user/home',{username:user.username})
}



module.exports = {
    registerUser,
    loadRegister,
    loadLogin,
    loadHome,
    login,
    logout
}