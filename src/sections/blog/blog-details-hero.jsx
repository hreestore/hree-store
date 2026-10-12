import { fDate } from "@/utils/format-time";

// ----------------------------------------------------------------------

export function BlogDetailsHero({
  className,
  title,
  createdBy,
  coverUrl,
  createdAt,
  ...other
}) {
  return (
    <div
      className={[
        "mt-5 h-[480px] overflow-hidden relative bg-cover bg-center bg-no-repeat",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        backgroundImage: `linear-gradient(0deg, rgba(33,43,54,0.64), rgba(33,43,54,0.64)), url(${coverUrl})`,
      }}
      {...other}
    >
      {/* Container */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-full relative">
        {/* Title */}
        <h1 className="absolute z-10 max-w-[480px] pt-4 md:pt-16  text-3xl font-bold leading-tight">
          {title}
        </h1>

        {/* Author info pinned to bottom */}
        <div className="absolute left-0 bottom-0 w-full">
          <div className="flex items-center px-4 md:px-6 pb-6 md:pb-16">
            <div className="">
              <p className="text-sm font-semibold leading-snug">{createdBy}</p>
              <p className="mt-[2px] text-sm opacity-60">{fDate(createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}