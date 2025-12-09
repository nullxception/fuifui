import { TRPCError } from "@trpc/server";

async function getPhysicalCoreCount(): Promise<number | null> {
  const platform = process.platform;

  try {
    if (platform === "linux") {
      // lscpu -p=core outputs core IDs; filter out comments; count unique
      const proc = Bun.spawn([
        "bash",
        "-c",
        "lscpu -p=core | grep -v '^#' | sort -u | wc -l",
      ]);
      const output = await new Response(proc.stdout).text();
      return Number(output.trim());
    }

    if (platform === "darwin") {
      // macOS: sysctl for physical cores
      const proc = Bun.spawn(["sysctl", "-n", "hw.physicalcpu"]);
      const output = await new Response(proc.stdout).text();
      return Number(output.trim());
    }

    if (platform === "win32") {
      // Windows: WMIC
      const proc = Bun.spawn(["cmd", "/c", "WMIC CPU Get NumberOfCores"]);
      const output = await new Response(proc.stdout).text();
      const matches = output.match(/\d+/g);
      return matches ? Number(matches[0]) : null;
    }

    return null; // unsupported OS
  } catch {
    return null;
  }
}
async function info() {
  try {
    const cpuCount = await getPhysicalCoreCount();
    if (cpuCount === null) {
      // Fallback to logical cores if physical cores detection fails
      const os = await import("os");
      return { cpuCount: os.cpus().length };
    }

    return { cpuCount };
  } catch (error) {
    console.error("Error getting system info:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get system info",
      cause: error,
    });
  }
}

export default { info };
