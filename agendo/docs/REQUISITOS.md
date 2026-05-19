# Rastreabilidade de Requisitos — Equipe 05

Documento base: **Equipe05_ListagemRequisitos.pdf** (Profª Ana Paula Muller Giancoli).

## Participantes

| Integrante | RA |
|------------|-----|
| Henrique Martinelli de Godoy | BP3062741 |
| Luiz Tozeti Costa | BP3061965 |
| Miguel Augusto de Oliveira | BP3061418 |
| Pedro Alcantara Meneses | BP3062791 |
| Pedro Pereira Vicente | BP3062716 |

## Requisitos funcionais

| ID | Requisito | Implementação no Agendo |
|----|-----------|-------------------------|
| RF01 | Cadastrar tarefas (título, descrição, data, prioridade) | Modal e adição rápida; campos `title`, `description`, `taskDate`, `priority` |
| RF02 | Editar tarefas | Modal **Editar Tarefa** + `PUT /api/tasks/:id` |
| RF03 | Excluir tarefas | Botão excluir + `DELETE /api/tasks/:id` |
| RF04 | Marcar como concluída | Checkbox na lista + `PATCH /api/tasks/:id` |
| RF05 | Listar tarefas | Lista no painel lateral e indicadores no calendário |
| RF06 | Definir prazos | Campo **Data** obrigatório (`task_date`) |
| RF07 | Filtrar por status, prioridade ou data | Filtros Todas/Ativas/Concluídas + prioridade; data via calendário |

## Requisitos não funcionais

| ID | Requisito | Atendimento |
|----|-----------|-------------|
| RNF01 | Resposta em até 2 s | API REST enxuta; consultas indexadas por data |
| RNF02 | Interface simples | Layout em cards, calendário e formulários guiados |
| RNF03 | Segurança com autenticação | *Planejado para evolução* (versão acadêmica sem login) |
| RNF04 | Navegadores modernos | React + Vite; Chrome, Edge, Firefox |
| RNF05 | Código estruturado | Pastas `frontend/`, `backend/`, `database/`, `docs/` |
| RNF06 | Disponibilidade 99% | Depende do deploy (local ou servidor) |

## Atributos de qualidade

Funcionalidade, confiabilidade, usabilidade, eficiência, manutenibilidade e portabilidade são contemplados na arquitetura em camadas (React, Express, MySQL).
