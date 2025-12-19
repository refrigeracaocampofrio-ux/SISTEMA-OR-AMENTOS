const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Dados da empresa
const EMPRESA = {
  nome: 'REFRIGERAÇÃO CAMPO FRIO',
  endereco: 'AVENIDA ANTONIO DI GIOIA 50 JARDIM CALIFORNIA CAMPO LIMPO PAULISTA',
  cnpj: '44.334.358/0001-26',
  telefone: '(11) 98016-3597',
  email: 'refrigeracaocampofrio@gmail.com'
};

// Cores
const COLORS = {
  primary: '#27ae60',
  secondary: '#2c3e50',
  text: '#333333',
  lightGray: '#ecf0f1',
  darkGray: '#7f8c8d'
};

function adicionarCabecalho(doc, titulo) {
  // Retângulo superior verde
  doc.rect(0, 0, doc.page.width, 140).fill(COLORS.primary);
  
  // Tentar adicionar logo
  const logoPath = path.join(__dirname, '../../imagens/logo.png');
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, 50, 20, { width: 100, height: 100 });
    } catch (e) {
      console.warn('Logo não pôde ser carregada:', e.message);
    }
  }
  
  // Nome da empresa (ao lado da logo ou centralizado)
  const startX = fs.existsSync(logoPath) ? 170 : 50;
  doc.fontSize(24)
     .fillColor('#ffffff')
     .font('Helvetica-Bold')
     .text(EMPRESA.nome, startX, 30, { width: doc.page.width - startX - 50 });
  
  // Subtítulo
  doc.fontSize(16)
     .fillColor('#ffffff')
     .font('Helvetica')
     .text(titulo, startX, 65, { width: doc.page.width - startX - 50 });
  
  // Linha decorativa
  doc.moveTo(50, 125)
     .lineTo(doc.page.width - 50, 125)
     .strokeColor('#ffffff')
     .lineWidth(2)
     .stroke();
  
  // Resetar para próximo conteúdo
  doc.fillColor(COLORS.text);
}

function adicionarRodape(doc, pageNumber = 1) {
  const bottom = doc.page.height - 50;
  
  // Linha superior
  doc.moveTo(50, bottom - 20)
     .lineTo(doc.page.width - 50, bottom - 20)
     .strokeColor(COLORS.primary)
     .lineWidth(1)
     .stroke();
  
  // Informações da empresa
  doc.fontSize(8)
     .fillColor(COLORS.darkGray)
     .font('Helvetica')
     .text(
       `${EMPRESA.endereco} | CNPJ: ${EMPRESA.cnpj}`,
       50,
       bottom - 10,
       { align: 'center', width: doc.page.width - 100 }
     );
  
  doc.text(
    `Tel: ${EMPRESA.telefone} | Email: ${EMPRESA.email}`,
    50,
    bottom,
    { align: 'center', width: doc.page.width - 100 }
  );
  
  // Número da página
  doc.fontSize(8)
     .text(
       `Página ${pageNumber}`,
       0,
       doc.page.height - 30,
       { align: 'right', width: doc.page.width - 50 }
     );
}

function adicionarSecao(doc, titulo, y) {
  doc.fontSize(12)
     .fillColor(COLORS.primary)
     .font('Helvetica-Bold')
     .text(titulo, 50, y);
  
  doc.moveTo(50, y + 15)
     .lineTo(doc.page.width - 50, y + 15)
     .strokeColor(COLORS.primary)
     .lineWidth(1)
     .stroke();
  
  return y + 25;
}

function adicionarCampo(doc, label, valor, x, y, width = 200) {
  doc.fontSize(9)
     .fillColor(COLORS.darkGray)
     .font('Helvetica-Bold')
     .text(label + ':', x, y);
  
  doc.fontSize(10)
     .fillColor(COLORS.text)
     .font('Helvetica')
     .text(valor || 'N/A', x, y + 12, { width });
  
  return y + 30;
}

function adicionarTabela(doc, headers, rows, startY) {
  const tableTop = startY;
  const itemHeight = 25;
  const colWidths = headers.map(() => (doc.page.width - 100) / headers.length);
  let y = tableTop;
  
  // Cabeçalho
  doc.rect(50, y, doc.page.width - 100, itemHeight)
     .fill(COLORS.lightGray);
  
  headers.forEach((header, i) => {
    const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.fontSize(9)
       .fillColor(COLORS.secondary)
       .font('Helvetica-Bold')
       .text(header, x + 5, y + 8, { width: colWidths[i] - 10, align: i > 0 ? 'right' : 'left' });
  });
  
  y += itemHeight;
  
  // Linhas
  rows.forEach((row, rowIndex) => {
    // Alternar cor de fundo
    if (rowIndex % 2 === 0) {
      doc.rect(50, y, doc.page.width - 100, itemHeight)
         .fill('#fafafa');
    }
    
    row.forEach((cell, i) => {
      const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.fontSize(9)
         .fillColor(COLORS.text)
         .font('Helvetica')
         .text(String(cell), x + 5, y + 8, { width: colWidths[i] - 10, align: i > 0 ? 'right' : 'left' });
    });
    
    y += itemHeight;
  });
  
  // Borda da tabela
  doc.rect(50, tableTop, doc.page.width - 100, y - tableTop)
     .strokeColor(COLORS.darkGray)
     .lineWidth(0.5)
     .stroke();
  
  return y + 10;
}

async function gerarPDFOrcamento(orcamento, cliente, itens) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Cabeçalho
      adicionarCabecalho(doc, 'ORÇAMENTO DE SERVIÇO');
      
      let y = 160;
      
      // Informações do orçamento
      y = adicionarSecao(doc, 'DADOS DO ORÇAMENTO', y);
      
      const dataFormatada = orcamento.data_criacao 
        ? new Date(orcamento.data_criacao).toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');
      
      y = adicionarCampo(doc, 'Protocolo', orcamento.protocolo || `#${orcamento.id}`, 50, y, 200);
      adicionarCampo(doc, 'Data', dataFormatada, 300, y - 30, 200);
      
      y = adicionarCampo(doc, 'Equipamento', orcamento.equipamento, 50, y, 200);
      adicionarCampo(doc, 'Validade', `${orcamento.validade || 7} dias`, 300, y - 30, 200);
      
      y = adicionarCampo(doc, 'Defeito Relatado', orcamento.defeito, 50, y, 500);
      
      if (orcamento.tecnico) {
        y = adicionarCampo(doc, 'Técnico Responsável', orcamento.tecnico, 50, y, 200);
      }
      
      y += 10;
      
      // Dados do cliente
      y = adicionarSecao(doc, 'DADOS DO CLIENTE', y);
      
      y = adicionarCampo(doc, 'Nome', cliente.nome, 50, y, 300);
      adicionarCampo(doc, 'Telefone', cliente.telefone, 400, y - 30, 150);
      
      y = adicionarCampo(doc, 'Email', cliente.email, 50, y, 500);
      
      y += 10;
      
      // Peças e componentes
      console.log('📋 Gerando PDF - Itens recebidos:', itens ? itens.length : 0);
      if (itens && itens.length > 0) {
        console.log('📋 Itens:', JSON.stringify(itens, null, 2));
        y = adicionarSecao(doc, 'PEÇAS E COMPONENTES A SUBSTITUIR', y);
        
        const headers = ['Descrição', 'Qtd', 'Valor Unit.', 'Subtotal'];
        const rows = itens.map(item => {
          console.log('  - Peça:', item.nome_peca, 'Qtd:', item.quantidade, 'Valor:', item.valor_unitario);
          return [
            item.nome_peca || 'N/A',
            String(item.quantidade || 0),
            `R$ ${Number(item.valor_unitario || 0).toFixed(2)}`,
            `R$ ${(Number(item.quantidade || 0) * Number(item.valor_unitario || 0)).toFixed(2)}`
          ];
        });
        
        y = adicionarTabela(doc, headers, rows, y);
        
        const subtotalPecas = itens.reduce(
          (sum, it) => sum + Number(it.quantidade || 0) * Number(it.valor_unitario || 0),
          0
        );
        
        // Subtotal peças
        doc.fontSize(10)
           .fillColor(COLORS.text)
           .font('Helvetica-Bold')
           .text('Subtotal Peças:', doc.page.width - 200, y)
           .text(`R$ ${subtotalPecas.toFixed(2)}`, doc.page.width - 150, y, { align: 'right', width: 100 });
        
        y += 25;
      }
      
      // Mão de obra
      const maoObraValor = orcamento.mao_obra || 0;
      if (maoObraValor > 0) {
        y = adicionarSecao(doc, 'SERVIÇOS TÉCNICOS', y);
        
        doc.fontSize(10)
           .fillColor(COLORS.text)
           .font('Helvetica')
           .text('Mão de Obra Especializada', 50, y);
        
        doc.font('Helvetica-Bold')
           .text(`R$ ${Number(maoObraValor).toFixed(2)}`, doc.page.width - 150, y, { align: 'right', width: 100 });
        
        y += 30;
      }
      
      // Valor total
      const total = Number(orcamento.valor_total || 0);
      
      doc.rect(50, y, doc.page.width - 100, 40)
         .fill(COLORS.primary);
      
      doc.fontSize(14)
         .fillColor('#ffffff')
         .font('Helvetica-Bold')
         .text('VALOR TOTAL DO ORÇAMENTO', 60, y + 12);
      
      doc.fontSize(16)
         .text(`R$ ${total.toFixed(2)}`, doc.page.width - 200, y + 10, { align: 'right', width: 150 });
      
      y += 60;
      
      // Condições
      if (y + 120 > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
      
      y = adicionarSecao(doc, 'CONDIÇÕES DO ORÇAMENTO', y);
      
      doc.fontSize(9)
         .fillColor(COLORS.text)
         .font('Helvetica')
         .list([
           `Orçamento válido por ${orcamento.validade || 7} dias`,
           `Garantia de ${orcamento.garantia || 90} dias para peças e mão de obra`,
           'Aprovação sujeita à disponibilidade de peças',
           'Parcelamos em até 3x sem juros no cartão'
         ], 60, y, { bulletRadius: 2, textIndent: 15 });
      
      y += 80;
      
      // Observações
      if (orcamento.observacoes) {
        if (y + 60 > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }
        
        y = adicionarSecao(doc, 'OBSERVAÇÕES', y);
        doc.fontSize(9)
           .fillColor(COLORS.text)
           .font('Helvetica')
           .text(orcamento.observacoes, 50, y, { width: doc.page.width - 100, align: 'justify' });
      }
      
      // Rodapé
      adicionarRodape(doc, 1);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function gerarPDFOrdemServico(ordem, cliente, itens) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Cabeçalho
      adicionarCabecalho(doc, 'ORDEM DE SERVIÇO');
      
      let y = 140;
      
      // Informações da OS
      y = adicionarSecao(doc, 'DADOS DA ORDEM DE SERVIÇO', y);
      
      const dataFormatada = ordem.data_abertura 
        ? new Date(ordem.data_abertura).toLocaleDateString('pt-BR')
        : new Date().toLocaleDateString('pt-BR');
      
      y = adicionarCampo(doc, 'Protocolo', ordem.protocolo || `#${ordem.id}`, 50, y, 200);
      adicionarCampo(doc, 'Data de Abertura', dataFormatada, 300, y - 30, 200);
      
      y = adicionarCampo(doc, 'Status', ordem.status, 50, y, 200);
      adicionarCampo(doc, 'Prioridade', ordem.prioridade || 'Normal', 300, y - 30, 200);
      
      y = adicionarCampo(doc, 'Equipamento', ordem.equipamento, 50, y, 200);
      
      if (ordem.prazo_estimado) {
        const prazoFormatado = new Date(ordem.prazo_estimado).toLocaleDateString('pt-BR');
        adicionarCampo(doc, 'Prazo Estimado', prazoFormatado, 300, y - 30, 200);
      }
      
      y = adicionarCampo(doc, 'Defeito Relatado', ordem.defeito_relatado, 50, y, 500);
      
      if (ordem.diagnostico) {
        y = adicionarCampo(doc, 'Diagnóstico', ordem.diagnostico, 50, y, 500);
      }
      
      if (ordem.tecnico) {
        y = adicionarCampo(doc, 'Técnico Responsável', ordem.tecnico, 50, y, 200);
      }
      
      y += 10;
      
      // Dados do cliente
      y = adicionarSecao(doc, 'DADOS DO CLIENTE', y);
      
      y = adicionarCampo(doc, 'Nome', cliente.nome, 50, y, 300);
      adicionarCampo(doc, 'Telefone', cliente.telefone, 400, y - 30, 150);
      
      y = adicionarCampo(doc, 'Email', cliente.email, 50, y, 500);
      
      y += 10;
      
      // Serviço realizado
      if (ordem.servico_realizado) {
        if (y + 80 > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }
        
        y = adicionarSecao(doc, 'SERVIÇO REALIZADO', y);
        doc.fontSize(9)
           .fillColor(COLORS.text)
           .font('Helvetica')
           .text(ordem.servico_realizado, 50, y, { width: doc.page.width - 100, align: 'justify' });
        
        y += Math.min(doc.heightOfString(ordem.servico_realizado, { width: doc.page.width - 100 }) + 20, 100);
      }
      
      // Valor do serviço
      if (ordem.valor_total) {
        if (y + 100 > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }
        
        const total = Number(ordem.valor_total || 0);
        
        doc.rect(50, y, doc.page.width - 100, 40)
           .fill(COLORS.primary);
        
        doc.fontSize(14)
           .fillColor('#ffffff')
           .font('Helvetica-Bold')
           .text('VALOR TOTAL DO SERVIÇO', 60, y + 12);
        
        doc.fontSize(16)
           .text(`R$ ${total.toFixed(2)}`, doc.page.width - 200, y + 10, { align: 'right', width: 150 });
        
        y += 60;
      }
      
      // Observações
      if (ordem.observacoes) {
        if (y + 60 > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }
        
        y = adicionarSecao(doc, 'OBSERVAÇÕES', y);
        doc.fontSize(9)
           .fillColor(COLORS.text)
           .font('Helvetica')
           .text(ordem.observacoes, 50, y, { width: doc.page.width - 100, align: 'justify' });
      }
      
      // Rodapé
      adicionarRodape(doc, 1);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  gerarPDFOrcamento,
  gerarPDFOrdemServico
};
