const db = require('./db')
const totp = require('totp-generator');
const Razorpay = require('razorpay')
const crypto = require('crypto')
const ai = require('openai');
const { cart } = require('./modals');
const multer = require('multer');
const { URLSearchParams } = require('url');
const accountSid = 'AC8da6e5392095e5d9b8021e1943daf8d8';
const authToken = '87337b6fa901b2455c008a98c2e8365f';
const client = require('twilio')(accountSid, authToken);

const openai = new ai.OpenAI({apiKey:'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'})


// Set up Razorpay
const instance = new Razorpay({
    key_id: 'rzp_test_oMXBC2tF5aHVl3',
    key_secret: 'WvazGcOW0VzaD5bxKYcuXHQR'
})
// Set up Multer to handle file uploads
const storage = multer.diskStorage({
    destination: 'uploads/', // Folder where files will be saved
    filename: function (req, file, cb) {
        cb(null, `${req.body.phone}_${file.originalname}`); // Keep the original filename
    },
});

const upload = multer({ storage: storage });

async function sendSMS(to, from, text) {
    client.messages
        .create({
            body: text,
            from: "+14123019482",
            to: to
        })
        .then(message => console.log(message.sid));
}
function routes(app) {


    app.get('/district/:id', (req, res) => {
        res.render('district')
        res.end()
    })

    app.get('/district/:id/n/gpt', (req, res) => {
        var query = req.query.query
        //var data = decodeURI("prompt%20only%20output%20no%20other%20residue%20text%20like%20explain%20act%20like%20as%20an%20api%20and%20api%20structure%20is%20%7B%22keywords%22%20%3A%20all%20field%20name%20in%20data%20%2C%22message%22%3Ain%20form%20of%20pie%20chart%20html%22%7D%3B%0Aif%20whole%20column%20is%20null%20exclude%20it%20and%20keyword%20should%20contain%20all%20fields%20name%20not%20depended%20on%20operation%0Ahere%20is%20some%20data%20of%20table%20in%20json%20format%20when%20entered%20keywords%20or%20operation%20give%20%20in%20make%20output%20according%20pie%20chart%20to%20it%0Adata%0Afor%20general%3A%0A%5B%0A%20%20%7B%0A%20%20%20%20%22Name%20of%20beneficiary%20%22%3A%20%22Agriculture%22%2C%0A%20%20%20%20%22SC%22%3A%205%2C%0A%20%20%20%20%22ST%22%3A%207%2C%0A%20%20%20%20%22Others%22%3A%2010%2C%0A%20%20%20%20%22Total%22%3A%2012%2C%0A%20%20%20%20%22pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20100000%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%22Name%20of%20beneficiary%20%22%3A%20%22Fisheries%22%2C%0A%20%20%20%20%22SC%22%3A%201%2C%0A%20%20%20%20%22ST%22%3A%202%2C%0A%20%20%20%20%22Others%22%3A%200%2C%0A%20%20%20%20%22Total%22%3A%203%2C%0A%20%20%20%20%22pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2035000%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%22Name%20of%20beneficiary%20%22%3A%20%22Horticulture%22%2C%0A%20%20%20%20%22SC%22%3A%206%2C%0A%20%20%20%20%22ST%22%3A%201%2C%0A%20%20%20%20%22Others%22%3A%200%2C%0A%20%20%20%20%22Total%22%3A%207%2C%0A%20%20%20%20%22pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2070000%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%22Name%20of%20beneficiary%20%22%3A%20%22Live%20Stocks%22%2C%0A%20%20%20%20%22SC%22%3A%202%2C%0A%20%20%20%20%22ST%22%3A%203%2C%0A%20%20%20%20%22Others%22%3A%201%2C%0A%20%20%20%20%22Total%22%3A%206%2C%0A%20%20%20%20%22pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2065000%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%22Name%20of%20beneficiary%20%22%3A%20%22others%22%2C%0A%20%20%20%20%22SC%22%3A%200%2C%0A%20%20%20%20%22ST%22%3A%200%2C%0A%20%20%20%20%22Others%22%3A%201%2C%0A%20%20%20%20%22Total%22%3A%201%2C%0A%20%20%20%20%22pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2010000%0A%20%20%7D%0A%5D%0Afor%20livestocks%3A%0A%7B%0A%20%20%22activities%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Milch%20Cow%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%203%2C%0A%20%20%20%20%20%20%22ST%22%3A%200%2C%0A%20%20%20%20%20%20%22Others%22%3A%2020%2C%0A%20%20%20%20%20%20%22Total%22%3A%2023%2C%0A%20%20%20%20%20%20%22Women%22%3A%205%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2048000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Goatery%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%2021%2C%0A%20%20%20%20%20%20%22ST%22%3A%200%2C%0A%20%20%20%20%20%20%22Others%22%3A%20151%2C%0A%20%20%20%20%20%20%22Total%22%3A%20172%2C%0A%20%20%20%20%20%20%22Women%22%3A%2020%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2030000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Duckery%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%2022%2C%0A%20%20%20%20%20%20%22ST%22%3A%200%2C%0A%20%20%20%20%20%20%22Others%22%3A%20110%2C%0A%20%20%20%20%20%20%22Total%22%3A%20132%2C%0A%20%20%20%20%20%20%22Women%22%3A%2090%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2025000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Poultry%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%2014%2C%0A%20%20%20%20%20%20%22ST%22%3A%200%2C%0A%20%20%20%20%20%20%22Others%22%3A%2095%2C%0A%20%20%20%20%20%20%22Total%22%3A%20109%2C%0A%20%20%20%20%20%20%22Women%22%3A%2080%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2025000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Beekeeping%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22SRI%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%201%2C%0A%20%20%20%20%20%20%22Total%22%3A%201%2C%0A%20%20%20%20%20%20%22Women%22%3A%201%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2020000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Vermi%20compost%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Piggery%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Fishery%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Pasture%20Development%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Carpentry%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%202%2C%0A%20%20%20%20%20%20%22Total%22%3A%202%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2020000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Cycle%20Repairing%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Rice%20Processing%20Unit%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%0A%20%20%5D%0A%7D%0Aoperation%20%3A%20show%20general%20data%20in%20html%20pie%20chart")
        var data = decodeURI("prompt%20only%20output%20no%20other%20residue%20text%20like%20explain%20act%20like%20as%20an%20api%20and%20api%20structure%20is%20%7B%22keywords%22%20%3A%20all%20field%20name%20in%20data%20%2C%22message%22%3Ain%20form%20of%20pie%20chart%20html%22%7D%3B%0Aif%20whole%20column%20is%20null%20exclude%20it%20and%20keyword%20should%20contain%20all%20fields%20name%20not%20depended%20on%20operation%0Ahere%20is%20some%20data%20of%20table%20in%20json%20format%20when%20entered%20keywords%20or%20operation%20give%20%20in%20make%20output%20according%20pie%20chart%20to%20it%0Adata%0Afor%20general%3A%0A%5B%0A%20%20%7B%0A%20%20%20%20%22Name%20of%20beneficiary%20%22%3A%20%22Agriculture%22%2C%0A%20%20%20%20%22SC%22%3A%205%2C%0A%20%20%20%20%22ST%22%3A%207%2C%0A%20%20%20%20%22Others%22%3A%2010%2C%0A%20%20%20%20%22Total%22%3A%2012%2C%0A%20%20%20%20%22pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20100000%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%22Name%20of%20beneficiary%20%22%3A%20%22Fisheries%22%2C%0A%20%20%20%20%22SC%22%3A%201%2C%0A%20%20%20%20%22ST%22%3A%202%2C%0A%20%20%20%20%22Others%22%3A%200%2C%0A%20%20%20%20%22Total%22%3A%203%2C%0A%20%20%20%20%22pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2035000%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%22Name%20of%20beneficiary%20%22%3A%20%22Horticulture%22%2C%0A%20%20%20%20%22SC%22%3A%206%2C%0A%20%20%20%20%22ST%22%3A%201%2C%0A%20%20%20%20%22Others%22%3A%200%2C%0A%20%20%20%20%22Total%22%3A%207%2C%0A%20%20%20%20%22pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2070000%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%22Name%20of%20beneficiary%20%22%3A%20%22Live%20Stocks%22%2C%0A%20%20%20%20%22SC%22%3A%202%2C%0A%20%20%20%20%22ST%22%3A%203%2C%0A%20%20%20%20%22Others%22%3A%201%2C%0A%20%20%20%20%22Total%22%3A%206%2C%0A%20%20%20%20%22pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2065000%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%22Name%20of%20beneficiary%20%22%3A%20%22others%22%2C%0A%20%20%20%20%22SC%22%3A%200%2C%0A%20%20%20%20%22ST%22%3A%200%2C%0A%20%20%20%20%22Others%22%3A%201%2C%0A%20%20%20%20%22Total%22%3A%201%2C%0A%20%20%20%20%22pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2010000%0A%20%20%7D%0A%5D%0Afor%20livestocks%3A%0A%7B%0A%20%20%22activities%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Milch%20Cow%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%203%2C%0A%20%20%20%20%20%20%22ST%22%3A%200%2C%0A%20%20%20%20%20%20%22Others%22%3A%2020%2C%0A%20%20%20%20%20%20%22Total%22%3A%2023%2C%0A%20%20%20%20%20%20%22Women%22%3A%205%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2048000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Goatery%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%2021%2C%0A%20%20%20%20%20%20%22ST%22%3A%200%2C%0A%20%20%20%20%20%20%22Others%22%3A%20151%2C%0A%20%20%20%20%20%20%22Total%22%3A%20172%2C%0A%20%20%20%20%20%20%22Women%22%3A%2020%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2030000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Duckery%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%2022%2C%0A%20%20%20%20%20%20%22ST%22%3A%200%2C%0A%20%20%20%20%20%20%22Others%22%3A%20110%2C%0A%20%20%20%20%20%20%22Total%22%3A%20132%2C%0A%20%20%20%20%20%20%22Women%22%3A%2090%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2025000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Poultry%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%2014%2C%0A%20%20%20%20%20%20%22ST%22%3A%200%2C%0A%20%20%20%20%20%20%22Others%22%3A%2095%2C%0A%20%20%20%20%20%20%22Total%22%3A%20109%2C%0A%20%20%20%20%20%20%22Women%22%3A%2080%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2025000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Beekeeping%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22SRI%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%201%2C%0A%20%20%20%20%20%20%22Total%22%3A%201%2C%0A%20%20%20%20%20%20%22Women%22%3A%201%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2020000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Vermi%20compost%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Piggery%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Fishery%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Pasture%20Development%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Carpentry%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%202%2C%0A%20%20%20%20%20%20%22Total%22%3A%202%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%2020000%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Cycle%20Repairing%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%2C%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22Name%20of%20activity%22%3A%20%22Rice%20Processing%20Unit%22%2C%0A%20%20%20%20%20%20%22SC%22%3A%20null%2C%0A%20%20%20%20%20%20%22ST%22%3A%20null%2C%0A%20%20%20%20%20%20%22Others%22%3A%20null%2C%0A%20%20%20%20%20%20%22Total%22%3A%20null%2C%0A%20%20%20%20%20%20%22Women%22%3A%20null%2C%0A%20%20%20%20%20%20%22Pre%20Project%20average%20income%20per%20hectare%20in%20RS%22%3A%20null%0A%20%20%20%20%7D%0A%20%20%5D%0A%7D%0Aoperation%20%3A%20")    
        data = data + query
        console.log(query)
        const completion = openai.chat.completions.create({
            messages: [{ role: "system", content: data }],
            model: "gpt-3.5-turbo",
          }).then((result) => {
            result = result.choices[0].message.content.replace(/\\n/g, '');
            var data = JSON.parse(result)
            console.log(data.message)

            res.status(200).send(data.message)
            res.end()
          }).catch((err) => {
            res.status(500).send({data : "Internal server error"})
            res.end()
          });
    })

    app.get('/district/d/:id', (req, res) => {
        res.render('d')
        res.end()
    })
    app.get('/district/d/:id/n', (req, res) => {
        res.render('n')
        res.end()
    })


    app.get('/app/shg/:id/view_gw', (req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect('/login')
            return
        }
        const shg_id = req.params.id
        db.get_shg(shg_id).then((data) => {
            res.status(200).render('view_gw', { data: JSON.stringify(data.gw), id: shg_id })
        }).catch((err) => {
            res.status(404).json({ "error": "Not found" });
            console.log(err)
        })
    })
    
    app.get('/app/shg/:id/products', (req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect('/login')
            return
        }
        const id = req.params.id
        db.get_shg(id).then((data) => {
            res.status(200).render('products', { data: JSON.stringify(data.products), id: id })
        }).catch((err) => {
            res.status(404).json({ "error": "Not found" });
            console.log(err)
        })
    })
    app.get('/app/shg/:id/inventory', (req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect('/login')
            return
        }
        const id = req.params.id
        db.get_shg(id).then((data) => {
            res.status(200).render('inventory', { data: JSON.stringify(data.inventory), id: id })
        }).catch((err) => {
            res.status(404).json({ "error": "Not found" });
            console.log(err)
        })
    })


    app.get('/app/shg/:id/products/add', (req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect('/login')
            return
        }
        const id = req.params.id
        const name = req.query.name
        const area = req.query.area
        const plot = req.query.tehsil
        const description = req.query.description
        if (name == null || name.length < 2 || area == null || area.length < 2 || plot == null || plot.length < 2 || description == null || description.length < 2) {
            res.status(400).json({ "error": "bad request" });
            return;
        }
        db.get_shg(id).then((data) => {
            db.create_shg_products(id,name,area,plot,tehsil,description).then((data) => {
                res.redirect(`/app/shg/${id}/products`)

            }).catch((err) => {
                res.status(404).json({ "error": "Not found" });
                console.log(err)
            })
        })
    })
    app.get('/app/shg/:id/products/edit', (req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect('/login')
            return
        }
        const id = req.params.id
        const name = req.query.name
        const quantity = req.query.quantity
        const description = req.query.description
        if (name == null || name.length < 2 || quantity == null || quantity.length < 1 || isNaN(quantity) || description == null || description.length < 2) {
            res.status(400).json({ "error": "bad request" });
            return;
        }
        db.get_shg(id).then((data) => {
            var exists = data.products.find(o => o.name == name);
            if (!exists) { res.status(400).json({ "error": "bad request" }); return; }
            db.get_shg(id).then((data) => {
                var exists = data.products.find(o => o.name == name);
                if (!exists) { res.status(400).json({ "error": "bad request" }); return; }
                db.update_shg_products(id, name, quantity, description).then((data) => {
                    db.update_shg_products_history(id, name, quantity, description, "updated").then((data) => {
                        res.redirect(`/app/shg/${id}/products`)
                    }).catch((err) => {
                        res.status(404).json({ "error": "Not found" });
                        console.log(err)
                    })
                }).catch((err) => {
                    res.status(404).json({ "error": "Not found" });
                    console.log(err)
                })
            }).catch((err) => {
                res.status(404).json({ "error": "Not found" });
                console.log(err)
            })
        })
    })
    app.get('/app/shg/:id/products/:name/delete', (req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect('/login')
            return
        }
        const id = req.params.id
        const name = req.params.name
        db.get_shg(id).then((data) => {
            var exists = data.products.find(o => o.name == name);
            if (!exists) { res.status(400).json({ "error": "bad request" }); return; }
            db.delete_shg_products(id, name).then((data) => {
                db.update_shg_products_history(id, name, exists.quantity, exists.description, "deleted").then((data) => {
                    res.redirect(`/app/shg/${id}/products`)
                }).catch((err) => {
                    res.status(404).json({ "error": "Not found" });
                    console.log(err)
                })
            }).catch((err) => {
                res.status(404).json({ "error": "Not found" });
                console.log(err)
            })

        })
    })
    app.get('/app/shg/:id/products/history', (req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect('/login')
            return
        }
        const id = req.params.id
        db.get_shg(id).then((data) => {
            res.status(200).render('products_history', { data: JSON.stringify(data.products_history), id: id })
        }).catch((err) => {
            res.status(404).json({ "error": "Not found" });
            console.log(err)
        })
    })

    app.get('/app/shg/:id/revenue', (req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect('/login')
            return
        }
        const id = req.params.id
        db.get_shg(id).then((data) => {
            res.status(200).render('revenue', { data: JSON.stringify(data.revenue), id: id })
        }).catch((err) => {
            res.status(404).json({ "error": "Not found" });
            console.log(err)
        })
    })

    app.get('/app/shg/:id/revenue/history', (req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect('/login')
            return
        }
        const id = req.params.id
        db.get_shg(id).then((data) => {
            res.status(200).render('revenue_history', { data: JSON.stringify(data.revenue_history), id: id })
        }).catch((err) => {
            res.status(404).json({ "error": "Not found" });
            console.log(err)
        })
    })

    app.get('/app/shg/:id/revenue/add', (req, res) => {
        if (!req.session.isLoggedIn) {
            res.redirect('/login')
            return
        }

        const id = req.params.id
        const amount = req.query.amount
        const description = req.query.description
        const date = req.query.date
        const status = req.query.status
        console.log(id, amount, description, status)
        if (amount == null || amount.length < 1 || isNaN(amount) || description == null || description.length < 2) {
            res.status(400).json({ "error": "bad request" });
            return;
        }
        db.get_shg(id).then((data) => {
            db.create_shg_revenue(id, description, amount, status, date).then((data) => {
                db.update_shg_revenue_history(id, amount, description, status, date).then((data) => {
                    res.redirect(`/app/shg/${id}/revenue`)
                }).catch((err) => {
                    res.status(404).json({ "error": "Not found" });
                    console.log(err)
                })
            }).catch((err) => {
                res.status(404).json({ "error": "Not found" });
                console.log(err)
            })
        })


    })
    app.post('/api/razorpay/verifyPayment', (req, res) => {
        const payment_id = req.body.payment_id;
        const order_id = req.body.order_id;
        const signature = req.body.signature;
        const key_secret = "WvazGcOW0VzaD5bxKYcuXHQR"

        const generated_signature = crypto.createHmac('sha256', key_secret).update(order_id + "|" + payment_id).digest('hex')
        res.status(200).json({ "message": "Payment successful" });

    })
    app.get('/payment/success', (req, res) => {
        var order_id = req.query.orderID;
        var transaction_id = req.query.transactionID;
        var amount = req.query.amount;
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
            var cart_data = []
            var billing_details = {
                "name": data.firstname + " " + data.lastname,
                "address": data.address,
                "state": data.state,
                "city": data.city,
                "pincode": data.pincode,
                "phone": data.phone,
                "orderId": order_id,
                "transactionId": transaction_id,
            }
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
                //res.status(200).render('success', { data: cart_data, billing_details: billing_details,order_id:order_id,transaction_id:transaction_id,amount:amount });
                db.insertOrders(cart_data, billing_details, req.session.phone).then((result) => {
                    const from = 'Vonage APIs'
                    const to = "+91" + billing_details.phone
                    const message = `Green Humanity, Your order has been placed successfully, your order id is ${order_id}, transaction id is ${transaction_id} and amount is ${amount}. Thank you for shopping with us.`
                    sendSMS(to, from, message)
                    res.status(200).render('success', { data: cart_data, billing_details: billing_details, order_id: order_id, transaction_id: transaction_id, amount: amount });
                    res.end()

                }).catch((err) => {
                    res.status(500).json({ "message": "Internal server error" });
                    console.log(err)
                })
            }
        }).catch((err) => {
            req.session.isLoggedIn = false
            console.log(err)
            res.redirect('/login')
            res.end()
        })
    })



    app.post('/api/razorpay/createOrder', (req, res) => {
        const phone = req.session.phone;
        const password = req.session.password;
        const amount = req.body.amount;
        const currency = "INR"
        const notes = {
            description: req.body.description,
            phone: phone
        }
        if (phone == null || phone.length < 2 || password == null || password.length < 6 || amount == null || amount.length < 1 || isNaN(amount)) {
            res.status(400).send({ response: "Bad request" });
            return;
        }

        db.user_exists(phone, password).then((data) => {
            req.session.isLoggedIn = true
            req.session.phone = phone
            req.session.password = password
            const options = {
                amount: amount * 100,
                currency,
                receipt: "receipt#1",
                notes
            }
            instance.orders.create(options, (err, order) => {
                if (err) {
                    res.status(500).send({ response: "Internal server error" });
                    console.log(err)
                } else {
                    order.key_id = 'rzp_test_oMXBC2tF5aHVl3'
                    res.status(200).send(order)
                }
            })
        }).catch((err) => {
            res.status(401).json({ response: "Unauthorised" });
            res.end()
        });
    })

    app.post('/dcricle', (req, res) => {
        var id = req.body.id;
        if (id == null || id.length < 1) {
            res.status(400).json({ "error": "Bad request" });
            return;
        }
        fetch('https://wdcpmksy.dolr.gov.in/getcircledisrictdata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'id':id, 'activity': 'farmerbenef' })
        })
            .then(res => res.json())
            .then(json => {
                data = json;
                res.status(200).json(data);
                res.end()
            })
            .catch(err => console.log(err));
    })

    app.get('/landing', function (req, res) {
        var data = undefined;


        fetch('https://wdcpmksy.dolr.gov.in/getwhshomedata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'id': 'farmerbenef' })
        })
            .then(res => res.json())
            .then(json => {
                data = json;
                res.render('landing', { data: data });
                res.end()
            })
            .catch(err => console.log(err));


    });
    app.get('/rental_land', function (req, res) {
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

            var userData = {
                email: data.email,
                phone: data.phone,
                name: `${data.firstname} ${data.lastname}`,
                address: `${data.address},\n${data.city},\n${data.state},\n${data.pincode}`,
            }
            res.render('rental_land', { userData: userData });
            res.end()
        }).catch((err) => {
            req.session.isLoggedIn = false
            console.log(err)
            res.redirect('/login')
            res.end()
        })

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

    app.post('/api/cart/changeQuantity', function (req, res) {
        const phone = req.session.phone;
        const password = req.session.password;
        const id = req.body.itemId;
        const quantity = req.body.quantity;
        if (isNaN(quantity)) {
            res.status(400).json({ "error": "bad request" });
            return;
        }

        if (phone == null || phone.length < 2 || password == null || password.length < 6 || id.length < 2 || quantity.length < 1) {
            req.session.isLoggedIn = false
            res.status(401).json({ response: "Unauthorised" });
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

                if (find_cart == undefined) {
                    res.status(400).json({ "error": "Item doesn't exist in cart" });
                } else {
                    var index = data.cart.findIndex(o => o.itemId == id)

                    db.updateItem(req.session.phone, id, quantity).then((result) => {
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

    app.post('/api/cart/deleteItem', function (req, res) {
        const phone = req.session.phone;
        const password = req.session.password;
        if (phone == null || phone.length < 2 || password == null || password.length < 6) {
            req.session.isLoggedIn = false
            res.status(401).json({ response: "Unauthorised" });
            return;
        }
        const id = req.body.itemId;
        if (id == null || id.length < 2) {
            res.status(400).json({ "error": "bad request" });
            return;
        }
        db.user_exists(phone, password).then((data) => {
            req.session.phone = phone
            req.session.password = password
            if (data == undefined) {
                res.status(400).json({ "error": "bad request" });
            } else {
                db.removefromcart(req.session.phone, id, []).then((result) => {
                    res.status(200).json({ "message": "Cart deleted" });

                }).catch((err) => {
                    res.status(500).json({ "message": "Internal server error" });
                    console.log(err)
                })

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
                var billing_details = {
                    "name": data.firstname + " " + data.lastname,
                    "address": data.address,
                    "state": data.state,
                    "city": data.city,
                    "pincode": data.pincode,
                    "phone": data.phone
                }
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
                    res.status(200).render('cart', { data: cart_data, billing_details: billing_details });
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

    app.get('/admin/register_shg', function (req, res) {
        if (req.session.adminIsLoggedIn) {
            db.get_areas().then((data) => {
                var area_map = []
                data.forEach(element => {
                    area_map.push({ name: element.name });
                });
                res.status(200).render('registerSHG', { data: area_map });
            }).catch((err) => {
                res.status(500).json({ "message": "Internal server error" });
                console.log(err)
            })
        } else {
            res.redirect('/admin/login')
        }
    })
    app.get('/app/shg_home', async (req, res) => {
        if (req.session.isLoggedIn) {
            var phone = req.session.phone
            var password = req.session.password
            if (phone == null || phone.length < 2 || password == null || password.length < 6) {
                res.redirect('/login')
                return
            }
            db.user_exists(phone, password).then((data) => {
                req.session.isLoggedIn = true
                req.session.phone = phone
                req.session.password = password
                res.status(200).render('shg_home', { "firstname": data.firstname, "lastname": data.lastname, "address": data.address, "state": data.state, "city": data.city, "pincode": data.pincode, "phone": data.phone })

            }).catch((err) => {
                req.session.isLoggedIn = false
                res.redirect('/login')
                res.end()
            })
        } else {
            res.redirect('/login')
        }

    })
    app.get('/app/frm_home', async (req, res) => {
        res.render('frm_home')
        res.end()
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
    app.post('/api/auth/register/sgh', async (req, res) => {
        if (!req.session.adminIsLoggedIn) {
            res.redirect('/admin/login')

            return
        }
        const name = req.body.fullname;
        const phone = req.body.phone;
        const address = req.body.address;
        const area = req.body.area;
        const password = req.body.password;
        const [firstname, lastname] = (req.body.fullname.trim().includes(" ") ? req.body.fullname.trim().split(" ", 2) : ("", ""))
        if (name == null || name.length < 2 || phone == null || phone.length < 10 || address == null || address.length < 2 || area == null || area.length < 2 || password == null || password.length < 6) {
            res.status(400).send({ response: "Bad request" });
            return;
        }
        db.shg_exists(phone).then((data) => {
            res.status(409).json({ error: 409, message: "SHG already exists" });
        }).catch((err) => {
            db.create_shg(phone, firstname, lastname, area, password, address, req.body.state, req.body.city, req.body.pincode).then((data) => {
                res.status(200).json({ "message": "SHG registered successful" })
            }).catch((err) => {
                res.status(500).json({ "message": "Internal server error" });
            })
        })
    })
    app.get('/api/resource/areas', async (req, res) => {
        db.get_areas().then((data) => {
            var area_map = []
            data.forEach(element => {
                area_map.push({ name: element.name, pincode: element.pincode, city: element.city, state: element.state });
            });
            res.status(200).json(area_map);
        }).catch((err) => {
            res.status(500).json({ "message": "Internal server error" });
            console.log(err)

        })
    })
    app.get('/api/admin/get_users', function (req, res) {
        db.get_users().then((data) => {
            var user_map = []
            data.forEach(element => {
                user_map.push({ firstname: element.firstname, role: element.role, verified: element.verified, address: element.address, lastname: element.lastname, email: (element.email == "null") ? "N/A" : element.email, phone: element.phone });
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
            res.redirect('/')
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
            if (req.session.role == "Consumer") {
                res.redirect('/home');
            } else if (req.session.role == "SHG") {
                res.redirect('/app/shg_home')
            } else if (req.session.role == "Farmer") {
                res.redirect('/app/frm_home')
            }
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
            res.status(200).json({ email: data.email, phone: data.phone, firstname: data.firstname, lastname: data.lastname, imageid: data.imageid });
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
            if (data.verified == false) {
                res.status(401).json({ response: "Unauthorised" });
                res.end()
            } else {
                req.session.role = data.role
                res.status(200).json({ email: data.email, phone: data.phone, firstname: data.firstname, lastname: data.lastname, imageid: data.imageid, role: data.role });
                res.end()
            }
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
                //req.session.cookie.maxAge = 60000
                res.status(200).json({ firstname: data.firstname, token: token });
            }

            res.end()
        }).catch((err) => {
            res.status(401).json({ response: "Unauthorised" });
            console.log(err)
        })
    });
    app.post('/api/auth/register', upload.single('certificate'), (req, res) => {
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password.trim();
        const role = req.body.type
        var verified = false
        if (role == "Consumer") {
            verified = true
        }
        const [firstname, lastname] = (req.body.fullname.trim().includes(" ") ? req.body.fullname.trim().split(" ", 2) : ("", ""))
        const phone = req.body.phone.trim()
        if (email == null || email.length < 2 || password == null || password.length < 6 || firstname == null || firstname.length < 1 || lastname.length < 1 || lastname == null || phone.length < 10 || phone == null) {
            res.status(400).send({ response: "Bad request" });
            return;
        }
        db.user_exists_phone(phone).then((data) => {
            res.status(409).json({ error: 409, message: "User already exists" });
        }).catch((err) => {
            db.create_user(phone, email, password, firstname, lastname, req.body.address, req.body.state, req.body.city, req.body.pincode, req.body.education, req.body.graduation, req.body.type, verified).then((data) => {
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