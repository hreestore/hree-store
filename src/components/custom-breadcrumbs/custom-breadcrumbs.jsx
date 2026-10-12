"use client";

import Link from "next/link";

export function CustomBreadcrumbs({ heading, links, action, className, ...other }) {
  const lastLink = links[links.length - 1]?.name;

  return (
    <div className={className}>
      <div className="flex items-center">
        <div className="flex-1">
          {heading && (
            <h4 className="text-2xl font-bold mb-2">{heading}</h4>
          )}

          {!!links.length && (
            <nav aria-label="breadcrumb" {...other}>
              <ol className="flex items-center flex-wrap gap-2">
                {links.map((link, index) => (
                  <li key={link.name || index} className="flex items-center gap-2">
                    <LinkItem link={link} disabled={link.name === lastLink} />
                    {index < links.length - 1 && <Separator />}
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

function Separator() {
  return (
    <span className="w-1 h-1 dark:bg-white rounded-full inline-block" />
  );
}

function LinkItem({ link, disabled }) {
  const { name, href, icon } = link;

  const baseClass = "text-sm inline-flex items-center ";
  const disabledClass = "cursor-default pointer-events-none ";

  const content = (
    <>
      {icon && (
        <span className="mr-1 inline-flex [&_svg]:w-5 [&_svg]:h-5">{icon}</span>
      )}
      {name}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClass} no-underline hover:text-[#711a20] transition-colors duration-200`}
      >
        {content}
      </Link>
    );
  }

  return (
    <span className={`${baseClass} ${disabled ? disabledClass : ""}`}>
      {content}
    </span>
  );
}