<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/auth';
  import { 
      Rocket,
      Package,
      ShoppingCart,
      Users,
      Settings,
      ChartLine,
      Plus,
      Bell,
      Save,
      StoreIcon
  } from "lucide-svelte";

  let products = [];
  let newProduct = {
    name: '',
    description: '',
    price: '',
    in_stock: true,
    qtd_in_stock: 1,
    ready_delivery: false
  };
  let storeId: string | null = null;

  onMount(async () => {
    // Dupla verificação (client-side)
    const token = localStorage.getItem('access_token');
    if (!token) goto('/signin');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/accounts/me/store', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const { has_store, store_id } = await response.json();
      if (!has_store) {
        goto('/create-store');
      } else {
        storeId = store_id;
        localStorage.setItem("store_id", storeId);
      }
    } catch (error) {
      goto('/signin');
    }
  });

  async function fetchProducts() {
    const token = localStorage.getItem('access_token');
    const account_id = localStorage.getItem('account_id');
    try {
      // Inclui o account_id como parâmetro de query
      const res = await fetch(`http://127.0.0.1:8000/api/products/?account_id=${account_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        products = await res.json();
      } else {
        console.error('Falha ao carregar produtos');
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  }

  async function addProduct() {
    const token = localStorage.getItem('access_token');
    const account_id = localStorage.getItem('account_id');
    try {
      const payload = { ...newProduct, account_id };
      const res = await fetch('http://127.0.0.1:8000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const product = await res.json();
        products = [...products, product];
        newProduct = { name: '', description: '', price: '', in_stock: true, qtd_in_stock: 1, ready_delivery: false };
      } else {
        console.error('Falha ao cadastrar produto');
      }
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
    }
  }

  onMount(() => {
    const token = localStorage.getItem('access_token');
    if (!token) goto('/signin');
    fetchProducts();
  });
</script>

<svelte:head>
    <title>LHub - Cadastro e Listagem de Produtos</title>
</svelte:head>

{#if auth}
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar + Main Content -->
    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 min-h-screen bg-white border-r border-gray-200">
        <div class="p-6">
          <div class="flex items-center space-x-2 mb-8">
            <Rocket class="w-6 h-6 text-blue-600" />
            <span class="text-xl font-semibold">LHub</span>
          </div>
          
          <nav class="space-y-2">
            <a href="#" class="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg">
              <ChartLine class="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a href="/home/orders/{storeId}" class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <ShoppingCart class="w-5 h-5" />
              <span>Pedidos</span>
            </a>
            <a href="/home/products/{storeId}" class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Package class="w-5 h-5" />
              <span>Produtos</span>
            </a>
            <a href="#" class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Users class="w-5 h-5" />
              <span>Clientes</span>
            </a>
            <a href="#" class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Settings class="w-5 h-5" />
              <span>Configurações</span>
            </a>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200">
          <div class="flex justify-between items-center px-6 py-4">
            <h1 class="text-xl font-semibold text-gray-900">Cadastro e Listagem de Produtos</h1>
            <div class="flex items-center space-x-4">
              <h3>
                <a href="/store/{storeId}" class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border" target="_blank">
                  <StoreIcon class="w-5 h-5 mr-2" />
                  Sua loja
                </a>
              </h3>
              <button class="p-2 text-gray-600 hover:bg-gray-50 rounded-full">
                <Bell class="w-5 h-5" />
              </button>
              <div class="w-8 h-8 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </header>

        <div class="p-6">
          <!-- Formulário de Cadastro de Produto -->
          <div class="mb-8 bg-white p-6 rounded-xl shadow-sm">
            <h2 class="text-lg font-semibold mb-4 flex items-center">
              <Plus class="w-5 h-5 mr-2 text-blue-600" /> Novo Produto
            </h2>
            <form on:submit|preventDefault={addProduct} class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nome do Produto</label>
                <input
                  type="text"
                  bind:value={newProduct.name}
                  class="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome do produto"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Preço</label>
                <input
                  type="number"
                  step="0.01"
                  bind:value={newProduct.price}
                  class="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Preço do produto"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  bind:value={newProduct.description}
                  class="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descrição do produto"
                ></textarea>
              </div>
              <div class="flex items-center space-x-4">
                <div class="flex items-center">
                  <input 
                    type="checkbox" 
                    bind:checked={newProduct.in_stock}
                    class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label class="ml-2 text-sm text-gray-700">Em Estoque</label>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Quantidade em Estoque</label>
                  <input
                    type="number"
                    bind:value={newProduct.qtd_in_stock}
                    class="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  bind:checked={newProduct.ready_delivery}
                  class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label class="ml-2 text-sm text-gray-700">Pronta Entrega?</label>
              </div>
              <button type="submit" class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Save class="w-5 h-5 mr-2" /> Salvar Produto
              </button>
            </form>
          </div>

          <!-- Listagem de Produtos -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h2 class="text-lg font-semibold mb-4">Lista de Produtos</h2>
            {#if products.length === 0}
              <p class="text-gray-600">Nenhum produto cadastrado.</p>
            {:else}
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Em Estoque</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pronta Entrega</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each products as product}
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {product.price}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.description}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.in_stock ? 'Sim' : 'Não'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.qtd_in_stock}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.ready_delivery ? 'Sim' : 'Não'}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        </div>
      </main>
    </div>
  </div>
{:else}
  <div class="text-center py-8">
    <p>Verificando autenticação...</p>
  </div>
{/if}
