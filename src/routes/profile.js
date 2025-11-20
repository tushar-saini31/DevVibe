const express=require("express");
const profileRouter=express.Router();
const {UserAuth}=require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validation");


const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });


profileRouter.get("/profile/view", UserAuth, async (req, res) => {
  try {
    const userId = req.user._id; // get ID from auth middleware
    const freshUser = await User.findById(userId); // fetch latest user
    if (!freshUser) {
      throw new Error("User does not exist");
    }

    res.json(freshUser); // send updated data including photoUrl
  } catch (err) {
    res.status(400).send("error: " + err.message);
  }
});


profileRouter.patch("/profile/edit", UserAuth, async (req, res)=>{
    try{
        if(!validateEditProfileData(req)){
            throw new Error("Invalid edit request" );
        }
        const loggedInuser =req.user;
        //console.log(loggedInuser);
        Object.keys(req.body).forEach((key)=>(loggedInuser[key]=req.body[key]));
        await loggedInuser.save();

        res.send(`${loggedInuser.firstName},your profile is upadated`);

    }catch(err){
       res.status(400).send("error"+err.message);
    }
})

// Upload profile photo
profileRouter.post("/profile/upload", UserAuth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = req.user;
    const imageBase64 = req.file.buffer.toString("base64");
    const imageType = req.file.mimetype;

    user.photoUrl = `data:${imageType};base64,${imageBase64}`;
    user.photoType = imageType;

    await user.save();

    const updatedUser = await User.findById(user._id); // fresh data from MongoDB

    // ✅ send structured response
    res.json({ message: "Profile photo uploaded successfully", data: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




module.exports=profileRouter;