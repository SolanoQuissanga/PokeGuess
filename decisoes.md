Decisões de Implementação

Aluno: Solano Quissanga — a2025110765


Arquitetura do projeto

O código JavaScript foi dividido em 5 ficheiros com responsabilidades separadas:

-api.js-toda a comunicação com a PokéAPI. Implementei uma cache com Map para não repetir pedidos já feitos, cumprindo a política de uso da API.
-engine.js-motor do jogo: vidas, timer, pontuação, streak. Não conhece HTML, apenas lógica.
-modes.js-cada modo sabe como apresentar o desafio. Chama o motor para reportar respostas.
-storage.js-persistência com localStorage e exportação CSV.
-main.js-liga os eventos do HTML ao motor e gere a navegação entre ecrãs.

Esta separação facilita a manutenção e a defesa oral, pois cada ficheiro tem uma função clara.


Dificuldades encontradas

Cadeia evolutiva: A PokéAPI devolve as evoluções em árvore recursiva. Implementei a função flattenChain para converter essa árvore numa lista simples e depois localizar o Pokémon atual para determinar se tem forma anterior ou seguinte.

Pool de Pokémon para dificuldade difícil: Carregar os nomes de todas as gerações seria demasiado pesado. A solução foi usar IDs numéricos diretamente (1 a N, onde N é obtido via ?limit=1), sorteando um ID aleatório e fazendo fetch apenas desse Pokémon quando necessário.

Botões desativados após modo Tipo+Geração: O handleChoice estava a desativar todos os botões da página. Corrigi usando #game-content button em vez de button para limitar o seletor apenas aos botões do jogo.

Header e footer no jogo: O CSS do jogo usava max-width que limitava também o header e footer. Resolvi separando o CSS do jogo (style.css) do CSS das páginas estáticas (pages.css).


Decisões de design

-Paleta inspirada nos jogos Pokémon originais: amarelo e azul sobre fundo escuro.
-A silhueta usa filter: brightness(0) — solução simples e eficaz sem precisar de imagens separadas.
-Os sons foram gerados com a Web Audio API sem ficheiros externos, para não depender de recursos adicionais.
-O timer usa transition: width 1s linear para diminuir suavemente em vez de saltar a cada segundo.
-A cache da API evita pedidos repetidos e torna o jogo mais rápido entre rondas.