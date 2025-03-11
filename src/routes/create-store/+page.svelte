<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { toast } from '@zerodevx/svelte-toast';
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
        Save
    } from "lucide-svelte";
    import {auth, logout} from '$lib/auth';

    let storeName = '';
    let cep = '';
    let deliveryFee = 0;
    let logoFile: File | null = null;
    let address = '';  // This is correctly referenced in storeData
    let description = '';
    let isLoading = false;

    onMount(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            goto('/signin');
        }
    });

    async function handleCreateStore(e: Event) {
        e.preventDefault();
        isLoading = true;

        try {
            const userId = localStorage.getItem('account_id');
            if (!userId) throw new Error('Usuário não autenticado');

            // 1. Montar objeto corretamente
            const storeData = {
                name: storeName,
                address: address,  // Now matches the variable name
                cep: cep,
                delivery_fee: deliveryFee,
                account_id: userId,
                description: description
            };
            console.log(storeData);

            // 2. Validar campos obrigatórios
            if (!storeData.name || !storeData.address || !storeData.cep) {
            throw new Error('Preencha todos os campos obrigatórios');
            }

            const formData = new FormData();
            formData.append('store', JSON.stringify(storeData));
            console.log(formData);
            
            // 3. Enviar com Content-Type correto
            const response = await fetch('http://localhost:8000/api/stores/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: formData
            });
            console.log(response);
            const result = await response.json();
            console.log(result);

            if (!response.ok) {
                throw new Error(result.detail || 'Falha ao criar loja');
            }

            toast.push('🎉 Loja criada com sucesso!', {
                classes: 'bg-green-500 text-white'
            });
            setTimeout(() => {
                goto('/home');
            }, 1500);

        } catch (error) {
            // toast.push(`❌ ${error.message}`, {
            //     classes: 'bg-red-500 text-white'
            // });
            console.error('Erro ao criar loja:', error);
        } finally {
            isLoading = false;
        }
    }
</script>

<style global>
    .toast {
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        font-weight: 500;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
</style>

<svelte:head>
    <title>LHub - Criar Nova Loja</title>
</svelte:head>

{#if auth}
<div class="min-h-screen bg-gray-50">
    <div class="flex">
        <!-- Sidebar (mantido igual) -->
        <aside class="w-64 min-h-screen bg-white border-r border-gray-200">
            <div class="p-6">
                <div class="flex items-center space-x-2 mb-8">
                    <Rocket class="w-6 h-6 text-blue-600" />
                    <span class="text-xl font-semibold">LHub</span>
                </div>
                
                <nav class="space-y-2">
                    <!-- Itens do menu mantidos -->
                </nav>
            </div>
        </aside>

        <!-- Conteúdo Principal -->
        <main class="flex-1">
            <!-- Header (mantido igual) -->
            <header class="bg-white border-b border-gray-200">
                <div class="flex justify-between items-center px-6 py-4">
                    <h1 class="text-xl font-semibold text-gray-900">Criar Nova Loja</h1>
                    <div class="flex items-center space-x-4">
                        <!-- Ícones do header mantidos -->
                    </div>
                </div>
            </header>

            <!-- Formulário de Criação -->
            <div class="p-6 max-w-3xl mx-auto">
                <form on:submit|preventDefault={handleCreateStore} class="space-y-6">
                    <!-- Nome da Loja -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Loja
                      </label>
                      <input
                        type="text"
                        bind:value={storeName}
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  
                    <!-- Descrição -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                      </label>
                      <textarea
                        bind:value={description}
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                      ></textarea>
                    </div>
                  
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            CEP
                        </label>
                        <input
                            type="text"
                            bind:value={cep}
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            placeholder="00000-000"
                        />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Endereço Completo
                      </label>
                      <input
                        type="text"
                        bind:value={address}
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Taxa de Entrega (R$)
                        </label>
                        <input
                            type="number"
                            bind:value={deliveryFee}
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            step="0.01"
                        />
                    </div>
                  
                    <!-- Botão de Submit -->
                    <div class="pt-6">
                        <button
                            type="submit"
                            class="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {#if isLoading}
                                <span class="animate-pulse">Criando loja...</span>
                            {:else}
                                <Save class="w-5 h-5" />
                                <span>Criar Minha Loja</span>
                            {/if}
                        </button>
                    </div>
                  </form>
            </div>
        </main>
    </div>
</div>
{:else}
<div class="text-center py-8">
    <p>Verificando autenticação...</p>
</div>
{/if}