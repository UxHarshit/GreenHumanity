const db = require('./db')
const totp = require('totp-generator');
const { cart } = require('./modals');

function routes(app) {

    app.get('/landing', function (req, res) {
        res.render('landing');
        res.end()
    });
    app.post('/api/user/deletecart', function (req, res) {
        const phone = req.session.phone;
        const password = req.session.password;
        const id = req.body.id;
        if (phone == null || phone.length < 2 || password == null || password.length < 6 || id.length < 2) {
            req.session.isLoggedIn = false
            res.redirect('/login')
            return;
        }
        db.user_exists(phone, password).then((data) => {
            req.session.isLoggedIn = true
            req.session.phone = phone
            req.session.password = password
            if (data == undefined) {
                res.status(400).json({ "error": "bad request" });
            } else {
                var exists = cart.find(o => o.itemId == id);
                if (!exists) { res.status(400).json({ "error": "bad request" }); return; }

                var find_cart = data.cart.find(o => o.itemId == id)
                var struct = [{
                    "itemId": id,
                    "quantity": 1
                }]

                if (find_cart == undefined) {
                    res.status(400).json({ "error": "Item doesn't exist in cart" });
                } else {
                    var index = data.cart.findIndex(o => o.itemId == id)

                    db.updateCart(req.session.phone, data.cart).then((result) => {
                        data.cart[index].name = exists.name;
                        res.status(200).json(data.cart[index]);

                    }).catch((err) => {
                        res.status(500).json({ "message": "Internal server error" });
                        console.log(err)
                    })
                }

            }

        }).catch((err) => {
            req.session.isLoggedIn = false
            console.log(err)
            res.redirect('/login')
            res.end()
        })

    })

    app.post('/api/user/addCart', function (req, res) {
        const phone = req.session.phone;
        const password = req.session.password;
        const id = req.body.id;
        if (phone == null || phone.length < 2 || password == null || password.length < 6 || id.length < 2) {
            req.session.isLoggedIn = false
            res.redirect('/login')
            return;
        }
        db.user_exists(phone, password).then((data) => {
            req.session.isLoggedIn = true
            req.session.phone = phone
            req.session.password = password
            if (data == undefined) {
                res.status(400).json({ "error": "bad request" });
            } else {
                var exists = cart.find(o => o.itemId == id);
                if (!exists) { res.status(400).json({ "error": "bad request" }); return; }

                var find_cart = data.cart.find(o => o.itemId == id)
                var struct = {
                    "itemId": id,
                    "quantity": 1
                }

                if (find_cart == undefined) {
                    db.addtocart(req.session.phone, struct).then((result) => {
                        res.status(200).json(struct);

                    }).catch((err) => {
                        res.status(500).json({ "message": "Internal server error" });
                        console.log(err)
                    })
                } else {
                    var index = data.cart.findIndex(o => o.itemId == id)
                    ++data.cart[index].quantity;

                    db.updateCart(req.session.phone, data.cart).then((result) => {
                        data.cart[index].name = exists.name;
                        res.status(200).json(data.cart[index]);

                    }).catch((err) => {
                        res.status(500).json({ "message": "Internal server error" });
                        console.log(err)
                    })
                }

            }

        }).catch((err) => {
            req.session.isLoggedIn = false
            console.log(err)
            res.redirect('/login')
            res.end()
        })

    })


    app.get('/cart', async (req, res) => {
        const phone = req.session.phone;
        const password = req.session.password;
        if (phone == null || phone.length < 2 || password == null || password.length < 6) {
            req.session.isLoggedIn = false
            res.redirect('/login')
            return;
        }
        db.user_exists(phone, password).then((data) => {
            req.session.isLoggedIn = true
            req.session.phone = phone
            req.session.password = password
            if (data == undefined) {
                res.status(200).render('cart', { data: "null" });
            } else {
                var cart_data = []
                data.cart.forEach(element => {

                    const rel = cart.find(o => o.itemId == element.itemId);
                    cart_data.push({
                        "name": rel.name,
                        "itemId": element.itemId,
                        "quantity": element.quantity,
                        "price": rel.price
                    })
                })

                if (!cart_data) {
                    res.status(400).json({ "error": "Bad request" });
                } else {
                    res.status(200).render('cart', { data: cart_data });
                    res.end()
                }
            }

        }).catch((err) => {
            req.session.isLoggedIn = false
            console.log(err)
            res.redirect('/login')
            res.end()
        })
    });
    app.get('/admin/login', function (req, res) {
        res.render('adminlogin');
    });
    app.get('/admin/home', function (req, res) {
        if (req.session.adminIsLoggedIn) {
            res.render('adminhome');
        } else {
            res.redirect('/admin/login')
        }

    });
    app.post('/api/auth/logout', function (req, res) {
        req.session.destroy();
        res.status(200).json({ 'status': true })
    })

    app.get('/items', async (req, res) => {
        const itemId = req.query.id;
        if (itemId == undefined) {
            res.json({ cart })
        } else {
            const data = cart.find(o => o.itemId == itemId);
            if (!data) {
                res.status(400).json({ "error": "Bad request" });
            } else {
                res.json(data)
            }
        }
    });

    app.get('/api/admin/get_users', function (req, res) {
        db.get_users().then((data) => {
            var user_map = []
            data.forEach(element => {
                user_map.push({ firstname: element.firstname, lastname: element.lastname, email: element.email, phone: element.phone });
            });
            res.status(200).json(user_map);
        }).catch((err) => {
            res.status(500).json({ "message": "Internal server error" });
            console.log(err)

        })
    })
    app.get('/login', (req, res) => {
        if (!req.session.isLoggedIn) {
            res.render('login')
        } else {
            res.redirect('/home')
        }

    });
    app.get('/aboutus', (req, res) => {
        res.render('aboutus')
    });
    app.get('/register', (req, res) => {
        res.render('register')
    })
    app.get('/contact', (req, res) => {
        res.render('contact')
    })
    app.get('/home', (req, res) => {
        if (req.session.isLoggedIn) {
            res.render('home', { data: cart })
        } else {
            res.redirect('/login');
        }

    })

    app.get('/', function (req, res) {
        if (req.session.isLoggedIn) {
            res.redirect('/home');
        } else {
            res.redirect('/landing')
        }

    });

    app.get('/api/auth/isloggedin', (req, res) => {
        const phone = req.session.phone;
        const password = req.session.password;
        if (phone == null || phone.length < 2 || password == null || password.length < 6) {
            res.status(400).send({ response: "Bad request" });
            req.session.isLoggedIn = false
            return;
        }
        db.user_exists(phone, password).then((data) => {
            req.session.isLoggedIn = true
            req.session.phone = phone
            req.session.password = password
            res.status(200).json({ email: data.email,phone : data.phone, firstname: data.firstname, lastname: data.lastname, imageid: data.imageid });
            res.end()
        }).catch((err) => {
            req.session.isLoggedIn = false
            res.status(401).json({ response: "Unauthorised" });
            res.end()
        })
    })
    app.post('/api/admin/user/cart', (req, res) => {
        const cart = req.body.phone;

        if (cart == null || cart.length < 2) {
            res.status(400).send({ response: "Bad request" });
            req.session.isLoggedIn = false
            return;
        }
        const rel = cart.find(o => o.itemId == element.itemId);
        cart_data.push({
            "name": rel.name,
            "itemId": element.itemId,
            "quantity": element.quantity,
            "price": rel.price
        })

        if (!cart_data) {
            res.status(400).json({ "error": "Bad request" });
        } else {
            res.status(200).render('cart', { data: cart_data });
            res.end()
        }
    })
    app.get('/api/user/cart', (req, res) => {
        const phone = req.session.phone;
        const password = req.session.password;
        if (phone == null || phone.length < 2 || password == null || password.length < 6) {
            res.status(400).send({ response: "Bad request" });
            req.session.isLoggedIn = false
            return;
        }
        db.user_exists(phone, password).then((data) => {
            req.session.isLoggedIn = true
            req.session.phone = phone
            req.session.password = password
            res.status(200).json(data.cart);
            res.end()
        }).catch((err) => {
            req.session.isLoggedIn = false
            res.status(401).json({ response: "Unauthorised" });
            res.end()
        })
    })



    app.post('/api/auth/login', (req, res) => {
        const phone = req.body.phone;
        const email = req.body.email;
        const password = req.body.password;
        if (phone == null || phone.length < 2 || password == null || password.length < 6) {
            res.status(400).send({ response: "Bad request" });
            return;
        }
        db.user_exists(phone, password).then((data) => {
            req.session.isLoggedIn = true
            req.session.phone = phone
            req.session.password = password
            res.status(200).json({ email: data.email, phone: data.phone, firstname: data.firstname, lastname: data.lastname, imageid: data.imageid });
            res.end()
        }).catch((err) => {
            res.status(401).json({ response: "Unauthorised" });
            res.end()
        })
    });
    app.post('/api/admin/auth/login', (req, res) => {
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password.trim();
        if (email == null || email.length < 2 || password == null || password.length < 6) {
            res.status(400).send({ response: "Bad request" });
            return;
        }
        db.admin_exists_email(email).then((data) => {

            const token = totp("IJMEYRCQJBKDCMKKG42TCUCUIJBUMURV")
            if (password != token) {
                res.status(401).json({ response: "Unauthorised" });
            } else {
                req.session.adminIsLoggedIn = true
                req.session.email = email
                req.session.cookie.maxAge = 6000
                res.status(200).json({ firstname: data.firstname, token: token });
            }

            res.end()
        }).catch((err) => {
            res.status(401).json({ response: "Unauthorised" });
            console.log(err)
        })
    });
    app.post('/api/auth/register', (req, res) => {
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password.trim();
        const [firstname, lastname] = (req.body.fullname.trim().includes(" ") ? req.body.fullname.trim().split(" ", 2) : ("", ""))
        const phone = req.body.phone.trim()
        if (email == null || email.length < 2 || password == null || password.length < 6 || firstname == null || firstname.length < 1 || lastname.length < 1 || lastname == null || phone.length < 10 || phone == null) {
            res.status(400).send({ response: "Bad request" });
            return;
        }
        db.user_exists_phone(phone).then((data) => {
            res.status(409).json({ error: 409, message: "User already exists" });
        }).catch((err) => {
            db.create_user(phone, email, password, firstname, lastname).then((data) => {
                res.status(200).json({ "message": "User registered successful" })
            }).catch((err) => {
                res.status(500).json({ "message": "Internal server error" });
            })
        })
    });






    app.use((req, res, next) => {
        res.status(404).render('404');
    });

}

module.exports = { routes };