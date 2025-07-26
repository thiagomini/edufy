Funcionalidade: Cadastro de Usuário

    Como um novo usuário
    Eu quero me cadastrar no sistema Edufy
    Para que eu possa acessar a plataforma

    Cenário: Cadastro bem-sucedido com dados válidos
        Dado que o email "john@mail.com" não está cadastrado
        Quando eu preencho o formulário de cadastro com:
            | Nome     | Email          | Senha     |
            | John Doe | john@mail.com  | senha123  |
        Então eu devo ver uma mensagem de sucesso "Cadastro realizado com sucesso"

    Cenário: Cadastro falha com email já cadastrado
        Dado que o email "john@mail.com" já está cadastrado
        Quando eu preencho o formulário de cadastro com:
            | Nome     | Email          | Senha     |
            | John Doe | john@mail.com  | senha123  |
        Então eu devo ver uma mensagem de erro "Email já cadastrado"

    Cenário: Cadastro falha com senha fraca
        Dado que o email "john@mail.com" não está cadastrado
        Quando eu preencho o formulário de cadastro com:
            | Nome     | Email          | Senha     |
            | John Doe | john@mail.com  | 123       |
        Então eu devo ver uma mensagem de erro "Senha fraca"

    Cenário: Cadastro falha com email inválido
        Quando eu preencho o formulário de cadastro com:
            | Nome     | Email          | Senha     |
            | John Doe | johnmail.com   | senha123  |
        Então eu devo ver uma mensagem de erro "Email inválido"

    Cenário: Cadastro falha com nome em branco
        Quando eu preencho o formulário de cadastro com:
            | Nome     | Email          | Senha     |
            |          | john@mail.com  | senha123  |
        Então eu devo ver uma mensagem de erro "Alguns campos são inválidos - preencha-os corretamente"

    Cenário: Cadastro falha com campos obrigatórios em branco
        Quando eu preencho o formulário de cadastro com:
            | Nome     | Email          | Senha     |
            |          |                |           |
        Então eu devo ver uma mensagem de erro "Alguns campos são inválidos - preencha-os corretamente"
