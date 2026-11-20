import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extractText, getDocumentProxy } from "unpdf";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLOUDFLARE_DIR = resolve(__dirname, "..");
const REPO_ROOT = resolve(CLOUDFLARE_DIR, "..");

const DEFAULT_PDF_PATH = join(REPO_ROOT, "public", "resume", "Ramesh_Badugu_Resume.pdf");
const PORTFOLIO_DOCS_PATH = join(CLOUDFLARE_DIR, "data", "portfolio-documents.json");
const GENERATED_OUTPUT_PATH = join(CLOUDFLARE_DIR, "data", "chunks.generated.json");

function parseArgs(argv) {
  const flags = {
    dryRun: argv.includes("--dry-run"),
    pdfPath: DEFAULT_PDF_PATH,
    workerUrl: process.env.RAG_INGEST_URL || process.env.RAG_API_URL?.replace(/\/chat$/, "/ingest") || "",
    apiKey: process.env.RAG_ADMIN_KEY || process.env.RAG_API_KEY || "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--pdf" && argv[i + 1]) flags.pdfPath = resolve(argv[i + 1]);
    if (argv[i] === "--url" && argv[i + 1]) flags.workerUrl = argv[i + 1];
  }
  return flags;
}

export async function extractResumeDocuments(pdfPath = DEFAULT_PDF_PATH) {
  const bytes = new Uint8Array(await readFile(pdfPath));
  const pdf = await getDocumentProxy(bytes);
  const { totalPages, text } = await extractText(pdf, { mergePages: false });
  const pages = Array.isArray(text) ? text : [String(text ?? "")];

  const docs = [];
  for (let i = 0; i < pages.length; i += 1) {
    const content = String(pages[i] ?? "").replace(/\s+\n/g, "\n").trim();
    if (!content) continue;
    docs.push({
      id: `resume-page-${i + 1}`,
      source: "Ramesh_Badugu_Resume.pdf",
      title: "Ramesh Badugu Resume",
      section: "resume",
      page: i + 1,
      totalPages,
      content,
    });
  }

  if (docs.length === 0) {
    throw new Error(`No extractable text found in ${pdfPath}`);
  }
  return docs;
}

export async function loadAllDocuments(pdfPath = DEFAULT_PDF_PATH) {
  const resumeDocs = await extractResumeDocuments(pdfPath);
  const portfolioDocs = JSON.parse(await readFile(PORTFOLIO_DOCS_PATH, "utf8"));
  return [...resumeDocs, ...portfolioDocs];
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  const documents = await loadAllDocuments(flags.pdfPath);

  if (flags.dryRun || !flags.workerUrl) {
    await writeFile(GENERATED_OUTPUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), documents }, null, 2));
    console.info(
      `[ingest] Prepared ${documents.length} source document(s) from resume PDF + portfolio docs -> ${GENERATED_OUTPUT_PATH}`,
    );
    if (!flags.dryRun && !flags.workerUrl) {
      console.info("[ingest] No RAG_INGEST_URL / --url set; skipped remote upload.");
    }
    return;
  }

  if (!flags.apiKey) {
    throw new Error("RAG_ADMIN_KEY or RAG_API_KEY is required to call the Worker /ingest endpoint.");
  }

  const response = await fetch(flags.workerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${flags.apiKey}`,
    },
    body: JSON.stringify({ documents }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(`Worker /ingest failed (${response.status}): ${result.error || "Unknown error"}`);
  }

  console.info(
    `[ingest] Uploaded ${result.documentsProcessed} documents (${result.chunksUpserted} chunks) to ${flags.workerUrl}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[ingest error]", error.message);
    process.exitCode = 1;
  });
}
