# Bookie — Brief de handoff para o Claude Code

> Coloque este arquivo na **raiz do projeto** com o nome **`CLAUDE.md`** — o Claude Code lê
> ele automaticamente e usa como contexto. É a fonte da verdade do que vamos construir.

## O que é o Bookie
App **web (React)** pra acompanhar leituras, com uma camada social calorosa. Versão de
**portfólio**: navegável, com **dados fictícios** (sem backend real neste momento). Em PT-BR.
Voz de "amiga curiosa" que **convida, nunca cobra**.

**Princípios (não violar):** reader-first · menos esforço ("1 toque") · convite nunca cobrança ·
privacidade por padrão · "parece feito pra mim".

**Personas:** user2508 (primária — lê pouco, não usa apps, quer registro sem esforço) · Bruna
(comunidade/retenção) · Letícia (notas/multiplataforma).

## Stack
- **Vite + React** (JavaScript) · **React Router** (navegação) · estado em memória/Context
  (dados fictícios; opcional `localStorage` pra persistir entre reloads).
- **Estilo:** CSS com variáveis de tema (abaixo) — ou Tailwind com o tema mapeado, se preferir.
- **Fontes:** Google Fonts — **Fraunces** (títulos, números, nomes de livros) e **Nunito** (texto/UI).
- **Ícones:** Tabler Icons (estilo de linha).
- **Deploy:** Vercel ou Netlify (plano grátis).
- Busca de livros: começar com **dados fictícios**; opcionalmente integrar a **Open Library API**
  (grátis) depois.

## Design system (tokens)
```css
:root{
  /* marca */
  --roxo:#643FA9; --lilas:#8B63C8; --roxo-escuro:#4E3187;
  --coral:#FF6F61; --sol:#FFC247; --ambar:#E8920A; --menta:#2FD0A6; --verde:#17A883;
  /* neutros */
  --tinta:#241B33; --texto-2:#6A6480; --papel:#FAF8FD; --linha:#EAE6F2; --roxo-claro:#EDE7F7;
  /* feedback */
  --sucesso:#17A883; --aviso:#E8920A; --erro:#E5484D; /* info = roxo */
}
```
- **Tipografia:** Fraunces 600–700 pra títulos/números; Nunito 400–800 pra texto/UI.
- **Formas:** cantos arredondados — cards 16px, sheets 24px (topo), botões em **pílula** (999px).
  Sombras suaves arroxeadas.
- **Ritmo de espaçamento** (validado no Figma): margem lateral **22** · topo de seção **22** ·
  rótulo→conteúdo **12** · entre seções **22** · padding de card **14** · barra de nav **72**.
- Botões flutuantes (FAB) a **12px** das bordas.

## Arquitetura de informação (navegação)
- **Barra inferior com 4 abas:** Início · Buscar · Comunidade · Perfil.
- **Detalhe do livro = hub central.** Tocar em **qualquer capa** (home, estante, busca, feed)
  abre o detalhe. As ações mudam conforme o **status** do livro:
  - não adicionado → **"Adicionar à estante"** (abre modal de status, "Quero ler" pré-selecionado)
  - **Quero ler** → atualizar status
  - **Lendo agora** → **atualizar progresso** (com reação dentro) + **adicionar nota** + barra de progresso
  - **Já li** → review (estrelas + resenha opcional)
  - **Abandonei** → review + **motivo do abandono**
  - **fim inteligente:** ao bater **100%** (inclusive pela home), oferecer estrelas + resenha, com opção de **pular**
- **Notas × Reações (fronteira clara):**
  - **Notas = privadas** (anotações pessoais). Criadas contextualmente (home "compartilhar algo → privado",
    Comunidade "Privado — só pra você", detalhe do livro). **Perfil é a casa** onde todas se reencontram.
  - **Reações = públicas** (posts na comunidade, p/ amigos ou geral).
  - No detalhe do livro: **duas abas** "Notas" (privadas) e "Reações" (suas, públicas); e, separada,
    a seção **"A comunidade achou"** (reações de outros leitores, com spoiler ocultável).

## Os 4 fluxos (MVP navegável)
1. **Adicionar livro + progresso:** Início mostra "Lendo agora" (card com progresso) e um **atalho de
   adicionar** visível. Buscar → resultado → "+" (modal de status). Atualizar progresso via home **ou**
   pelo detalhe do livro (bottom sheet: digita página → % automática; **botão voltar**). Ao salvar,
   **celebração** com confete.
2. **Seguir uma leitora:** possível **na Comunidade** (seção "pessoas pra seguir" / descobrir) **e** na
   Buscar › aba **Pessoas**. Botão "Seguir" alterna pra "Seguindo". Perfil de leitora clicável.
3. **Postar uma reação:** FAB na Comunidade → compositor (escolher livro, escrever, estrelas, privacidade
   amigos/comunidade). Post aparece no topo do feed, com curtir/responder/repostar/salvar.
4. **Guardar uma nota (privada):** criada nos pontos contextuais; **Perfil** lista todas (busca + filtros);
   editar/excluir.

## Busca (aba Buscar)
Abas **Livros · Autores · Pessoas**. Em Pessoas, digitar nome → lista com "Seguir" rápido + abrir perfil.

## Dados fictícios (exemplos)
Livros: "A Biblioteca da Meia-Noite" (Matt Haig), "Rei da Ira" (Ana Huang, série Reis do Pecado),
"Circe" (Madeline Miller), "Torto Arado" (Itamar Vieira Junior), "Pachinko". Usuária logada: **user2508**.
Leitoras da comunidade: Bruna, Letícia.

## Melhorias já mapeadas dos testes (aplicar)
- Seguir pessoas **dentro da Comunidade** (achado nº 1).
- **Notas privadas vs reações públicas** separadas e nomeadas (achado nº 2).
- Atalho de adicionar na **home** + progresso pelo **detalhe** + **botão voltar** no sheet.
- Home: "lendo agora" + stats do mês **mais acima** (não escondidas).

## Ordem de construção (fatias)
1. Setup do projeto + tema (tokens, fontes, ícones) + **app shell** com as 4 abas e roteamento + dados fictícios.
2. **Início** (home) com cards de livro clicáveis + atalho de adicionar + stats do mês.
3. **Detalhe do livro** (hub contextual por status) + **sheet de progresso** + **celebração** + abas Notas/Reações.
4. **Buscar** (Livros/Autores/Pessoas) + fluxo de adicionar (modal de status).
5. **Comunidade** (feed + seguir/descobrir + compositor de reação/FAB).
6. **Perfil de leitora** + **Perfil (seu)** com a casa das notas (lista + criar/editar/excluir).
7. Polimento + **deploy** (Vercel/Netlify).

## Fora deste MVP (V2 / mockups do case)
Onboarding, retrospectiva, conquistas "ver todas", configurações, dark mode, OCR de foto — ficam de fora
do app clicável (retrospectiva e onboarding viram **mockups ilustrativos** no case).
