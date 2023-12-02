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
var get_users = async () => {
  return new Promise(async (resolve, reject) => {
    const data = await modal.usermodel.find();
    if(!data){
      reject("Internal server error")
    } else {
      resolve(data);
    }
  })
}
var user_exists_phone = async (phone) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.usermodel.findOne({ phone: phone}).exec();
    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}
var admin_exists_email = async (email) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.adminmodel.findOne({ email: email}).exec();

    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}
var addtocart = async (phone,sc) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.usermodel.updateOne({phone:phone},{$push:{cart:sc}},{upsert:true}).exec()

    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}
var updateCart = async (phone,sc) => {
  return new Promise(async (resolve, reject) => {
    const user = await modal.usermodel.updateOne({phone:phone},{$set:{cart:sc}},{upsert:true}).exec()

    if (!user) {
      reject("User doesn't exists or Email and password are wrong!");
    } else {
      resolve(user);
    }
  })
}
var create_user = async (phone,email, password, firstname, lastname) => {
  return new Promise((resolve, reject) => {
    const data = new modal.usermodel({"email":email,"password":password,cart:[],"phone":phone,"firstname":firstname,"lastname":lastname,"imageid":"null"});
    const res = data.save()
      if(!res){
        reject("Unable to add data to user");
      }else{
        resolve("done");
      }
  })
}
module.exports = { connectToDatabase, user_exists ,create_user,user_exists_phone,get_users,admin_exists_email,addtocart,updateCart};
