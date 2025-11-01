import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import OrcamentoForm from '../components/OrcamentoForm';
import OrcamentoResultado from '../components/OrcamentoResultado';
import { Orcamento, OrcamentoInput } from '../types';

const Container = styled.div`
  padding: 2rem;
`;

const HomePage = () => {
  const [costs, setCosts] = useState<any>(null);
  const [orcamentoInput, setOrcamentoInput] = useState<OrcamentoInput | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/costs')
      .then(res => res.json())
      .then(data => {
        setCosts(data);
        setOrcamentoInput({
          largura: 0,
          comprimento: 0,
          diametroCorreia: 0,
          motorId: data.motores[0].id,
          tipoApoio: 'pe',
          opcionaisSelecionados: {
            roleteInferior: false,
            pintura: false,
          },
        });
      });
  }, []);

  if (!costs || !orcamentoInput) {
    return <div>Carregando...</div>;
  }

  // Calcula o valor completo do orçamento, incluindo campos derivados
  const area = (orcamentoInput.largura / 1000) * (orcamentoInput.comprimento / 1000);
  
  const perfilEstrutura = area <= 2 ? 9 : 9 + Math.ceil(area - 2) * 2;

  let horasProjeto = 8;
  let horasMontagem = 20

  if (area > 2) {
    const metrosExcedentes = Math.ceil(area - 2);
    const acrescimoPercentual = 0.05 * metrosExcedentes;
    horasProjeto += horasProjeto * acrescimoPercentual;
    horasMontagem += horasMontagem * acrescimoPercentual;
  }
  
  const orcamentoCompleto: Orcamento = {
    ...orcamentoInput,
    perfilEstrutura,
    horasProjeto,
    horasMontagem,
  };

  return (
    <Container>
      <h1>Orçamento de Esteiras</h1>
      <OrcamentoForm 
        orcamentoInput={orcamentoInput} 
        setOrcamentoInput={setOrcamentoInput as React.Dispatch<React.SetStateAction<OrcamentoInput>>} 
        perfilEstruturaCalculado={orcamentoCompleto.perfilEstrutura}
        horasProjetoCalculadas={orcamentoCompleto.horasProjeto}
        horasMontagemCalculadas={orcamentoCompleto.horasMontagem}
      />
      <OrcamentoResultado orcamento={orcamentoCompleto} costs={costs} />
    </Container>
  );
};

export default HomePage;
