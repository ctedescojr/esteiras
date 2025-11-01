import React from 'react';
import styled from 'styled-components';
import { OrcamentoInput } from '../types';
import { costs } from '../data/costs'; // Manter para a lista de motores

interface Props {
  orcamentoInput: OrcamentoInput;
  setOrcamentoInput: React.Dispatch<React.SetStateAction<OrcamentoInput>>;
  perfilEstruturaCalculado: number;
  horasProjetoCalculadas: number;
  horasMontagemCalculadas: number;
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
  margin-bottom: 1rem;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.toggleBorder};
  background-color: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.toggleBorder};
  background-color: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
  border-radius: 4px;
`;

const CalculatedValue = styled.div`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.inputBackground};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.toggleBorder};
  color: ${({ theme }) => theme.text};
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

const OrcamentoForm: React.FC<Props> = ({ 
  orcamentoInput, 
  setOrcamentoInput, 
  perfilEstruturaCalculado,
  horasProjetoCalculadas,
  horasMontagemCalculadas 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setOrcamentoInput(prev => ({
        ...prev,
        opcionaisSelecionados: {
          ...prev.opcionaisSelecionados,
          [name]: checked,
        },
      }));
    } else {
      const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
      let finalValue: string | number = parsedValue;

      setOrcamentoInput(prev => ({
        ...prev,
        [name]: parsedValue,
      }));
    }
  };

  return (
    <FormContainer>
      <div>
        <h3>Dimensões e Estrutura</h3>
        <FormGroup>
          <Label htmlFor="largura">Largura (mm)</Label>
          <Input type="number" id="largura" name="largura" value={orcamentoInput.largura} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="comprimento">Comprimento (mm)</Label>
          <Input type="number" id="comprimento" name="comprimento" value={orcamentoInput.comprimento} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="diametroCorreia">Diâmetro da Correia (mm)</Label>
          <Input type="number" id="diametroCorreia" name="diametroCorreia" value={orcamentoInput.diametroCorreia} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label>Perfil para Estrutura (m)</Label>
          <CalculatedValue>{perfilEstruturaCalculado.toFixed(2)}</CalculatedValue>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="motorId">Motor</Label>
          <Select id="motorId" name="motorId" value={orcamentoInput.motorId} onChange={handleChange}>
            {costs.motores.map(motor => (
              <option key={motor.id} value={motor.id}>{motor.nome}</option>
            ))}
          </Select>
        </FormGroup>
      </div>
      
      <div>
        <h3>Outros Materiais e Opcionais</h3>
        <FormGroup>
          <Label htmlFor="tipoApoio">Tipo de Apoio</Label>
          <Select id="tipoApoio" name="tipoApoio" value={orcamentoInput.tipoApoio} onChange={handleChange}>
            <option value="pe">Pé Articulado</option>
            <option value="rodizio">Rodízios</option>
          </Select>
        </FormGroup>
        <CheckboxLabel>
          <input
            type="checkbox"
            name="roleteInferior"
            checked={!!orcamentoInput.opcionaisSelecionados.roleteInferior}
            onChange={handleChange}
          />
          Rolete Inferior
        </CheckboxLabel>
        <CheckboxLabel>
          <input
            type="checkbox"
            name="pintura"
            checked={!!orcamentoInput.opcionaisSelecionados.pintura}
            onChange={handleChange}
          />
          Pintura
        </CheckboxLabel>
      </div>

      <div>
        <h3>Horas (Calculado Automaticamente)</h3>
        <FormGroup>
          <Label>Horas de Projeto</Label>
          <CalculatedValue>{horasProjetoCalculadas.toFixed(2)}</CalculatedValue>
        </FormGroup>
        <FormGroup>
          <Label>Horas de Montagem</Label>
          <CalculatedValue>{horasMontagemCalculadas.toFixed(2)}</CalculatedValue>
        </FormGroup>
      </div>
    </FormContainer>
  );
};

export default OrcamentoForm;
