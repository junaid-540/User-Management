const userModal = require('../model/userModal')


const checkSession = (req,res,next) =>{
    if(req.session.user){
        next()
    }else{
        res.redirect('/user/login');
    }
}


const isLogin = (req,res,next) =>{
    if(req.session.user){
        res.redirect('/user/home');
    }else{
        
        next()
    }
}

const verifyUserSession = async (req,res,next) =>{
    if(!req.session.user){
        return res.redirect('/user/login');
    }

    try {
        
        const user = await userModal.findById(req.session.user.id);
        if(!user){
            req.session.destroy(()=>{
                return res.redirect('/user/login');
            })
        }else{
            next();
        }

    } catch (error) {
        console.error("Session Check Error :",error);
        res.redirect('/user/login')
    }
}

module.exports = {checkSession,isLogin,verifyUserSession}