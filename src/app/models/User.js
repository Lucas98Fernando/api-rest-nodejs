const mongoose = require('../../database/db')
const bcrypt = require('bcryptjs')

// Campos que teremos no nosso banco de dados
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Antes de realizar o salvamento dos dados do usuário no banco de dados, a senha será formada em hash
UserSchema.pre('save', async function (next) {
    // Referenciando o campo senha do Schema Usuários e gerando uma hash
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User