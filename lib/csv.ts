export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
  const rows = parseRows(text);
  if (rows.length === 0) {
    return [];
  }
  const headers = rows[0].map((cell) => cell.trim());
  return rows.slice(1).map((row) => {
    const record: CsvRow = {};
    headers.forEach((header, index) => {
      record[header] = (row[index] ?? "").trim();
    });
    return record;
  });
}

function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === "\"" && inQuotes && next === "\"") {
      value += "\"";
      i += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      current.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      current.push(value);
      value = "";
      if (current.some((cell) => cell.trim() !== "")) {
        rows.push(current);
      }
      current = [];
      continue;
    }

    value += char;
  }

  if (value.length || current.length) {
    current.push(value);
    if (current.some((cell) => cell.trim() !== "")) {
      rows.push(current);
    }
  }

  return rows;
}
