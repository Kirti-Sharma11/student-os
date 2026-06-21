const jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{

  console.log("AUTH HEADER =", req.headers.authorization);

  const token =
    req.headers.authorization?.split(" ")[1];

  if(!token){
    console.log("NO TOKEN");
    return res.status(401).json({
      message:"Unauthorized"
    });
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  console.log("DECODED =", decoded);

  req.userId = decoded.id;

  console.log("REQ.USERID =", req.userId);

  next();
};