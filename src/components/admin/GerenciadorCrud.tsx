import React, { useState } from 'react';
import styled from 'styled-components';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  border-bottom: 2px solid ${({ theme }) => theme.primary};
  padding: 0.5rem;
  text-align: left;
`;

const Td = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.toggleBorder};
  padding: 0.5rem;
`;

const Button = styled.button`
  margin-right: 0.5rem;
`;

const Form = styled.form`
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.toggleBorder};
`;

interface Item {
  id: number;
  nome: string;
  preco: number;
}

interface Props {
  titulo: string;
  itens: Item[];
  onSave: (item: Omit<Item, 'id'> & { id?: number }) => void;
  onDelete: (id: number) => void;
}

const GerenciadorCrud: React.FC<Props> = ({ titulo, itens, onSave, onDelete }) => {
  const [editando, setEditando] = useState<Item | null>(null);
  const [novoItem, setNovoItem] = useState({ nome: '', preco: '' });

  const handleSave = (item: Item) => {
    onSave(item);
    setEditando(null);
  };

  const handleNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...novoItem, preco: parseFloat(novoItem.preco) });
    setNovoItem({ nome: '', preco: '' });
  };

  return (
    <div>
      <h3>{titulo}</h3>
      <Table>
        <thead>
          <tr>
            <Th>Nome</Th>
            <Th>Preço</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item: Item) => (
            <tr key={item.id}>
              <Td>{editando?.id === item.id ? <Input value={editando.nome} onChange={e => setEditando({ ...editando, nome: e.target.value })} /> : item.nome}</Td>
              <Td>{editando?.id === item.id ? <Input type="number" value={editando.preco} onChange={e => setEditando({ ...editando, preco: parseFloat(e.target.value) || 0 })} /> : item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Td>
              <Td>
                {editando?.id === item.id ? (
                  <Button onClick={() => handleSave(editando!)}>Salvar</Button>
                ) : (
                  <Button onClick={() => setEditando({ ...item })}>Editar</Button>
                )}
                <Button onClick={() => onDelete(item.id)}>Deletar</Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Form onSubmit={handleNewSubmit}>
        <Input placeholder="Novo nome" value={novoItem.nome} onChange={e => setNovoItem({...novoItem, nome: e.target.value})} required />
        <Input placeholder="Novo preço" type="number" value={novoItem.preco} onChange={e => setNovoItem({...novoItem, preco: e.target.value})} required />
        <Button type="submit">Adicionar Novo</Button>
      </Form>
    </div>
  );
};

export default GerenciadorCrud;
