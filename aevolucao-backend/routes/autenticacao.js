const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/usuario');
const router = express.Router();

// Middleware para verificar o token JWT
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido.' });
        }
        req.userId = decoded.id;
        next();
    });
};

// Rota para registrar um usuário
router.post('/register', async (req, res) => {
    const { nome, cpf, senha } = req.body;

    if (!nome || !cpf || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
        const existingUser = await User.findOne({ cpf });
        if (existingUser) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        
        const user = new User({
            nome,
            cpf,
            senha: hashedPassword,
        });

        await user.save();
        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar usuário' });
    }
});

// Rota para fazer login
router.post('/login', async (req, res) => {
    const { cpf, senha } = req.body;

    if (!cpf || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
        const user = await User.findOne({ cpf });
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Verifica a senha
        const isMatch = await bcrypt.compare(senha, user.senha);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Gera um token JWT
        const token = jwt.sign({ id: user._id, cpf: user.cpf }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
});

// Rota para alterar informações do usuário
router.put('/update', authMiddleware, async (req, res) => {
    const { nome, cpf } = req.body;

    if (!nome && !cpf) {
        return res.status(400).json({ message: 'Pelo menos um campo deve ser fornecido para atualização.' });
    }

    try {
        const updateData = {};
        if (nome) updateData.nome = nome;
        if (cpf) updateData.cpf = cpf;

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
});

// Rota para obter informações do usuário
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.status(200).json({
            nome: user.nome,
            cpf: user.cpf,
            trilhaReabilitacao: user.trilhaReabilitacao,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao obter informações do usuário' });
    }
});

module.exports = router;
