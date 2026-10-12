import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone, MapPin, Loader2, Upload, X, ZoomIn, ZoomOut, Check } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Loaded client-side only — uses window/document/canvas which don't exist on the server
const Cropper = dynamic(() => import("react-easy-crop"), { ssr: false });

import { CONFIG } from "@/global-config";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateProfile } from "@/redux/actions";

import { fData } from "@/utils/format-number";

import { toast } from "@/components/snackbar";

import { updateProfileSchema } from "./profile-schema";

import { updateProfile as updateUserProfile } from "@/api";

// ----------------------------------------------------------------------

/** Crop the image using a canvas and return a Blob */
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await new Promise((resolve, reject) => {
    const img = new window.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });
}

// ----------------------------------------------------------------------

export function ProfileGeneral() {
  const dispatch = useAppDispatch();

  const { profile } = useAppSelector((state) => state.profile);
  const { addresses, full_name, phone_number, email, featured_image } = profile;

  const [imagePreview, setImagePreview] = useState(featured_image || null);

  // Crop modal state
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef(null);

  const currentUser = {
    full_name: full_name,
    email: email,
    featured_image: featured_image,
    phone_number: phone_number,
    addresses: addresses,
  };

  const defaultValues = {
    full_name: "",
    email: "",
    featured_image: null,
    phone_number: "",
    addresses: [],
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "all",
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
    values: currentUser,
  });

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!(file instanceof File || file instanceof Blob)) {
        reject(new Error("Invalid file input"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3145728) {
      toast.error(`Maximum file size is ${fData(3145728)}`);
      return;
    }
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPEG, JPG, and PNG files are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropSrc(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleCropConfirm = async () => {
    try {
      const blob = await getCroppedImg(cropSrc, croppedAreaPixels);
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
      setValue("featured_image", file);
      const previewUrl = URL.createObjectURL(blob);
      setImagePreview(previewUrl);
      setShowCropModal(false);
      setCropSrc(null);
    } catch {
      toast.error("Failed to crop image. Please try again.");
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setCropSrc(null);
  };

  const handleRemoveImage = () => {
    setValue("featured_image", null);
    setImagePreview(null);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const updatedData = { ...data };

      if (updatedData.featured_image instanceof File || updatedData.featured_image instanceof Blob) {
        updatedData.featured_image = await convertFileToBase64(updatedData.featured_image);
      } else {
        delete updatedData.featured_image;
      }

      const response = await updateUserProfile(updatedData);
      dispatch(updateProfile(response[0]));
      toast.success("Profile update success!");
    } catch (error) {
      toast.error("Couldn't update profile! Try again.");
    }
  });

  return (
    <>
      {/* ── Crop Modal ─────────────────────────────────────────── */}
      {showCropModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        >
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ width: "min(520px, 95vw)", maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f7e6dc]">
              <h3 className="text-lg font-black uppercase tracking-tighter">Crop Photo</h3>
              <button
                type="button"
                onClick={handleCropCancel}
                className="p-2 rounded-full hover:bg-[#f7e6dc] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cropper area */}
            <div className="relative bg-black" style={{ height: 340 }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom slider */}
            <div className="px-6 py-4 border-t border-[#f7e6dc]">
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-[#711a20] h-1 rounded-full cursor-pointer"
                />
                <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-1 font-medium uppercase tracking-widest">Scroll or drag to adjust</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={handleCropCancel}
                className="flex-1 py-3 border-2 border-[#f7e6dc] rounded-full font-black uppercase tracking-tighter text-sm hover:bg-[#f7e6dc] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 py-3 bg-[#711a20] text-white rounded-full font-black uppercase tracking-tighter text-sm hover:bg-[#5a1219] transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Form ────────────────────────────────────────── */}
      <form onSubmit={onSubmit} className=" rounded-[2.5rem] p-8 shadow-sm border-2 border-[#f7e6dc]">
        <h2 className="text-2xl font-display font-black uppercase tracking-tighter mb-6">
          General
        </h2>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 rounded-full   border-4 border-[#f7e6dc] shadow-lg mb-4">
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Profile"
                  fill
                  className="object-cover rounded-full"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 p-1.5 z-[9]! bg-red-500 text-[#ffffff] rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 " />
              </div>
            )}
          </div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 hover:bg-[#711a20] hover:text-white rounded-full font-bold text-sm uppercase tracking-tight transition-all">
            <Upload className="w-4 h-4" />
            Upload Photo
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <p className="text-xs  text-center mt-2 font-medium">
            Allowed *.jpeg, *.jpg, *.png
            <br />
            max size of {fData(3145728)}
          </p>
        </div>

        {/* Name Field */}
        <div className="mb-6">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="w-5 h-5 " />
            </div>
            <input
              type="text"
              {...register("full_name")}
              className="w-full pl-12 pr-4 py-4  border border-[#f7e6dc] rounded-2xl  focus:outline-none focus:ring-2 focus:ring-[#e7e7e7] focus:border-transparent transition-all"
              placeholder="Enter your full name"
            />
          </div>
          {errors.full_name && (
            <p className="mt-2 text-sm text-red-500">{errors.full_name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="mb-6">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 " />
            </div>
            <input
              type="email"
              {...register("email")}
              className="w-full pl-12 pr-4 py-4  border border-[#f7e6dc] rounded-2xl  focus:outline-none focus:ring-2 focus:ring-[#e7e7e7] focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="mb-6">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em]  mb-2">
            Contact Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="w-5 h-5 " />
            </div>
            <input
              type="tel"
              {...register("phone_number")}
              className="w-full pl-12 pr-4 py-4 b border border-[#f7e6dc] rounded-2xl  focus:outline-none focus:ring-2 focus:ring-[#e7e7e7] focus:border-transparent transition-all"
              placeholder="Enter 10-digit contact number"
            />
          </div>
          {errors.phone_number && (
            <p className="mt-2 text-sm text-red-500">{errors.phone_number.message}</p>
          )}
        </div>

        {/* Address Display */}
        {addresses && addresses.length > 0 && (
          <div className="mb-6 p-6  rounded-2xl border border-[#f7e6dc]">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 " />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] ">
                Address
              </h3>
            </div>
            {addresses.map((addr, index) => (
              <p key={addr.address_id || index} className="text-sm  mb-2 last:mb-0">
                {addr.address}
                {addr.district && `, ${addr.district.district_name}`}
                {addr.state && `, ${addr.state.state_name}`}
              </p>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className=" px-8 py-4 border-2 border-[#f7e6dc] rounded-full font-black uppercase tracking-tighter hover:bg-[#711a20] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </>
  );
}
