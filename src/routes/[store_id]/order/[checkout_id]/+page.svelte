<script>
  import { page } from '$app/state';
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { 
      CheckCircleIcon, 
      TruckIcon, 
      CurrencyDollarIcon, 
      ClockIcon
  } from '@heroicons/vue/24/outline';
  
  let orderDetails = null;
  let loading = true;
  let error = null;
  let store_id;
  let interval;

  // Status mapeados do backend
  const statusMap = {
      'RECEBIDO': 1,
      'EM_PREPARO': 2,
      'ENVIADO': 3,
      'ENTREGUE': 4,
      'CANCELADO': 0
  };

  const statusOrder = [
      'RECEBIDO',
      'EM_PREPARO', 
      'ENVIADO',
      'ENTREGUE'
  ];

  const statusLabels = {
      'RECEBIDO': 'Pedido Recebido',
      'EM_PREPARO': 'Em Preparação',
      'ENVIADO': 'Saiu para Entrega',
      'ENTREGUE': 'Entregue',
      'CANCELADO': 'Cancelado'
  };

  // Gerar timeline baseado no histórico
  $: statusSteps = statusOrder.map(status => {
      const stepIndex = statusOrder.indexOf(status);
      const currentIndex = statusOrder.indexOf(orderDetails?.status);
      
      let stepStatus = 'upcoming';
      
      if (orderDetails?.history?.some(h => h.status === status)) {
          stepStatus = 'complete';
      } else if (status === orderDetails?.status) {
          stepStatus = 'current';
      } else if (stepIndex < currentIndex) {
          stepStatus = 'complete';
      }
      
      return {
          id: status,
          name: statusLabels[status],
          status: stepStatus
      };
  });

  // Buscar dados do pedido
  // Atualizar fetchOrder para processar histórico
  const fetchOrder = async () => {
      try {
          const checkout_id = page.params.checkout_id;
          console.log(checkout_id);
          
          const response = await fetch(
              `http://localhost:8000/api/orders/${checkout_id}/status`
          );
          
          if (!response.ok) throw new Error('Pedido não encontrado');
          
          const data = await response.json();
          
          orderDetails = {
              id: checkout_id,
              date: new Date(data.last_update).toLocaleDateString('pt-BR'),
              total: data.total_amount,
              status: data.current_status,
              items: data.items || [],
              address: data.shipping_address,
              deliveryEstimate: data.delivery_estimate,
              history: (data.history || []).sort((a, b) => 
                  new Date(a.timestamp) - new Date(b.timestamp)
              )
          };
          
      } catch (err) {
          error = err.message;
          orderDetails = null;
      } finally {
          loading = false;
      }
  };

  onMount(async () => {
      await fetchOrder();
      interval = setInterval(fetchOrder, 60000);
  });

  onDestroy(() => clearInterval(interval));
</script>
  
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Cabeçalho -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900">
          Acompanhe seu Pedido
        </h1>
      </div>
  
      <!-- Timeline do Status -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Andamento do Pedido</h2>
        <div class="flow-root">
          <ul class="-mb-8">
            {#each statusSteps as step, index (step.id)}
              {#if step.name !== 'Cancelado' || orderDetails?.status === 'CANCELADO'}
                <li class="relative pb-8">
                  {#if index < statusSteps.length - 1}
                    <div class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" />
                  {/if}
                  <div class="relative flex items-start space-x-3">
                    <div>
                      <span class={`h-8 w-8 rounded-full flex items-center justify-center 
                        ${step.status === 'complete' ? 'bg-green-500' :
                         step.status === 'current' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        
                        {#if step.status === 'complete'}
                          <CheckCircleIcon class="h-5 w-5 text-white" />
                        {:else if step.status === 'current'}
                          <ClockIcon class="h-5 w-5 text-white" />
                        {:else}
                          <div class="h-2 w-2 bg-white rounded-full" />
                        {/if}
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5">
                      <p class={`text-sm ${step.status === 'current' ? 
                        'text-blue-600 font-semibold' : 'text-gray-900'}`}>
                        {step.name}
                        {#if step.id === orderDetails?.status && orderDetails?.history?.[0]?.timestamp}
                          <span class="block text-xs text-gray-500 mt-1">
                            {new Date(orderDetails.history[0].timestamp).toLocaleDateString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                          </span>
                        {/if}
                      </p>
                    </div>
                  </div>
                </li>
              {/if}
            {/each}
          </ul>
        </div>
      </div>
  
      <!-- Detalhes da Entrega -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Entrega</h2>
        <div class="space-y-2">
          <div class="flex items-center">
            <TruckIcon class="h-5 w-5 text-gray-500 mr-2" />
            <!-- <span class="text-gray-700">{orderDetails.address}</span> -->
          </div>
          <div class="flex items-center">
            <ClockIcon class="h-5 w-5 text-gray-500 mr-2" />
            <!-- <span class="text-gray-700">Previsão de entrega: {orderDetails.deliveryEstimate}</span> -->
          </div>
        </div>
      </div>
  
      <!-- Itens do Pedido -->
      {#if loading}
          <div class="text-center py-8">
              <i class="fas fa-spinner fa-spin"></i> Carregando detalhes do pedido...
          </div>
      {:else if error}
          <div class="text-red-500 p-4 text-center">
              {error}
          </div>
      {:else if orderDetails}
          <!-- Conteúdo principal -->
          <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
              <div class="max-w-3xl mx-auto">
                  <!-- Cabeçalho com safe navigation -->
                  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                      <div class="flex items-center justify-between mb-4">
                          <h1 class="text-2xl font-bold text-gray-900">
                              Acompanhe seu Pedido
                          </h1>
                          {#if orderDetails?.id}
                              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                  #{orderDetails.id.slice(0,8)}
                              </span>
                          {/if}
                      </div>
                      
                      <!-- Restante do conteúdo seguro -->
                  </div>
              </div>
          </div>
      {/if}
  
      <!-- Ações -->
      <div class="mt-6 flex justify-between">
        <a href="/store/{store_id}" on:click={() => iniciarCheckout()} class="text-blue-600 hover:text-blue-800">
          ← Voltar para a loja
        </a>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Ajuda com o Pedido
        </button>
      </div>
    </div>
  </div>