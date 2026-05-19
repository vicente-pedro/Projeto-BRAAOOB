# Casos de uso — Sistema Agendo

Documento base: **Equipe05_DiagramaCasoUso.pdf**.

## Ator

- **Usuário**: pessoa que organiza suas tarefas no sistema.

## Casos de uso principais

| Caso de uso | Descrição | Requisitos |
|-------------|-----------|------------|
| Cadastrar tarefa | Incluir título, descrição, data, prioridade e opcionais (horário, categoria, recorrência) | RF01, RF06 |
| Editar tarefa | Alterar dados de uma tarefa existente | RF02 |
| Excluir tarefa | Remover tarefa do sistema | RF03 |
| Marcar tarefa como concluída | Alternar status ativo/concluído | RF04 |
| Listar tarefas | Ver tarefas do dia selecionado e visão mensal | RF05 |
| Filtrar tarefas | Por status (todas/ativas/concluídas) e prioridade | RF07 |
| Consultar calendário | Navegar semana/mês e selecionar data | RF05, RF06 |
| Mover tarefa no calendário | Arrastar tarefa não recorrente para outro dia | Extensão do RF02 |
| Visualizar timeline | Ver tarefas do dia ordenadas por horário | Extensão de RF05 |

## Fluxo resumido — Cadastrar tarefa

1. Usuário seleciona o dia no calendário.
2. Digita tarefa rápida **ou** abre o formulário completo.
3. Sistema valida título e data.
4. Sistema persiste no MySQL e atualiza a lista.

## Fluxo resumido — Concluir tarefa

1. Usuário marca o checkbox da tarefa.
2. Sistema atualiza `is_completed`.
3. Lista e contadores são atualizados.
