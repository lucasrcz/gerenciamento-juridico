INSERT INTO advogados (
    id,
    nome,
    cpf,
    email,
    telefone,
    senha,
    role,
    numero_oab,
    seccional,
    ativo
)
SELECT
    '123e4567-e89b-12d3-a456-426614174000',
    'Admin do Sistema',
    '00000000000',
    'admin@juris.com.br',
    '11999990000',
    '$2a$10$GzxMbubpJWsi6FoWL1Wrau1A8/91mxzQryRZ7ndKXHgSBoCs7dJOS', -- Senha: 123
    'ADMIN',
    '000000',
    'SP',
    TRUE
    WHERE NOT EXISTS (
    SELECT 1 FROM advogados WHERE cpf = '00000000000'
);

-- ADVOGADOS
INSERT INTO advogados (id, cpf, senha, role, numero_oab, seccional, nome, email, telefone, ativo) VALUES
('11111111-1111-1111-1111-111111111111', '111.111.111-11', 'senha1', 'USER', 'OAB1111', 'SP', 'Advogado 1', 'adv1@email.com', '11999990001', TRUE),
('22222222-2222-2222-2222-222222222222', '222.222.222-22', 'senha2', 'USER', 'OAB2222', 'RJ', 'Advogado 2', 'adv2@email.com', '21999990002', TRUE),
('33333333-3333-3333-3333-333333333333', '333.333.333-33', 'senha3', 'USER', 'OAB3333', 'MG', 'Advogado 3', 'adv3@email.com', '31999990003', TRUE),
('44444444-4444-4444-4444-444444444444', '444.444.444-44', 'senha4', 'USER', 'OAB4444', 'RS', 'Advogado 4', 'adv4@email.com', '51999990004', TRUE),
('55555555-5555-5555-5555-555555555555', '555.555.555-55', 'senha5', 'USER', 'OAB5555', 'PR', 'Advogado 5', 'adv5@email.com', '41999990005', TRUE),
('66666666-6666-6666-6666-666666666666', '666.666.666-66', 'senha6', 'USER', 'OAB6666', 'SC', 'Advogado 6', 'adv6@email.com', '47999990006', TRUE),
('77777777-7777-7777-7777-777777777777', '777.777.777-77', 'senha7', 'USER', 'OAB7777', 'BA', 'Advogado 7', 'adv7@email.com', '71999990007', TRUE),
('88888888-8888-8888-8888-888888888888', '888.888.888-88', 'senha8', 'USER', 'OAB8888', 'PE', 'Advogado 8', 'adv8@email.com', '81999990008', TRUE),
('99999999-9999-9999-9999-999999999999', '999.999.999-99', 'senha9', 'USER', 'OAB9999', 'GO', 'Advogado 9', 'adv9@email.com', '62999990009', TRUE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '000.000.000-00', 'senha10', 'USER', 'OAB0000', 'DF', 'Advogado 10', 'adv10@email.com', '61999990010', TRUE);

-- ENDEREÇOS
INSERT INTO enderecos (logradouro, numero, complemento, bairro, cidade, estado, cep) VALUES
('Rua A', '100', 'Apto 1', 'Centro', 'São Paulo', 'SP', '01000-000'),
('Rua B', '200', 'Casa', 'Bairro B', 'Rio de Janeiro', 'RJ', '20000-000'),
('Rua C', '300', NULL, 'Bairro C', 'Belo Horizonte', 'MG', '30000-000'),
('Rua D', '400', 'Bloco D', 'Bairro D', 'Porto Alegre', 'RS', '90000-000'),
('Rua E', '500', NULL, 'Bairro E', 'Curitiba', 'PR', '80000-000'),
('Rua F', '600', 'Apto 2', 'Bairro F', 'Florianópolis', 'SC', '88000-000'),
('Rua G', '700', NULL, 'Bairro G', 'Salvador', 'BA', '40000-000'),
('Rua H', '800', 'Casa', 'Bairro H', 'Recife', 'PE', '50000-000'),
('Rua I', '900', NULL, 'Bairro I', 'Goiânia', 'GO', '74000-000'),
('Rua J', '1000', 'Apto 3', 'Bairro J', 'Brasília', 'DF', '70000-000');

-- PARTES
INSERT INTO partes (nome, tipo_pessoa, documento, email, telefone, observacoes, endereco_id) VALUES
('Parte 1', 'FISICA', '123.456.789-01', 'parte1@email.com', '11988880001', 'Observação 1', 1),
('Parte 2', 'JURIDICA', '12.345.678/0001-02', 'parte2@email.com', '21988880002', 'Observação 2', 2),
('Parte 3', 'FISICA', '234.567.890-12', 'parte3@email.com', '31988880003', NULL, 3),
('Parte 4', 'JURIDICA', '23.456.789/0001-03', 'parte4@email.com', '51988880004', NULL, 4),
('Parte 5', 'FISICA', '345.678.901-23', 'parte5@email.com', '41988880005', 'Observação 5', 5),
('Parte 6', 'JURIDICA', '34.567.890/0001-04', 'parte6@email.com', '47988880006', NULL, 6),
('Parte 7', 'FISICA', '456.789.012-34', 'parte7@email.com', '71988880007', NULL, 7),
('Parte 8', 'JURIDICA', '45.678.901/0001-05', 'parte8@email.com', '81988880008', 'Observação 8', 8),
('Parte 9', 'FISICA', '567.890.123-45', 'parte9@email.com', '62988880009', NULL, 9),
('Parte 10', 'JURIDICA', '56.789.012/0001-06', 'parte10@email.com', '61988880010', NULL, 10);

-- PROCESSOS
INSERT INTO processos (numero, status, observacoes, estado, advogado_responsavel_id) VALUES
('PROC0001', 'ARQUIVADO', 'Processo 1', 'SP', '11111111-1111-1111-1111-111111111111'),
('PROC0002', 'ARQUIVADO', 'Processo 2', 'RJ', '22222222-2222-2222-2222-222222222222'),
('PROC0003', 'EM_ANDAMENTO', 'Processo 3', 'MG', '33333333-3333-3333-3333-333333333333'),
('PROC0004', 'EM_ANDAMENTO', 'Processo 4', 'RS', '44444444-4444-4444-4444-444444444444'),
('PROC0005', 'EM_ANDAMENTO', 'Processo 5', 'PR', '55555555-5555-5555-5555-555555555555'),
('PROC0006', 'EM_ANDAMENTO', 'Processo 6', 'SC', '66666666-6666-6666-6666-666666666666'),
('PROC0007', 'FINALIZADO', 'Processo 7', 'BA', '77777777-7777-7777-7777-777777777777'),
('PROC0008', 'FINALIZADO', 'Processo 8', 'PE', '88888888-8888-8888-8888-888888888888'),
('PROC0009', 'FINALIZADO', 'Processo 9', 'GO', '99999999-9999-9999-9999-999999999999'),
('PROC0010', 'ARQUIVADO', 'Processo 10', 'DF', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

