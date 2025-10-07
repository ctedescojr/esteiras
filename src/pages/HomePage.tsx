import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import OrcamentoForm from '../components/OrcamentoForm';
import OrcamentoResultado from '../components/OrcamentoResultado';
import { Orcamento } from '../types';

const Container = styled.div`
  padding: 2rem;
`;

const HomePage = () => {
  const [costs, setCosts] = useState<any>(null);
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/costs')
      .then(res => res.json())
      .then(data => {
        setCosts(data);
        setOrcamento({
          largura: 0,
          comprimento: 0,
          diametroCorreia: 0,
          perfilEstrutura: 0,
          motorId: data.motores[0].id,
          opcionaisSelecionados: {},
          horasProjeto: 0,
          horasMontagem: 0,
        });
      });
  }, []);

  if (!costs || !orcamento) {
    return <div>Carregando...</div>;
  }

  return (
    <Container>
      <h1>Orçamento de Esteiras</h1>
      <OrcamentoForm orcamento={orcamento} setOrcamento={setOrcamento as React.Dispatch<React.SetStateAction<Orcamento>>} />
      <OrcamentoResultado orcamento={orcamento} />
    </Container>
  );
};

export default HomePage;
