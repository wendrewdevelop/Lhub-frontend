export async function handle({ event, resolve }) {
    // Verificar rotas de checkout
    if (event.url.pathname.startsWith('/checkout')) {
      const checkoutId = event.params.checkout_id;
      
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(checkoutId)) {
        return new Response('Invalid checkout ID', { status: 400 });
      }
    }
  
    return await resolve(event);
  }