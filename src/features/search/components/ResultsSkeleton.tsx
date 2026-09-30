import { resultsGrid, skeletonCard } from '../../../styles/classes';

export function ResultsSkeleton({ count }: { count: number }) {
  return (
    <div className={resultsGrid} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${skeletonCard} p-5`}>
          <div className="flex items-center gap-[0.85rem]">
            <div className="skeleton w-[42px] h-[42px] rounded-[10px] shrink-0" />
            <div className="flex-1 flex flex-col gap-[6px]">
              <div className="skeleton w-[65%] h-[16px]" />
              <div className="skeleton w-[40%] h-[12px]" />
            </div>
          </div>
          <div className="skeleton w-full h-[36px] my-2" />
          <div className="flex gap-3 mt-auto pt-[0.85rem] border-t border-line">
            <div className="skeleton w-[60px] h-[16px]" />
            <div className="skeleton w-[50px] h-[16px]" />
            <div className="skeleton w-[50px] h-[16px]" />
            <div className="skeleton w-[70px] h-[16px] ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
