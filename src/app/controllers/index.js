const fs = require('fs')
const path = require('path')

module.exports = app => {
    // Filtrando arquivos para que não pegue arqueles que começam com . nem index dentro da pasta de controllers
    fs
        .readdirSync(__dirname)
        .filter(file => ((file.indexOf('.')) !== 0 && (file !== 'index.js')))
        .forEach(file => require(path.resolve(__dirname, file))(app))
}