INSERT INTO advogados (id, nome, cpf, senha, role, numero_oab, seccional)
SELECT
    '123e4567-e89b-12d3-a456-426614174000',
    'Admin do Sistema',
    '00000000000',
    '$2a$10$GzxMbubpJWsi6FoWL1Wrau1A8/91mxzQryRZ7ndKXHgSBoCs7dJOS', -- Senha: 123
    'ADMIN',
    '000000',
    'SP'
    WHERE NOT EXISTS (SELECT 1 FROM advogados WHERE cpf = '00000000000');