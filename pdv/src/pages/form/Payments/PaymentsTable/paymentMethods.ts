 const paymentMethods = [
    "Verificar", "Pix", "Cartão de Débito", "Dinheiro",
    ...Array.from({ length: 10}, (_, i) => `Cartão de Crédito ${i + 1}x`),
    ...Array.from({length: 36}, (_, i) => `Crediário ${i + 1}x`)
 ];

 export default paymentMethods;