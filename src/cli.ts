import { readFile } from "node:fs/promises";
import { analyzeMatch } from "./analyzer.js";

interface CliArgs {
  resume?: string;
  vacancy?: string;
  pretty: boolean;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!args.resume || !args.vacancy) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const [resumeText, vacancyText] = await Promise.all([
    readFile(args.resume, "utf8"),
    readFile(args.vacancy, "utf8"),
  ]);

  const report = analyzeMatch(resumeText, vacancyText);
  console.log(JSON.stringify(report, null, args.pretty ? 2 : 0));
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { pretty: false };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current === "--resume" && next) {
      args.resume = next;
      index += 1;
    } else if (current === "--vacancy" && next) {
      args.vacancy = next;
      index += 1;
    } else if (current === "--pretty") {
      args.pretty = true;
    }
  }

  return args;
}

function printUsage(): void {
  console.error("Usage:\n  npm run analyze -- --resume examples/sample-resume.md --vacancy examples/sample-vacancy.md --pretty");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
