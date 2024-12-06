const mongoose = require('mongoose');

// Define o esquema da etapa
const etapaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    completada: { type: Boolean, default: false },
}, { _id: false });

// Define o esquema da trilha
const trilhaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: { type: String, required: true },
    etapas: [etapaSchema],
}, { timestamps: true });

// Método para calcular o progresso da trilha
trilhaSchema.methods.progresso = function() {
    const totalEtapas = this.etapas.length;
    const etapasCompletadas = this.etapas.filter(etapa => etapa.completada).length;
    return {
        total: totalEtapas,
        completadas: etapasCompletadas,
        faltando: totalEtapas - etapasCompletadas,
        porcentagem: totalEtapas > 0 ? (etapasCompletadas / totalEtapas) * 100 : 0,
    };
};


const Trilha = mongoose.model('Trilha', trilhaSchema);
module.exports = Trilha;
