const mongoose = require('mongoose');
const monogoUrl = 'mongodb+srv://uxhurricane:harshit%407890@predexcluster.s69q4fz.mongodb.net/GreenHumanity?retryWrites=true&w=majority';
const modal = require('./modals')
mongoose.connect(monogoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

function connectToDatabase() {
  return new Promise((resolve, reject) => {
    db.once('open', () => {
      resolve();
    });
    db.on('error', (err) => {
      reject(err);
    });
  });
}

var get_areas = async () => {
  return new Promise(async (resolve, reject) => {
    const data = await modal.areasModel.find();
    if (!data) {
      reject("Internal server error")
    } else {
      resolve(data);
    }
  }
  )
}
var user_exists = async (phone, password) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.usermodel.findOne({ phone: phone, password: password }).exec();
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}
var shg_exists = async (phone, password) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.shgModel.findOne({ phone: phone, password: password }).exec();
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}

var get_users = async () => {
  return new Promise(async (resolve, reject) => {
    const data = await modal.usermodel.find();
    if (!data) {
      reject("Internal server error")
    } else {
      resolve(data);
    }
  })
}
var user_exists_phone = async (phone) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.usermodel.findOne({ phone: phone }).exec();
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}
var admin_exists_email = async (email) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.adminmodel.findOne({ email: email }).exec();

    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}
var addtocart = async (phone, sc) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.usermodel.updateOne({ phone: phone }, { $push: { cart: sc } }, { upsert: true }).exec()

    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}
var updateItem = async (phone, itemId, quantity) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.usermodel.updateOne({ phone: phone, cart: { $elemMatch: { itemId: itemId } } }, { $set: { "cart.$.quantity": quantity } }, { upsert: true }).exec()

    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}

var removefromcart = async (phone, id) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.usermodel.updateOne({ phone: phone }, { $pull: { cart: { itemId: id } } }, { upsert: true }).exec()

    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}
var updateCart = async (phone, sc) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.usermodel.updateOne({ phone: phone }, { $set: { cart: sc } }, { upsert: true }).exec()

    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}
var insertOrders = async (cart_data, billing_data, phone) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.usermodel.updateOne({ phone: phone }, { $push: { orders: { cart_data, billing_data } } }, { upsert: true }).exec()
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}

var get_shg = async (phone) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.shgdataModel.findOne({ phone: phone }).exec()
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}

var create_shgdata = async (phone, firstname, lastname, area, password, address, state, city, pincode) => {
  return new Promise(async (resolve, reject) => {
    const data = new modal.shgdataModel({ "phone": phone, "firstname": firstname, "lastname": lastname, "area": area, "password": password, "address": address, "state": state, "city": city, "pincode": pincode, "products": [], "products_history": [], "revenue_history": [], "revenue": [] });
    const res = data.save()
    if (!res) {
      reject("Unable to add data to user");
    } else {
      resolve("done");
    }
  })
}

var update_shg_revenue_history = async (phone, amount, description, status, date) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.shgdataModel.updateOne({ phone: phone }, { $push: { revenue_history: { description: description, amount: amount, status: status, date: date } } }, { upsert: true }).exec()
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}
var create_shg_revenue = async (phone, description, amount, status, date) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.shgdataModel.updateOne({ phone: phone }, { $push: { revenue: { detail: description, amount: amount, status: status, date: date } } }, { upsert: true }).exec()
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);

    }
  })
}

var update_shg_products_history = async (phone, name, quantity, description, status) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.shgdataModel.updateOne({ phone: phone }, { $push: { products_history: { name: name, quantity: quantity, description: description, status: status } } }, { upsert: true }).exec()
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}

var delete_shg_products = async (phone, name) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.shgdataModel.updateOne({ phone: phone }, { $pull: { products: { name: name } } }, { upsert: true }).exec()
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {

      resolve(user);

    }
  })
}
var update_shg_products = async (phone, name, quantity, description) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.shgdataModel.updateOne({ phone: phone, products: { $elemMatch: { name: name } } }, { $set: { "products.$.quantity": quantity, "products.$.description": description } }, { upsert: true }).exec()
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {

      resolve(user);
    }
  })
}

var create_shg_products = async (phone, name, quantity, description) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.shgdataModel.updateOne({ phone: phone }, { $push: { products: { name: name, quantity: quantity, description: description } } }, { upsert: true }).exec()
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);

    }
  })
}
var add_shg_gw = async (phone, name, education, graduation, gw_phone, address) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.shgdataModel.updateOne({ phone: phone }, { $push: { gw: { name: name, education: education, graduation: graduation, phone: gw_phone, address: address } } }, { upsert: true }).exec()
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);

    }
  })

}
var create_user = async (phone, email, password, firstname, lastname, address, state, city, pincode, education, graduation, role, verified) => {
  return new Promise((resolve, reject) => {
    const data = new modal.usermodel({ "email": email, "password": password, cart: [], "phone": phone, "firstname": firstname, "lastname": lastname, "imageid": "null", "address": address, "state": state, "city": city, "pincode": pincode, "orders": [], "education": education, "graduation": graduation, "role": role, "verified": verified });
    const res = data.save()
    if (!res) {
      reject("Unable to add data to user");
    } else {
      resolve("done");
    }
  })
}
module.exports = {
  connectToDatabase, user_exists, create_user, user_exists_phone, get_users, admin_exists_email, addtocart, updateCart, removefromcart, updateItem, insertOrders
  , get_areas, create_shgdata, shg_exists, get_shg, delete_shg_products, create_shg_products, update_shg_products_history, update_shg_products, create_shg_revenue, update_shg_revenue_history
  , add_shg_gw
};
