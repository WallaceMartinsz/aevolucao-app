const express = require('express');
const Trilha = require('../model/trilha');
const Usuario = require('../model/usuario');
const router = express.Router();


// Rota para listar todas as subtrilhas da trilha de reabilitação de um usuário
router.get('/usuario/:userId/subtrilhas', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.userId);
        if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
        
        res.json(usuario.trilhaReabilitacao.subTrilhas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar subtrilhas' });
    }
});

// Rota para visualizar uma subtrilha específica
router.get('/usuario/:userId/subtrilhas/:subTrilhaId', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.userId);
        if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
        
        const subTrilha = usuario.trilhaReabilitacao.subTrilhas.id(req.params.subTrilhaId);
        if (!subTrilha) return res.status(404).json({ error: 'Subtrilha não encontrada' });
        
        res.json(subTrilha);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar subtrilha' });
    }
});

// Rota para atualizar o status de uma atividade dentro de uma subtrilha
router.put('/usuario/:userId/subtrilhas/:subTrilhaId/atividades/:atividadeId', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.userId);
        if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
        
        const subTrilha = usuario.trilhaReabilitacao.subTrilhas.id(req.params.subTrilhaId);
        if (!subTrilha) return res.status(404).json({ error: 'Subtrilha não encontrada' });
        
        const atividade = subTrilha.atividades.id(req.params.atividadeId);
        if (!atividade) return res.status(404).json({ error: 'Atividade não encontrada' });

        atividade.completada = true;
        atividade.dataConclusao = new Date();

        await usuario.save();
        res.json({ message: 'Atividade marcada como completa', atividade });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar atividade' });
    }
});

// Rota para finalizar a subtrilha e deixar feedback
router.put('/usuario/:userId/subtrilhas/:subTrilhaId/finalizar', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.userId);
        if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
        
        const subTrilha = usuario.trilhaReabilitacao.subTrilhas.id(req.params.subTrilhaId);
        if (!subTrilha) return res.status(404).json({ error: 'Subtrilha não encontrada' });

        const todasAtividadesConcluidas = subTrilha.atividades.every(atividade => atividade.completada);
        if (!todasAtividadesConcluidas) {
            return res.status(400).json({ error: 'Ainda há atividades não concluídas nesta subtrilha' });
        }

        subTrilha.feedback = req.body.feedback;
        subTrilha.insigne = `Insígnia da ${subTrilha.titulo} adquirida!`
        subTrilha.completada = true;
        
        await usuario.save();
        res.json({ message: 'Subtrilha concluída com sucesso e feedback salvo', subTrilha });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao finalizar subtrilha' });
    }
});

// Rota para avaliar o progresso geral do usuário na trilha de reabilitação
router.get('/usuario/:userId/progresso', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.userId);
        if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
        
        const totalSubtrilhas = usuario.trilhaReabilitacao.subTrilhas.length;
        const subtrilhasConcluidas = usuario.trilhaReabilitacao.subTrilhas.filter(subTrilha => subTrilha.insigne).length;
        
        res.json({
            progresso: {
                total: totalSubtrilhas,
                concluidas: subtrilhasConcluidas,
                faltando: totalSubtrilhas - subtrilhasConcluidas,
                porcentagem: totalSubtrilhas > 0 ? (subtrilhasConcluidas / totalSubtrilhas) * 100 : 0,
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter progresso' });
    }
});

module.exports = router;
