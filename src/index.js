// Importando módulos
const express = require('express')
const app = express()
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocs = require('./docs/swagger.json')

// Permitindo que a API entenda informações em JSON
app.use(express.json())
// Permitindo a API entender parâmetros passados pela rota
app.use(express.urlencoded({
    extended: false
}))

app.use(cors())

// Rota da documentação com o Swagger
app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.get('/', (req, res) => {
    res.redirect('/v1/api-docs')
})

// Passando o contexto do app global para os outros controllers
require('./app/controllers/index')(app)

app.listen(3000, () => {
    console.log('API rodando em => http://localhost:3000')
})