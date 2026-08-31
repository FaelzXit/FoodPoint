# FoodPoint
Projeto acadêmico desenvolvido para a disciplina de Análise e Desenvolvimento de Sistemas, com foco na ODS 9 — Indústria, Inovação e Infraestrutura.

## ODS Escolhido

### ODS 9 — Indústria, Inovação e Infraestrutura

O projeto FoodPoint está relacionado à **ODS 9**, que busca promover infraestrutura resiliente, industrialização sustentável e inovação.

A escolha da ODS 9 ocorre porque o projeto utiliza **tecnologia, análise de dados e Inteligência Artificial** para melhorar processos operacionais de empresas do setor de alimentação.

O sistema busca transformar dados que já são gerados durante as operações da empresa em informações úteis para identificar gargalos, atrasos e padrões de ineficiência, contribuindo para processos mais organizados e eficientes.

---

## O Problema Real

Empresas do setor de alimentação precisam lidar diariamente com um grande volume de pedidos e diferentes etapas operacionais, como recebimento, preparação, montagem e entrega.

Durante esses processos, podem ocorrer **atrasos e gargalos** que afetam a produtividade da empresa e a experiência do cliente.

Um dos problemas é que os dados gerados durante a operação nem sempre são analisados de maneira eficiente. Dessa forma, o gestor pode perceber que existe um problema somente depois que os atrasos já estão afetando o funcionamento da empresa.

Além disso, criar uma nova etapa para que os funcionários registrem manualmente cada problema poderia aumentar a carga de trabalho.

O FreshBite busca resolver esse problema utilizando dados que **já são produzidos pelos processos da empresa**, evitando a necessidade de criar uma nova rotina de registros.

---

## A Solução com IA

A FoodPoint é um sistema de análise inteligente que recebe dados operacionais relacionados aos pedidos e processos da empresa por meio de uma API.

A aplicação analisa informações como:

* Tempo de preparação dos pedidos;
* Tempo de montagem;
* Tempo entre etapas;
* Volume de pedidos;
* Horários de maior movimento;
* Variações no tempo de atendimento.

A partir desses dados, o sistema pode identificar padrões que indiquem possíveis gargalos.

### Aplicação da Inteligência Artificial

A Inteligência Artificial será utilizada como diferencial do projeto para **interpretar os dados identificados pelo sistema e gerar análises e recomendações**.

Por exemplo, caso o sistema identifique que o tempo médio de preparação de um pedido é de 10 minutos, mas em determinados períodos esse tempo aumenta para 20 minutos, a IA poderá analisar o comportamento dos dados e apresentar uma possível explicação ou recomendação ao gestor.

Exemplo:

> **Gargalo identificado:** aumento significativo no tempo de preparação durante o período de maior movimento.

> **Análise da IA:** o aumento do tempo de preparação coincide com um crescimento no volume de pedidos.

> **Recomendação:** analisar a distribuição dos recursos durante os horários de maior demanda.

Dessa forma, o sistema não apenas apresenta números, mas transforma os dados em **informações que podem auxiliar na tomada de decisões**.

O diferencial é que o funcionário não precisa registrar manualmente que existe um gargalo. O sistema identifica possíveis problemas a partir dos dados já disponíveis.

---

## Público-Alvo

O principal público-alvo do FreshBite são **gestores, administradores e responsáveis pela operação de empresas do setor de alimentação**, como restaurantes, lanchonetes e estabelecimentos que trabalham com grande volume de pedidos.

O sistema pode ser utilizado principalmente por gestores que precisam acompanhar o desempenho dos processos e identificar pontos que necessitam de melhorias.

```
Dados operacionais da empresa
            ↓
           API
            ↓
         Backend
            ↓
    Análise dos dados
            ↓
   Identificação de padrões
            ↓
    Inteligência Artificial
            ↓
   Análise e recomendações
            ↓
        Dashboard
            ↓
          Gestor
```
