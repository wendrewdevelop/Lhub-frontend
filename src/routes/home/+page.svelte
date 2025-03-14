<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, logout } from '$lib/auth';
  import { 
      Rocket,
      Package,
      ShoppingCart,
      Users,
      Settings,
      ChartLine,
      Plus,
      Bell,
      MapPin,
      Truck,
      Image,
      Save,
      StoreIcon
  } from "lucide-svelte";
  import { page } from '$app/state';
	import { writable } from 'svelte/store';

  let storeId: string | null = null;
  const orders = writable([]);
  let loadingOrders = false;
  let ordersError = null;
  let selectedOrder: any = null;
  let newStatus = '';
  let statusNotes = '';
  let updatingStatus = false;
  let statusError = '';
  let statusHistory = [];

  const openOrderDetails = async (order: any) => {
    selectedOrder = order;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${order.id}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Falha ao carregar detalhes');
      
      const data = await response.json();
      newStatus = data.current_status;
      statusHistory = data.history || []; // Garante array vazio se não houver histórico
    } catch (err) {
      statusError = err.message;
    }
  };

  const updateOrderStatus = async () => {
    try {
      updatingStatus = true;
      statusError = '';
      
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha na atualização');
      }

      // Atualiza a lista de pedidos
      await loadOrders();
      selectedOrder = null;
    } catch (err) {
      statusError = err.message;
    } finally {
      updatingStatus = false;
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const loadOrders = async () => {
      try {
          loadingOrders = true;
          ordersError = null;
          let store_id = localStorage.getItem("store_id");
          
          const response = await fetch(
              `http://127.0.0.1:8000/api/orders/retrieve/new?store_id=${store_id}`
          );

          if (!response.ok) throw new Error('Falha ao carregar pedidos');
          
          const data = await response.json();
          orders.set(data);
          console.log(data);
          
      } catch (err) {
          ordersError = err.message;
      } finally {
          loadingOrders = false;
      }
  };

  const getStatusStyle = (status: string) => {
    const styles = {
      'RECEBIDO': 'bg-blue-100 text-blue-600',
      'EM_PREPARO': 'bg-yellow-100 text-yellow-600',
      'ENVIADO': 'bg-purple-100 text-purple-600',
      'ENTREGUE': 'bg-green-100 text-green-600',
      'CANCELADO': 'bg-red-100 text-red-600',
      default: 'bg-gray-100 text-gray-600'
    };
    return styles[status] || styles.default;
  };

  onMount(async () => {
    // Dupla verificação (client-side)
    const token = localStorage.getItem('access_token');
    if (!token) {
      goto('/signin');
      return;
    }

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

    let interval: NodeJS.Timeout;
    await loadOrders();
    interval = setInterval(() => loadOrders(), 30000);
    onDestroy(() => {
      if (interval) clearInterval(interval);
    });
  });
</script>

<svelte:head>
    <title>LHub - Painel Administrativo</title>
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
            <a href="/home" class="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg">
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
            <h1 class="text-xl font-semibold text-gray-900">Dashboard</h1>
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

        <!-- Stats -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Total Sales -->
            <div class="bg-white p-6 rounded-xl shadow-sm">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-gray-600">Vendas totais</p>
                  <p class="text-2xl font-bold mt-2">R$ 24.532,00</p>
                </div>
                <div class="bg-blue-100 p-3 rounded-lg">
                  <ChartLine class="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <!-- Total Orders -->
            <div class="bg-white p-6 rounded-xl shadow-sm">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-gray-600">Pedidos</p>
                  <p class="text-2xl font-bold mt-2">1.234</p>
                </div>
                <div class="bg-green-100 p-3 rounded-lg">
                  <ShoppingCart class="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <!-- Total Products -->
            <div class="bg-white p-6 rounded-xl shadow-sm">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-gray-600">Produtos</p>
                  <p class="text-2xl font-bold mt-2">56</p>
                </div>
                <div class="bg-purple-100 p-3 rounded-lg">
                  <Package class="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts and Recent Orders -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <!-- Sales Chart -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-lg font-semibold mb-4">Vendas nos últimos 30 dias</h3>
            <div class="h-64 bg-gray-50 rounded-lg">
              <!-- Espaço para gráfico (ex: Chart.js) -->
              <div class="flex items-center justify-center h-full text-gray-400">
                Gráfico de vendas
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="max-w-7xl mx-auto px-4 lg:px-8 py-8">
            <div class="bg-white p-6 rounded-xl shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Pedidos Recentes</h3>
                    <a href="/home/orders/{storeId}" class="text-blue-600 text-sm hover:text-blue-700">Ver todos</a>
                </div>
                
                {#if loadingOrders}
                    <div class="text-center py-4">
                        <i class="fas fa-spinner fa-spin"></i> Carregando pedidos...
                    </div>
                {:else if ordersError}
                    <div class="text-red-500 p-4">
                        {ordersError}
                    </div>
                {:else}
                    <div class="space-y-4">
                        {#each $orders as order}
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                            on:click={() => openOrderDetails(order)}>
                                <div>
                                    <p class="font-medium">#{order.id} - {order.shipping_address.street}, {order.shipping_address.number}</p>
                                    <p class="text-sm text-gray-600">
                                        {order.product_count} produtos • {formatarMoeda(order.total_amount)}
                                    </p>
                                </div>
                                <span class="px-2 py-1 text-sm rounded-full {getStatusStyle(order.status)}">
                                    {order.status}
                                </span>
                            </div>
                        {:else}
                            <div class="text-center py-4 text-gray-500">
                                Nenhum pedido recente
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
          </div>

        </div>

        <!-- Quick Actions -->
        <div class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="#" class="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center hover:bg-gray-50">
              <Plus class="w-6 h-6 text-blue-600 mb-2" />
              <span class="text-sm font-medium">Novo Produto</span>
            </a>
            <a href="#" class="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center hover:bg-gray-50">
              <ShoppingCart class="w-6 h-6 text-blue-600 mb-2" />
              <span class="text-sm font-medium">Ver Pedidos</span>
            </a>
            <a href="#" class="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center hover:bg-gray-50">
              <Users class="w-6 h-6 text-blue-600 mb-2" />
              <span class="text-sm font-medium">Clientes</span>
            </a>
            <a href="#" class="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center hover:bg-gray-50">
              <Settings class="w-6 h-6 text-blue-600 mb-2" />
              <span class="text-sm font-medium">Configurações</span>
            </a>
          </div>
        </div>

        {#if selectedOrder}
        <div class="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4"
            on:click|self={() => selectedOrder = null}>
          <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 space-y-6">
              <!-- Cabeçalho -->
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">Pedido #{selectedOrder.id}</h2>
                <button on:click={() => selectedOrder = null} class="text-gray-500 hover:text-gray-700">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>

              <!-- Detalhes do Pedido -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 class="font-medium mb-2">Endereço de Entrega</h3>
                  <p class="text-gray-600">
                    {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}<br>
                    {selectedOrder.shipping_address.city} - {selectedOrder.shipping_address.state}
                  </p>
                </div>
                
                <div>
                  <h3 class="font-medium mb-2">Valor Total</h3>
                  <p class="text-xl font-bold text-green-600">
                    {formatarMoeda(selectedOrder.total_amount)}
                  </p>
                </div>
              </div>

              <!-- Formulário de Atualização -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Status Atual</label>
                  <select 
                    bind:value={newStatus}
                    class="w-full p-3 border rounded-lg"
                    disabled={updatingStatus}
                  >
                    <option value="RECEBIDO">Recebido</option>
                    <option value="EM_PREPARO">Em preparo</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="ENTREGUE">Entregue</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>

                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Observações</label>
                  <textarea
                    bind:value={statusNotes}
                    class="w-full p-3 border rounded-lg"
                    placeholder="Adicione notas sobre a atualização..."
                    rows="3"
                    disabled={updatingStatus}
                  ></textarea>
                </div>

                {#if statusError}
                  <div class="text-red-500 p-3 bg-red-50 rounded-lg">{statusError}</div>
                {/if}

                <div class="flex gap-4 justify-end">
                  <button 
                    on:click={() => selectedOrder = null}
                    class="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    disabled={updatingStatus}
                  >
                    Cancelar
                  </button>
                  <button 
                    on:click={updateOrderStatus}
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? 'Atualizando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>

              <!-- Histórico de Status -->
              <div class="border-t pt-4">
                <h3 class="font-medium mb-4">Histórico de Atualizações</h3>
                <div class="space-y-3">
                  {#each statusHistory as history}
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p class="font-medium">{history.status}</p>
                        <p class="text-sm text-gray-600">{new Date(history.timestamp).toLocaleDateString()}</p>
                      </div>
                      <p class="text-sm text-gray-600 max-w-[200px] truncate">{history.notes}</p>
                    </div>
                  {:else}
                    <p class="text-gray-500 text-center">Nenhum histórico disponível</p>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/if}

      </main>
    </div>
  </div>
{:else}
    <!-- Redirecionando... -->
    <div class="text-center py-8">
        <p>Verificando autenticação...</p>
    </div>
{/if}
  
