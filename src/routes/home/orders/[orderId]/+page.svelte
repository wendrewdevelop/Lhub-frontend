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
      Bell,
      StoreIcon
  } from "lucide-svelte";
  let storeId: string | null = null;
  let orders = [];

  onMount(async () => {
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
        await fetchOrders();
      }
    } catch (error) {
      goto('/signin');
    }
  });

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  async function fetchOrders() {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/orders/?store_id=${storeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        orders = data.map(order => ({
          id: order.id,
          total: order.total_amount,
          status: order.status,
          created_at: formatDate(order.created_at),
          payment_status: order.payment_info?.status || 'Não informado',
          customer: order.shipping_address?.full_name || 'Cliente não identificado',
          shipping_address: order.shipping_address,
          payment_info: order.payment_info,
          status_history: order.status_history
        }));
      } else {
        console.error('Falha ao carregar pedidos');
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  }
</script>

<svelte:head>
    <title>LHub - Listagem de Pedidos</title>
</svelte:head>

{#if auth}
  <div class="min-h-screen bg-gray-50">
    <div class="flex">
      <aside class="w-64 min-h-screen bg-white border-r border-gray-200">
        <div class="p-6">
          <div class="flex items-center space-x-2 mb-8">
            <Rocket class="w-6 h-6 text-blue-600" />
            <span class="text-xl font-semibold">LHub</span>
          </div>
          
          <nav class="space-y-2">
            <a href="/home" class="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <ChartLine class="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a href="/home/orders/{storeId}" class="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg">
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

      <main class="flex-1">
        <header class="bg-white border-b border-gray-200">
          <div class="flex justify-between items-center px-6 py-4">
            <h1 class="text-xl font-semibold text-gray-900">Listagem de Pedidos</h1>
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
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h2 class="text-lg font-semibold mb-4">Pedidos Recentes</h2>
            {#if orders.length === 0}
              <p class="text-gray-600">Nenhum pedido encontrado.</p>
            {:else}
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each orders as order}
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.slice(0,8)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.created_at}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {order.total.toFixed(2)}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="px-3 py-1 inline-flex text-xs font-medium rounded-full 
                            {order.status === 'ENTREGUE' ? 'bg-green-100 text-green-800' 
                             : order.status === 'RECEBIDO' ? 'bg-yellow-100 text-yellow-800'
                             : 'bg-gray-100 text-gray-800'}">
                            {order.status === 'RECEBIDO' ? 'Pendente' 
                             : order.status === 'ENTREGUE' ? 'Entregue'
                             : order.status}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.payment_status === 'approved' ? 'Aprovado' 
                           : order.payment_status === 'recebido' ? 'Pendente'
                           : order.payment_status}
                        </td>
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