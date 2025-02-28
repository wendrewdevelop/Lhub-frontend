<script lang="ts">
    import { Rocket, Box, ShieldCheck, BarChart } from "lucide-svelte";
</script>
  
<svelte:head>
    <title>LHub - Sua Loja Online Simplificada</title>
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
                <a href="/signin" class="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors">
                    Entrar
                </a>
                <a href="/signup" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Criar minha loja
                </a>
            </div>
        </div>
    </nav>
  
    <!-- Hero Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
            <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                Crie sua loja virtual em 
                <span class="text-blue-600">minutos, não em dias</span>
            </h1>
            <p class="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Tudo que você precisa para vender online. Gerenciamento de produtos, 
                pedidos e pagamentos em uma única plataforma simples.
            </p>
            <div class="flex justify-center space-x-4">
                <button class="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors">
                    Começar agora - É grátis
                </button>
            </div>
        </div>
    </section>
  
    <!-- Features Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid md:grid-cols-3 gap-8">
            <!-- Feature Card 1 -->
            <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div class="flex flex-col items-center text-center">
                    <Box class="w-12 h-12 text-blue-600 mb-4" />
                    <h3 class="text-xl font-semibold mb-2 text-gray-900">Controle Total de Estoque</h3>
                    <p class="text-gray-600">
                    Gerencie produtos, variantes e estoque de forma intuitiva 
                    com atualizações em tempo real
                    </p>
                </div>
            </div>
    
            <!-- Feature Card 2 -->
            <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div class="flex flex-col items-center text-center">
                    <ShieldCheck class="w-12 h-12 text-blue-600 mb-4" />
                    <h3 class="text-xl font-semibold mb-2 text-gray-900">Pagamentos Seguros</h3>
                    <p class="text-gray-600">
                    Integração com principais gateways de pagamento e 
                    segurança de nível bancário
                    </p>
                </div>
            </div>
    
            <!-- Feature Card 3 -->
            <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div class="flex flex-col items-center text-center">
                    <BarChart class="w-12 h-12 text-blue-600 mb-4" />
                    <h3 class="text-xl font-semibold mb-2 text-gray-900">Relatórios Poderosos</h3>
                    <p class="text-gray-600">
                    Acompanhe vendas, métricas de crescimento e 
                    desempenho de produtos
                    </p>
                </div>
            </div>
        </div>
    </section>
  
    <!-- Footer -->
    <footer class="border-t bg-gray-50 mt-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="text-center text-gray-600">
            © 2024 LHub. Todos os direitos reservados.
            </div>
        </div>
    </footer>
</div>