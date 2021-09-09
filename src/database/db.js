const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

mongoose.Promise = global.Promise
mongoose.connect((process.env.MONGO_URL), {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conexão estabelecida com o Mongo')
}).catch((error) => {
    console.log(`Não foi possível se conectar ao Mongo: ${error}`)
})

module.exports = mongoose