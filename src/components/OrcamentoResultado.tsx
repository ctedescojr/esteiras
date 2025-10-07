import React from 'react';
import styled from 'styled-components';
import { Orcamento } from '../types';
import { costs } from '../data/costs';

interface Props {
  orcamento: Orcamento;
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
  color: ${({ theme }) => theme.primary};
  border-bottom: 2px solid ${({ theme }) => theme.primary};
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
  color: ${({ theme }) => theme.primary};
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

const OrcamentoResultado: React.FC<Props> = ({ orcamento }) => {
  const calcularTotal = () => {
    const {
      largura,
      comprimento,
      diametroCorreia,
      perfilEstrutura,
      motorId,
      opcionaisSelecionados,
      horasProjeto,
      horasMontagem,
    } = orcamento;

    // Cálculos (convertendo mm para m onde necessário)
    const comprimentoCorreia = ((comprimento / 1000) * 2) + (Math.PI * (diametroCorreia / 1000));
    const custoCorreia = comprimentoCorreia * (largura / 1000) * costs.correiaPorMetro;
    const custoChapa = (largura / 1000) * (comprimento / 1000) * costs.chapaPorM2;
    const custoEstrutura = perfilEstrutura * costs.perfilEstruturaPorMetro;
    
    const motorSelecionado = costs.motores.find(m => m.id === motorId);
    const custoMotor = motorSelecionado ? motorSelecionado.preco : 0;

    const custoOpcionais = Object.keys(opcionaisSelecionados)
      .filter(key => opcionaisSelecionados[key])
      .reduce((total, key) => {
        const opcional = costs.opcionais.find(o => o.id === key);
        return total + (opcional ? opcional.preco : 0);
      }, 0);

    const custoProjeto = horasProjeto * costs.projetoPorHora;
    const custoMontagem = horasMontagem * costs.montagemPorHora;

    const subtotal = custoCorreia + custoChapa + custoEstrutura + custoMotor + custoOpcionais + custoProjeto + custoMontagem;

    return {
      custoCorreia,
      custoChapa,
      custoEstrutura,
      custoMotor,
      custoOpcionais,
      custoProjeto,
      custoMontagem,
      subtotal,
    };
  };

  const totais = calcularTotal();

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
      <ItemLista>
        <span>Custos Opcionais</span>
        <span>{formatCurrency(totais.custoOpcionais)}</span>
      </ItemLista>
      <ItemLista>
        <span>Custo do Projeto</span>
        <span>{formatCurrency(totais.custoProjeto)}</span>
      </ItemLista>
      <ItemLista>
        <span>Custo da Montagem</span>
        <span>{formatCurrency(totais.custoMontagem)}</span>
      </ItemLista>
      <Total>
        <span>TOTAL</span>
        <span>{formatCurrency(totais.subtotal)}</span>
      </Total>
      <Button onClick={handleSalvarOrcamento}>Salvar Orçamento</Button>
    </ResultadoContainer>
  );
};

export default OrcamentoResultado;
