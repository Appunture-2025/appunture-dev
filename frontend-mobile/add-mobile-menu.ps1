# Script para adicionar menu mobile aos arquivos HTML
$userFiles = @(
    "userBodyMap.html",
    "userChatBot.html", 
    "userFavorites.html",
    "userLogin.html",
    "userPointsDetails.html",
    "userRegister.html",
    "userSearch.html"
)

$mobileMenuHtml = @"
      <div class="mobile-menu-toggle" onclick="toggleMobileMenu()">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </header>
    
    <!-- Mobile Navigation -->
    <div class="mobile-nav" id="mobileNav" onclick="closeMobileMenu(event)">
      <div class="mobile-nav-content">
        <div class="mobile-nav-header">
          <div class="logo">Appunture</div>
          <div class="mobile-nav-close" onclick="closeMobileMenu()">&times;</div>
        </div>
        <nav class="mobile-nav-links">
          <a href="userHome.html" onclick="closeMobileMenu()">Home</a>
          <a href="userBodyMap.html" onclick="closeMobileMenu()">Mapa</a>
          <a href="userSearch.html" onclick="closeMobileMenu()">Buscar Sintomas</a>
          <a href="userAllPoints.html" onclick="closeMobileMenu()">Todos os Pontos</a>
          <a href="userFavorites.html" onclick="closeMobileMenu()">Favoritos</a>
          <a href="userChatBot.html" onclick="closeMobileMenu()">Chatbot</a>
          <a href="userLogin.html" onclick="closeMobileMenu()">Login</a>
        </nav>
      </div>
    </div>
"@

foreach ($file in $userFiles) {
    $filePath = "c:\Users\Usuario\OneDrive\Desktop\everything\projetos\prototipo\user\$file"
    if (Test-Path $filePath) {
        Write-Host "Processing: $file"
        
        # Ler conteúdo do arquivo
        $content = Get-Content $filePath -Raw
        
        # Substituir o fechamento do header
        $content = $content -replace '</nav>\s*</header>', "</nav>$mobileMenuHtml"
        
        # Adicionar script antes do fechamento do body
        $content = $content -replace '</body>\s*</html>', "  <script src=`"../mobile-menu.js`"></script>`n</body>`n</html>"
        
        # Salvar arquivo
        Set-Content $filePath $content -NoNewline
        
        Write-Host "Updated: $file"
    }
}

Write-Host "Mobile menu added to all user files!"
