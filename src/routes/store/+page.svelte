<script>
    import { slide, fade } from 'svelte/transition';
    import { writable } from 'svelte/store';

    export const selectedProduct = writable(null);
    export const cartOpen = writable(false);

    // Dados dos produtos
    const produtos = [
        {
            id: 1,
            nome: 'Experiência Nebula',
            preco: 299,
            descricao: 'Jantar multidimensional com realidade aumentada',
            detalhes: '5 pratos temáticos • Acompanhamento de sombras • Pairing de bebidas alienígenas',
            imagem: 'https://source.unsplash.com/random/800x600?cuisine,1',
            categoria: 'premium',
            tempo: '90-120 min',
            ingredientes: ['Tecnologia 5D', 'Sabores Exóticos', 'Interação IA']
        },
        // ... mais produtos
    ];

    let carrinhoAberto = false;
    let itemEmDestaque = null;

  // Funções do carrinho
    const formatarMoeda = (valor) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

    const createCart = () => {
        const initialState = {
            items: [],
            subtotal: 0,
            taxa: 3.5,
            total: 0,
            open: false  // add open property
        };

        const { subscribe, update, set } = writable(initialState);

        return {
            subscribe,
            addItem: (item) => {
            update(state => {
                const existing = state.items.find(i => i.id === item.id);
                const newItems = [...state.items];
                if (existing) {
                existing.quantity += 1;
                } else {
                newItems.push({ ...item, quantity: 1 });
                }
                return calculateTotals({ ...state, items: newItems });
            });
            },
            updateQuantity: (id, delta) => {
            update(state => {
                const newItems = state.items.map(item => {
                if (item.id === id) {
                    return { ...item, quantity: Math.max(1, item.quantity + delta) };
                }
                return item;
                });
                return calculateTotals({ ...state, items: newItems });
            });
            },
            removeItem: (id) => {
            update(state => {
                const newItems = state.items.filter(item => item.id !== id);
                return calculateTotals({ ...state, items: newItems });
            });
            },
            // Add a method to toggle the open state
            toggleOpen: () => update(state => ({ ...state, open: !state.open })),
            // Also expose the set method so Svelte's $cart assignments work
            set
        };
    };
    export const cart = createCart();

    export const filters = writable({
        open: false,
        searchQuery: '',
        category: 'all',
        minPrice: 0,
        maxPrice: 1000
    });

  // Função auxiliar imutável
    const calculateTotals = (state) => {
        const subtotal = state.items.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
        const total = subtotal + state.taxa;
        
        return {
            ...state,
            subtotal,
            total
        };
    };

    $: produtosFiltrados = produtos.filter(produto => {
        const searchQuery = $filters.searchQuery.toLowerCase();
        const matchesSearch = searchQuery === '' || 
            produto.nome.toLowerCase().includes(searchQuery) ||
            produto.descricao.toLowerCase().includes(searchQuery);
        
        const matchesCategory = $filters.category === 'all' || 
            produto.categoria === $filters.category;
        
        const matchesPrice = produto.preco >= $filters.minPrice && 
            produto.preco <= $filters.maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
    });

    
</script>

<svelte:head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-zinc-50 to-cyan-50 font-[Satoshi]">
    <!-- Header Aprimorado -->
    <header class="sticky top-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 lg:px-8 py-3">
            <div class="flex items-center justify-between gap-4">
                <!-- Botão Filtros -->
                <button
                    on:click={() => $filters.open = !$filters.open}
                    class="p-2 text-cyan-900 hover:bg-cyan-50 rounded-lg"
                >
                    <i class="fas fa-sliders-h text-lg"></i>
                </button>

                <!-- Campo de Busca -->
                <div class="flex-1 max-w-2xl relative">
                    <input
                        type="text"
                        bind:value={$filters.searchQuery}
                        placeholder="Buscar produtos..."
                        class="w-full px-5 py-3 rounded-xl bg-zinc-100 border-2 border-transparent focus:border-cyan-300 focus:bg-white transition-all"
                    />
                    <button class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-cyan-900">
                        <i class="fas fa-search"></i>
                    </button>
                </div>

                <!-- Carrinho -->
                <button 
                    on:click={() => $cart.open = !$cart.open}
                    class="relative p-2 text-cyan-900 hover:bg-cyan-50 rounded-lg"
                >
                    <i class="fas fa-shopping-basket text-lg"></i>
                    {#if $cart.items.length > 0}
                        <span class="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {$cart.items.length}
                        </span>
                    {/if}
                </button>
            </div>
        </div>
    </header>

    <!-- Filtros Avançados -->
    {#if $filters.open}
        <div transition:fade class="max-w-7xl mx-auto px-4 lg:px-8 py-4 bg-white border-y">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-medium text-cyan-900 mb-2">Categoria</label>
                    <select 
                        bind:value={$filters.category}
                        class="w-full px-4 py-2 rounded-lg border border-zinc-200 bg-white"
                    >
                        <option value="all">Todas</option>
                        <option value="premium">Premium</option>
                        <option value="vegetariano">Vegetariano</option>
                        <option value="fusion">Fusão</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-cyan-900 mb-2">Faixa de Preço</label>
                    <div class="flex items-center gap-4">
                        <input 
                            type="number" 
                            bind:value={$filters.minPrice}
                            class="w-1/2 px-3 py-2 border border-zinc-200 rounded-lg"
                            placeholder="Mínimo"
                        >
                        <span class="text-zinc-400">-</span>
                        <input 
                            type="number" 
                            bind:value={$filters.maxPrice}
                            class="w-1/2 px-3 py-2 border border-zinc-200 rounded-lg"
                            placeholder="Máximo"
                        >
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Grid de Produtos -->
    <main class="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <!-- Carrinho Lateral -->
        {#if $cart.open}
        <aside 
            transition:slide={{ duration: 300, y: 300 }}
            class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
        >
            <div class="p-6 border-b flex items-center justify-between">
                <h2 class="text-2xl font-bold text-cyan-900">Seu Carrinho</h2>
                <button 
                    on:click={() => cart.toggleOpen()}
                    class="text-zinc-400 hover:text-cyan-900"
                >
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-6">
                {#each $cart.items as item (item.id)}
                    <div class="flex gap-4 group">
                        <div class="w-24 h-24 rounded-xl overflow-hidden">
                            <img 
                                src={item.imagem} 
                                alt={item.nome}
                                class="w-full h-full object-cover"
                            />
                        </div>
                        
                        <div class="flex-1">
                            <h3 class="font-semibold text-cyan-900 mb-1">{item.nome}</h3>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <button 
                                        on:click={() => cart.updateQuantity(item.id, -1)}
                                        class="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-cyan-100 text-cyan-900"
                                    >
                                        -
                                    </button>
                                    <span class="font-medium">{item.quantity}</span>
                                    <button 
                                        on:click={() => cart.updateQuantity(item.id, 1)}
                                        class="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-cyan-100 text-cyan-900"
                                    >
                                        +
                                    </button>
                                </div>
                                <div class="space-x-4">
                                    <span class="font-bold text-cyan-900">
                                        {formatarMoeda(item.preco * item.quantity)}
                                    </span>
                                    <button 
                                        on:click={() => cart.removeItem(item.id)}
                                        class="text-rose-500 hover:text-rose-700"
                                    >
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                {:else}
                    <div class="text-center py-12 text-zinc-400">
                        <i class="fas fa-shopping-basket text-4xl mb-4"></i>
                        <p>Seu carrinho está vazio</p>
                    </div>
                {/each}
            </div>

            <div class="p-6 border-t bg-zinc-50">
                <div class="space-y-4 mb-6">
                    <div class="flex justify-between">
                        <span>Subtotal</span>
                        <span class="font-bold">{formatarMoeda($cart.subtotal)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Taxa de Serviço</span>
                        <span class="font-bold">{formatarMoeda($cart.taxa)}</span>
                    </div>
                    <div class="flex justify-between text-xl font-bold text-cyan-900">
                        <span>Total</span>
                        <span>{formatarMoeda($cart.total)}</span>
                    </div>
                </div>
                <button class="w-full bg-cyan-900 text-white py-4 rounded-xl hover:bg-cyan-800 transition-colors">
                    Finalizar Pedido
                </button>
            </div>
        </aside>
        {/if}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each produtosFiltrados as produto}
                <article 
                    on:click={() => selectedProduct.set(produto)}
                    class="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                >
                    <div class="relative aspect-video">
                        <img 
                            src={produto.imagem} 
                            alt={produto.nome}
                            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-4">
                            <h3 class="text-white font-bold text-xl mb-2">{produto.nome}</h3>
                            <div class="flex gap-2 flex-wrap">
                                {#each produto.ingredientes as tag}
                                    <span class="px-2 py-1 bg-white/10 backdrop-blur-sm text-cyan-100 text-xs rounded-full">
                                        {tag}
                                    </span>
                                {/each}
                            </div>
                        </div>
                    </div>
                    
                    <div class="p-4">
                        <div class="flex justify-between items-start mb-4">
                            <div class="space-y-1">
                                <p class="text-cyan-900 font-bold text-lg">
                                    {formatarMoeda(produto.preco)}
                                </p>
                                <div class="flex items-center gap-2 text-zinc-500 text-sm">
                                    <i class="fas fa-clock"></i>
                                    <span>{produto.tempo}</span>
                                </div>
                            </div>
                            <button
                                on:click|stopPropagation={() => cart.addItem(produto)}
                                class="bg-cyan-900 text-white p-2 rounded-lg hover:bg-cyan-800 transition-colors"
                            >
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </article>
            {/each}
        </div>
        
    </main>

    <!-- Modal de Detalhes do Produto -->
    {#if $selectedProduct}
        <div 
            transition:fade
            class="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            on:click|self={() => $selectedProduct = null}
        >
            <div 
                transition:slide={{ duration: 300 }}
                class="max-w-2xl mx-auto bg-white rounded-2xl my-8 overflow-hidden"
            >
                <div class="relative">
                    <img 
                        src={$selectedProduct.imagem} 
                        alt={$selectedProduct.nome}
                        class="w-full h-96 object-cover"
                    />
                    <button 
                        on:click={() => $selectedProduct = null}
                        class="absolute top-4 right-4 bg-white/90 p-2 rounded-lg hover:bg-white"
                    >
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="p-6 space-y-4">
                    <h2 class="text-3xl font-bold text-cyan-900">{$selectedProduct.nome}</h2>
                    <div class="flex items-center gap-2 text-amber-500">
                        <i class="fas fa-star"></i>
                        <span class="font-medium">4.9</span>
                        <span class="text-zinc-400">•</span>
                        <span class="text-zinc-600">{$selectedProduct.tempo}</span>
                    </div>

                    <p class="text-zinc-700">{$selectedProduct.descricao}</p>

                    <div class="space-y-2">
                        <h3 class="text-lg font-semibold text-cyan-900">Características:</h3>
                        <div class="flex flex-wrap gap-2">
                            {#each $selectedProduct.ingredientes as ingrediente}
                                <span class="px-3 py-1 bg-cyan-100 text-cyan-900 rounded-full text-sm">
                                    {ingrediente}
                                </span>
                            {/each}
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-4">
                        <p class="text-2xl font-bold text-cyan-900">
                            {formatarMoeda($selectedProduct.preco)}
                        </p>
                        <button
                            on:click={() => {
                                cart.addItem($selectedProduct);
                                $selectedProduct = null;
                            }}
                            class="bg-cyan-900 text-white px-6 py-3 rounded-lg hover:bg-cyan-800 transition-colors"
                        >
                            Adicionar ao Experimento
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Carrinho Lateral (mantido do anterior) -->
</div>

<style>
    /* Adicionar no global.css */
:root {
    --color-cyan-900: #083344;
    --color-cyan-800: #155e75;
    --color-amber-400: #fbbf24;
}

.detail-modal {
    scrollbar-width: thin;
    scrollbar-color: var(--color-cyan-800) var(--color-cyan-100);
}

.detail-modal::-webkit-scrollbar {
    width: 8px;
}

.detail-modal::-webkit-scrollbar-track {
    background: var(--color-cyan-100);
}

.detail-modal::-webkit-scrollbar-thumb {
    background-color: var(--color-cyan-800);
    border-radius: 4px;
}
</style>