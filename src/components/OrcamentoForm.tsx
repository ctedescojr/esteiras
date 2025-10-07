import React from 'react';
import styled from 'styled-components';
import { Orcamento } from '../types';
import { costs } from '../data/costs';

interface Props {
  orcamento: Orcamento;
  setOrcamento: React.Dispatch<React.SetStateAction<Orcamento>>;
}

const FormContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.toggleBorder};
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.toggleBorder};
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  border-radius: 4px;
`;

const CheckboxContainer = styled.div`
  margin-top: 1rem;
  h3 {
    margin-bottom: 1rem;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  cursor: pointer;

  input {
    margin-right: 0.5rem;
  }
`;

const OrcamentoForm: React.FC<Props> = ({ orcamento, setOrcamento }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setOrcamento(prev => ({
        ...prev,
        opcionaisSelecionados: {
          ...prev.opcionaisSelecionados,
          [name]: checked,
        },
      }));
    } else {
      setOrcamento(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
      }));
    }
  };

  return (
    <FormContainer>
      <div>
        <h3>Dimensões e Estrutura</h3>
        <FormGroup>
          <Label htmlFor="largura">Largura (mm)</Label>
          <Input type="number" id="largura" name="largura" value={orcamento.largura} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="comprimento">Comprimento (mm)</Label>
          <Input type="number" id="comprimento" name="comprimento" value={orcamento.comprimento} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="diametroCorreia">Diâmetro da Correia (mm)</Label>
          <Input type="number" id="diametroCorreia" name="diametroCorreia" value={orcamento.diametroCorreia} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="perfilEstrutura">Perfil para Estrutura (m)</Label>
          <Input type="number" id="perfilEstrutura" name="perfilEstrutura" value={orcamento.perfilEstrutura} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="motorId">Motor</Label>
          <Select id="motorId" name="motorId" value={orcamento.motorId} onChange={handleChange}>
            {costs.motores.map(motor => (
              <option key={motor.id} value={motor.id}>{motor.nome}</option>
            ))}
          </Select>
        </FormGroup>
      </div>
      
      <div>
        <h3>Horas</h3>
        <FormGroup>
          <Label htmlFor="horasProjeto">Horas de Projeto</Label>
          <Input type="number" id="horasProjeto" name="horasProjeto" value={orcamento.horasProjeto} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="horasMontagem">Horas de Montagem</Label>
          <Input type="number" id="horasMontagem" name="horasMontagem" value={orcamento.horasMontagem} onChange={handleChange} />
        </FormGroup>
      </div>

      <CheckboxContainer>
        <h3>Materiais Opcionais</h3>
        {costs.opcionais.map(opcional => (
          <CheckboxLabel key={opcional.id}>
            <input
              type="checkbox"
              name={opcional.id}
              checked={!!orcamento.opcionaisSelecionados[opcional.id]}
              onChange={handleChange}
            />
            {opcional.nome}
          </CheckboxLabel>
        ))}
      </CheckboxContainer>
    </FormContainer>
  );
};

export default OrcamentoForm;
