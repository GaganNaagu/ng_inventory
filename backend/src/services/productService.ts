import { productRepository } from '../repositories/productRepository';

export const productService = {
  async getAllProducts(filters: { search?: string; category_id?: string; low_stock?: boolean }) {
    return productRepository.findAll(filters);
  },

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  async createProduct(data: {
    name: string; sku: string; description?: string;
    price: number; quantity: number; reorder_threshold: number;
    category_id?: string; expiry_date?: string;
  }) {
    if (!data.name || !data.sku) throw new Error('Name and SKU are required');
    if (data.price < 0) throw new Error('Price must be non-negative');
    if (data.quantity < 0) throw new Error('Quantity must be non-negative');
    return productRepository.create(data);
  },

  async updateProduct(id: string, data: any) {
    const updated = await productRepository.update(id, data);
    if (!updated) throw new Error('Product not found');
    return updated;
  },

  async deleteProduct(id: string) {
    const deleted = await productRepository.delete(id);
    if (!deleted) throw new Error('Product not found');
    return deleted;
  }
};
