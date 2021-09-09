const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth')

const Project = require('../models/Project')
const Task = require('../models/Task')

router.use(authMiddleware)

// Listando todos os projetos cadastrados
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find()
            .populate(['user', 'tasks'])
        return res.send({
            projects
        })
    } catch (erro) {
        return res.status(400).send({
            error: 'Error loading projects'
        })
    }
})

// Rota de listagem de um projeto específico
router.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(
            req.params.projectId
        ).lean().populate(['user', 'tasks'])
        return res.send({
            project
        })
    } catch (erro) {
        return res.status(400).send({
            error: 'Error loading project'
        })
    }
})

// Rota de criação de projetos
router.post('/', async (req, res) => {
    try {
        const {
            title,
            description,
            tasks
        } = req.body

        const project = await Project.create({
            title,
            description,
            user: req.userId
        })

        // Vincular as tarefas aos projetos
        // Aguardando todas as promises serem resolvidas, para a partir daí salvar o projeto com as tarefas vinculadas
        await Promise.all(tasks.map(task => {
            const projectTask = new Task({
                ...task,
                project: project._id
            })

            projectTask.save()
            project.tasks.push(projectTask)
        }))

        // Salvando o dodumento
        await project.save()

        return res.send({
            project
        })
    } catch (erro) {
        console.log(erro)
        return res.status(400).send({
            error: 'Erro creating a new project'
        })
    }
})

// Rota de atualização de dados de projetos
router.put('/:projectId', async (req, res) => {
    try {
        const {
            title,
            description,
            tasks
        } = req.body

        const project = await Project.findByIdAndUpdate(req.params.projectId, {
                title,
                description
            },
            // Para retornar o projeto atualizado 
            {
                new: true
            }
        )

        // Removendo as tasks para depois adicionar as novas ou só as que restaram
        project.tasks = []
        // Referenciando o model e removendo as tasks
        await Task.deleteOne({
            project: project._id
        })

        // Vincular as tarefas aos projetos
        // Aguardando todas as promises serem resolvidas, para a partir daí salvar o projeto com as tarefas vinculadas
        await Promise.all(tasks.map(task => {
            const projectTask = new Task({
                ...task,
                project: project._id
            })

            projectTask.save()
            project.tasks.push(projectTask)
        }))

        // Salvando o documento
        await project.save()

        return res.send({
            project
        })
    } catch (erro) {
        console.log(erro)
        return res.status(400).send({
            error: 'Erro updating project'
        })
    }
})

// Rota de exclusão de projetos
router.delete('/:projectId', async (req, res) => {
    try {
        const project = await Project.findByIdAndRemove(
            req.params.projectId
        ).lean()
        return res.send({
            message: 'Project removed!'
        })
    } catch (erro) {
        return res.status(400).send({
            error: 'Error deleting project'
        })
    }
})

module.exports = app => app.use('/projects', router)