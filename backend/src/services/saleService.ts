import { saleRepository } from '../repositories/saleRepository';

export const saleService = {
  async checkout(userId: string, items: { productId: string; quantity: number }[]) {
    if (!items || items.length === 0) {
      throw new Error('Cart is empty. Cannot process sale.');
    }
    
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new Error('Invalid item data in cart.');
      }
    }

    return saleRepository.createSale(userId, items);
  },

  async getSalesHistory(limit?: number, offset?: number) {
    return saleRepository.getSales(limit, offset);
  },

  async getSaleById(saleId: string) {
    const sale = await saleRepository.getSaleDetails(saleId);
    if (!sale) throw new Error('Sale not found');
    return sale;
  }
};
