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

export interface Orcamento {
  largura: number;
  comprimento: number;
  diametroCorreia: number;
  perfilEstrutura: number;
  motorId: string;
  opcionaisSelecionados: { [key: string]: boolean };
  horasProjeto: number;
  horasMontagem: number;
}
