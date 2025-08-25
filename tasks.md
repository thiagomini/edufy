# TODO

- [x] Enviar um email ao criador de um ticket quando este é resolvido
- [x] Exibir o número de tickets resolvidos no perfil do usuário (agente de suporte)
- [x] Implementar a nova rota para criar um ticket de suporte: POST /support/client/tickets
- [x] Migrar a rota para resolver um ticket de suporte: POST /support/agent/tickets/:id/resolve
- [ ] Remover o endpoint antigo para resolver um ticket de suporte
- [ ] Realizar as adaptações na controller atual para não dependermos do UserRepository -> Client, Agente
