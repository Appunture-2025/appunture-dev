/**
 * Script para capturar screenshots dos PROTÓTIPOS INICIAIS do sistema Appunture
 * para inclusão nas Histórias de Usuário do TCC (Apêndice E)
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Mapeamento dos protótipos para as histórias de usuário
const prototypes = [
  { file: "userSearch.html", output: "proto-busca.png", hu: "HU-01" },
  { file: "userPointsDetails.html", output: "proto-detalhes.png", hu: "HU-02" },
  { file: "userBodyMap.html", output: "proto-mapa.png", hu: "HU-03" },
  { file: "userFavorites.html", output: "proto-favoritos.png", hu: "HU-04" },
  { file: "userChatBot.html", output: "proto-chat.png", hu: "HU-07" },
  {
    file: "userAllPoints.html",
    output: "proto-meridianos.png",
    hu: "HU-08/HU-10",
  },
  { file: "userLogin.html", output: "proto-login.png", hu: "HU-09" },
  { file: "userRegister.html", output: "proto-cadastro.png", hu: "HU-09" },
  { file: "userHome.html", output: "proto-home.png", hu: "HU-11" },
];

// Diretórios
const prototypeDir = path.resolve(__dirname, "..");
const outputDir = path.resolve(__dirname, "../../../doc/tcc-appunture/fig");

async function capturePrototypes() {
  console.log("🚀 Iniciando captura de screenshots dos PROTÓTIPOS...\n");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
    ],
  });

  const page = await browser.newPage();

  // Viewport de celular
  await page.setViewport({
    width: 430,
    height: 932,
    deviceScaleFactor: 2,
  });

  let successCount = 0;
  let errorCount = 0;

  for (const proto of prototypes) {
    const inputPath = path.join(prototypeDir, proto.file);
    const outputPath = path.join(outputDir, proto.output);

    try {
      if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  Arquivo não encontrado: ${proto.file}`);
        errorCount++;
        continue;
      }

      // Usa file:// protocol
      const fileUrl = `file://${inputPath}`;

      await page.goto(fileUrl, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });

      // Pequena espera para CSS carregar
      await new Promise((r) => setTimeout(r, 500));

      // Screenshot da página inteira
      await page.screenshot({
        path: outputPath,
        type: "png",
        clip: {
          x: 0,
          y: 0,
          width: 430,
          height: 932,
        },
      });

      console.log(`✅ ${proto.file} → ${proto.output} (${proto.hu})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Erro ao capturar ${proto.file}: ${error.message}`);
      errorCount++;
    }
  }

  await browser.close();

  console.log("\n==================================================");
  console.log(`📊 Resumo: ${successCount} sucesso, ${errorCount} erros`);
  console.log(`📂 Imagens salvas em: ${outputDir}`);
  console.log("==================================================\n");
}

capturePrototypes().catch(console.error);
