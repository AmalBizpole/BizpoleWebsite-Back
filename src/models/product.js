// In-memory Product model
let products = [];
let idCounter = 1;

module.exports = {
  getAll: () => products,
  getById: (id) => products.find(p => p.id === id),
  create: (product) => {
    const newProduct = { id: idCounter++, ...product };
    products.push(newProduct);
    return newProduct;
  },
  update: (id, updated) => {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updated };
    return products[idx];
  },
  delete: (id) => {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    products.splice(idx, 1);
    return true;
  }
};
