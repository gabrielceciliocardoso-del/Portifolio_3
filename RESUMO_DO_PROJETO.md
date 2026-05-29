# Resumo do Projeto - Controle de Estoque Ionic/Angular

## 1. Criacao inicial do sistema

Foi criado um sistema de controle de estoque com as seguintes areas principais:

- Login com usuario e senha.
- Cadastro de usuarios.
- Cadastro de produtos.
- Cadastro de clientes.
- Controle de estoque.
- Registro de vendas.
- Controle de caixa.
- Relatorios administrativos.

No inicio, o sistema foi montado como uma aplicacao web estatica usando HTML, CSS e JavaScript.

## 2. Conversao para Angular/Ionic

Depois, o projeto foi convertido para uma aplicacao Ionic com Angular.

Foi gerada uma estrutura Ionic/Angular contendo:

- `package.json`
- `angular.json`
- `capacitor.config.ts`
- `src/app`
- `src/app/home`
- arquivos de configuracao do Angular
- arquivos de tema e estilos globais

A tela principal foi implementada em:

- `src/app/home/home.page.ts`
- `src/app/home/home.page.html`
- `src/app/home/home.page.scss`

## 3. Login e acesso inicial

Foi criado um login simples usando dados salvos no `localStorage` do navegador.

O acesso inicial configurado foi:

- Usuario: `admin`
- Senha: `admin123`

Apos o login, o usuario acessa o painel principal do sistema.

## 4. Cadastro de usuarios

Foi criada uma area para administrar usuarios do sistema.

Funcionalidades:

- Cadastrar usuario.
- Editar usuario.
- Excluir usuario.
- Definir perfil do usuario.
- Ativar ou inativar usuario.
- Impedir nomes de usuario duplicados.
- Impedir que o ultimo usuario seja excluido.

Perfis disponiveis:

- Administrador
- Operador
- Caixa

## 5. Cadastro de produtos e estoque

Foi criada uma area para cadastro e controle de produtos.

Campos do produto:

- Nome do produto.
- SKU.
- Preco.
- Quantidade em estoque.
- Estoque minimo.

Funcionalidades:

- Cadastrar produto.
- Editar produto.
- Excluir produto.
- Buscar produto por nome ou SKU.
- Exibir status de estoque.
- Alertar produtos com estoque baixo.

## 6. Cadastro de clientes

Foi criada uma area para gerenciamento de clientes.

Campos do cliente:

- Nome.
- CPF/CNPJ.
- Telefone.
- E-mail.

Funcionalidades:

- Cadastrar cliente.
- Editar cliente.
- Excluir cliente.
- Visualizar clientes cadastrados.

## 7. Registro de vendas

Foi criada uma area especifica para vendas.

Cada venda registra:

- Cliente.
- Produtos vendidos.
- Quantidade de cada produto.
- Forma de pagamento.
- Valor total da nota.
- Data e horario da compra.

Ao finalizar uma venda:

- A venda e registrada no historico.
- O estoque dos produtos e reduzido automaticamente.
- Uma entrada e criada no caixa.
- A venda passa a aparecer nos pedidos e notas de compra.

## 8. Cancelamento de compra

Foi adicionada a funcionalidade de cancelamento de compra.

Regras implementadas:

- Apenas vendas ativas podem ser canceladas.
- O sistema exige uma justificativa obrigatoria.
- A venda nao e excluida, apenas marcada como cancelada.
- Os produtos da venda cancelada retornam ao estoque.
- O caixa recebe um lancamento negativo referente ao cancelamento.
- O cancelamento fica registrado nos relatorios.

Dados registrados no cancelamento:

- Justificativa.
- Data e hora do cancelamento.
- Usuario responsavel.
- Cliente da compra.
- Valor da compra cancelada.

## 9. Controle de caixa

Foi criada uma area especifica para o caixa.

Funcionalidades:

- Visualizar entradas de pagamentos.
- Registrar entradas manuais.
- Registrar automaticamente entradas geradas por vendas.
- Registrar lancamentos negativos quando uma venda e cancelada.
- Exibir saldo total do caixa.

Formas de pagamento disponiveis:

- Dinheiro
- Pix
- Cartao de debito
- Cartao de credito
- Boleto

## 10. Relatorios

Foi criada uma area de relatorios para melhor visualizacao dos dados.

Relatorios e indicadores criados:

- Numero de vendas no mes.
- Valor total vendido no mes.
- Valor total vendido geral.
- Quantidade total em estoque.
- Saldo total em caixa.
- Produtos mais vendidos.
- Quantidade em estoque por produto.
- Total de compras canceladas.
- Registro detalhado de cancelamentos.

As vendas canceladas deixam de contar como vendas ativas nos totais vendidos.

## 11. Persistencia dos dados

Os dados sao salvos no `localStorage` do navegador.

Isso permite que os registros continuem disponiveis mesmo depois de atualizar a pagina.

Dados salvos:

- Usuarios.
- Produtos.
- Clientes.
- Vendas.
- Pagamentos.
- Cancelamentos.

## 12. Ajustes visuais e responsividade

Foi criada uma interface usando componentes Ionic.

Componentes utilizados:

- `ion-content`
- `ion-card`
- `ion-list`
- `ion-item`
- `ion-input`
- `ion-select`
- `ion-button`
- `ion-badge`
- `ion-menu`
- `ion-split-pane`
- `ion-progress-bar`

A interface foi organizada para funcionar em telas maiores e tambem em telas menores.

## 13. Validacao do projeto

O projeto foi compilado com sucesso usando:

```bash
npm run build
```

O servidor de desenvolvimento foi iniciado com:

```bash
npm start -- --host 0.0.0.0
```

A aplicacao ficou disponivel em:

```bash
http://localhost:4200/
```

## 14. Configuracao do Git

A pasta do projeto foi transformada em um repositorio Git.

Comandos executados:

```bash
git init
git config user.name "Claretiano"
git config user.email "claretiano@example.com"
git branch -M main
git remote add origin git@github.com:gabrielceciliocardoso-del/Portifolio_3.git
```

Foi criado o commit inicial:

```bash
git add .
git commit -m "Initial Ionic inventory system"
```

Commit gerado:

```bash
b91cfb7 Initial Ionic inventory system
```

## 15. Envio para o GitHub

O projeto foi enviado para o GitHub via SSH.

Repositorio:

```bash
git@github.com:gabrielceciliocardoso-del/Portifolio_3.git
```

Branch enviada:

```bash
main
```

Comando final:

```bash
git push -u origin main
```

O push foi concluido com sucesso.

## 16. Estado final

O projeto final e uma aplicacao Ionic/Angular de controle de estoque com:

- Login.
- Usuarios.
- Produtos.
- Clientes.
- Vendas.
- Cancelamento de compras com justificativa.
- Caixa.
- Relatorios.
- Persistencia local.
- Repositorio Git configurado.
- Projeto enviado para o GitHub.
