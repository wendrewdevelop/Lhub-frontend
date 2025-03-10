<script lang="ts">
  import { Rocket, LogIn, Github, Key } from "lucide-svelte";
  import { toast } from '@zerodevx/svelte-toast';
  import { goto } from '$app/navigation';

  // Variáveis reativas
  let email = '';
  let password = '';
  let isLoading = false;

  async function handleSubmit(event: Event) {
      event.preventDefault();
      isLoading = true;

      try {
          // 1. Validar campos
          if (!email || !password) {
              throw new Error('Preencha todos os campos');
          }

          // 2. Criar payload
          const formData = new URLSearchParams();
          formData.append('username', email);
          formData.append('password', password);
          formData.append('grant_type', 'password');
          formData.append('client_id', 'seu-client-id'); // Altere para seus valores reais
          formData.append('client_secret', 'seu-client-secret');

          // 3. Fazer requisição
          const response = await fetch('http://127.0.0.1:8000/api/auth/token', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
              },
              body: formData
          });

          // 4. Tratar resposta
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || 'Erro na autenticação');
          }

          const data = await response.json();
          
          // 5. Armazenar token e redirecionar
          localStorage.setItem('access_token', data.access_token);
          await goto('/home');

          toast.push('Login realizado com sucesso!', {
              theme: { '--toastBackground': '#4CAF50', '--toastColor': 'white' }
          });

      } catch (error) {
          toast.push(error.message, {
              theme: { '--toastBackground': '#EF5350', '--toastColor': 'white' }
          });
          console.error('Erro no login:', error);
      } finally {
          isLoading = false;
      }
  }
</script>
  
<svelte:head>
    <title>LHub - Acesse sua conta</title>
</svelte:head>
  
<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- Navigation -->
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <Rocket class="w-8 h-8 text-blue-600" />
          <span class="text-2xl font-bold text-gray-900">LHub</span>
        </div>
        <div class="space-x-4">
          <a href="/signup" class="text-gray-600 hover:text-blue-600 transition-colors">
            Criar conta
          </a>
        </div>
      </div>
    </nav>
  
    <!-- Main Content -->
    <main class="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-12">
        <LogIn class="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Acesse sua conta
        </h1>
        <p class="text-gray-600">
          Gerencie suas lojas e acompanhe suas vendas
        </p>
      </div>
  
      <form class="space-y-6" on:submit={handleSubmit}>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              E-mail
          </label>
          <input
              type="email"
              id="email"
              bind:value={email}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
              required
          />
        </div>
  
        <div>
          <div class="flex justify-between items-center mb-2">
              <label for="password" class="block text-sm font-medium text-gray-700">
                  Senha
              </label>
              <a href="/" class="text-sm text-blue-600 hover:text-blue-700">
                  Esqueceu a senha?
              </a>
          </div>
          <input
              type="password"
              id="password"
              bind:value={password}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
          />
        </div>
  
        <button
          type="submit"
          class="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {#if isLoading}
              <span class="animate-pulse">Processando...</span>
          {:else}
              Entrar na conta
          {/if}
        </button>
  
        <div class="relative mt-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">Ou continue com</span>
          </div>
        </div>
  
        <button
          type="button"
          class="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
        >
          <Github class="w-5 h-5" />
          <span>Entrar com GitHub</span>
        </button>
      </form>
    </main>
  
    <!-- Footer -->
    <footer class="border-t bg-gray-50 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-600">
          © 2024 LHub. Todos os direitos reservados.
        </div>
      </div>
    </footer>
</div>