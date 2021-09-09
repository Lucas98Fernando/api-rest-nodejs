const path = require('path')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const {
    host,
    port,
    user,
    pass
} = require('../config/mail')

const transport = nodemailer.createTransport({
    host,
    port,
    auth: {
        user,
        pass
    }
})

// Template de e-mail com handlebars
transport.use('compile', hbs({
    viewEngine: {
        defaultLayout: undefined,
        partialsDir: path.resolve('./src/resources/mail/')
    },
    // Caminho de onde irá ficar os templates
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html'
}))

module.exports = transport