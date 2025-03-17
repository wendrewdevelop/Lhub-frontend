import { writable } from 'svelte/store';

export const cart = writable({
    items: [],
    subtotal: 0,
    taxa: 3.5,
    total: 0,
    open: false
});

export const calculateTotals = (state) => {
    state.subtotal = state.items.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
    state.total = Number((state.subtotal + state.taxa).toFixed(2));
    return state;
};

export const addToCart = (item) => {
    cart.update(prev => {
        const existing = prev.items.find(i => i.id === item.id);
        if (existing) {
            existing.quantity++;
        } else {
            prev.items.push({ ...item, quantity: 1 });
        }
        return calculateTotals(prev);
    });
};

export const updateQuantity = (itemId, delta) => {
    cart.update(prev => {
        const item = prev.items.find(i => i.id === itemId);
        if (item) {
            item.quantity += delta;
            if (item.quantity < 1) {
                prev.items = prev.items.filter(i => i.id !== itemId);
            }
        }
        return calculateTotals(prev);
    });
};

export const removeItem = (itemId) => {
    cart.update(prev => {
        prev.items = prev.items.filter(i => i.id !== itemId);
        return calculateTotals(prev);
    });
};

// Atualização automática dos totais
cart.subscribe(state => {
    calculateTotals(state);
});