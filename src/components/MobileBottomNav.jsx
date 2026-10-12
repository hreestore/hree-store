'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { paths } from '@/routes/paths';
import { useAppSelector } from '@/redux/hooks';
import { usePathname } from 'next/navigation';
import { Iconify } from './iconify';
import { AnimatePresence, LayoutGroup } from 'framer-motion';

// ----------------------------------------------------------------

export default function MobileBottomNav({ onMenuOpen, isMobileMenuOpen }) {
    const pathname = usePathname();
    const { totalItems } = useAppSelector((state) => state.cart);
    const { totalItems: wishlistTotalItems } = useAppSelector((state) => state.wishlist);
    const { isLogin } = useAppSelector((state) => state.auth);
    const { profile } = useAppSelector((state) => state.profile);
    const { featured_image, full_name } = profile || {};

    const isActive = (href) => pathname === href;

    const navItems = [
        { label: 'Home', href: paths.home, icon: "solar:home-2-bold" },
        { label: 'Wishlist', href: paths.wishlist, icon: "solar:heart-bold", badge: wishlistTotalItems },
        { label: 'Customize', href: paths.customize.root, icon: "solar:t-shirt-bold" },
        { label: 'Cart', href: paths.cart, icon: "solar:bag-3-bold", badge: totalItems },
        {
            label: isLogin ? 'Profile' : 'Login',
            href: isLogin ? paths.profile.root : paths.auth.signIn,
            icon: "solar:user-circle-bold",
            isProfile: true,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[999] md:hidden">
            <div className="mx-3 mb-3 rounded-[2rem] relative overflow-hidden">
                {/* Dark mode glare */}
                <div
                    className="absolute inset-0 pointer-events-none hidden dark:block"
                    style={{
                        background: 'rgb(0 0 0 / 70%)',      // nearly invisible fill
                        backdropFilter: 'blur(10px)',               // no saturate/brightness — pure blur
                        WebkitBackdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(113,26,32,0.15)',
                        boxShadow: [
                            'inset 0 1px 0 rgba(255,255,255,0.18)',
                            'inset 0 -1px 0 rgba(113,26,32,0.08)',
                            '0 4px 16px rgba(113,26,32,0.12)',
                        ].join(', '),
                    }}
                />

                <div className="flex items-center justify-around px-1.5 py-2 relative z-10">

                    <LayoutGroup>
                        {navItems.map(({ label, href, icon, badge, isProfile }) => {
                            const active = isActive(href);
                            return (

                                <Link
                                    key={label}
                                    href={href}
                                    className="flex flex-col items-center justify-between gap-0.5 py-2 rounded-full relative"
                                    style={{ flex: 1 }}
                                >
                                    {/* Sliding glass pill — one shared layoutId moves it between tabs */}
                                    {active && (
                                        <motion.div
                                            layoutId="activeNavPill"
                                            className="absolute inset-x-1 inset-y-0 rounded-full"
                                            style={{
                                                background: 'linear-gradient(135deg, rgb(255 255 255 / 30%) 0%, rgba(113, 26, 32, 0.06) 100%)',
                                                backdropFilter: 'blur(16px) saturate(180%)',
                                                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                                                border: '1px solid rgba(113,26,32,0.15)',
                                                boxShadow: [
                                                    'inset 0 2px 0 rgba(255,255,255,0.18)',
                                                    'inset 0 -2px 0 rgba(113,26,32,0.08)',
                                                    '0 4px 16px rgba(113,26,32,0.12)',
                                                ].join(', '),
                                            }}
                                            transition={{
                                                type: 'tween',
                                                ease: [0.30, 0.46, 0.45, 0.94],  // easeOutQuart — fast start, smooth settle
                                                duration: 0.32,
                                            }}
                                        />
                                    )}
                                    {/* Icon */}
                                    <div className="relative z-10">
                                        <motion.div
                                            animate={{
                                                scale: active ? 1.15 : 1,
                                                y: active ? -1 : 0,
                                            }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                                        >
                                            {isProfile && isLogin ? (
                                                <div
                                                    className="w-6 h-6 rounded-full overflow-hidden border transition-all duration-300"
                                                    style={{
                                                        borderColor: active ? '#ffffff' : 'transparent',
                                                        boxShadow: active ? '0 0 0 2px rgba(113,26,32,0.2)' : 'none',
                                                    }}
                                                >
                                                    <img
                                                        src={featured_image || '/img/user/icon.png'}
                                                        alt={full_name || 'Profile'}
                                                        title={full_name || 'Profile'}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
                                                    />
                                                </div>
                                            ) : (
                                                <Iconify
                                                    className="w-6 h-6 transition-colors duration-300"
                                                    style={{ color: active ? '#ffffff' : "#ffffff" }}
                                                    icon={icon}
                                                    strokeWidth={active ? 2.2 : 1.8}
                                                />
                                            )}
                                        </motion.div>

                                        {badge > 0 && (
                                            <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#711a20] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white dark:border-[#0b191a] shadow">
                                                {badge > 9 ? '9+' : badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <motion.span
                                        animate={{ opacity: active ? 1 : 0.5 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-[9px] font-bold font-montserratt uppercase  relative z-10 transition-colors duration-300"
                                        style={{ color: active ? '#ffffff' : "#ffffff" }}
                                    >
                                        {label}
                                    </motion.span>
                                </Link>
                            );
                        })}
                    </LayoutGroup>

                </div>
            </div>
        </div>
    );
}