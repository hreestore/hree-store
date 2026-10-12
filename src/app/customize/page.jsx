'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/lib/store';
import { PRODUCT_TYPES, COLORS, SIZES, DESIGNS } from '@/lib/data';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  RotateCw,
  Maximize2,
  ShoppingBag,
  Info
} from 'lucide-react';

import { paths } from '@/routes/paths';
import CustomizeView from '@/sections/customize/view/customize-view';

export default function CustomizePage() {
  const router = useRouter();
  const {
    currentStep,
    nextStep,
    prevStep,
    selectedProduct,
    selectedColor,
    selectedSize,
    frontDesign,
    backDesign,
    setSelectedProduct,
    setSelectedColor,
    setSelectedSize,
    setFrontDesign,
    setBackDesign,
    addToCart
  } = useStore();

  const [view, setView] = useState('front');
  const [isZoomed, setIsZoomed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTshirtType, setSelectedTshirtType] = useState('oversized');

  const tshirtConcepts = [
    {
      id: 'oversized',
      name: 'Oversized',
      frontImage: '/img/mockups/oversize front.png',
      backImage: '/img/mockups/oversize back.png',
      description: 'Relaxed fit with bold urban silhouette.',
      details: 'Drop shoulder, heavyweight drape',
    },
    {
      id: 'regular',
      name: 'Regular',
      frontImage: '/img/mockups/regular front.png',
      backImage: '/img/mockups/regular back.png',
      description: 'Balanced classic fit for daily wear.',
      details: 'Standard length, easy movement',
    },
    {
      id: 'slim',
      name: 'Slim',
      frontImage: '/img/mockups/slim front.png',
      backImage: '/img/mockups/slim back.png',
      description: 'Closer cut with a clean modern profile.',
      details: 'Tailored feel, refined look',
    },
    {
      id: 'vintage',
      name: 'Vintage',
      frontImage: '/img/mockups/vintage front.png',
      backImage: '/img/mockups/vintage back.png',
      description: 'Retro-inspired style with worn character.',
      details: 'Faded texture, old-school mood',
    },
  ];

  const designPairs = DESIGNS.map((design) => ({
    id: design.id,
    name: design.name,
    category: design.category,
    front: {
      id: `${design.id}-front`,
      name: `${design.name} Front`,
      image: design.frontImage,
      category: design.category,
    },
    back: {
      id: `${design.id}-back`,
      name: `${design.name} Back`,
      image: design.backImage || design.frontImage,
      category: design.category,
    },
  }));

  const filteredDesignPairs = designPairs.filter((pair) =>
    pair.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pair.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTshirtConcept = tshirtConcepts.find((concept) => concept.id === selectedTshirtType);
  const activePreviewImage = activeTshirtConcept
    ? (view === 'front' ? activeTshirtConcept.frontImage : (activeTshirtConcept.backImage || activeTshirtConcept.frontImage))
    : (view === 'front' ? selectedProduct?.image : (selectedProduct?.backImage || selectedProduct?.image));

  const steps = [
    'Product',
    'Options',
    'Colors & Sizes',
    'Design',
    'Preview',
    'Review'
  ];

  const canGoNext = () => {
    if (currentStep === 1) return !!selectedProduct;
    if (currentStep === 2) return !!selectedTshirtType;
    if (currentStep === 3) return !!selectedColor && !!selectedSize;
    if (currentStep === 4) return !!frontDesign;
    return true;
  };

  const swapDesignSides = () => {
    const currentFront = frontDesign;
    const currentBack = backDesign;

    setFrontDesign(currentBack || null);
    setBackDesign(currentFront || null);
  };

  return (
    <main className="">
      <CustomizeView />
    </main>
  );
}
