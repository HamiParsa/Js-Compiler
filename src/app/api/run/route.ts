import { NextRequest, NextResponse } from "next/server";

type ExecResponse = {
  stdout: string;
  stderr: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: { code?: string } = await req.json();

    if (!body.code) {
      return NextResponse.json(
        { stdout: "", stderr: "Code is missing" } as ExecResponse,
        { status: 400 }
      );
    }

    let stdout = "";
    let stderr = "";

    try {
      const log: string[] = [];
      const consoleProxy = { log: (...args: string[]) => log.push(args.join(" ")) };

      // Execute JS safely
      new Function("console", body.code)(consoleProxy);

      stdout = log.join("\n");
    } catch (err) {
      stderr = err instanceof Error ? err.message : String(err);
    }

    const response: ExecResponse = { stdout, stderr };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Server error:", err);
    const response: ExecResponse = { stdout: "", stderr: "Server error" };
    return NextResponse.json(response, { status: 500 });
  }
}
