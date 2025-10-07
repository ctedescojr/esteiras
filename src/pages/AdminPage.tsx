import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import CustosGeraisForm from '../components/admin/CustosGeraisForm';
import GerenciadorCrud from '../components/admin/GerenciadorCrud';

const AdminContainer = styled.div`
  padding: 2rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.toggleBorder};
  border-radius: 8px;
`;

const AdminPage = () => {
  const [costs, setCosts] = useState<any>(null);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchCosts = useCallback(async () => {
    const res = await fetch('http://localhost:3001/costs');
    const data = await res.json();
    setCosts(data);
  }, []);

  const fetchOrcamentos = useCallback(async (token: string | null) => {
    if (!token) return navigate('/login');

    const res = await fetch('http://localhost:3001/orcamentos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401 || res.status === 403) {
      return navigate('/login');
    }

    const data = await res.json();
    setOrcamentos(data);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCosts();
    fetchOrcamentos(token);
  }, [navigate, fetchCosts, fetchOrcamentos]);

  const handleSaveCustosGerais = async (data: any) => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:3001/costs/gerais', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    alert('Custos gerais salvos!');
    fetchCosts();
  };

  const handleSaveItem = (tipo: 'motores' | 'opcionais') => async (item: any) => {
    const token = localStorage.getItem('token');
    const url = item.id ? `http://localhost:3001/${tipo}/${item.id}` : `http://localhost:3001/${tipo}`;
    const method = item.id ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ nome: item.nome, preco: item.preco }),
    });
    alert(`${tipo} salvo(a)!`);
    fetchCosts();
  };

  const handleDeleteItem = (tipo: 'motores' | 'opcionais') => async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar?')) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3001/${tipo}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    alert(`${tipo} deletado(a)!`);
    fetchCosts();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!costs) {
    return <div>Carregando...</div>;
  }

  return (
    <AdminContainer>
      <h1>Painel Administrativo</h1>
      <button onClick={handleLogout}>Sair</button>

      <Section>
        <h2>Custos Gerais</h2>
        <CustosGeraisForm custos={costs} onSave={handleSaveCustosGerais} />
      </Section>

      <Section>
        <GerenciadorCrud
          titulo="Motores"
          itens={costs.motores}
          onSave={handleSaveItem('motores')}
          onDelete={handleDeleteItem('motores')}
        />
      </Section>

      <Section>
        <GerenciadorCrud
          titulo="Opcionais"
          itens={costs.opcionais}
          onSave={handleSaveItem('opcionais')}
          onDelete={handleDeleteItem('opcionais')}
        />
      </Section>

      <Section>
        <h2>Orçamentos Salvos</h2>
      </Section>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Total</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {orcamentos.map(orc => (
            <tr key={orc.id}>
              <td>{new Date(orc.data).toLocaleString('pt-BR')}</td>
              <td>{orc.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td><pre>{JSON.stringify(JSON.parse(orc.dados), null, 2)}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminContainer>
  );
};

export default AdminPage;
