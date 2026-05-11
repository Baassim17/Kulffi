export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5E6D3]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-[3px] border-[#A31D1D]/20 border-t-[#A31D1D] animate-spin" />
        <span className="text-xs tracking-widest uppercase text-[#A31D1D]/50">Loading...</span>
      </div>
    </div>
  );
}