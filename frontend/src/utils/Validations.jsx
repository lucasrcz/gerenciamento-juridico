export const validarCPF = (cpf) => {
  // Remove tudo que não é dígito
  cpf = cpf.replace(/[^\d]+/g, '');

  // Verifica se tem 11 dígitos ou se todos são iguais (ex: 111.111.111-11)
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  // Validação do 1º Dígito
  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) {
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  // Validação do 2º Dígito
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};