const mongoose = require("mongoose");
const User = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    phone : String,
    cart: Array,
    imageid: String,
}, { timestamps: true });
const Admin = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    imageid: String,
}, { timestamps: true });


const cart = [
    {
        "itemId":"AD12345",
        "name" : "Wheat",
        "price" : 2000,
    },
    {
        "itemId":"AD12346",
        "name" : "Rice",
        "price" : 999999,
    },
    {
        "itemId":"AD12347",
        "name" : "Fertilizer",
        "price" :  100,
    }
]


const usermodel = mongoose.model("User", User,"users");
const adminmodel = mongoose.model("Admin", User,"admins");

module.exports = { usermodel,adminmodel ,cart}

