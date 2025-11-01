import React from 'react';
import styled from 'styled-components';
import { Orcamento } from '../types';

interface Props {
  orcamento: Orcamento;
  costs: any;
}

const ResultadoContainer = styled.div`
  margin-top: 3rem;
  padding: 2rem;
  background-color: ${({ theme }) => theme.body};
  border: 1px solid ${({ theme }) => theme.toggleBorder};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Titulo = styled.h2`
  color: ${({ theme }) => theme.highlight};
  border-bottom: 2px solid ${({ theme }) => theme.highlight};
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ItemLista = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.toggleBorder};

  &:last-child {
    border-bottom: none;
  }
`;

const Total = styled(ItemLista)`
  font-weight: bold;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.highlight};
  margin-top: 1rem;
`;

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1.5rem;

  &:hover {
    opacity: 0.9;
  }
`;

const OrcamentoResultado: React.FC<Props> = ({ orcamento, costs }) => {
  const calcularCustosDetalhados = () => {
    const {
      largura,
      comprimento,
      diametroCorreia,
      perfilEstrutura,
      motorId,
      tipoApoio,
      opcionaisSelecionados,
      horasProjeto,
      horasMontagem,
    } = orcamento;

    const larguraM = largura / 1000;
    const comprimentoM = comprimento / 1000;
    const areaM2 = larguraM * comprimentoM;

    // --- CUSTOS BÁSICOS ---
    const comprimentoCorreia = (comprimentoM * 2) + (Math.PI * (diametroCorreia / 1000));
    const custoCorreia = comprimentoCorreia * larguraM * costs.correiaPorMetro;
    const custoChapa = areaM2 * costs.chapaPorM2;
    const custoEstrutura = perfilEstrutura * costs.perfilEstruturaPorMetro;
    const motorSelecionado = costs.motores.find((m: { id: string; preco: number }) => m.id === motorId);
    const custoMotor = motorSelecionado ? motorSelecionado.preco : 0;

    // Cálculo de Horas de Projeto e Montagem com base na área
    let horasProjetoCalculadas = horasProjeto;
    let horasMontagemCalculadas = horasMontagem;

    if (areaM2 > 2) {
      const metrosExcedentes = Math.ceil(areaM2 - 2);
      const acrescimoPercentual = 0.05 * metrosExcedentes;
      horasProjetoCalculadas += horasProjeto * acrescimoPercentual;
      horasMontagemCalculadas += horasMontagem * acrescimoPercentual;
    }

    const custoProjeto = horasProjetoCalculadas * costs.projetoPorHora;
    const custoMontagem = horasMontagemCalculadas * costs.montagemPorHora;

    // --- OUTROS MATERIAIS (PADRÃO) ---
    const outrosMateriais: { nome: string; detalhe: string; custo: number }[] = [];
    
    // Função auxiliar para calcular custo baseado em área
    const calcularCustoPorArea = (nomeItem: string) => {
      const item = costs.opcionais.find((o: { nome: string; preco: number }) => o.nome.toLowerCase().includes(nomeItem.toLowerCase()));
      if (!item) return 0;
      
      let custo = item.preco;
      let detalhe = `Valor base até 2m²: ${formatCurrency(custo)}`;
      if (areaM2 > 2) {
        const metrosExcedentes = Math.ceil(areaM2 - 2);
        const acrescimo = item.preco * 0.20 * metrosExcedentes;
        custo += acrescimo;
        detalhe += ` + ${formatCurrency(acrescimo)} (${metrosExcedentes}m² excedente(s))`;
      }
      outrosMateriais.push({ nome: nomeItem, custo, detalhe });
      return custo;
    };

    // Mancais: 4 unidades, preço unitário
    const itemMancais = costs.opcionais.find((o: { nome: string; preco: number }) => o.nome === 'Mancais');
    const custoMancais = itemMancais ? itemMancais.preco * 4 : 0;
    if (itemMancais) {
      outrosMateriais.push({ nome: 'Mancais', custo: custoMancais, detalhe: `4 un x ${formatCurrency(itemMancais.preco)}` });
    }

    // Proteções: 4 unidades, preço fixo (assumido)
    const itemProtecoes = costs.opcionais.find((o: { nome: string; preco: number }) => o.nome === 'Proteções');
    const custoProtecoes = itemProtecoes ? itemProtecoes.preco : 0; // Assumindo que o preço é para as 4
    if (itemProtecoes) {
      const precoUnitario = custoProtecoes / 4;
      outrosMateriais.push({ nome: 'Proteções', custo: custoProtecoes, detalhe: `4 un x ${formatCurrency(precoUnitario)}` });
    }

    // Pés ou Rodízios
    const nomeApoioBusca = tipoApoio === 'pe' ? 'Pé articulado' : 'Rodízios';
    const nomeApoioExibicao = tipoApoio === 'pe' ? 'Pé Articulado' : 'Rodízios';
    const itemApoio = costs.opcionais.find((o: { nome: string; preco: number }) => o.nome.toLowerCase().includes(nomeApoioBusca.toLowerCase()));
    let custoApoio = 0;
    if (itemApoio) {
      const qtd = 4 + Math.floor(comprimentoM / 6) * 2;
      custoApoio = itemApoio.preco * qtd;
      outrosMateriais.push({ nome: nomeApoioExibicao, custo: custoApoio, detalhe: `${qtd} un x ${formatCurrency(itemApoio.preco)}` });
    }
    
    // Soma dos custos de "Outros Materiais"
    const totalOutrosMateriais = custoMancais +
                           custoProtecoes +
                           custoApoio +
                           calcularCustoPorArea('Usinagem suportes') +
                           calcularCustoPorArea('Usinagem eixos') +
                           calcularCustoPorArea('Fixações gerais') +
                           calcularCustoPorArea('Tratamento superficial');

    // --- MATERIAIS OPCIONAIS ---
    const materiaisOpcionais: { nome: string; detalhe: string; custo: number }[] = [];
    
    // Rolete Inferior
    if (opcionaisSelecionados.roleteInferior) {
      const itemRolete = costs.opcionais.find((o: { nome: string; preco: number; }) => o.nome === 'Rolete Inferior');
      if (itemRolete) {
        const qtd = 1 + Math.floor(Math.max(0, comprimentoM - 2) / 2);
        const custo = itemRolete.preco * qtd;
        materiaisOpcionais.push({ nome: 'Rolete Inferior', custo, detalhe: `${qtd} un x ${formatCurrency(itemRolete.preco)}` });
      }
    }

    // Pintura
    if (opcionaisSelecionados.pintura) {
        const itemPintura = costs.opcionais.find((o: { nome: string; preco: number; }) => o.nome === 'Pintura');
        if(itemPintura) {
            let custo = itemPintura.preco;
            let detalhe = `Valor base até 2m²: ${formatCurrency(custo)}`;
            if (areaM2 > 2) {
                const metrosExcedentes = Math.ceil(areaM2 - 2);
                const acrescimo = itemPintura.preco * 0.20 * metrosExcedentes;
                custo += acrescimo;
                detalhe += ` + ${formatCurrency(acrescimo)} (${metrosExcedentes}m² excedente(s))`;
            }
            materiaisOpcionais.push({ nome: 'Pintura', custo, detalhe });
        }
    }

    const totalMateriaisOpcionais = materiaisOpcionais.reduce((acc, item) => acc + item.custo, 0);

    // --- TOTAL GERAL ---
    const subtotal = custoCorreia + custoChapa + custoEstrutura + custoMotor + custoProjeto + custoMontagem + totalOutrosMateriais + totalMateriaisOpcionais;

    return {
      custoCorreia,
      custoChapa,
      custoEstrutura,
      custoMotor,
      custoProjeto,
      custoMontagem,
      outrosMateriais,
      totalOutrosMateriais,
      materiaisOpcionais,
      totalMateriaisOpcionais,
      subtotal,
    };
  };

  const totais = calcularCustosDetalhados();

  const handleSalvarOrcamento = async () => {
    try {
      const response = await fetch('http://localhost:3001/orcamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados: orcamento, total: totais.subtotal }),
      });
      if (response.ok) {
        alert('Orçamento salvo com sucesso!');
      } else {
        throw new Error('Falha ao salvar o orçamento.');
      }
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao salvar o orçamento.');
    }
  };

  return (
    <ResultadoContainer>
      <Titulo>Resumo do Orçamento</Titulo>
      
      {/* Custos Básicos */}
      <ItemLista>
        <span>Custo da Correia</span>
        <span>{formatCurrency(totais.custoCorreia)}</span>
      </ItemLista>
      <ItemLista>
        <span>Custo da Chapa</span>
        <span>{formatCurrency(totais.custoChapa)}</span>
      </ItemLista>
      <ItemLista>
        <span>Custo da Estrutura</span>
        <span>{formatCurrency(totais.custoEstrutura)}</span>
      </ItemLista>
      <ItemLista>
        <span>Custo do Motor</span>
        <span>{formatCurrency(totais.custoMotor)}</span>
      </ItemLista>

      {/* Outros Materiais */}
      <Titulo style={{ marginTop: '2rem' }}>Outros Materiais</Titulo>
      {totais.outrosMateriais.map((item, index) => (
        <ItemLista key={index}>
          <span>{item.nome} <small>({item.detalhe})</small></span>
          <span>{formatCurrency(item.custo)}</span>
        </ItemLista>
      ))}

      {/* Materiais Opcionais */}
      {totais.materiaisOpcionais.length > 0 && (
        <>
          <Titulo style={{ marginTop: '2rem' }}>Materiais Opcionais</Titulo>
          {totais.materiaisOpcionais.map((item, index) => (
            <ItemLista key={index}>
              <span>{item.nome} <small>({item.detalhe})</small></span>
              <span>{formatCurrency(item.custo)}</span>
            </ItemLista>
          ))}
        </>
      )}

      {/* Custos de Serviço */}
      <Titulo style={{ marginTop: '2rem' }}>Serviços</Titulo>
      <ItemLista>
        <span>Custo do Projeto</span>
        <span>{formatCurrency(totais.custoProjeto)}</span>
      </ItemLista>
      <ItemLista>
        <span>Custo da Montagem</span>
        <span>{formatCurrency(totais.custoMontagem)}</span>
      </ItemLista>

      {/* Total */}
      <Total>
        <span>TOTAL</span>
        <span>{formatCurrency(totais.subtotal)}</span>
      </Total>
      <Button onClick={handleSalvarOrcamento}>Salvar Orçamento</Button>
    </ResultadoContainer>
  );
};

export default OrcamentoResultado;
