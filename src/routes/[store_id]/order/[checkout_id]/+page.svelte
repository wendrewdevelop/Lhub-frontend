<script>
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { 
        CheckCircleIcon, 
        TruckIcon, 
        CurrencyDollarIcon, 
        ClockIcon
    } from '@heroicons/vue/24/outline';
  
    // Dados de exemplo (substituir por dados reais da API)
    let orderDetails = {
        id: '',
        date: '',
        total: 0,
        status: '',
        items: [],
        address: '',
        deliveryEstimate: ''
    };
    let store_id;
  
    const statusSteps = [
      { id: 1, name: 'Pedido Confirmado', status: 'complete' },
      { id: 2, name: 'Pagamento Aprovado', status: 'complete' },
      { id: 3, name: 'Preparando Pedido', status: 'current' },
      { id: 4, name: 'Saiu para Entrega', status: 'upcoming' },
      { id: 5, name: 'Entregue', status: 'upcoming' }
    ];
    // onMount(() => {
    //     const regex = /[0-9a-fA-F-]{36}/;
    //     const store_id = window.location.pathname.match(regex);
    // });
    const iniciarCheckout = () => {
        const regex = /[0-9a-fA-F-]{36}/;
        const store_id = window.location.pathname.match(regex);
        goto(`/store/${store_id}/`);
    };
</script>
  
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Cabeçalho -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-900">
            Acompanhe seu Pedido
          </h1>
          <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            #{orderDetails.id.slice(0,8)}
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-gray-500">Data do Pedido</dt>
            <dd class="font-medium">{orderDetails.date}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Total</dt>
            <dd class="font-medium">R$ {orderDetails.total.toFixed(2)}</dd>
          </div>
        </div>
      </div>
  
      <!-- Timeline do Status -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Andamento do Pedido</h2>
        <div class="flow-root">
          <ul class="-mb-8">
            {#each statusSteps as step, index (step.id)}
              <li class="relative pb-8">
                {#if index < statusSteps.length - 1}
                  <div class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" />
                {/if}
                <div class="relative flex items-start space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      {#if step.status === 'complete'}
                        <CheckCircleIcon class="h-5 w-5 text-white" />
                      {:else if step.status === 'current'}
                        <ClockIcon class="h-5 w-5 text-white" />
                      {:else}
                        <div class="h-2 w-2 bg-gray-300 rounded-full" />
                      {/if}
                    </span>
                  </div>
                  <div class="min-w-0 flex-1 pt-1.5">
                    <p class="text-sm {step.status === 'current' ? 'text-blue-600' : 'text-gray-900'}">
                      {step.name}
                    </p>
                  </div>
                </div>
              </li>
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
            <span class="text-gray-700">{orderDetails.address}</span>
          </div>
          <div class="flex items-center">
            <ClockIcon class="h-5 w-5 text-gray-500 mr-2" />
            <span class="text-gray-700">Previsão de entrega: {orderDetails.deliveryEstimate}</span>
          </div>
        </div>
      </div>
  
      <!-- Itens do Pedido -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold mb-4">Itens do Pedido</h2>
        <div class="space-y-4">
          {#each orderDetails.items as item}
            <div class="flex justify-between items-center border-b pb-2">
              <div>
                <p class="font-medium">{item.name}</p>
                <p class="text-sm text-gray-500">Qtd: {item.quantity}</p>
              </div>
              <p class="text-gray-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
            </div>
          {/each}
        </div>
      </div>
  
      <!-- Ações -->
      <div class="mt-6 flex justify-between">
        <a href="#" on:click={() => iniciarCheckout()} class="text-blue-600 hover:text-blue-800">
          ← Voltar para a loja
        </a>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Ajuda com o Pedido
        </button>
      </div>
    </div>
  </div>