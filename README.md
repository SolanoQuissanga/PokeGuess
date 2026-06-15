PokéGuess

Aluno: Solano Quissanga  
Número: a2025110765  
Curso: CTeSP TPSI — ESTGOH, Politécnico de Coimbra  
Unidade Curricular:Desenvolvimento para a Web I  
Ano Letivo: 2025/26


Descrição

O PokéGuess é um jogo de adivinha de Pokémon que corre inteiramente no browser. O jogador tenta identificar um Pokémon a partir de pistas progressivas. Todos os dados são obtidos em tempo real a partir da PokéAPI, uma API REST pública e gratuita.


Como correr

1.Ter o Visual Studio Code instalado
2.Instalar a extensão **Live Server** (Ritwick Dey)
3.Abrir a pasta do projeto no VS Code
4.Clicar com o botão direito no index.html
5.O browser abre automaticamente com o site

Necessita de ligação à Internet para comunicar com a PokéAPI.


Estrutura do projeto

PokeGuess/
index.html          # Página inicial
jogo.html           # Jogo PokéGuess
sobre.html          # Como jogar e regras
ranking.html        # Tabela de pontuações
pokedex.html        # Catálogo de Pokémon
faq.html            # Perguntas frequentes
privacidade.html    # Política de privacidade
404.html            # Página de erro personalizada


Modos de jogo

Silhueta

A imagem oficial do Pokémon é apresentada completamente a preto. O jogador escreve o nome para adivinhar. Pistas disponíveis: primeira letra, número de letras e geração.

Estatísticas

As estatísticas base do Pokémon são apresentadas (HP, Ataque, Defesa, Ataque Especial, Defesa Especial, Velocidade). O jogador adivinha o nome. Pista disponível: tipo(s).

Tipo + Geração

O tipo e a geração do Pokémon são apresentados. O jogador escolhe entre 4 opções qual é o Pokémon correto.

Cadeia Evolutiva

Um Pokémon é apresentado com a sua imagem. O jogador tem de adivinhar qual é a sua forma anterior ou seguinte na cadeia evolutiva.


Regras

-O jogador começa com 3 vidas
-Cada resposta errada ou tempo esgotado perde uma vida
-O jogo termina ao chegar a zero vidas
-Cada pista usada reduz a pontuação da ronda
-Acertos seguidos aumentam o streak e o multiplicador de pontuação

Pontuação

pontosRonda = max(10, round((100 - 15 * pistasUsadas) * (segundosRestantes / tempoTotal) * multiplicadorStreak))

multiplicadorStreak = 1 + (streakAtual * 0.1), limitado a 2.0


Dificuldades

Dificuldade | Pokémon disponíveis | Tempo por ronda 
| Fácil | 1ª geração (151) | 60 segundos |
| Médio | 1ª e 2ª geração (251) | 40 segundos |
| Difícil | Todas as gerações | 20 segundos |


Atalhos de teclado

| Tecla | Ação |
| Enter | Submeter resposta |
| H | Pedir pista |


Funcionalidades extra

-Histórico de partidas guardado no localStorage
-Exportação do histórico em CSV
-Retoma a partida ao recarregar a página
-Efeitos sonoros (acerto, erro, fim de jogo)
-Definições: nome do jogador, dificuldade, tempo e som
-Design responsivo (desktop, tablet e mobile)