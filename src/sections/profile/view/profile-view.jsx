"use client";

import { useEffect, useState, useCallback } from "react";
import { User, ShoppingBag, MapPin, LogOut } from "lucide-react";

import { paths } from "@/routes/paths";
import { useRouter } from "@/routes/hooks";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getProfileRequest,
  clearUser,
  resetCart,
  resetProfile,
  clearWishlist,
} from "@/redux/actions";

import { toast } from "@/components/snackbar";

import { EmailVerificationBanner } from "@/auth/components";

import { ProfileAccount } from "../profile-account";
import { ProfileAddress } from "../profile-address";
import { OrderView } from "../../order/view";

import { signOut } from "@/api/auth";

// ----------------------------------------------------------------------

const TABS = [
  {
    label: "Account",
    value: "account",
    icon: User,
  },

  {
    label: "Order",
    value: "order",
    icon: ShoppingBag,
  },

  {
    label: "Address",
    value: "address",
    icon: MapPin,
  },
];

// ----------------------------------------------------------------------

export function ProfileView() {
  const dispatch = useAppDispatch();

  const { isLogin } = useAppSelector((state) => state.auth);

  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState("account");

  useEffect(() => {
    if (isLogin) {
      dispatch(getProfileRequest());
    } else {
      router.push(paths.auth.signIn);
    }
  }, [dispatch, isLogin]);

  const handleTab = (value) => {
    setSelectedTab(value);
  };

  const handleLogout = useCallback(async () => {
    try {
      await signOut();

      dispatch(clearUser());

      router.push(paths.home);

      toast.success("You have been logged out!");

      dispatch(resetCart());

      dispatch(resetProfile());

      dispatch(clearWishlist());
    } catch (error) {
      console.error(error);

      toast.error("Unable to logout!");
    }
  }, [router]);

  const renderTabContent = () => {
    switch (selectedTab) {
      case "account":
        return <ProfileAccount />;

      case "order":
        return <OrderView />;

      case "address":
        return <ProfileAddress />;
    }
  };

  return (
    <main className="lg:py-20 py-16 min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black uppercase  tracking-tighter leading-none">
              Profile
            </h1>
            <p className=" mt-2 text-lg font-medium">
              Manage your account settings and preferences
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-4 bg-red-100 text-red-600 rounded-full font-bold uppercase tracking-tight text-sm hover:bg-red-100 transition-all border border-red-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        <EmailVerificationBanner />

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {TABS.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => handleTab(tab.value)}
                className={`flex items-center gap-2 px-6 py-4 rounded-full font-bold uppercase tracking-tight text-sm transition-all whitespace-nowrap ${selectedTab === tab.value
                  ? "border-[#f7e6dc] border-3"
                  : "bg-[#ffffff] text-gray-700 hover:bg-gray-100 border border-black/10"
                  }`}
              >
                <IconComponent className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {renderTabContent()}
      </div>
    </main>
  );
}
