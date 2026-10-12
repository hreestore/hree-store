
import { useState } from "react";
import { Iconify } from "@/components/iconify";
import { useAppSelector } from "@/redux/hooks";

// Static Pokhara branch data (outside component to avoid re-creation on every render)
const POKHARA_BRANCH = {
    id: "pokhara",
    label: "Pokhara",
    sublabel: "Lakeside",
    map_src:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3515.7950488524734!2d83.9578596762067!3d28.213538802982843!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995950792694efb%3A0x49b3fc07d7a3a17a!2sHree%20Store%20Pokhara!5e0!3m2!1sne!2snp!4v1781243715646!5m2!1sne!2snp",
    address: "Lakeside, Pokhara 33700, Nepal",
    phone: "+977 9856015343",
    email: "hreecreate@gmail.com",
    hours: "Sun – Sat, 9 AM – 7 PM",
};

function BranchCard({ branch }) {
    return (
        <div className="flex flex-col gap-0 h-full">
            {/* Map */}
            <div
                className="relative w-full rounded-2xl overflow-hidden shadow-md border border-gray-100"
                style={{ height: 340 }}
            >
                <iframe
                    title={`${branch.label} Map`}
                    src={branch.map_src}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="transition-all duration-500"
                />
                {/* Branch badge on map */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-[#711a20] animate-pulse inline-block" />
                    <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">
                        {branch.label} · {branch.sublabel}
                    </span>
                </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 mt-4">
                <InfoTile icon="carbon:location" label="Address" value={branch.address} />
                <InfoTile icon="carbon:phone" label="Phone" value={branch.phone} />
                {branch.email && <InfoTile icon="carbon:email" label="Email" value={branch.email} />}
                {branch.hours && <InfoTile icon="carbon:time" label="Hours" value={branch.hours} />}
            </div>
        </div>
    );
}

function InfoTile({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-[#FAFAFA] hover:bg-white hover:shadow-sm transition-all duration-200 group">
            <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-white group-hover:bg-[#711a20]/5 flex items-center justify-center shadow-sm border border-gray-100 transition-colors duration-200">
                <Iconify icon={icon} className="w-4 h-4 text-[#711a20]" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                <p className="text-gray-700 text-sm font-medium leading-snug truncate">{value}</p>
            </div>
        </div>
    );
}

export default function ContactMap() {
    const { vendor } = useAppSelector((state) => state.vendor);
    const [active, setActive] = useState("kathmandu");

    const BRANCHES = [
        {
            id: "kathmandu",
            label: "Kathmandu",
            sublabel: "Naxal",
            map_src: vendor?.map_link || "",
            address: vendor?.address || "",
            phone: vendor?.contact_info || "",
            email: "hreecreate@gmail.com",
            hours: "Sun – Sat, 9 AM – 7 PM",
            // email: vendor?.email || "",
            // hours: vendor?.hours || "",
        },
        POKHARA_BRANCH,
    ];

    const activeBranch = BRANCHES.find((b) => b.id === active);

    return (
        <section className="w-full">
            {/* Section header */}
            <div className="mb-8">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#711a20] mb-2">
                    Our Locations
                </p>
                <h2 className="text-3xl font-extrabold leading-tight">
                    Find Us Near You
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                    Two branches across Nepal — pick the one closest to you.
                </p>
            </div>

            {/* Branch switcher tabs */}
            <div className="flex gap-1 p-1 bg-gray-100/70 rounded-2xl w-fit mb-8 border border-gray-100 shadow-inner">
                {BRANCHES.map((branch) => (
                    <button
                        key={branch.id}
                        onClick={() => setActive(branch.id)}
                        className={`
                            relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold
                            transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#711a20]/40
                            ${active === branch.id
                                ? "bg-white text-gray-900 shadow-md border border-gray-100"
                                : "text-gray-500 hover:text-gray-700"
                            }
                        `}
                    >
                        {active === branch.id && (
                            <span className="w-2 h-2 rounded-full bg-[#711a20] flex-shrink-0" />
                        )}
                        <span>{branch.label}</span>
                        <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full transition-colors ${active === branch.id
                                ? "bg-[#711a20]/10 text-[#711a20]"
                                : "bg-gray-200 text-gray-400"
                                }`}
                        >
                            {branch.sublabel}
                        </span>
                    </button>
                ))}
            </div>
            {/* <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BRANCHES.map((branch) => (
                    <button
                        key={branch.id}
                        onClick={() => setActive(branch.id)}
                        className={`
                            flex items-center gap-4 p-4 rounded-xl border text-left
                            transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#711a20]/40
                            ${active === branch.id
                                ? "border-[#711a20]/25 bg-[#711a20]/5 shadow-sm"
                                : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                            }
                        `}
                    >
                        <div
                            className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors ${active === branch.id ? "bg-[#711a20] text-white" : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            <Iconify icon="carbon:store" className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{branch.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{branch.address}</p>
                        </div>
                        {active === branch.id && (
                            <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-[#711a20] bg-[#711a20]/10 px-2 py-1 rounded-full">
                                Viewing
                            </span>
                        )}
                    </button>
                ))}
            </div> */}
            {/* Active branch content */}
            <div
                key={active}
                style={{ animation: "fadeSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both" }}
            >
                <BranchCard branch={activeBranch} />
            </div>

            {/* Quick compare strip */}


            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
}