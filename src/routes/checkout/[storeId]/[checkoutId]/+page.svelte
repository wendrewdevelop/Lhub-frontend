<script>
    import { loadStripe } from '@stripe/stripe-js';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { 
        cart, 
        addToCart, 
        updateQuantity, 
        removeItem 
    } from '$lib/cart.js';
    
    // Obter IDs da URL
    const store_id = page.params.storeId;
    console.log(store_id);
    const checkout_id = page.params.checkoutId;
    console.log(checkout_id);
  
    let stripe;
    let elements;
    let cardElement;
    let loading = false;
    let errorMessage = '';
    let shippingAddress = {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        complement: ''
    }; // Adicione campos de formulário conforme necessário
  
    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  
    onMount(async () => {
        stripe = await stripePromise;
        console.log(stripe);
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
        console.log("Itens do carrinho:", $cart.items);
  
        try {
            // 1. Criar Payment Intent
            const paymentIntentResponse = await fetch('http://localhost:8000/api/gateways/stripe/payment/intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: Math.round($cart.total * 100), // Já converte para centavos
                    currency: 'brl',
                    description: 'Pagamento de pedido'
                })
            });
  
            if (!paymentIntentResponse.ok) throw new Error('Falha ao criar pagamento');
  
            // 2. Confirmar pagamento
            const { client_secret, intent_id } = await paymentIntentResponse.json();
            const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                payment_method: { card: cardElement }
            });
  
            if (error) throw error;
  
            // 3. Criar pedido na API
            const orderResponse = await fetch(`http://localhost:8000/api/orders?store_id=${encodeURIComponent(store_id)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    checkout_id: checkout_id,  // Adicione esta linha
                    items: $cart.items.map(item => ({
                        product_id: item.id,
                        quantity: item.quantity,
                        unit_price: item.preco
                    })),
                    shipping_address: shippingAddress,
                    payment_method: {
                        provider: 'stripe',
                        payment_intent_id: paymentIntent.id,
                        method_type: paymentIntent.payment_method_types[0],
                        last4: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4 || '****'
                    }
                })
            });
  
            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.detail || 'Erro ao criar pedido');
            }
  
            // 4. Redirecionar para página de status
            goto(`/${store_id}/order/${checkout_id}`);
  
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

    <div class="mb-6 border-b pb-4">
        <h3 class="text-lg font-semibold mb-2">Resumo do Pedido</h3>
        
        <div class="space-y-2">
            {#each $cart.items as item}
                <div class="flex justify-between">
                    <span>{item.quantity}x {item.nome}</span>
                    <span>R$ {(item.preco * item.quantity).toFixed(2)}</span>
                </div>
            {/each}
        </div>

        <div class="mt-4 pt-2 border-t">
            <div class="flex justify-between mb-1">
                <span>Subtotal:</span>
                <span>R$ {$cart.subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between mb-1">
                <span>Taxa de entrega:</span>
                <span>R$ {$cart.taxa.toFixed(2)}</span>
            </div>
            <div class="flex justify-between font-bold">
                <span>Total:</span>
                <span>R$ {$cart.total.toFixed(2)}</span>
            </div>
        </div>
    </div>

  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-2">Endereço Completo</label>
    <input
      bind:value={shippingAddress.street}
      class="w-full px-3 py-2 border rounded-md mb-2"
      placeholder="Rua"
      required
    />
    <div class="grid grid-cols-2 gap-2">
      <input
        bind:value={shippingAddress.number}
        class="w-full px-3 py-2 border rounded-md"
        placeholder="Número"
        required
      />
      <input
        bind:value={shippingAddress.complement}
        class="w-full px-3 py-2 border rounded-md"
        placeholder="Complemento"
      />
    </div>
    <div class="grid grid-cols-2 gap-2 mt-2">
      <input
        bind:value={shippingAddress.neighborhood}
        class="w-full px-3 py-2 border rounded-md"
        placeholder="Bairro"
        required
      />
      <input
        bind:value={shippingAddress.city}
        class="w-full px-3 py-2 border rounded-md"
        placeholder="Cidade"
        required
      />
      <input
        bind:value={shippingAddress.state}
        class="w-full px-3 py-2 border rounded-md"
        placeholder="Estado (UF)"
        maxlength="2"
        required
      />
    </div>
  </div>

    <div id="card-element" class="mb-4 p-3 border rounded"></div>

    <button
        on:click={handleSubmit}
        disabled={loading}
        class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
    >
        {#if loading}
            <i class="fas fa-spinner fa-spin mr-2"></i> Processando...
        {:else}
            Confirmar Pagamento R$ {$cart.total.toFixed(2)}
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

    .text-currency {
        font-family: 'Arial', sans-serif;
        letter-spacing: 0.5px;
    }
</style>