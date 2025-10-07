import React, { useState } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  /* Adicione estilos para o formulário aqui */
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

interface Custos {
  correiaPorMetro: number;
  chapaPorM2: number;
  perfilEstruturaPorMetro: number;
  projetoPorHora: number;
  montagemPorHora: number;
}

interface Props {
  custos: Custos;
  onSave: (data: Custos) => void;
}

const CustosGeraisForm: React.FC<Props> = ({ custos, onSave }) => {
  const [formData, setFormData] = useState<Custos>(custos);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label>Correia por Metro</Label>
        <Input type="number" name="correiaPorMetro" value={formData.correiaPorMetro} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label>Chapa por m²</Label>
        <Input type="number" name="chapaPorM2" value={formData.chapaPorM2} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label>Perfil Estrutura por Metro</Label>
        <Input type="number" name="perfilEstruturaPorMetro" value={formData.perfilEstruturaPorMetro} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label>Projeto por Hora</Label>
        <Input type="number" name="projetoPorHora" value={formData.projetoPorHora} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label>Montagem por Hora</Label>
        <Input type="number" name="montagemPorHora" value={formData.montagemPorHora} onChange={handleChange} />
      </FormGroup>
      <Button type="submit">Salvar Custos Gerais</Button>
    </Form>
  );
};

export default CustosGeraisForm;
