export const Colors = {
    primaryDark: '#2C2966',   // Azul Roxo Escuro (Títulos, Sidebar ativa)
    primaryDeep: '#131047',   // Azul Profundo (Sidebar fundo, Textos fortes)
    secondary:   '#6C6C94',   // Azul Acinzentado (Subtextos)
    accent:      '#FFA051',   // Laranja (Botão de Ação, Destaques)
    
    // Helpers
    white: '#FFFFFF',
    success: '#42976f',
    danger: '#c24c58',
    textLight: '#F8F9FA'
};

export const headerStyle = {
    color: Colors.primaryDark,
    borderColor: Colors.primaryDark,
    backgroundColor: '#f8f9fa',
    padding: '10px 15px',
    borderRadius: '8px',
    marginTop: '20px'
};

export const actionBtnStyle = {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    color: Colors.primaryDeep,
    fontWeight: 'bold'
};