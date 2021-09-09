const express = require('express')
const User = require('../models/User')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')

// Utilizado como um identificador da nossa aplicação, algo único
const authConfig = require('../../config/auth')

// Passando a informação que nunca vai se repetir para gerar o token e determinando o tempo de expiração
function generateToken(params = {}) {
    return jwt.sign({
        params
    }, authConfig.secret, {
        expiresIn: 86400
    })
}

// Rota de cadastro
router.post('/register', async (req, res) => {
    const {
        email
    } = req.body

    try {
        // Verifica se já existe o e-mail passado na requisição já foi cadastrado
        if (await User.findOne({
                email
            }))

            return res.status(400).send({
                error: 'User already exists'
            })

        const user = await User.create(req.body)

        // Ocultando o hash da senha, para ela não ser exibida na resposta
        user.password = undefined

        // Retornando dados do usuário e exibindo token de autenticação para ele poder realizar login
        return res.send({
            user,
            token: generateToken({
                id: user.id
            })
        })

    } catch (erro) {
        return res.status(400).send({
            error: 'Registration failed'
        })
    }
})

router.post('/authenticate', async (req, res) => {
    const {
        email,
        password
    } = req.body

    // Procurando um usuário com o e-mail e senha que foram passados na requisição
    const user = await User.findOne({
        email
    }).lean().select('+password')

    // Se não existir um usuário com os dados passados, será retornado uma mensagem de erro
    if (!user) {
        return res.status(400).send({
            error: 'User not found!'
        })
    }

    // Comparando se as senha não coincidem
    if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({
            error: 'Invalid password!'
        })
    }

    // Removendo o campo de senha na visualização dos dados retornados ao usuário
    user.password = undefined

    // Se tudo ocorreu bem, será exibido os dados do usuário autenticado com o token
    res.send({
        user,
        token: generateToken({
            id: user.id
        })
    })
})

router.post('/forgot_password', async (req, res) => {
    // Recebendo o e-mail que o usuário deseja utilizar para recuperar senha
    const {
        email
    } = req.body

    try {
        // Procurando um usuário com o e-mail passado na requisição
        const user = await User.findOne({
            email: email
        })

        if (!user) {
            return res.status(400).send({
                error: 'User not found!'
            })
        }

        // Gerando um token aleatório para realizar a alteração da senha
        const token = crypto.randomBytes(20).toString('hex')

        // Pegando a data atual
        const now = new Date()
        // O token terá 1 hora para expirar
        now.setHours(now.getHours() + 1)

        // Alterando a senha do usuário
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        })

        // Configurando as informações para envio de e-mail
        mailer.sendMail({
            to: email,
            from: 'lucas98fernando@gmail.com',
            template: 'auth/forgot_password',
            context: {
                token
            }
        }, (erro) => {
            if (erro) {
                return res.status(400).send({
                    error: 'Cannot send forgot password e-mail'
                })
            }

            // Se tudo der certo, será enviado o status de positivo
            return res.send()
        })
    } catch (error) {
        res.status(400).send({
            error: 'Error recovering password, try again'
        })
    }
})

router.post('/reset_password', async (req, res) => {
    // Recuperando os dados da requisição
    const {
        email,
        token,
        password
    } = req.body

    try {
        // Procurando o usuaário no banco com os dados passados na requisição
        const user = await User.findOne({
            email
        }).select('+passwordResetToken passwordResetExpires')

        // Caso não exista o usuário
        if (!user) {
            return res.status(400).send({
                error: 'User not found!'
            })
        }

        // Verificando se o token da requisição e o token do banco não coincidem
        if (token !== user.passwordResetToken) {
            return res.status(400).send({
                error: 'Invalid token!'
            })
        }

        const now = new Date()

        // Se o token é válido, porém expirou o tempo de utilização
        if (now > user.passwordResetExpires) {
            return res.status(400).send({
                error: 'Expired token, generate a new one!'
            })
        }

        // Se estiver tudo ok, a senha passada na requisição será atribuída ao campo senha
        user.password = password

        // Gravando os novos dados
        await user.save()

        res.send()

    } catch (erro) {
        res.status(400).send({
            error: 'Cannot reset password, try again.'
        })
    }
})

// Toda vez que o usuário acessar a rota /auth será chamado esse router
module.exports = app => app.use('/auth', router)