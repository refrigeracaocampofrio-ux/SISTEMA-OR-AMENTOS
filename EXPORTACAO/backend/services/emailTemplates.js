function gerarTemplateOrcamento(orcamento, cliente) {
  const dataFormatada = orcamento.data_criacao 
    ? new Date(orcamento.data_criacao).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');
    const itens = Array.isArray(orcamento.itens) ? orcamento.itens : [];
    const subtotalItens = itens.reduce(
        (sum, it) => sum + Number(it.quantidade || 0) * Number(it.valor_unitario || 0),
        0,
    );
    const maoObraValor = orcamento.mao_obra != null
        ? Number(orcamento.mao_obra)
        : Math.max(Number(orcamento.valor_total || 0) - subtotalItens, 0);
    const totalCalculado = subtotalItens + maoObraValor;
    const totalOrcamento = totalCalculado > 0 ? totalCalculado : Number(orcamento.valor_total || 0);
    
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 28px; margin: 10px 0; }
        .header p { font-size: 18px; opacity: 0.9; }
        .content { 
            background: white; 
            padding: 30px;
            position: relative;
            background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1zaXplPSI2MCIgZmlsbD0iIzI3YWU2MCIgb3BhY2l0eT0iMC4wMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+UkNGPC90ZXh0Pjwvc3ZnPg==');
            background-repeat: no-repeat;
            background-position: center center;
            background-size: 250px;
        }
        .greeting { margin-bottom: 20px; font-size: 14px; }
        .section { margin-bottom: 25px; }
        .section-title { 
            display: flex; 
            align-items: center; 
            margin-bottom: 15px; 
            padding-bottom: 10px; 
            border-left: 4px solid #2ecc71;
            padding-left: 10px;
            font-weight: bold;
            color: #333;
        }
        .section-title i { margin-right: 8px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px; }
        td:first-child { font-weight: bold; width: 40%; color: #555; }
        td:last-child { color: #333; }
        .highlight { color: #2ecc71; font-weight: bold; font-size: 18px; }
        .terms { background: #f9f9f9; padding: 15px; border-radius: 5px; font-size: 13px; }
        .terms li { margin-left: 20px; margin-bottom: 8px; }
        .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
        .company { font-weight: bold; margin-top: 10px; }
        .contact { margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Refrigeração Campo Frio</h1>
            <p>Orçamento de Serviço</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Prezado(a) ${cliente.nome || 'Cliente'},<br><br>
                Segue orçamento para o serviço solicitado:
            </div>

            <div class="section">
                <div class="section-title">📋 DETALHES DO ORÇAMENTO</div>
                <table>
                    <tr>
                        <td>Orçamento Nº:</td>
                        <td><span class="highlight">${orcamento.protocolo || '#' + orcamento.id}</span></td>
                    </tr>
                    <tr>
                        <td>Data do orçamento:</td>
                        <td>${dataFormatada}</td>
                    </tr>
                    <tr>
                        <td>Validade:</td>
                        <td>${orcamento.validade || 7} dias</td>
                    </tr>
                    <tr>
                        <td>Equipamento:</td>
                        <td>${orcamento.equipamento || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Defeito relatado:</td>
                        <td>${orcamento.defeito || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Valor do orçamento:</td>
                        <td><span class="highlight">R$ ${parseFloat(totalOrcamento || 0).toFixed(2)}</span></td>
                    </tr>
                    <tr>
                        <td>Garantia:</td>
                        <td>${orcamento.garantia || 90} dias para peças e mão de obra</td>
                    </tr>
                </table>
            </div>

            ${(itens.length || maoObraValor) ? `
            <div class="section">
                <div class="section-title">� COMPONENTES E SERVIÇOS</div>
                ${itens.length ? `
                <div style="margin-bottom: 20px;">
                    <p style="font-weight: bold; color: #555; margin-bottom: 10px;">Peças e Componentes a Substituir:</p>
                    <table style="width:100%; border-collapse: collapse; border: 1px solid #e0e0e0;">
                        <tr style="background:#f0f0f0; font-weight:bold;">
                            <td style="padding:10px; border: 1px solid #e0e0e0;">Descrição do Componente</td>
                            <td style="padding:10px; border: 1px solid #e0e0e0;" align="center">Quantidade</td>
                            <td style="padding:10px; border: 1px solid #e0e0e0;" align="right">Valor Unitário</td>
                            <td style="padding:10px; border: 1px solid #e0e0e0;" align="right">Subtotal</td>
                        </tr>
                        ${itens.map(it => `
                        <tr>
                            <td style="padding:10px; border: 1px solid #e0e0e0;">${it.nome_peca || 'Item'}</td>
                            <td style="padding:10px; border: 1px solid #e0e0e0;" align="center">${it.quantidade || 0}</td>
                            <td style="padding:10px; border: 1px solid #e0e0e0;" align="right">R$ ${Number(it.valor_unitario || 0).toFixed(2)}</td>
                            <td style="padding:10px; border: 1px solid #e0e0e0;" align="right">R$ ${(Number(it.valor_unitario || 0) * Number(it.quantidade || 0)).toFixed(2)}</td>
                        </tr>`).join('')}
                        <tr style="background:#f9f9f9;">
                            <td colspan="3" style="padding:10px; font-weight:bold; text-align:right; border: 1px solid #e0e0e0;">Subtotal Peças</td>
                            <td style="padding:10px; font-weight:bold; border: 1px solid #e0e0e0;" align="right">R$ ${subtotalItens.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
                ` : ''}
                ${maoObraValor ? `
                <div style="margin-bottom: 15px;">
                    <p style="font-weight: bold; color: #555; margin-bottom: 10px;">Serviços Técnicos:</p>
                    <table style="width:100%; border-collapse: collapse; border: 1px solid #e0e0e0;">
                        <tr style="background:#f0f0f0; font-weight:bold;">
                            <td style="padding:10px; border: 1px solid #e0e0e0;">Descrição do Serviço</td>
                            <td style="padding:10px; border: 1px solid #e0e0e0;" align="right">Valor</td>
                        </tr>
                        <tr>
                            <td style="padding:10px; border: 1px solid #e0e0e0;">Mão de Obra Especializada</td>
                            <td style="padding:10px; border: 1px solid #e0e0e0;" align="right">R$ ${maoObraValor.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
                ` : ''}
                <table style="width:100%; margin-top: 15px;">
                    <tr style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white;">
                        <td style="padding:12px; font-weight:bold; font-size: 16px; text-align:right; border-radius: 5px 0 0 5px;">VALOR TOTAL DO ORÇAMENTO</td>
                        <td style="padding:12px; font-weight:bold; font-size: 18px; border-radius: 0 5px 5px 0;" align="right">R$ ${totalOrcamento.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            ` : ''}

            <div class="section">
                <div class="section-title">👤 DADOS DO CLIENTE</div>
                <table>
                    <tr>
                        <td>Nome:</td>
                        <td>${cliente.nome || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Telefone:</td>
                        <td>${cliente.telefone ? formatarTelefone(cliente.telefone) : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td>${cliente.email || 'N/A'}</td>
                    </tr>
                </table>
            </div>

            ${orcamento.observacoes ? `
            <div class="section">
                <div class="section-title">📝 OBSERVAÇÕES</div>
                <p>${orcamento.observacoes}</p>
            </div>
            ` : ''}

            <div class="section">
                <div class="section-title">📝 CONDIÇÕES DO ORÇAMENTO</div>
                <div class="terms">
                    <ul>
                        <li>Orçamento válido por ${orcamento.validade || 7} dias</li>
                        <li>Garantia de ${orcamento.garantia || 90} dias para peças e mão de obra</li>
                        <li>Aprovação sujeita à disponibilidade de peças</li>
                        <li>Parcelamos em até 3x sem juros no cartão</li>
                    </ul>
                </div>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #2ecc71;">
                <p>Atenciosamente,</p>
                <p style="margin-top: 10px; font-weight: bold;">Equipe Refrigeração Campo Frio</p>
                <p style="margin-top: 15px; color: #666; font-size: 13px;">
                    <strong>CNPJ:</strong> 44.334.358/0001-26
                </p>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
                <div class="section-title">📞 CONTATO</div>
                <p style="font-size: 13px; color: #666;">
                    <strong>Telefone:</strong> (11) 98016-3597<br>
                    <strong>Email:</strong> refrigeracaocampofrio@gmail.com
                </p>
            </div>
        </div>

        <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p style="margin-top: 10px; font-weight: bold;">AVENIDA ANTONIO DI GIOIA Nº 50 JARDIM CALIFORNIA CAMPO LIMPO PAULISTA</p>
        </div>
    </div>
</body>
</html>
  `;
}

function formatarTelefone(telefone) {
  const cleaned = telefone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return telefone;
}

function gerarTemplateOSAberta(ordem, cliente) {
  const dataFormatada = ordem.data_criacao 
    ? new Date(ordem.data_criacao).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');
    
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 28px; margin: 10px 0; }
        .content { background: white; padding: 30px; }
        .section-title { 
            display: flex; 
            align-items: center; 
            margin-bottom: 15px; 
            padding-bottom: 10px; 
            border-left: 4px solid #3498db;
            padding-left: 10px;
            font-weight: bold;
            color: #333;
        }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px; }
        td:first-child { font-weight: bold; width: 40%; color: #555; }
        td:last-child { color: #333; }
        .highlight { color: #3498db; font-weight: bold; font-size: 18px; }
        .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Refrigeração Campo Frio</h1>
            <p>Atualização da Ordem de Serviço</p>
        </div>
        
        <div class="content">
            <p>Prezado(a) ${cliente.nome || 'Cliente'},</p>

            <div class="section" style="margin-top: 20px;">
                <div class="section-title">📋 ATUALIZAÇÃO DO STATUS</div>
                <table>
                    <tr>
                        <td>Ordem de Serviço:</td>
                        <td><span class="highlight">${ordem.protocolo || '#' + ordem.id}</span></td>
                    </tr>
                    <tr>
                        <td>Status atual:</td>
                        <td><span class="highlight">${ordem.status || 'EM ANDAMENTO'}</span></td>
                    </tr>
                    <tr>
                        <td>Data:</td>
                        <td>${dataFormatada}</td>
                    </tr>
                    ${ordem.equipamento ? `
                    <tr>
                        <td>Equipamento:</td>
                        <td>${ordem.equipamento}</td>
                    </tr>` : ''}
                    ${ordem.defeito ? `
                    <tr>
                        <td>Descrição/Defeito:</td>
                        <td>${ordem.defeito}</td>
                    </tr>` : ''}
                    ${ordem.valor_total ? `
                    <tr>
                        <td>Valor aprovado:</td>
                        <td><span class="highlight">R$ ${parseFloat(ordem.valor_total || 0).toFixed(2)}</span></td>
                    </tr>` : ''}
                    ${ordem.garantia ? `
                    <tr>
                        <td>Garantia:</td>
                        <td>${ordem.garantia} dias</td>
                    </tr>` : ''}
                </table>
            </div>

            ${ordem.observacoes ? `
            <div class="section">
                <div class="section-title">📝 OBSERVAÇÕES</div>
                <p>${ordem.observacoes}</p>
            </div>
            ` : ''}

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #3498db;">
                <p>Atenciosamente,</p>
                <p style="margin-top: 10px; font-weight: bold;">Equipe Refrigeração Campo Frio</p>
                <p style="margin-top: 15px; color: #666; font-size: 13px;">
                    <strong>CNPJ:</strong> 44.334.358/0001-26
                </p>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
                <div class="section-title">📞 CONTATO</div>
                <p style="font-size: 13px; color: #666;">
                    <strong>Telefone:</strong> (11) 98016-3597<br>
                    <strong>Email:</strong> refrigeracaocampofrio@gmail.com
                </p>
            </div>
        </div>

        <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p style="margin-top: 10px; font-weight: bold;">AVENIDA ANTONIO DI GIOIA Nº 50 JARDIM CALIFORNIA CAMPO LIMPO PAULISTA</p>
        </div>
    </div>
</body>
</html>
  `;
}

function gerarTemplateCancelamento(orcamento, cliente, motivo) {
  const dataFormatada = orcamento.data_criacao 
    ? new Date(orcamento.data_criacao).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');
    
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { font-size: 28px; margin: 10px 0; }
        .content { background: white; padding: 30px; }
        .section-title { 
            display: flex; 
            align-items: center; 
            margin-bottom: 15px; 
            padding-bottom: 10px; 
            border-left: 4px solid #e74c3c;
            padding-left: 10px;
            font-weight: bold;
            color: #333;
        }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px; }
        td:first-child { font-weight: bold; width: 40%; color: #555; }
        td:last-child { color: #333; }
        .highlight { color: #e74c3c; font-weight: bold; font-size: 18px; }
        .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Refrigeração Campo Frio</h1>
            <p>Orçamento Cancelado</p>
        </div>
        
        <div class="content">
            <p>Prezado(a) ${cliente.nome || 'Cliente'},</p>

            <div class="section" style="margin-top: 20px;">
                <div class="section-title">❌ INFORMAÇÃO IMPORTANTE</div>
                <table>
                    <tr>
                        <td>Orçamento:</td>
                        <td><span class="highlight">${orcamento.protocolo || '#' + orcamento.id}</span></td>
                    </tr>
                    <tr>
                        <td>Status:</td>
                        <td><span class="highlight">CANCELADO</span></td>
                    </tr>
                    <tr>
                        <td>Data:</td>
                        <td>${dataFormatada}</td>
                    </tr>
                </table>
            </div>

            ${motivo ? `
            <div style="margin-top: 20px;">
                <div class="section-title">📝 MOTIVO</div>
                <p>${motivo}</p>
            </div>
            ` : ''}

            <div style="margin-top: 30px; padding: 20px; background: #fef5f5; border-radius: 5px; border-left: 4px solid #e74c3c;">
                <div class="section-title">😔 SENTIMOS MUITO</div>
                <p>Lamentamos informar que não será possível realizar o serviço solicitado. Entre em contato conosco para mais informações.</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e74c3c;">
                <p>Atenciosamente,</p>
                <p style="margin-top: 10px; font-weight: bold;">Equipe Refrigeração Campo Frio</p>
                <p style="margin-top: 15px; color: #666; font-size: 13px;">
                    <strong>CNPJ:</strong> 44.334.358/0001-26
                </p>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
                <div class="section-title">📞 CONTATO</div>
                <p style="font-size: 13px; color: #666;">
                    <strong>Telefone:</strong> (11) 98016-3597<br>
                    <strong>Email:</strong> refrigeracaocampofrio@gmail.com
                </p>
            </div>
        </div>

        <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p style="margin-top: 10px; font-weight: bold;">AVENIDA ANTONIO DI GIOIA Nº 50 JARDIM CALIFORNIA CAMPO LIMPO PAULISTA</p>
        </div>
    </div>
</body>
</html>
  `;
}

module.exports = { gerarTemplateOrcamento, gerarTemplateOSAberta, gerarTemplateCancelamento };
