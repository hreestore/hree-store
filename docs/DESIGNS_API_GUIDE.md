# Designs API Implementation Guide

## API Response Structure

Each design object from the API contains:
```json
{
  "id": 1,
  "front_id": 1146,
  "back_id": 1145,
  "created_at": "2026-03-25T07:58:52.000000Z",
  "updated_at": "2026-03-25T07:58:52.000000Z",
  "front_product": {
    "product_id": 1146,
    "name": "Black Beast",
    "description": "<p>asdasd</p>",
    "price": "10.00",
    "sku": "SHER-01146",
    "featured_image": "uploads/32/2026/03/products/image_11774258839.png",
    "slug": "sher-back"
  },
  "back_product": {
    "product_id": 1145,
    "name": "Black Beast",
    "price": "100.00",
    "sku": "SHER-01145",
    "featured_image": "uploads/32/2026/03/products/image_11774258784.webp",
    "slug": "sher"
  }
}
```

## Usage Examples

### 1. Fetching All Designs

```javascript
import { useGetDesigns, getDesignImageUrl } from '@/api/design';

function MyComponent() {
  const { designs, designsLoading, designsError } = useGetDesigns();

  if (designsLoading) return <div>Loading...</div>;
  if (designsError) return <div>Error loading designs</div>;

  return (
    <div>
      {designs.map((design) => (
        <div key={design.id}>
          <h3>{design.front_product.name}</h3>
          <img 
            src={getDesignImageUrl(design.front_product.featured_image)} 
            alt={design.front_product.name} 
          />
        </div>
      ))}
    </div>
  );
}
```

### 2. Displaying Front and Back Designs

```javascript
function DesignPairDisplay({ design }) {
  return (
    <div>
      {/* Front Design */}
      <div>
        <h4>Front: {design.front_product.name}</h4>
        <img 
          src={getDesignImageUrl(design.front_product.featured_image)}
          alt={design.front_product.name}
        />
        <p>Price: ${design.front_product.price}</p>
      </div>

      {/* Back Design */}
      <div>
        <h4>Back: {design.back_product.name}</h4>
        <img 
          src={getDesignImageUrl(design.back_product.featured_image)}
          alt={design.back_product.name}
        />
        <p>Price: ${design.back_product.price}</p>
      </div>
    </div>
  );
}
```

### 3. Selecting a Design (Customizer Flow)

```javascript
import { useGetDesigns } from '@/api/design';
import { useStore } from '@/lib/store';

function DesignSelector() {
  const { designs } = useGetDesigns();
  const { setFrontDesign, setBackDesign, frontDesign } = useStore();

  const handleSelectDesign = (design) => {
    // Set both front and back designs
    setFrontDesign({
      id: design.front_product.product_id,
      name: design.front_product.name,
      image: design.front_product.featured_image,
      slug: design.front_product.slug,
      price: design.front_product.price,
    });

    setBackDesign({
      id: design.back_product.product_id,
      name: design.back_product.name,
      image: design.back_product.featured_image,
      slug: design.back_product.slug,
      price: design.back_product.price,
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {designs?.map((design) => (
        <button
          key={design.id}
          onClick={() => handleSelectDesign(design)}
          className={`border-2 ${
            frontDesign?.id === design.front_product.product_id
              ? 'border-red-600'
              : 'border-gray-200'
          }`}
        >
          <img 
            src={getDesignImageUrl(design.front_product.featured_image)}
            alt={design.front_product.name}
          />
          <p>{design.front_product.name}</p>
        </button>
      ))}
    </div>
  );
}
```

### 4. Using Next.js Image Component

```javascript
import Image from 'next/image';
import { CONFIG } from '@/global-config';

function DesignImage({ design }) {
  const imageUrl = `${CONFIG.designAssetsUrl}${design.front_product.featured_image}`;

  return (
    <Image
      src={imageUrl}
      alt={design.front_product.name}
      width={500}
      height={500}
      className="object-cover"
      referrerPolicy="no-referrer"
    />
  );
}
```

## Implementation Checklist

✅ **API Setup**
- [x] Design endpoint added to `src/api/endpoints.js`
- [x] `useGetDesigns` hook created in `src/api/design.js`
- [x] `getDesignImageUrl` helper function created
- [x] Design API exported from `src/api/index.js`

✅ **Components Updated**
- [x] `customize-hero.jsx` - Uses designs API for design selection
- [x] `home-featured-designs.jsx` - Displays featured designs

✅ **Configuration**
- [x] `CONFIG.designUrl` set to "https://cms.hree.com.np/api/"
- [x] `CONFIG.designAssetsUrl` set to "https://cms.hree.com.np/storage/"

## Key Points

1. **Each design is a pair**: Every design has both a front_product and back_product
2. **Image URLs**: Always use `getDesignImageUrl()` or prepend `CONFIG.designAssetsUrl`
3. **Loading states**: The hook returns `designsLoading` and `designsError`
4. **Null checks**: Always check if designs exist before mapping
5. **Full URLs**: Image paths from API are relative; prepend base URL

## Files Modified

1. **`src/api/design.js`** - Added hooks and helper functions
2. **`src/api/index.js`** - Exported design API
3. **`src/sections/customize/customize-hero.jsx`** - Integrated designs API
4. **`src/sections/home/home-featured-designs.jsx`** - Display featured designs

## Next Steps

Consider adding:
- Search/filter functionality for designs
- Categories for designs (if API supports it)
- Pagination if there are many designs
- Design preview modal
- Design favoriting/wishlist
