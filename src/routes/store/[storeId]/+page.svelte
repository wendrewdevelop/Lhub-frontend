<script>
    import { writable, derived } from 'svelte/store';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { page } from '$app/state';
    import { invalidate, goto } from '$app/navigation';
    import { slide, fade } from 'svelte/transition';
    import { v4 as uuidv4 } from "uuid";


    export let data; // Recebe os dados do servidor
    let uuid = "";
    // Estado inicial
    let loading = true;
    let error = null;
    let storeExists = true;
    // Stores
    const produtos = writable([]);
    export const selectedProduct = writable(null);
    const filters = writable({
        open: false,
        searchQuery: '',
        category: 'all',
        minPrice: 0,
        maxPrice: 1000
    });
    const cart = writable({
        items: [],
        subtotal: 0,
        taxa: 3.5,
        total: 0,
        open: false
    });
    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };
    const addToCart = (item) => {
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
    const calculateTotals = (state) => {
        state.subtotal = state.items.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
        state.total = state.subtotal + state.taxa;
        return state;
    };
    const updateQuantity = (itemId, delta) => {
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
    const removeItem = (itemId) => {
        cart.update(prev => {
            prev.items = prev.items.filter(i => i.id !== itemId);
            return calculateTotals(prev);
        });
    };

    // Atualize a função calculateTotals para ser reativa
    cart.subscribe(state => {
        calculateTotals(state);
    });

    // Store derivada para filtragem
    const produtosFiltrados = derived(
        [produtos, filters],
        ([$produtos, $filters]) => {
            return $produtos.filter(produto => {
                const searchQuery = $filters.searchQuery.toLowerCase();
                return (
                    searchQuery === '' ||
                    produto.nome.toLowerCase().includes(searchQuery) ||
                    produto.descricao.toLowerCase().includes(searchQuery)
                ) && (
                    $filters.category === 'all' ||
                    produto.categoria === $filters.category
                ) && (
                    produto.preco >= $filters.minPrice &&
                    produto.preco <= $filters.maxPrice
                );
            });
        }
    );

    const loadProducts = async () => {
        if (browser) {
            try {
                if (!browser) return;
                const regex = /[0-9a-fA-F-]{36}/;
                const store_id = window.location.pathname.match(regex);
                if (!store_id) {
                    console.log('Erro ao obter o store_id da URL.');
                }
                
                const response = await fetch(
                    `http://127.0.0.1:8000/api/products?store_id=${store_id}`);

                if (!response.ok) throw new Error('Falha ao carregar produtos');
                
                const products = await response.json();
                
                const productsData = Array.isArray(products) ? products : [];

                produtos.set(productsData.map(item => ({
                    id: item.id,
                    nome: item.name || 'Sem nome',
                    preco: item.price ? Number(item.price) : 0,
                    descricao: item.description || 'Sem descrição',
                    detalhes: item.details || '',
                    categoria: item.category || 'sem-categoria',
                    tempo: item.preparation_time || 'N/A',
                    ingredientes: Array.isArray(item.tags) ? item.tags : []
                })));

            } catch (err) {
                error = err.message;
                produtos.set([]);
            } finally {
                loading = false;
            }
        }
    };

    onMount(async () => {
        await loadProducts();
        // iniciarCheckout();
        invalidate('load:products');
    });

    const iniciarCheckout = () => {
        const regex = /[0-9a-fA-F-]{36}/;
        const store_id = window.location.pathname.match(regex);
        const checkout_id = uuidv4(); // Gera UUID único
        goto(`/checkout/${store_id}/${checkout_id}`);
    };
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
                    on:click={() => filters.open = !filters.open}
                    class="p-2 text-cyan-900 hover:bg-cyan-50 rounded-lg"
                >
                    <i class="fas fa-sliders-h text-lg"></i>
                </button>

                <!-- Campo de Busca -->
                <div class="flex-1 max-w-2xl relative">
                    <input
                        type="text"
                        bind:value={filters.searchQuery}
                        placeholder="Buscar produtos..."
                        class="w-full px-5 py-3 rounded-xl bg-zinc-100 border-2 border-transparent focus:border-cyan-300 focus:bg-white transition-all"
                    />
                    <button class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-cyan-900">
                        <i class="fas fa-search"></i>
                    </button>
                </div>

                <!-- Carrinho -->
                <button on:click={() => $cart.open = true}>
                    Carrinho ({$cart.items.length})
                </button>
            </div>
        </div>
    </header>

    <!-- Filtros Avançados -->
    {#if filters.open}
        <div transition:fade class="max-w-7xl mx-auto px-4 lg:px-8 py-4 bg-white border-y">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-medium text-cyan-900 mb-2">Categoria</label>
                    <select 
                        bind:value={filters.category}
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
                            bind:value={filters.minPrice}
                            class="w-1/2 px-3 py-2 border border-zinc-200 rounded-lg"
                            placeholder="Mínimo"
                        >
                        <span class="text-zinc-400">-</span>
                        <input 
                            type="number" 
                            bind:value={filters.maxPrice}
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
        {#if !storeExists}
            <div class="error-message">
                Loja não encontrada
            </div>
        {:else if error}
            <div class="error-message">
                {error}
            </div>
        {:else if loading}
            <div class="loading-indicator">
                Carregando...
            </div>
        {:else if $produtos.length === 0}
            <div class="text-center py-12 text-zinc-400">
                <i class="fas fa-store-slash text-3xl mb-4"></i>
                <p>Esta loja não possui produtos cadastrados</p>
            </div>
        {:else}
            <!-- Seu grid de produtos aqui -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each $produtosFiltrados as produto}
                    <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                        <img 
                            src={produto.imagem} 
                            alt={produto.nome}
                            class="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <h3 class="text-lg font-semibold text-cyan-900 mb-2">{produto.nome}</h3>
                        <p class="text-zinc-600 text-sm mb-4">{produto.descricao}</p>
                        
                        <div class="flex justify-between items-center">
                            <span class="text-lg font-bold text-cyan-900">
                                {formatarMoeda(produto.preco)}
                            </span>
                            <button 
                                on:click={() => addToCart(produto)}
                                class="bg-cyan-900 text-white px-4 py-2 rounded-lg hover:bg-cyan-800"
                            >
                                <i class="fas fa-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
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
    {#if $cart.open}
        <!-- Carrinho Lateral -->
        <div 
            transition:fade
            class="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            on:click|self={() => $cart.open = false}
        >
            <div 
                transition:slide={{ duration: 300, direction: 'right', x: 1000 }}
                class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
            >
                <div class="p-6 h-full flex flex-col">
                    <!-- Cabeçalho -->
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-semibold">Seu Carrinho</h3>
                        <button 
                            on:click={() => $cart.open = false}
                            class="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <i class="fas fa-times text-lg"></i>
                        </button>
                    </div>

                    <div class="flex-1 overflow-y-auto space-y-4">
                        {#each $cart.items as item (item.id)}
                            <div class="flex gap-4 border-b pb-4">
                                <img 
                                    src={item.imagem} 
                                    alt={item.nome} 
                                    class="w-20 h-20 object-cover rounded-lg"
                                />
                                <div class="flex-1">
                                    <h4 class="font-medium">{item.nome}</h4>
                                    <div class="flex items-center gap-2 mt-2">
                                        <button 
                                            on:click={() => updateQuantity(item.id, -1)}
                                            class="px-2 py-1 bg-gray-100 rounded"
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            on:click={() => updateQuantity(item.id, 1)}
                                            class="px-2 py-1 bg-gray-100 rounded"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-medium">{formatarMoeda(item.preco * item.quantity)}</p>
                                    <button 
                                        on:click={() => removeItem(item.id)}
                                        class="text-red-500 text-sm mt-1 hover:text-red-700"
                                    >
                                        Remover
                                    </button>
                                </div>
                            </div>
                        {:else}
                            <p class="text-gray-500 text-center py-8">Carrinho vazio</p>
                        {/each}
                    </div>

                    <div class="border-t pt-4">
                        <div class="space-y-2 mb-6">
                            <div class="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatarMoeda($cart.subtotal)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Taxa:</span>
                                <span>{formatarMoeda($cart.taxa)}</span>
                            </div>
                            <div class="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>{formatarMoeda($cart.total)}</span>
                            </div>
                        </div>
                        
                        <button 
                        on:click={iniciarCheckout}
                        class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                        >
                        Finalizar Compra
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
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