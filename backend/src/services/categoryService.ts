import { categoryRepository } from '../repositories/categoryRepository';

export const categoryService = {
  async getAllCategories() {
    return categoryRepository.findAll();
  },

  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error('Category not found');
    return category;
  },

  async createCategory(name: string) {
    if (!name || name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    return categoryRepository.create(name.trim());
  },

  async updateCategory(id: string, name: string) {
    if (!name || name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    const updated = await categoryRepository.update(id, name.trim());
    if (!updated) throw new Error('Category not found');
    return updated;
  },

  async deleteCategory(id: string) {
    return categoryRepository.delete(id);
  }
};
