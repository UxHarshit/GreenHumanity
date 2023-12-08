const mongoose = require("mongoose");
const User = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    phone : String,
    cart: Array,
    orders: Array,
    address: String,
    state: String,
    city: String,
    pincode: String,
    imageid: String,
}, { timestamps: true });
const Admin = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    imageid: String,
}, { timestamps: true });

const Shgs = new mongoose.Schema({
    firstname: String,
    lastname: String,
    area : String,
    GW : Array,
    password: String,
    address: String,
    state: String,
    city: String,
    pincode: String,
}, { timestamps: true });

const Areas = new mongoose.Schema({
    name: String,
    pincode: String,
    city: String,
    state: String,
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
        "price" : 100,
    },
    {
        "itemId":"AD12347",
        "name" : "Fertilizer",
        "price" :  1,
    },
    {
        "itemId":"AD12340",
        "name" : "Seeds",
        "price" :  5,
    }
]


const usermodel = mongoose.model("User", User,"users");
const adminmodel = mongoose.model("Admin", User,"admins");
const areasModel = mongoose.model("Areas", Areas,"areas");
const shgModel = mongoose.model("Shgs", Shgs,"shgs");

module.exports = { usermodel,adminmodel ,shgModel,areasModel,cart}

