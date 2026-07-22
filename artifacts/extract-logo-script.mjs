import fs from "fs";

const p =
  "C:/Users/Skipp3r407/.cursor/projects/c-Users-Skipp3r407-Desktop-Websites-egg-meme-project/agent-transcripts/71a70021-1a74-4b5d-83d1-8facb62322e2/subagents/0c9718b4-70d2-437c-bccd-14e292b83093.jsonl";
const lines = fs.readFileSync(p, "utf8").split("\n");
for (const line of lines) {
  if (!line.includes("import sharp") || !line.includes("composite")) continue;
  const j = JSON.parse(line);
  const tools = j.message?.content || [];
  for (const t of tools) {
    if (
      t.type === "tool_use" &&
      t.input?.command &&
      t.input.command.includes("import sharp") &&
      t.input.command.includes("composite")
    ) {
      fs.writeFileSync("artifacts/prior-logo-stamp-command.txt", t.input.command);
      console.log("wrote artifacts/prior-logo-stamp-command.txt", t.input.command.length);
      process.exit(0);
    }
  }
}
console.log("not found");
