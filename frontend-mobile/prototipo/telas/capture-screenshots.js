/**
 * Script para capturar screenshots das telas do sistema Appunture
 * para inclusão no TCC (Capítulo 6 - Apresentação do Sistema)
 *
 * Uso: node capture-screenshots.js
 *
 * Requisitos: npm install puppeteer
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Configuração das telas a serem capturadas
const screens = [
  { file: "tela-login.html", output: "tela-login.png" },
  { file: "tela-cadastro.html", output: "tela-cadastro.png" },
  { file: "tela-home.html", output: "tela-home.png" },
  { file: "tela-busca.html", output: "tela-busca.png" },
  { file: "tela-meridianos.html", output: "tela-meridianos.png" },
  { file: "tela-mapa.html", output: "tela-mapa.png" },
  { file: "tela-detalhes.html", output: "tela-detalhes.png" },
  { file: "tela-chat.html", output: "tela-chat.png" },
  { file: "tela-favoritos.html", output: "tela-favoritos.png" },
];

// Diretório de saída para as imagens (fig/ do TCC)
const outputDir = path.resolve(__dirname, "../../../doc/tcc-appunture/fig");

async function captureScreenshots() {
  console.log("🚀 Iniciando captura de screenshots...\n");

  // Verifica se o diretório de saída existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Diretório criado: ${outputDir}\n`);
  }

  // Inicia o navegador
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Configura viewport para corresponder ao frame do telefone
  await page.setViewport({
    width: 500, // Largura suficiente para o frame + padding
    height: 1000, // Altura suficiente para capturar todo o frame
    deviceScaleFactor: 2, // Retina para melhor qualidade
  });

  let successCount = 0;
  let errorCount = 0;

  for (const screen of screens) {
    const inputPath = path.resolve(__dirname, screen.file);
    const outputPath = path.resolve(outputDir, screen.output);

    try {
      // Verifica se o arquivo HTML existe
      if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  Arquivo não encontrado: ${screen.file}`);
        errorCount++;
        continue;
      }

      // Carrega a página HTML
      await page.goto(`file://${inputPath}`, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Aguarda renderização completa
      await page.waitForSelector(".phone-frame", { timeout: 5000 });

      // Captura apenas o elemento do frame do telefone
      const phoneFrame = await page.$(".phone-frame");

      if (phoneFrame) {
        await phoneFrame.screenshot({
          path: outputPath,
          type: "png",
          omitBackground: true,
        });

        console.log(`✅ ${screen.file} → ${screen.output}`);
        successCount++;
      } else {
        // Fallback: captura a página inteira
        await page.screenshot({
          path: outputPath,
          type: "png",
          fullPage: false,
        });
        console.log(`⚠️  ${screen.file} → ${screen.output} (fallback)`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Erro ao processar ${screen.file}: ${error.message}`);
      errorCount++;
    }
  }

  await browser.close();

  console.log("\n" + "=".repeat(50));
  console.log(`📊 Resumo: ${successCount} sucesso, ${errorCount} erros`);
  console.log(`📂 Imagens salvas em: ${outputDir}`);
  console.log("=".repeat(50));
}

// Executa o script
captureScreenshots().catch(console.error);
