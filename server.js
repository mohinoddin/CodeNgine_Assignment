const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dataModal = require("./modal/dataSchema");
const userModal = require("./modal/userSchema")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//to start the server
app.listen(3000, (err) => {
    if (!err) {
        console.log("Server Started at 3000");
    } else {
        console.log(err);
    }
});

//db conncetion
mongoose.connect("mongodb://localhost/codeNgineAssignment", () => {
    console.log("Connected to db")
}, (err) => {
    console.log(err);
});

//to generate encrypted text
const generateEncryptedText = (textData) => {
    const salt = 10;
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(salt).then((hashSalt) => {
            bcrypt.hash(textData, hashSalt).then((textDataHash) => {
                resolve(textDataHash);
            })
        })
    });
}


//base route
app.get("/", (req, res) => {
    res.send("base route")

})




// register route
app.post("/add", async (req, res) => {

    if (req.headers.authorization) {

        try {
            user_mail = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
        generateEncryptedText(req.body.textData).then((textDataHash) => {
            dataModal.create({
                textData: textDataHash
            })
                .then((data) => {
                    res.status(200).send(data)
                }).catch((err) => {
                    res.status(400).send(err.message)
                })
        });

    } catch (err) {
        res.status(403).send("User not authorized")
    }
    }else{
        res.status(403).send("missing authorization token in header")
    }
}
)


//get route
app.get("/alldata", (req, res) => {

    if (req.headers.authorization) {

        try {
            user_mail = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);

    dataModal.find().then((data) => {
        res.status(200).json({
            alldata: data
        })
    })

} catch (err) {
    res.status(403).send("User not authorized")
}
}else{
    res.status(403).send("missing authorization token in header")
}
})



//to check if user exist
const checkExistingUser = async (email) => {
    let existingUser = false;
    await userModal.find({ email: email }).then((userData) => {
        if (userData.length) {
            existingUser = true;
        }
    });
    return existingUser;
}





//login route
app.post("/login", (req, res) => {
    userModal.find({ email: req.body.email }).then((userData) => {
        if (userData.length) {
            bcrypt.compare(req.body.password, userData[0].password).then((val) => {
                if (val) {
                    const token = jwt.sign(userData[0].email, process.env.SECRET_KEY);
                    res.status(200).json({
                        status: "success", token
                    }
                    );
                } else {
                    res.status(400).send("Invalid Password");
                }
            }).catch((err) => {
                res.status(400).send(err.message)
            })
        } else {

            res.status(400).send("Invalid username");
        }
    })

})

const generatePasswordHash = (password) => {
    const salt = 10;
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(salt).then((hashSalt) => {
            bcrypt.hash(password, hashSalt).then((passwordHash) => {
                resolve(passwordHash);
            })
        })
    });
}


// register route
app.post("/register", async (req, res) => {

    if (await checkExistingUser(req.body.email)) {
        res.status(400).send("Username exist. Please try with different email id");
    } else {
        generatePasswordHash(req.body.password).then((passwordHash) => {
            userModal.create({
                name: req.body.name, email: req.body.email,
                password: passwordHash
            })
                .then((data) => {
                   res.status(200).send("user registered")
                }).catch((err) => {
                    res.status(400).send(err.message)
                })
        });
    }
})



