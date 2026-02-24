<h1>🚗 CarSalesControl – Sistema de Gestão para Concessionárias</h1>

<p>
  O <strong>CarSalesControl</strong> é um sistema desenvolvido para auxiliar concessionárias
  de pequeno e médio porte no controle de estoque de veículos, gestão de compras e vendas
  e análise de lucratividade.  
  O projeto foi construído utilizando <strong>HTML5, CSS3 e JavaScript (ES6+)</strong>,
  com foco na aplicação de lógica de negócio financeira e organização de código no front-end.
</p>

<p>
  A proposta principal foi simular um sistema comercial real, permitindo acompanhar
  todo o ciclo de vida de um veículo dentro da concessionária:
  <strong>compra → estoque → venda → análise de lucro</strong>.
</p>

<hr>

<h2>🚀 Funcionalidades</h2>

<p>
  O sistema permite o cadastro completo de veículos, incluindo marca, modelo,
  ano, placa e valor de aquisição.  
  Cada veículo possui status automático (Em estoque ou Vendido), garantindo
  maior controle sobre o inventário.
</p>

<p>
  No momento da venda, o sistema realiza automaticamente o cálculo de:
  <strong>lucro obtido</strong> e <strong>margem percentual</strong>,
  aplicando regras de negócio que simulam um cenário real de gestão comercial.
</p>

<p>
  Além disso, o projeto conta com um <strong>dashboard financeiro</strong> que exibe:
  total investido, total faturado, lucro acumulado e valor atual em estoque,
  oferecendo uma visão estratégica da operação.
</p>

<hr>

<h2>🧠 Regras de Negócio Aplicadas</h2>

<p>
  O cálculo de lucro segue a fórmula:
  <code>Lucro = Valor de Venda - Custo de Aquisição</code>
</p>

<p>
  A margem percentual é calculada por:
  <code>Margem (%) = (Lucro / Custo) × 100</code>
</p>

<p>
  O sistema permite a venda apenas de veículos com status <strong>"Em estoque"</strong>,
  garantindo consistência nas operações.
</p>

<hr>

<h2>🧩 Tecnologias Utilizadas & Aprendizados</h2>

<p>
  O projeto foi estruturado com <strong>HTML5</strong> para organização semântica do conteúdo,
  enquanto o <strong>CSS3</strong> foi utilizado para estilização, responsividade e organização visual.
</p>

<p>
  O <strong>JavaScript (ES6+)</strong> foi responsável pela manipulação de DOM,
  controle de estado da aplicação, implementação de regras de negócio
  e persistência de dados utilizando <code>localStorage</code>.
</p>

<p>
  Durante o desenvolvimento, foram aplicados conceitos como:
  organização modular de código, manipulação de arrays e objetos,
  validações, separação de responsabilidades e simulação de CRUD no front-end.
</p>

<hr>

<h2>📁 Como executar o projeto</h2>

<p>
  Para utilizar o sistema, basta baixar ou clonar o repositório
  e abrir o arquivo <code>index.html</code> diretamente no navegador.
  Não é necessário backend ou instalação adicional.
</p>

<p>
  Os dados são armazenados localmente via <code>localStorage</code>.
</p>

<hr>

<h2>🎯 Objetivo do Projeto</h2>

<p>
  Este projeto foi desenvolvido com o objetivo de consolidar conhecimentos em
  JavaScript puro, aplicar lógica de negócio financeira e simular um sistema
  real de gestão comercial.
</p>
