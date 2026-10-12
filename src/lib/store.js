import { create } from 'zustand';

export const useStore = create((set) => ({
  currentStep: 1,
  selectedProduct: null,
  selectedColor: null,
  selectedSize: null,
  frontDesign: null,
  backDesign: null,
  cart: [],

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setSelectedSize: (size) => set({ selectedSize: size }),
  setFrontDesign: (design) => set({ frontDesign: design }),
  setBackDesign: (design) => set({ backDesign: design }),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== id),
  })),

  updateQuantity: (id, quantity) => set((state) => ({
    cart: state.cart.map((item) => item.id === id ? { ...item, quantity } : item),
  })),

  clearCart: () => set({ cart: [] }),

  addItemToCart: (item) => set((state) => ({
    cart: [...state.cart, {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      price: item.productType.basePrice,
    }],
  })),

  addToCart: (customization = {}) => set((state) => {
    if (!state.selectedProduct || !state.selectedColor || !state.selectedSize) return state;

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      productType: state.selectedProduct,
      color: state.selectedColor,
      size: state.selectedSize,
      frontDesign: state.frontDesign,
      backDesign: state.backDesign,
      tshirtType: customization.tshirtType || null,
      mockupFrontImage: customization.mockupFrontImage || state.selectedProduct.image,
      mockupBackImage: customization.mockupBackImage || state.selectedProduct.backImage || state.selectedProduct.image,
      quantity: 1,
      price: state.selectedProduct.basePrice,
    };

    return {
      cart: [...state.cart, newItem],
      currentStep: 1,
      selectedProduct: null,
      selectedColor: null,
      selectedSize: null,
      frontDesign: null,
      backDesign: null,
    };
  }),

  resetCustomizer: () => set({
    currentStep: 1,
    selectedProduct: null,
    selectedColor: null,
    selectedSize: null,
    frontDesign: null,
    backDesign: null,
  }),
}));
