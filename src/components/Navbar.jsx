'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X, User, Heart, HeartIcon, LogOut, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { paths } from '@/routes/paths';
import { Logo } from './logo/logo';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useRouter } from '@/routes/hooks';
import { clearUser } from '@/redux/reducer/auth/auth-slice';
import { resetCart } from '@/redux/actions';
import { toast } from '@/components/snackbar';
import { ThemeToggle } from './theme-toggle';
import { useTheme } from 'next-themes';
import MobileBottomNav from './MobileBottomNav';
import { Iconify } from './iconify';

export default function Navbar() {
  const { resolvedTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { totalItems } = useAppSelector((state) => state.cart);
  const { totalItems: wishlistTotalItems } = useAppSelector((state) => state.wishlist);
  const { isLogin, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.profile);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Track when the user last logged in to ignore transient 401s right after login
  const loginTimestampRef = useRef(null);

  const handleLogout = () => {
    dispatch(clearUser());
    dispatch(resetCart());
    setAnchorEl(null);
    toast.success('Logged out successfully!');
    router.push(paths.home);
  };

  useEffect(() => {
    if (isLogin) {
      // Record the moment isLogin became true
      loginTimestampRef.current = Date.now();
    }
  }, [isLogin]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Listen for unauthorized API calls globally
    const handleUnauthorized = () => {
      if (!isLogin) return;

      // Ignore 401s fired within 3 s of a fresh login — these are transient
      // race conditions where the token hadn't propagated yet.
      const msSinceLogin = loginTimestampRef.current
        ? Date.now() - loginTimestampRef.current
        : Infinity;
      if (msSinceLogin < 3000) return;

      dispatch(clearUser());
      dispatch(resetCart());
      setAnchorEl(null);
      toast.error('Session expired. Please log in again.');
      router.push(paths.auth.signIn);
    };
    window.addEventListener('unauthorized_api_call', handleUnauthorized);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('unauthorized_api_call', handleUnauthorized);
    };
  }, [isLogin, dispatch, router]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const { full_name, featured_image } = profile;
  const showPopover = Boolean(anchorEl);

  return (
    <>
      {resolvedTheme === 'dark' && (
        <nav className="py-2.5 z-[99] backdrop-blur-xl fixed top-0 left-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">

              <Logo href={paths.home} className="" />
              {/* HREE<span className="text-[#711a20]">CREATE</span> */}

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-12">
                <Link href={paths.catalog} className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-[#711a20] transition-colors relative group">
                  Catalog
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#711a20] transition-all group-hover:w-full" />
                </Link>

                <Link href={paths.about} className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-[#711a20] transition-colors relative group">
                  Our Story
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#711a20] transition-all group-hover:w-full" />
                </Link>
                {/* <Link href={paths.blog.root} className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-[#711a20] transition-colors relative group">
                Blogs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#711a20] transition-all group-hover:w-full" />
              </Link> */}
                <Link href={paths.shop.root} className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-[#711a20] transition-colors relative group">
                  Accessories
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#711a20] transition-all group-hover:w-full" />
                </Link>
                <Link href={paths.contact} className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-[#711a20] transition-colors relative group">
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#711a20] transition-all group-hover:w-full" />
                </Link>

              </div>

              <div className="flex items-center gap-6">
                <ThemeToggle />
                <Link href={paths.wishlist} className="hidden md:block relative group">
                  <div className="  hover:text-[#711a20] transition-all shadow-xl flex justify-center items-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  {wishlistTotalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#711a20] text-[#ffffff] text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      {wishlistTotalItems}
                    </span>
                  )}
                </Link>
                <Link href={paths.cart} className="relative group">
                  <div className="  hover:text-[#711a20] transition-all shadow-xl flex justify-center items-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#711a20] text-[#ffffff] text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      {totalItems}
                    </span>
                  )}
                </Link>
                {isLogin ? (
                  <div
                    className="hidden md:block relative group"
                    onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
                    onMouseLeave={() => setAnchorEl(null)}
                  >
                    <button
                      onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}
                      className="  hover:text-[#711a20] transition-all shadow-xl flex justify-center items-center h-7 w-7 rounded-full overflow-hidden">
                      <img
                        src={featured_image || '/img/user/icon.png'}
                        alt={full_name}
                        title={full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.png';
                        }}
                      />
                    </button>
                    <div
                      className={`absolute right-0 top-10 pt-2 z-50 transition-all duration-300 transform ${showPopover ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'
                        } `}
                    >
                      <div className="bg-[#0a1a1a] rounded-xl shadow-2xl border border-gray-200  py-2 w-52 overflow-hidden backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
                        <div className="px-4 py-3 border-b border-gray-800 mb-1">
                          <p className="text-xs font-semibold  uppercase tracking-wider">Account</p>
                          <p className="text-sm font-bold truncate ">{full_name}</p>
                        </div>
                        <Link
                          href={paths.profile.root}
                          onClick={() => setAnchorEl(null)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm font-medium  transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-medium text-red-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={paths.auth.signIn} className="hidden md:block relative group">
                    <div className="  hover:text-[#711a20] transition-all shadow-xl flex justify-center items-center">
                      <User className="w-5 h-5" />
                    </div>
                  </Link>
                )}
                <Link
                  href={paths.customize.root}
                  className="group lg:block hidden relative bg-[#711a20] text-[#ffffff] px-4 py-2 rounded-full text-sm font-black uppercase  hover:bg-[#710000] transition-all shadow-[0_0_40px_rgba(139,0,0,0.3)] overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Customize <Iconify icon="solar:magic-stick-3-bold" />
                  </span>
                </Link>
                <button
                  className="md:hidden p-2.5 bg-gray-100 dark:bg-[#1a2e2f] rounded-full hover:bg-gray-200 dark:hover:bg-[#233c3e] transition-all duration-300 flex items-center justify-center text-gray-900 dark:text-white"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Sidebar */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/70 backdrop-blur-4xl z-[100] md:hidden h-screen"
                />

                {/* Sidebar */}
                <motion.div
                  initial={{
                    x: '105%',
                    opacity: 0.7,
                    scale: 0.98,
                  }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    x: '105%',
                    opacity: 0.7,
                    scale: 0.98,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className={`fixed inset-y-0 right-0 w-80 h-screen z-[101] md:hidden flex flex-col
  overflow-hidden rounded-l-[2rem]
  border-l backdrop-blur-3xl backdrop-saturate-200
  transform-gpu will-change-transform
    
  ${resolvedTheme === 'dark'
                      ? `
        bg-white/[0.03]
        border-white/20
        text-white
        shadow-[0_8px_40px_rgba(0,0,0,0.6)]
      `
                      : `
        bg-white/[0.25]
        border-white/60
        text-gray-900
        shadow-[0_8px_40px_rgba(31,38,135,0.15)]
      `
                    }`}
                >
                  {/* Gradient Overlay */}
                  <div
                    className={`absolute inset-0 pointer-events-none
    ${resolvedTheme === 'dark'
                        ? 'bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0))]'
                        : 'bg-[linear-gradient(135deg,rgba(255,255,255,0.4),rgba(255,255,255,0))]'
                      }`}
                  />

                  {/* Glow Effect */}
                  <div
                    className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-30
    ${resolvedTheme === 'dark'
                        ? 'bg-cyan-400/20'
                        : 'bg-blue-300/30'
                      }`}
                  />

                  {/* Header */}
                  <div
                    className={`relative z-10 px-5 py-4 flex justify-end items-center border-b
    ${resolvedTheme === 'dark'
                        ? 'border-white/10'
                        : 'border-white/30'
                      }`}
                  >
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`p-2 rounded-full transition-all duration-300 active:scale-90
      ${resolvedTheme === 'dark'
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-white/20 hover:bg-white/80 text-gray-900'
                        }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
                    <Link
                      href={paths.catalog}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xl font-bold uppercase tracking-wider hover:text-[#711a20]
      transition-all duration-300 hover:translate-x-2 flex items-center group"
                    >
                      Catalog
                      <span className="w-0 group-hover:w-4 h-0.5 bg-[#711a20] ml-2 transition-all duration-300" />
                    </Link>

                    <Link
                      href={paths.about}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xl font-bold uppercase tracking-wider hover:text-[#711a20]
      transition-all duration-300 hover:translate-x-2 flex items-center group"
                    >
                      Our Story
                      <span className="w-0 group-hover:w-4 h-0.5 bg-[#711a20] ml-2 transition-all duration-300" />
                    </Link>

                    <Link
                      href={paths.contact}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xl font-bold uppercase tracking-wider hover:text-[#711a20]
      transition-all duration-300 hover:translate-x-2 flex items-center group"
                    >
                      Contact
                      <span className="w-0 group-hover:w-4 h-0.5 bg-[#711a20] ml-2 transition-all duration-300" />
                    </Link>

                    <div
                      className={`h-px my-2 ${resolvedTheme === 'dark'
                        ? 'bg-white/10'
                        : 'bg-black/10'
                        }`}
                    />

                    {isLogin ? (
                      <>
                        <Link
                          href={paths.profile.root}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-lg font-bold uppercase tracking-wider
          hover:text-[#711a20]
          transition-all duration-300 flex items-center gap-4 py-2"
                        >
                          <User className="w-5 h-5 opacity-70" />
                          Profile
                        </Link>

                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="text-lg font-bold uppercase tracking-wider
          text-red-500 hover:text-red-600
          transition-all duration-300 flex items-center gap-4 text-left w-full py-2"
                        >
                          <LogOut className="w-5 h-5" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link
                        href={paths.auth.signIn}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-bold uppercase tracking-wider
        hover:text-[#711a20]
        transition-all duration-300 flex items-center gap-4 py-2"
                      >
                        <User className="w-5 h-5 opacity-70" />
                        Login / Sign Up
                      </Link>
                    )}
                    <Link
                      href={paths.customize.root}
                      className="group lg:hidden block relative bg-[#711a20] text-[#ffffff] px-6 py-4 rounded-full text-lg font-black uppercase  hover:bg-[#710000] transition-all shadow-[0_0_40px_rgba(139,0,0,0.3)] overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Customize Now
                      </span>
                    </Link>
                    {/* Footer */}
                    <div
                      className={`mt-auto pt-8 border-t ${resolvedTheme === 'dark'
                        ? 'border-white/10'
                        : 'border-black/10'
                        }`}
                    >
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-50 mb-6">
                        Connect
                      </p>

                      <div className="flex flex-col gap-5">
                        <span
                          className="text-sm font-bold uppercase tracking-widest cursor-pointer
          hover:text-[#711a20]
          flex items-center gap-3 group transition-all duration-300"
                        >
                          <span className="w-2 h-2 bg-[#711a20] rounded-full group-hover:scale-125 transition-transform duration-300" />
                          Instagram
                        </span>

                        <span
                          className="text-sm font-bold uppercase tracking-widest cursor-pointer
          hover:text-[#711a20]
          flex items-center gap-3 group transition-all duration-300"
                        >
                          <span className="w-2 h-2 bg-[#711a20] rounded-full group-hover:scale-125 transition-transform duration-300" />
                          Facebook
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </nav>
      )}
      {resolvedTheme === 'light' && (
        <nav className="py-2.5 z-[99] fixed top-0 left-0 backdrop-blur-xl bg-[#ffffff]/40 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">

              <Logo href={paths.home} className="" />
              {/* HREE<span className="text-[#711a20]">CREATE</span> */}

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-12">
                <Link href={paths.catalog} className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-[#711a20] transition-colors relative group">
                  Catalog
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#711a20] transition-all group-hover:w-full" />
                </Link>

                <Link href={paths.about} className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-[#711a20] transition-colors relative group">
                  Our Story
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#711a20] transition-all group-hover:w-full" />
                </Link>
                <Link href={paths.shop.root} className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-[#711a20] transition-colors relative group">
                  Accessories
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#711a20] transition-all group-hover:w-full" />
                </Link>
                <Link href={paths.contact} className="text-[11px] font-black uppercase tracking-[0.3em] hover:text-[#711a20] transition-colors relative group">
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#711a20] transition-all group-hover:w-full" />
                </Link>

              </div>

              <div className="flex items-center gap-6">
                <ThemeToggle />
                <Link href={paths.wishlist} className="hidden md:block relative group">
                  <div className="  hover:text-[#711a20] transition-all shadow-xl flex justify-center items-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  {wishlistTotalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#711a20] text-[#ffffff] text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      {wishlistTotalItems}
                    </span>
                  )}
                </Link>
                <Link href={paths.cart} className="relative group">
                  <div className="  hover:text-[#711a20] transition-all shadow-xl flex justify-center items-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#711a20] text-[#ffffff] text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      {totalItems}
                    </span>
                  )}
                </Link>
                {isLogin ? (
                  <div
                    className="hidden md:block relative group"
                    onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
                    onMouseLeave={() => setAnchorEl(null)}
                  >
                    <button
                      onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}
                      className="  hover:text-[#711a20] transition-all shadow-xl flex justify-center items-center h-8 w-8 border border-1 border-amber-100 rounded-full overflow-hidden">
                      <img
                        src={featured_image || '/img/user/icon.png'}
                        alt={full_name}
                        title={full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.png';
                        }}
                      />
                    </button>
                    <div
                      className={`absolute right-0 top-10 pt-2 z-50 transition-all duration-300 transform ${showPopover ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'
                        } `}
                    >
                      {resolvedTheme === 'light' && (

                        <div className="bg-[#f7e6dc]  rounded-xl shadow-2xl border border-gray-200  py-2 w-52 overflow-hidden backdrop-blur-xl">
                          <div className="px-4 py-3 border-b border-gray-100  mb-1">
                            <p className="text-xs font-semibold  uppercase tracking-wider">Account</p>
                            <p className="text-sm font-bold truncate text-gray-900 ">{full_name}</p>
                          </div>
                          <Link
                            href={paths.profile.root}
                            onClick={() => setAnchorEl(null)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50  text-sm font-medium text-gray-700  transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-red-50  text-sm font-medium text-red-600 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      )}
                      {
                        resolvedTheme === "dark" && (
                          <div className="bg-[#0a1a1a] rounded-xl shadow-2xl border border-gray-700 py-2 w-52 overflow-hidden backdrop-blur-xl">
                            <div className="px-4 py-3 border-b border-gray-800 mb-1">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                              <p className="text-sm font-bold truncatetext-white">{full_name}</p>
                            </div>
                            <Link
                              href={paths.profile.root}
                              onClick={() => setAnchorEl(null)}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              Profile
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-medium text-red-600 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Logout
                            </button>
                          </div>
                        )
                      }
                    </div>
                  </div>
                ) : (
                  <Link href={paths.auth.signIn} className="hidden md:block relative group">
                    <div className="  hover:text-[#711a20] transition-all shadow-xl flex justify-center items-center">
                      <User className="w-5 h-5" />
                    </div>
                  </Link>
                )}
                <Link
                  href={paths.customize.root}
                  className="group lg:block hidden relative bg-[#711a20] text-[#ffffff] px-4 py-2 rounded-full text-sm font-black uppercase  hover:bg-[#710000] transition-all shadow-[0_0_40px_rgba(139,0,0,0.3)] overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-1">
                    Customize <Iconify icon="solar:magic-stick-3-bold" />
                  </span>
                </Link>
                <button
                  className="md:hidden p-2.5 bg-gray-100 dark:bg-[#1a2e2f] rounded-full hover:bg-gray-200 dark:hover:bg-[#233c3e] transition-all duration-300 flex items-center justify-center text-gray-900 dark:text-white"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Sidebar */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/70 backdrop-blur-4xl z-[100] md:hidden h-screen"
                />

                {/* Sidebar */}
                <motion.div
                  initial={{
                    x: '105%',
                    opacity: 0.7,
                    scale: 0.98,
                  }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    x: '105%',
                    opacity: 0.7,
                    scale: 0.98,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className={`fixed inset-y-0 right-0 w-80 h-screen z-[101] md:hidden flex flex-col
  overflow-hidden rounded-l-[2rem]
  border-l backdrop-blur-3xl backdrop-saturate-200
  transform-gpu will-change-transform
    
  ${resolvedTheme === 'dark'
                      ? `
        bg-white/[0.03]
        border-white/20
        text-white
        shadow-[0_8px_40px_rgba(0,0,0,0.6)]
      `
                      : `
        bg-white/[0.25]
        border-white/60
        text-gray-900
        shadow-[0_8px_40px_rgba(31,38,135,0.15)]
      `
                    }`}
                >
                  {/* Gradient Overlay */}
                  <div
                    className={`absolute inset-0 pointer-events-none
    ${resolvedTheme === 'dark'
                        ? 'bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0))]'
                        : 'bg-[linear-gradient(135deg,rgba(255,255,255,0.4),rgba(255,255,255,0))]'
                      }`}
                  />

                  {/* Glow Effect */}
                  <div
                    className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-30
    ${resolvedTheme === 'dark'
                        ? 'bg-cyan-400/20'
                        : 'bg-blue-300/30'
                      }`}
                  />

                  {/* Header */}
                  <div
                    className={`relative z-10 px-5 py-4 flex justify-end items-center border-b
    ${resolvedTheme === 'dark'
                        ? 'border-white/10'
                        : 'border-white/30'
                      }`}
                  >
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`p-2 rounded-full transition-all duration-300 active:scale-90
      ${resolvedTheme === 'dark'
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-white/20 hover:bg-white/80 text-gray-900'
                        }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
                    <Link
                      href={paths.catalog}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xl font-bold uppercase tracking-wider hover:text-[#711a20]
      transition-all duration-300 hover:translate-x-2 flex items-center group"
                    >
                      Catalog
                      <span className="w-0 group-hover:w-4 h-0.5 bg-[#711a20] ml-2 transition-all duration-300" />
                    </Link>

                    <Link
                      href={paths.about}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xl font-bold uppercase tracking-wider hover:text-[#711a20]
      transition-all duration-300 hover:translate-x-2 flex items-center group"
                    >
                      Our Story
                      <span className="w-0 group-hover:w-4 h-0.5 bg-[#711a20] ml-2 transition-all duration-300" />
                    </Link>
                    <Link
                      href={paths.blog.root}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xl font-bold uppercase tracking-wider hover:text-[#711a20]
      transition-all duration-300 hover:translate-x-2 flex items-center group"
                    >
                      Blogs
                      <span className="w-0 group-hover:w-4 h-0.5 bg-[#711a20] ml-2 transition-all duration-300" />
                    </Link>

                    {/* <Link
                    href={paths.blog.root}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl font-bold uppercase tracking-wider hover:text-[#711a20]
      transition-all duration-300 hover:translate-x-2 flex items-center group"
                  >
                    Blogs
                    <span className="w-0 group-hover:w-4 h-0.5 bg-[#711a20] ml-2 transition-all duration-300" />
                  </Link> */}

                    <Link
                      href={paths.contact}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-xl font-bold uppercase tracking-wider hover:text-[#711a20]
      transition-all duration-300 hover:translate-x-2 flex items-center group"
                    >
                      Contact
                      <span className="w-0 group-hover:w-4 h-0.5 bg-[#711a20] ml-2 transition-all duration-300" />
                    </Link>

                    <div
                      className={`h-px my-2 ${resolvedTheme === 'dark'
                        ? 'bg-white/10'
                        : 'bg-black/10'
                        }`}
                    />

                    {isLogin ? (
                      <>
                        <Link
                          href={paths.profile.root}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-lg font-bold uppercase tracking-wider
          hover:text-[#711a20]
          transition-all duration-300 flex items-center gap-4 py-2"
                        >
                          <User className="w-5 h-5 opacity-70" />
                          Profile
                        </Link>

                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="text-lg font-bold uppercase tracking-wider
          
          transition-all duration-300 flex items-center gap-4 text-left w-full py-2"
                        >
                          <LogOut className="w-5 h-5" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link
                        href={paths.auth.signIn}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-bold uppercase tracking-wider
        hover:text-[#711a20]
        transition-all duration-300 flex items-center gap-4 py-2"
                      >
                        <User className="w-5 h-5 opacity-70" />
                        Login / Sign Up
                      </Link>
                    )}
                    <Link
                      href={paths.customize.root}
                      className="group lg:hidden block relative bg-[#711a20] text-[#ffffff] px-6 py-4 rounded-full text-lg font-black uppercase  hover:bg-[#710000] transition-all shadow-[0_0_40px_rgba(139,0,0,0.3)] overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Customize Now
                      </span>
                    </Link>
                    {/* Footer */}
                    <div
                      className={`mt-auto pt-8 border-t ${resolvedTheme === 'dark'
                        ? 'border-white/10'
                        : 'border-black/10'
                        }`}
                    >
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-50 mb-6">
                        Connect
                      </p>
                      {/* 
                      <div className="flex flex-col gap-5">
                        <span
                          className="text-sm font-bold uppercase tracking-widest cursor-pointer
          hover:text-[#711a20]
          flex items-center gap-3 group transition-all duration-300"
                        >
                          <span className="w-2 h-2 bg-[#711a20] rounded-full group-hover:scale-125 transition-transform duration-300" />
                          Instagram
                        </span>

                        <span
                          className="text-sm font-bold uppercase tracking-widest cursor-pointer
          hover:text-[#711a20]
          flex items-center gap-3 group transition-all duration-300"
                        >
                          <span className="w-2 h-2 bg-[#711a20] rounded-full group-hover:scale-125 transition-transform duration-300" />
                          Facebook
                        </span>
                      </div> */}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </nav>
      )}

      <MobileBottomNav
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      // onMenuOpen={() => setIsMobileMenuOpen((prev) => !prev)}
      />
    </>

  );
}
