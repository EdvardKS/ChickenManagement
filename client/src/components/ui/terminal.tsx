import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TerminalProps {
  logs: string[];
}

export function Terminal({ logs }: TerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border bg-slate-950 p-4">
      <div className="font-mono text-sm text-green-400">
        {logs.map((log, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {log}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
