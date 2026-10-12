// import { Box, Skeleton } from "@mui/material";

// // ----------------------------------------------------------------------

// export function BlogItemSkeleton({ sx, itemCount = 16, ...other }) {
//   return Array.from({ length: itemCount }, (_, index) => (
//     <Box
//       key={index}
//       sx={[
//         (theme) => ({
//           display: "flex",
//           borderRadius: 2,
//           bgcolor: "background.paper",
//           border: `solid 1px ${theme.vars.palette.divider}`,
//         }),
//         ...(Array.isArray(sx) ? sx : [sx]),
//       ]}
//       {...other}
//     >
//       <Box
//         sx={{
//           p: 3,
//           gap: 2,
//           flexGrow: 1,
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <Skeleton variant="circular" sx={{ width: 40, height: 40 }} />
//           <Skeleton sx={{ width: 24, height: 12 }} />
//         </Box>

//         <Skeleton sx={{ width: 1, height: 10 }} />
//         <Skeleton sx={{ width: `calc(100% - 40px)`, height: 10 }} />
//         <Skeleton sx={{ width: `calc(100% - 80px)`, height: 10 }} />
//       </Box>

//       <Box sx={{ p: 1, display: { xs: "none", sm: "block" } }}>
//         <Skeleton sx={{ width: 170, height: 240, flexShrink: 0 }} />
//       </Box>
//     </Box>
//   ));
// }

// // ----------------------------------------------------------------------

// export function BlogDetailsSkeleton({ sx, ...other }) {
//   return (
//     <Box sx={sx} {...other}>
//       <Skeleton variant="rectangular" sx={{ height: 480 }} />

//       <Box sx={{ width: 1, maxWidth: 720, mx: "auto" }}>
//         <Box
//           sx={{
//             my: 8,
//             gap: 2,
//             display: "flex",
//             flexDirection: "column",
//           }}
//         >
//           <Skeleton height={10} />
//           <Skeleton height={10} sx={{ width: 0.9 }} />
//           <Skeleton height={10} sx={{ width: 0.8 }} />
//         </Box>
//       </Box>
//     </Box>
//   );
// }
"use client";

// ----------------------------------------------------------------------

export function BlogItemSkeleton({ itemCount = 16, className = "", ...other }) {
  return Array.from({ length: itemCount }).map((_, index) => (
    <div
      key={index}
      className={`flex rounded-lg bg-white border border-gray-200 ${className}`}
      {...other}
    >
      <div className="p-4 flex flex-col gap-3 flex-1 animate-pulse">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="w-6 h-3 bg-gray-200 rounded" />
        </div>

        {/* Text lines */}
        <div className="h-2 bg-gray-200 rounded w-full" />
        <div className="h-2 bg-gray-200 rounded w-5/6" />
        <div className="h-2 bg-gray-200 rounded w-4/6" />
      </div>

      {/* Image skeleton */}
      <div className="p-1 hidden sm:block">
        <div className="w-[170px] h-[240px] bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  ));
}

// ----------------------------------------------------------------------

export function BlogDetailsSkeleton({ className = "", ...other }) {
  return (
    <div className={className} {...other}>
      {/* Hero image */}
      <div className="w-full h-[480px] bg-gray-200 animate-pulse" />

      <div className="w-full max-w-[720px] mx-auto">
        <div className="my-8 flex flex-col gap-3 animate-pulse">
          <div className="h-2 bg-gray-200 rounded w-full" />
          <div className="h-2 bg-gray-200 rounded w-[90%]" />
          <div className="h-2 bg-gray-200 rounded w-[80%]" />
        </div>
      </div>
    </div>
  );
}