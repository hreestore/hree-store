import Link from "next/link";

import { paths } from "@/routes/paths";

// ----------------------------------------------------------------------

export function SignUpTerms({ className, ...other }) {
  return (
    <p
      className={`mt-6 text-center text-xs ${className || ''}`}
      {...other}
    >
      By signing up, I agree to{" "}
      <Link href={paths.legal.terms} className=" underline hover:text-[#711a20]">
        Terms of service
      </Link>
      {" and "}
      <Link href={paths.legal.privacy} className=" underline hover:text-[#711a20]">
        Privacy policy
      </Link>
      .
    </p>
  );
}
