import { Skeleton } from "@/components/ui/misc";

export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="grid gap-4">
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
