// ----------------------------------------------------------------------

export function FormHead({ className, icon, title, description, ...other }) {
  return (
    <div className={className} {...other}>
      {icon && (
        <span className="mb-3 mx-auto inline-flex">
          {icon}
        </span>
      )}

      <div className="flex flex-col gap-1.5 text-center whitespace-pre-line">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
