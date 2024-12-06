const mongoose = require('mongoose');

const atividadeSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    videoUrl: { type: String }, 
    completada: { type: Boolean, default: false }, 
    dataConclusao: { type: Date } 
});

// Esquema para as subtrilhas
const subTrilhaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    atividades: [atividadeSchema],
    insigne: { type: String },
    feedback: String, 
    completada: { type: Boolean, default: false },
    dataConclusao: { type: Date } 
});

// Esquema do usuário
const usuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    trilhaReabilitacao: {
        titulo: { type: String, default: 'Trilha de Reabilitação' },
        status: { type: String, enum: ['em processo', 'completo', 'não iniciado'], default: 'não iniciado' },
        dataInicio: Date,
        dataFim: Date,
        subTrilhas: [subTrilhaSchema],
        progresso: [{
            avaliacao: { type: Number, min: 0, max: 10 },
            atividades: [{
                nome: { type: String, required: true },
                descricao: { type: String, required: true },
                completada: { type: Boolean, default: false },
                dataConclusao: { type: Date }
            }]
        }]
    },
}, { timestamps: true });

// Hook para inicializar a trilha de reabilitação ao criar um novo usuário
usuarioSchema.pre('save', function (next) {
    if (this.isNew) {
        this.trilhaReabilitacao = {
            titulo: 'Trilha de Reabilitação',
            status: 'não iniciado',
            subTrilhas: [
                {
                    titulo: 'Subtrilha 1 - Introdução',
                    atividades: [
                        { nome: 'Atividade 1', descricao: 'Introdução à reabilitação' },
                        { nome: 'Atividade 2', descricao: 'Reflexão sobre comportamento' }
                    ]
                },
                {
                    titulo: 'Subtrilha 2 - Responsabilidade',
                    atividades: [
                        { nome: 'Atividade 3', descricao: 'Assumindo responsabilidades' },
                        { nome: 'Atividade 4', descricao: 'Consequências das ações' }
                    ]
                },
                {
                    titulo: 'Subtrilha 3 - Empatia',
                    atividades: [
                        { nome: 'Atividade 5', descricao: 'Desenvolvendo empatia' },
                        { nome: 'Atividade 6', descricao: 'Impacto das ações nos outros' }
                    ]
                },
                {
                    titulo: 'Subtrilha 4 - Controle Emocional',
                    atividades: [
                        { nome: 'Atividade 7', descricao: 'Reconhecendo emoções' },
                        { nome: 'Atividade 8', descricao: 'Estratégias de controle emocional' }
                    ]
                },
                {
                    titulo: 'Subtrilha 5 - Resolução de Conflitos',
                    atividades: [
                        { nome: 'Atividade 9', descricao: 'Comunicação eficaz' },
                        { nome: 'Atividade 10', descricao: 'Técnicas de resolução de conflitos' }
                    ]
                }
            ],
            progresso: [] 
        };
    }
    next();
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
module.exports = Usuario;
