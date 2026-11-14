import { SkipLink } from "@/components/ui/misc";

/** Minimal shell for login and quiz: no main nav, no footer. Each page renders its own top bar. */
export default function MinimalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      {children}
    </>
  );
}
