'use client';

import Link from 'next/link';
import { paths } from '@/routes/paths';
import { Iconify } from '@/components/iconify';
import { Logo } from './logo';
import { useGetSocialMediaData } from '@/api/social-media';
import { useGetCategories } from '@/api';
import '../app/globals.css'
// ---------------------------------------

export default function Footer() {
  const { socialMediaData } = useGetSocialMediaData();
  const { categories } = useGetCategories();

  return (
    <footer
      className="bg-cover bg-center text-white py-20 pb-10 relative z-[1] footer-bg"
    >      {/* <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent bg-black/90 to-transparent" /> */}
      < div className="bg-black/40 h-full w-full absolute left-0 z-0 top-0" ></div >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="grid grid-cols-1 md:grid-cols-12 lg:gap-20 gap-5 z-[99] relative">
          <div className="col-span-1 md:col-span-4 ">
            <h3 className="text-md font-black uppercase tracking-[0.4em]  text-[#f5f5f5] mb-10 text-center">Our Accessories</h3>
            <ul className="space-y-5  text-sm font-bold uppercase tracking-widest text-center">
              {categories?.find((cat) => (cat.category_id) === 289)?.subCategories?.filter((subCat) => subCat.show_in_home)?.map((type, idx) => (
                <li key={type.category_id}>
                  <Link href={`/shop?sub=${type.category_id}`} className="hover:text-[#ffffff] transition-colors">
                    {type.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-4">
            {/* <Link href={paths.home} className="text-5xl font-display font-black tracking-tighter uppercase leading-none">
              HREE<span className="text-[#711a20]">CREATE</span>
            </Link> */}
            <div className="flex justify-center pb-5 ">
              <Logo className="scale-[3] origin-center" />
            </div>
            <p className="mt-8  text-[#f5f5f5] text-center  text-xl font-display font-black uppercase tracking-tighter w-full">
              Recreating Your Imagination</p>
            <div className="lg:mt-10 mt-3 flex gap-6 justify-center">
              {Array.isArray(socialMediaData) && socialMediaData.map((social) =>
                <Link key={social.id} title={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#ffffff]/5 rounded-2xl flex items-center justify-center hover:bg-[#711a20] transition-all cursor-pointer group hover:scale-110">
                  <Iconify icon={social.icon} className="w-5 h-5 text-[#ffffff] group-hover:scale-110 transition-transform" />
                </Link>
              )}

              {/* <Link href={paths.social.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center hover:bg-[#711a20] transition-all cursor-pointer group hover:scale-110">
                <Iconify icon="mdi:facebook" className="w-5 h-5 text-[#ffffff] group-hover:scale-110 transition-transform" />
              </Link>
              <Link href={paths.social.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#ffffff]/5 rounded-2xl flex items-center justify-center hover:bg-[#711a20] transition-all cursor-pointer group hover:scale-110">
                <Iconify icon="ri:twitter-x-fill" className="w-5 h-5 text-[#ffffff] group-hover:scale-110 transition-transform" />
              </Link> */}
            </div>
          </div>

          <div className="col-span-1 md:col-span-4">
            <h3 className="text-md font-black uppercase tracking-[0.4em] text-[#f5f5f5] mb-10 text-center">Quick Links</h3>
            <ul className="space-y-5  text-sm font-bold uppercase tracking-widest text-center">
              <li>
                <Link href={`${paths.blog.root} `} className="hover:text-[#ffffff] transition-colors">
                  Blogs
                </Link>
              </li>
              <li><Link href={paths.support.shipping} className="hover:text-[#ffffff] transition-colors">Shipping Policy</Link></li>
              <li><Link href={paths.support.returns} className="hover:text-[#ffffff] transition-colors">Returns & Exchanges</Link></li>
              <li><Link href={paths.contact} className="hover:text-[#ffffff] transition-colors">Contact Us</Link></li>
              <li><Link href={paths.support.faq} className="hover:text-[#ffffff] transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="lg:mt-32 mt-3 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6  text-[10px] font-black uppercase tracking-[0.3em]">
          <p>© {new Date().getFullYear()} Hree Create. Recreating Your Imagination.</p>
          <div className="flex gap-10">
            <Link href={paths.legal.privacy} className="hover:text-[#ffffff] transition-colors">Privacy Policy</Link>
            <Link href={paths.legal.terms} className="hover:text-[#ffffff] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer >
  );
}
