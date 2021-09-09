const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth')

module.exports = (req, res, next) => {
    // Buscando o token de acesso no header da requisição
    const authHeader = req.headers.authorization

    // Se não houver o token de acesso no header da requisição, o usuário receberá um status de erro de autorização
    if (!authHeader) {
        return res.status(401).send({
            error: 'Access not allowed, access token not provided.'
        })
    }

    // Verificando o formato do token, geralmente começa com um Bearer e depois um hash
    // Dividindo a token em duas partes
    const parts = authHeader.split(' ')

    // Verificando se o token realmente possui duas partes, se não... status de erro de autorização
    if (!(parts.length === 2)) {
        return res.status(401).send({
            error: 'Token error!'
        })
    }

    // Desestruturando o token
    const [scheme, token] = parts

    // Verificando se o scheme não começa com Bearer usando regex
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).send({
            error: 'Token format is invalid!'
        })
    }

    // Verificando o token do usuário passado na requisição e o secret do authConfig 
    jwt.verify(token, authConfig.secret, (error, decoded) => {
        if (error) {
            res.status(401).send({
                error: 'Invalid token!'
            })
        }
        // Caso o id do usuário esteja certo, ele será incluído nas próximas requisições do controller 
        // O decoded.id será passado no params da função de gerar token, com isso, será possível passar esse id para qualquer controller que estiver autenticado
        req.userId = decoded.id
        return next()
    })
}