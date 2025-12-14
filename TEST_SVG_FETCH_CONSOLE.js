// TESTE DE FETCH DIRETO - Cole isso no console do Expo/Metro DevTools
// Isso vai testar se fetch funciona como esperado

const testSvgFetch = async () => {
  const url =
    "https://firebasestorage.googleapis.com/v0/b/appunture-tcc.firebasestorage.app/o/body-map%2FLU.svg?alt=media";

  console.log("=== TESTE DE FETCH SVG ===");
  console.log("URL:", url);
  console.log("");

  try {
    console.log("1. Iniciando fetch...");
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/svg+xml, image/svg+xml, */*",
        "Content-Type": "application/svg+xml",
      },
    });

    console.log("2. Response recebido");
    console.log("   Status:", response.status);
    console.log("   StatusText:", response.statusText);
    console.log("   Headers:", {
      "content-type": response.headers.get("content-type"),
      "content-length": response.headers.get("content-length"),
      "cache-control": response.headers.get("cache-control"),
    });
    console.log("   OK?", response.ok);

    if (!response.ok) {
      console.log("3. ERROR: Response não OK!");
      const text = await response.text();
      console.log("   Corpo da resposta:", text.substring(0, 200));
      return;
    }

    console.log("3. Parsing response como texto...");
    const text = await response.text();
    console.log("   ✓ Texto recebido:", text.length, "bytes");
    console.log("   Primeiros 100 caracteres:", text.substring(0, 100));

    console.log("");
    console.log("✓ SUCESSO - Fetch funcionou!");
    console.log("Se o SVG não aparece no app, o problema está em outro lugar.");
  } catch (error) {
    console.log("2. ERROR - Fetch falhou");
    console.error("Erro:", error);
    if (error instanceof Error) {
      console.error("Mensagem:", error.message);
      console.error("Nome:", error.name);
      console.error("Stack:", error.stack);
    }
  }
};

// Execute a função
testSvgFetch();
