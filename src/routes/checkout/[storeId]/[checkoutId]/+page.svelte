<script>
  import { loadStripe } from '@stripe/stripe-js';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  // Obter IDs da URL
  const store_id = $page.params.storeId;
  const order_id = $page.params.checkoutId; // Reaproveitando como order_id

  let stripe;
  let elements;
  let cardElement;
  let loading = false;
  let errorMessage = '';

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  onMount(async () => {
      stripe = await stripePromise;
      elements = stripe.elements();
      const card = elements.create('card', {
          style: {
              base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#9e2146' },
          },
      });
      card.mount('#card-element');
      cardElement = card;
  });

  const handleSubmit = async () => {
      loading = true;
      errorMessage = '';

      try {
          // 1. Criar Payment Intent
          const response = await fetch('http://localhost:8000/api/gateways/stripe/payment/intent', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                  amount: 1000,
                  currency: 'brl',
                  description: 'Pagamento de pedido'
              })
          });

          if (!response.ok) throw new Error('Falha ao criar pagamento');

          // 2. Confirmar pagamento
          const { client_secret } = await response.json();
          const { error } = await stripe.confirmCardPayment(client_secret, {
              payment_method: { card: cardElement }
          });

          if (error) throw error;

          // 3. Redirecionar para página de status
          goto(`/${store_id}/order/${order_id}`);

      } catch (err) {
          errorMessage = err.message || 'Erro ao processar pagamento';
      } finally {
          loading = false;
      }
  };
</script>

<div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
  <h2 class="text-2xl font-bold mb-6 text-gray-800">Finalizar Pagamento</h2>

  {#if errorMessage}
      <div class="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
      </div>
  {/if}

  <div id="card-element" class="mb-4 p-3 border rounded"></div>

  <button
      on:click={handleSubmit}
      disabled={loading}
      class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
  >
      {#if loading}
          <i class="fas fa-spinner fa-spin mr-2"></i> Processando...
      {:else}
          Confirmar Pagamento R$ 10,00
      {/if}
  </button>
</div>

<style>
  .StripeElement {
      box-sizing: border-box;
      height: 40px;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background-color: white;
  }
  .StripeElement--focus { box-shadow: 0 1px 3px 0 #cfd7df; }
  .StripeElement--invalid { border-color: #fa755a; }
  .StripeElement--webkit-autofill { background-color: #fefde5 !important; }
</style>