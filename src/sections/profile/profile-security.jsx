import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Info, Loader2 } from "lucide-react";

import { toast } from "@/components/snackbar";

import { changePassWordSchema } from "./profile-schema";

import { updatePassword } from "@/api";

// ----------------------------------------------------------------------

export function ProfileSecurity() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const defaultValues = {
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  };

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    resolver: zodResolver(changePassWordSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updatePassword(data);

      reset();

      toast.success("Password update success!");
    } catch (error) {
      toast.error("Couldn't update password! Try again.");
    }
  });

  return (
    <form onSubmit={onSubmit} className=" rounded-[2.5rem] p-8 shadow-sm border border-[#f7e6dc]">
      <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-6">
        Security
      </h2>

      {/* Old Password Field */}
      <div className="mb-6">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em]  mb-2">
          Old Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 " />
          </div>
          <input
            type={showOldPassword ? "text" : "password"}
            {...register("old_password")}
            className="w-full pl-12 pr-12 py-4  border border-[#f7e6dc] rounded-2xl  focus:outline-none focus:ring-2 focus:ring-[#711a20] focus:border-transparent transition-all"
            placeholder="Enter old password"
          />
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showOldPassword ? (
              <EyeOff className="w-5 h-5 " />
            ) : (
              <Eye className="w-5 h-5 " />
            )}
          </button>
        </div>
        {errors.old_password && (
          <p className="mt-2 text-sm text-red-500">{errors.old_password.message}</p>
        )}
      </div>

      {/* New Password Field */}
      <div className="mb-6">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em]  mb-2">
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 " />
          </div>
          <input
            type={showNewPassword ? "text" : "password"}
            {...register("new_password")}
            className="w-full pl-12 pr-12 py-4  border border-[#f7e6dc] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#711a20] focus:border-transparent transition-all"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showNewPassword ? (
              <EyeOff className="w-5 h-5 " />
            ) : (
              <Eye className="w-5 h-5 " />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs ">
          <Info className="w-4 h-4" />
          <span>Password must be minimum 8+ characters</span>
        </div>
        {errors.new_password && (
          <p className="mt-2 text-sm text-red-500">{errors.new_password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="mb-6">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em]  mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 " />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirm_new_password")}
            className="w-full pl-12 pr-12 py-4  border border-[#f7e6dc] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#711a20] focus:border-transparent transition-all"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5 " />
            ) : (
              <Eye className="w-5 h-5 " />
            )}
          </button>
        </div>
        {errors.confirm_new_password && (
          <p className="mt-2 text-sm text-red-500">{errors.confirm_new_password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-[#ffffff] px-8 py-4 rounded-full font-black uppercase tracking-tighter hover:bg-[#711a20] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
