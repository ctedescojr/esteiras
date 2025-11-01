export interface Motor {
  id: string;
  nome: string;
  preco: number;
}

export interface Opcional {
  id: string;
  nome: string;
  preco: number;
}

// Representa os dados que o usuário insere diretamente no formulário
// Representa os dados que o usuário insere diretamente no formulário
export interface OrcamentoInput {
  largura: number;
  comprimento: number;
  diametroCorreia: number;
  motorId: string;
  tipoApoio: 'pe' | 'rodizio';
  // Apenas os itens que são verdadeiramente opcionais agora
  opcionaisSelecionados: {
    roleteInferior?: boolean;
    pintura?: boolean;
  };
}

// Representa o estado completo, incluindo valores calculados
export interface Orcamento extends OrcamentoInput {
  perfilEstrutura: number;
  horasProjeto: number;
  horasMontagem: number;
}
