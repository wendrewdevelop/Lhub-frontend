// src/routes/home/+page.server.ts
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, fetch }) {
    // 1. Verificar token
    const token = cookies.get('access_token');
    if (!token) throw redirect(302, '/signin');

    // 2. Verificar se tem store vinculada
    try {
        const storeCheck = await fetch('/api/accounts/me/store', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!storeCheck.ok) throw redirect(302, '/create-store');
        
        const { has_store } = await storeCheck.json();
        if (!has_store) throw redirect(302, '/create-store');

    } catch (error) {
        throw redirect(302, '/signin');
    }

    // 3. Carregar dados da página (se necessário)
    return {};
}