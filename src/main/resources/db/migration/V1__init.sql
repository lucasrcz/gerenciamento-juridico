-- 1. Tabela: Advogados
-- Esta tabela é criada primeiro pois não depende de chaves estrangeiras,
-- mas é chave estrangeira para Processos.
CREATE TABLE advogados (
                           id UUID NOT NULL,
                           cpf VARCHAR(18) NOT NULL,
                           senha VARCHAR(100) NOT NULL,
                           role VARCHAR(255) NOT NULL,
                           numero_oab VARCHAR(10) NOT NULL,
                           seccional VARCHAR(2) NOT NULL,
                           nome VARCHAR(150) NOT NULL,
                           email VARCHAR(150) NOT NULL,
                           telefone VARCHAR(20),
                           ativo BOOLEAN DEFAULT TRUE NOT NULL,

                           PRIMARY KEY (id)
);

-- Constraints únicas definidas na entidade Advogado
ALTER TABLE advogados ADD CONSTRAINT uk_advogado_cpf UNIQUE (cpf);
ALTER TABLE advogados ADD CONSTRAINT uk_advogado_email UNIQUE (email);
ALTER TABLE advogados ADD CONSTRAINT uk_advogado_oab_seccional UNIQUE (numero_oab, seccional);


-- 2. Tabela: Endereços
-- Criada antes de Partes, pois Partes possui a FK para Endereço.
CREATE TABLE enderecos (
                           id BIGSERIAL NOT NULL,
                           logradouro VARCHAR(150) NOT NULL,
                           numero VARCHAR(20),
                           complemento VARCHAR(100),
                           bairro VARCHAR(100),
                           cidade VARCHAR(100) NOT NULL,
                           estado VARCHAR(2) NOT NULL,
                           cep VARCHAR(9),

                           PRIMARY KEY (id)
);


-- 3. Tabela: Partes
-- Depende da tabela Endereços.
CREATE TABLE partes (
                        id BIGSERIAL NOT NULL,
                        nome VARCHAR(150) NOT NULL,
                        tipo_pessoa VARCHAR(255) NOT NULL,
                        documento VARCHAR(18),
                        email VARCHAR(150),
                        telefone VARCHAR(20),
                        observacoes TEXT,
                        endereco_id BIGINT NOT NULL,

                        PRIMARY KEY (id),
                        CONSTRAINT fk_partes_endereco FOREIGN KEY (endereco_id) REFERENCES enderecos (id)
);

-- Constraint para garantir OneToOne entre Parte e Endereço
ALTER TABLE partes ADD CONSTRAINT uk_partes_endereco UNIQUE (endereco_id);


-- 4. Tabela: Processos
-- Depende da tabela Advogados.
CREATE TABLE processos (
                           id BIGSERIAL NOT NULL,
                           numero VARCHAR(25) NOT NULL,
                           status VARCHAR(30) NOT NULL,
                           observacoes TEXT,
                           estado VARCHAR(2) NOT NULL,
                           advogado_responsavel_id UUID NOT NULL,

                           PRIMARY KEY (id),
                           CONSTRAINT fk_processos_advogado_responsavel FOREIGN KEY (advogado_responsavel_id) REFERENCES advogados (id)
);

ALTER TABLE processos ADD CONSTRAINT uk_processo_numero UNIQUE (numero);


-- 5. Tabela: Processos_Contratos (Entidade Contrato)
-- Mapeada explicitamente como "processos_contratos". Depende de Processos.
CREATE TABLE processos_contratos (
                                     id BIGSERIAL NOT NULL,
                                     nome VARCHAR(255) NOT NULL,
                                     dados BYTEA NOT NULL,
                                     processo_id BIGINT NOT NULL,

                                     PRIMARY KEY (id),
                                     CONSTRAINT fk_contratos_processo FOREIGN KEY (processo_id) REFERENCES processos (id)
);

ALTER TABLE processos_contratos ADD CONSTRAINT uk_contrato_processo UNIQUE (processo_id);


-- 6. Tabela: Documento
-- A entidade não possuía anotação @Table, assumindo "documento". Depende de Processos.
CREATE TABLE documento (
                           id BIGSERIAL NOT NULL,
                           nome VARCHAR(255) NOT NULL,
                           arquivo BYTEA NOT NULL,
                           data_criacao TIMESTAMP NOT NULL,
                           formato_arquivo VARCHAR(255),
                           descricao VARCHAR(255),
                           processo_id BIGINT,

                           PRIMARY KEY (id),
                           CONSTRAINT fk_documento_processo FOREIGN KEY (processo_id) REFERENCES processos (id)
);


-- 7. Tabela: Prazos
-- Depende de Processos.
CREATE TABLE prazos (
                        id BIGSERIAL NOT NULL,
                        data_vencimento DATE NOT NULL,
                        descricao VARCHAR(255),
                        processo_id BIGINT,

                        PRIMARY KEY (id),
                        CONSTRAINT fk_prazos_processo
                            FOREIGN KEY (processo_id) REFERENCES processos (id)
);


-- 8. Tabela: Processo_Advogado (Join Table ManyToMany)
-- Tabela de junção entre Processos e Advogados (lista de advogados no processo).
CREATE TABLE processo_advogado (
                                   processo_id BIGINT NOT NULL,
                                   advogado_id UUID NOT NULL,

                                   CONSTRAINT fk_pa_processo FOREIGN KEY (processo_id) REFERENCES processos (id),
                                   CONSTRAINT fk_pa_advogado FOREIGN KEY (advogado_id) REFERENCES advogados (id)
);


-- 9. Tabela: Processo_Partes
-- Entidade de relacionamento com atributos extras entre Processo e Partes.
CREATE TABLE processo_partes (
                                 id BIGSERIAL NOT NULL,
                                 processo_id BIGINT NOT NULL,
                                 parte_id BIGINT NOT NULL,
                                 tipo_parte VARCHAR(255) NOT NULL,
                                 observacoes TEXT,

                                 PRIMARY KEY (id),
                                 CONSTRAINT fk_pp_processo FOREIGN KEY (processo_id) REFERENCES processos (id),
                                 CONSTRAINT fk_pp_parte FOREIGN KEY (parte_id) REFERENCES partes (id)
);