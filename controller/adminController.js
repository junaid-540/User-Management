const adminModal = require('../model/adminModal');
const userModal = require('../model/userModal');
const bcrypt = require('bcrypt');
const saltRounds = 10;



const loadLogin = async (req,res) => {

    res.render("admin/login");
}


const login = async (req,res) => {
    try {
        
        const {email , password} = req.body

        console.log(req.body)

        const admin = await adminModal.findOne({email});

        if(!admin) return res.render('admin/login',{err:'Invalid Credentials'});

        const isMatch =await bcrypt.compare(password,admin.password);

        if(!isMatch) return res.render('admin/login',{err:"Invalid Credentials"});

        req.session.admin = true
        console.log(req.session);
        

        res.redirect('/admin/dashboard')

    } catch (error) {
        
        // res.send(error)
        console.error("Admin Login Error:", error);
        res.render('admin/login', { msg: 'Something Went Wrong' });

    }
}


const loadDashboard = async (req,res) => {
    try {
        const admin = req.session.admin;
        if(!admin) return res.redirect('/admin/login')

        const users =  await userModal.find({})

        res.render('admin/dashboard', {
            users,
            dashmsg: req.flash('dashmsg')[0] || '',
            type: req.flash('type')[0] || ''
        });

    } catch (error) {
        console.error("Load Dashboard Error:", error);
        res.status(500).send("Internal Server Error");
    }
}


const editUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const { id } = req.params;

    // Server-side validation
    if (!username || !email) {
      req.flash('dashmsg', 'Username and email are required');
      req.flash('type', 'error');
      return res.redirect('/admin/dashboard');
    }

    // Check for duplicate username or email
    const duplicates = await userModal.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: id }
    });

    if (duplicates) {
      req.flash('dashmsg', 'Username or email already exists');
      req.flash('type', 'error');
      return res.redirect('/admin/dashboard');
    }

    // Prepare update data
    const updateData = { username, email };

    // Only hash and update password if provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update the user
    await userModal.findByIdAndUpdate(id, { $set: updateData });

    // Set success message
    req.flash('dashmsg', 'User updated successfully');
    req.flash('type', 'success');
    return res.redirect('/admin/dashboard');

  } catch (error) {
    console.error("Edit User Error:", error);
    req.flash('dashmsg', 'Error updating user');
    req.flash('type', 'error');
    return res.redirect('/admin/dashboard');
  }
};



const deleteUser = async (req,res) =>{
    try {
        
        const {id} = req.params;

        const user = await userModal.findOneAndDelete({_id:id})

        if(!user){
            return res.status(404).json({success:false,message:"User not found"});
        }

        res.status(200).json({success:true});

        
        // res.redirect('/admin/dashboard'); -> this reloads the page so we dont need that thats why we used the AJAX(asynchronus js) like the fetch it find the id and delete it without reloadin the site//

    } catch (error) {
        
        // console.log(error)

        console.error("Delete User Error:", error);
        // res.status(500).redirect('/admin/dashboard');
        res.status(500).json({success:false,message:"Internal Server Error"});
    }
}





// ===================================================
// DELETE USER (Form-based method like Add User)
// This is the version used if delete is handled through a <form> action (GET method)
// It reloads the entire page after deleting — simple but not user-friendly
// We are NOT using this, just keeping for understanding.
// ===================================================

// const deleteUser = async (req,res) => {
//     try {
//         const { id } = req.params;
//         await userModal.findOneAndDelete({ _id: id });
//         res.redirect('/admin/dashboard'); // full page reload
//     } catch (error) {
//         console.error("Delete User Error:", error);
//         res.status(500).redirect('/admin/dashboard');
//     }
// }



const addUser = async (req,res) =>{

    try {
        
        const {username,email,password} = req.body;

        const existingUser = await userModal.findOne({email});
        if(existingUser){
            console.log("User already exist with this email.");
            return res.redirect('/admin/dashboard');
        }


        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new userModal({
            username,
            email,
            password:hashedPassword
        })

        await newUser.save()

        res.redirect('/admin/dashboard');

    } catch (error) {
        
        // console.log(error)

        console.error("Add User Error:", error);
         res.status(500).render('admin/dashboard', { msg: 'Error adding user' });

    }

}


const searchUser = async (req,res)=>{
    try {
        
        const searchQuery = req.body.search.trim();

        const users = await userModal.find({
            $or:[
                {username:{$regex:searchQuery,$options:'i'}},
                {email:{$regex:searchQuery,$options:'i'}}
            ]
        });

        res.render('admin/dashboard',{users});

    } catch (error) {
        
        console.error("Search User Error :",error);
        res.status(500).render('admin/dashboard',{mgs:"Error while searching user"});
    }
}


const logout = async (req,res) =>{
    req.session.destroy((err)=>{
        if(err){
            console.error("Logout error:",err);
            
            //optionally show a message or redirect to an error page//

            return res.status(500).send("Logout failed");
        }
        res.redirect('/admin/login');
    }); 
}



module.exports = {loadLogin,login,loadDashboard,deleteUser,editUser,addUser,logout,searchUser}