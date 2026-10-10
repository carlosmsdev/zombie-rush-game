# Zombie Rush

Estou desenvolvendo esse jogo para praticar e aprender mais sobre programação.

Zombie Rush é um jogo 2D de sobrevivência feito com **Phaser**, **TypeScript** e **Vite**.

O objetivo é sobreviver o máximo possível contra ondas de zumbis, utilizando diferentes armas, melhorias e estratégias.

## Versão atual

v0.2.0

## Funcionalidades

- Movimentação com WASD
- Mira e tiros com o mouse
- Pistola, Rifle e Shotgun
- Evolução de armas
- Sistema de XP e Level Up
- Melhorias durante a partida
- Sistema de vida e barra de HP
- Pontuação e recorde salvo localmente
- Ondas e dificuldade progressiva
- Bosses
- Sistema de infecção
- Sistema de mutação
- Sistema de barulho
- Rush de zumbis
- Eventos aleatórios
- Clima
- Biomassa e ninhos
- Sistema de extração
- Zumbis que reagem a sons
- Zumbis que conseguem seguir rastros de sangue
- Vírus que se adapta ao estilo do jogador
- Predador especial que aprende com as armas usadas
- Informações da partida anterior salvas

## Inimigos

### Zombie Normal

Inimigo equilibrado em vida, velocidade e dano.

### Zombie Fast

Possui menos vida, mas se movimenta mais rápido.

### Zombie Tank

Possui muita vida e causa mais dano, porém é mais lento.

### Exploder

Se aproxima do jogador e explode causando dano.

### Spitter

Ataca o jogador de longe.

### Bosses

Inimigos mais fortes que aparecem em determinados momentos da partida.

### The Stalker

Um predador especial que persegue o jogador.

Quando recebe muito dano, ele pode fugir, analisar qual arma foi mais usada contra ele e depois voltar mais resistente.

## Barulho

As armas fazem diferentes níveis de barulho.

Quanto mais barulho o jogador faz, maior pode ser a quantidade de zumbis atraídos.

Quando o barulho chega ao máximo começa um **Rush**.

## Infecção e Mutação

Os ataques dos zumbis podem aumentar a infecção.

Quanto maior a infecção, mais mudanças acontecem no personagem.

Com a infecção alta é possível ativar uma mutação e ficar mais forte por alguns segundos.

Se a infecção chegar em 100%, a partida termina.

## Vírus Adaptativo

O jogo analisa como o jogador está jogando.

Por exemplo:

- Qual arma está usando mais
- Quanto está se movimentando
- Quanto está usando mutação

Depois disso os inimigos podem começar a se adaptar ao estilo do jogador.

## Biomassa

Quando muitos zumbis morrem no mesmo local, pode começar a acumular biomassa.

Se acumular muito, pode surgir um ninho que gera novos zumbis.

O jogador também pode queimar a biomassa usando a tecla **E**.

## Clima

O clima pode mudar durante a partida.

Atualmente existem:

- Tempo Limpo
- Chuva
- Neblina
- Tempestade

O clima pode alterar a visão dos zumbis, o alcance dos sons e outras partes da gameplay.

## Extração

Durante a partida podem aparecer oportunidades de extração.

O jogador pode escolher sair ou continuar jogando para tentar conseguir uma recompensa maior.

## Controles

- WASD — movimentação
- Mouse — mirar
- Clique do mouse — atirar
- 1 — Pistola
- 2 — Rifle
- 3 — Shotgun
- F — Mutação
- E — Queimar biomassa
- R — Reiniciar partida

## Tecnologias

- TypeScript
- Phaser
- Vite
- HTML5
- CSS3
- LocalStorage

## Objetivo do projeto

Estou usando esse projeto para praticar:

- TypeScript
- Lógica de programação
- Desenvolvimento de jogos
- Organização de código
- Programação orientada a objetos
- Git e GitHub

## Status

Projeto ainda em desenvolvimento.

Ainda quero melhorar o mapa, adicionar sprites, animações, sons, efeitos e novas mecânicas.
