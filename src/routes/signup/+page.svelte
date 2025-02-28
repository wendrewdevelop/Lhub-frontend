<script lang="ts">
    import { Rocket, UserPlus, Lock, Mail } from "lucide-svelte";
</script>
  
<svelte:head>
    <title>LHub - Crie sua conta</title>
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
          <a href="/signin" class="text-gray-600 hover:text-blue-600 transition-colors">
            Entrar
          </a>
        </div>
      </div>
    </nav>
  
    <!-- Main Content -->
    <main class="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-12">
        <UserPlus class="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Crie sua conta gratuita
        </h1>
        <p class="text-gray-600">
          Comece a vender online em poucos minutos
        </p>
      </div>
  
      <form class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Nome completo
          </label>
          <input
            type="text"
            id="name"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Seu nome completo"
          />
        </div>
  
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="seu@email.com"
          />
        </div>
  
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Senha
          </label>
          <input
            type="password"
            id="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>
  
        <div class="flex items-center">
          <input
            type="checkbox"
            id="terms"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label for="terms" class="ml-2 text-sm text-gray-600">
            Concordo com os <a href="#" class="text-blue-600 hover:text-blue-700">Termos de Serviço</a>
          </label>
        </div>
  
        <button
          type="submit"
          class="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Criar conta gratuita
        </button>
  
        <p class="text-center text-gray-600 text-sm mt-8">
          Já tem uma conta? 
          <a href="/signin" class="text-blue-600 hover:text-blue-700">Entrar</a>
        </p>
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