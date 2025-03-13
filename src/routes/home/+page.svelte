<script lang="ts">
  import { onMount } from 'svelte';
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

  let storeId: string | null = null;

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
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Pedidos Recentes</h3>
              <a href="#" class="text-blue-600 text-sm hover:text-blue-700">Ver todos</a>
            </div>
            <div class="space-y-4">
              <!-- Order Item -->
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium">#3215 - João Silva</p>
                  <p class="text-sm text-gray-600">2 produtos • R$ 152,00</p>
                </div>
                <span class="px-2 py-1 bg-green-100 text-green-600 text-sm rounded-full">
                  Entregue
                </span>
              </div>
              
              <!-- Order Item -->
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium">#3214 - Maria Souza</p>
                  <p class="text-sm text-gray-600">5 produtos • R$ 429,00</p>
                </div>
                <span class="px-2 py-1 bg-yellow-100 text-yellow-600 text-sm rounded-full">
                  Processando
                </span>
              </div>
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
      </main>
    </div>
  </div>
{:else}
    <!-- Redirecionando... -->
    <div class="text-center py-8">
        <p>Verificando autenticação...</p>
    </div>
{/if}
  
