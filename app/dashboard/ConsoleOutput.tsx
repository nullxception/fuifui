import React, { useEffect, useMemo, useRef } from "react";
import { useDiffusionJobs } from "./useDiffusionJobs";

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString();
};

const ConsoleOutput: React.FC = () => {
  const consoleRef = useRef<HTMLDivElement>(null);
  const { logs } = useDiffusionJobs();

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const processedLogs = useMemo(() => {
    const result: Array<{
      type: "stdout" | "stderr";
      message: string;
      timestamp: number;
      isProgress?: boolean;
    }> = [];
    let lastProgressIndex = -1;

    logs.forEach((log) => {
      const message = log.message.trim();
      // Check if this is a progress bar line
      const isProgress = /\|=*.*\| \d+\/\d+/.test(message);

      if (isProgress) {
        if (lastProgressIndex >= 0) {
          // Update the last progress line
          result[lastProgressIndex] = { ...log, isProgress: true };
        } else {
          // Add new progress line
          result.push({ ...log, isProgress: true });
          lastProgressIndex = result.length - 1;
        }
      } else {
        // Regular log line
        result.push(log);
        lastProgressIndex = -1; // Reset progress tracking
      }
    });

    return result;
  }, [logs]);

  return (
    <div
      className="scrollbar-thin h-[50vh] w-full overflow-auto bg-background/60 p-6 font-mono text-xs scrollbar-thumb-secondary scrollbar-track-transparent md:text-sm lg:h-full"
      ref={consoleRef}
    >
      {processedLogs.length === 0 ? (
        <div className="text-muted-foreground italic">
          Waiting for process output...
        </div>
      ) : (
        processedLogs.map((log, index) => (
          <div key={index} className="mb-1 font-mono text-xs">
            <span className="mr-2 text-muted-foreground select-none">
              [{formatTime(log.timestamp)}]
            </span>
            <span
              className={
                log.type === "stderr" ? "text-red-400" : "text-gray-300"
              }
            >
              {log.message}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default ConsoleOutput;
