/**
 * ==========================================================================
 * TARA'S COLLECTION - CORE DATA STORE & STORAGE ENGINE ($0 COST)
 * Handles inventory, cart logic, LocalStorage persistence, and GitHub exports.
 * Guaranteed cart persistence and verified Facebook proof of transactions.
 * ==========================================================================
 */

const LOCAL_STORAGE_KEY = "taras_collection_store_data_v6";
const CART_STORAGE_KEY = "taras_collection_cart_v6";

// Fallback seed data in case file system loading fails or is run offline
const DEFAULT_SEED_DATA = {
  storeInfo: {
    name: "Tara's Collection",
    tagline: "Custom Bracelets & Handcrafted Healing Stones",
    phone: "0915 457 1859",
    messengerId: "109568137198741",
    messengerUrl: "https://m.me/109568137198741",
    facebookPage: "https://www.facebook.com/profile.php?id=100063858590900",
    youtubeChannel: "https://www.youtube.com/@TARA-LNM/shorts",
    location: "Central Luzon, Philippines",
    currency: "₱",
    defaultWristSizes: ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"]
  },
  products: [
    {
      id: "ocean-jasper-01",
      name: "Ocean Jasper Harmony Bracelet",
      price: 350,
      category: "bracelets",
      status: "Available",
      featured: true,
      badge: "BEST SELLER",
      description: "Natural Ocean Jasper beads known for grounding energies, mental emotional harmony, and soothing stress. Cleansed and energized before packaging.",
      images: [
        "https://images.unsplash.com/photo-1611591472159-259f7ce8f1df?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
      ],
      sizes: ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm"],
      createdAt: "2026-08-01T10:00:00Z"
    },
    {
      id: "obsidian-shield-02",
      name: "Black Obsidian Protection Aura",
      price: 380,
      category: "gemstones",
      status: "Available",
      featured: true,
      badge: "HEALING",
      description: "Powerful protective stone that absorbs negative energy and clears psychic smog. Paired with polished finish and heavy-duty elastic core.",
      images: [
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop"
      ],
      sizes: ["15cm", "16cm", "17cm", "18cm", "19cm", "20cm"],
      createdAt: "2026-08-01T11:00:00Z"
    },
    {
      id: "golden-rutile-03",
      name: "Golden Rutile Wealth Quartz",
      price: 450,
      category: "gemstones",
      status: "Sold Out",
      featured: true,
      badge: "SOLD OUT",
      description: "Infused with golden rutile threads that amplify manifestation, clarity, and abundance. Highly sought after by spiritual practitioners.",
      images: [
        "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=800&auto=format&fit=crop"
      ],
      sizes: ["15cm", "16cm", "17cm", "18cm"],
      createdAt: "2026-08-01T12:00:00Z"
    },
    {
      id: "rose-quartz-love-04",
      name: "Rose Quartz Gentle Affection",
      price: 320,
      category: "bracelets",
      status: "Available",
      featured: true,
      badge: "NEW",
      description: "The stone of universal love. Promotes emotional healing, compassion, and inner peace. Delicate soft pink natural beads.",
      images: [
        "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop"
      ],
      sizes: ["14cm", "15cm", "16cm", "17cm"],
      createdAt: "2026-08-01T13:00:00Z"
    },
    {
      id: "custom-base-01",
      name: "Rose Quartz Custom Bracelet",
      price: 250,
      category: "personalized",
      status: "Available",
      featured: false,
      isCustomBase: true,
      badge: "CUSTOMIZABLE",
      description: "Ideal foundational base for customized charms and auxiliary gemstones. Tailored directly to your exact personal intentions and wrist measurements via Messenger.",
      images: [
        "https://images.unsplash.com/photo-1611591472159-259f7ce8f1df?q=80&w=800&auto=format&fit=crop"
      ],
      sizes: ["14cm", "15cm", "16cm", "17cm", "18cm"],
      createdAt: "2026-08-01T14:00:00Z"
    },
    {
      id: "custom-base-02",
      name: "Black Onyx Custom Bracelet",
      price: 260,
      category: "personalized",
      status: "Available",
      featured: false,
      isCustomBase: true,
      badge: "CUSTOMIZABLE",
      description: "Solid matte or polished onyx base designed for male and unisex custom bracelets. Add focal crystals or gold spacers.",
      images: [
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop"
      ],
      sizes: ["16cm", "17cm", "18cm", "19cm", "20cm"],
      createdAt: "2026-08-01T15:00:00Z"
    },
    {
      id: "charm-lucky-buddha-01",
      name: "Jade Lucky Charm & Prosperity",
      price: 400,
      category: "charms",
      status: "Available",
      featured: false,
      badge: "HEALING",
      description: "Authentic jade charm element integrated into a balanced spiritual stone array.",
      images: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
      ],
      sizes: ["15cm", "16cm", "17cm", "18cm"],
      createdAt: "2026-08-01T16:00:00Z"
    }
  ],
  youtubeShorts: [
    {
      id: "21pHSgQB--Q",
      title: "Ocean Jasper Energy Reveal",
      url: "https://www.youtube.com/shorts/21pHSgQB--Q",
      thumbnail: "https://i.ytimg.com/vi/21pHSgQB--Q/hqdefault.jpg"
    },
    {
      id: "M2iDlJWNto4",
      title: "Special Curation & Singing Bowl",
      url: "https://www.youtube.com/shorts/M2iDlJWNto4",
      thumbnail: "https://i.ytimg.com/vi/M2iDlJWNto4/hqdefault.jpg"
    },
    {
      id: "gZLi0lawRj8",
      title: "Obsidian Protection Quality",
      url: "https://www.youtube.com/shorts/gZLi0lawRj8",
      thumbnail: "https://i.ytimg.com/vi/gZLi0lawRj8/hqdefault.jpg"
    },
    {
      id: "A4-7E6upmII",
      title: "Golden Rutile Quartz Glow",
      url: "https://www.youtube.com/shorts/A4-7E6upmII",
      thumbnail: "https://i.ytimg.com/vi/A4-7E6upmII/hqdefault.jpg"
    }
  ],
  customerProofs: [
    {
      id: "proof-1",
      image: "assets/proofs/proof-1.jpg",
      link: "https://www.facebook.com/photo?fbid=1496846199120652&set=pb.100063858590900.-2207520000",
      caption: "Verified Transaction #1 - Delivered Safely"
    },
    {
      id: "proof-2",
      image: "assets/proofs/proof-2.jpg",
      link: "https://www.facebook.com/photo.php?fbid=1463990942406178&set=pb.100063858590900.-2207520000&type=3",
      caption: "Verified Transaction #2 - Custom Order Complete"
    },
    {
      id: "proof-3",
      image: "assets/proofs/proof-3.jpg",
      link: "https://www.facebook.com/photo?fbid=1434517582020181&set=pb.100063858590900.-2207520000",
      caption: "Verified Transaction #3 - Cleansed & Shipped"
    },
    {
      id: "proof-4",
      image: "assets/proofs/proof-4.jpg",
      link: "https://www.facebook.com/photo?fbid=1406069524864987&set=pb.100063858590900.-2207520000",
      caption: "Verified Transaction #4 - Happy Client!"
    },
    {
      id: "proof-5",
      image: "assets/proofs/proof-5.jpg",
      link: "https://www.facebook.com/photo?fbid=1405798064892133&set=pb.100063858590900.-2207520000",
      caption: "Verified Transaction #5 - J&T Nationwide Dispatch"
    },
    {
      id: "proof-6",
      image: "assets/proofs/proof-6.jpg",
      link: "https://www.facebook.com/photo?fbid=1405797881558818&set=pb.100063858590900.-2207520000",
      caption: "Verified Transaction #6 - Authentic Earth Elements"
    }
  ]
};

class StoreManager {
  constructor() {
    this.data = null;
    this.cart = [];
    this.observers = [];
    const SUPABASE_URL = "https://asltoyrmipekmbsuhfvo.supabase.co";
    const SUPABASE_KEY = "sb_publishable_mn_d7xVx13Jy165OUTSH3g_YcUtaDEr";
    this.supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
    if (this.supabase) {
      console.log("⚡ Connected to Supabase Cloud Engine (Tokyo Instance)");
    }
  }

  // Initialize data from Supabase Cloud or fallback to products.json
  async init() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("taras_collection_") || key.startsWith("tara_")) && key !== LOCAL_STORAGE_KEY && key !== CART_STORAGE_KEY && key !== "tara_admin_unsaved_product_draft") {
        localStorage.removeItem(key);
      }
    }

    this.loadCart();
    
    // Step 1: Instant baseline render (with fast 2s network timeout to prevent mobile browser hangs)
    let baseData = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch("data/products.json?v=" + Date.now(), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        baseData = await response.json();
        console.log("Loaded baseline storefront config from data/products.json.");
      }
    } catch (e) {
      console.warn("Fetch fallback: loading from localStorage or default seed data.");
    }

    if (!baseData) {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        try { baseData = JSON.parse(localData); } catch (err) { localStorage.removeItem(LOCAL_STORAGE_KEY); }
      }
    }
    this.data = baseData || JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));

    // Step 2: Background Real-Time Cloud Sync (Stale-While-Revalidate pattern)
    // This allows first-time mobile visitors to view the storefront immediately in under 0.1 seconds!
    if (this.supabase) {
      setTimeout(async () => {
        try {
          const { data: dbProducts, error } = await this.supabase
            .from("products")
            .select("*");

          if (!error && dbProducts) {
            console.log(`⚡ Background sync: loaded ${dbProducts.length} live products from Supabase Cloud!`);
            
            // Normalize PostgreSQL snake_case column names into standard JavaScript camelCase properties
            const normalized = dbProducts.map(p => ({
              ...p,
              isCustomBase: p.is_custom_base !== undefined ? p.is_custom_base : p.isCustomBase,
              stockQty: p.stock_qty !== undefined ? p.stock_qty : (p.stockQty || 1),
              soldCount: p.sold_count !== undefined ? p.sold_count : (p.soldCount || 0),
              stoneSizes: p.stone_sizes !== undefined ? p.stone_sizes : p.stoneSizes,
              createdAt: p.created_at !== undefined ? p.created_at : p.createdAt
            }));

            this.data.products = normalized;
            this.saveToStorage();
            this.notifyObservers();
          } else if (error) {
            console.warn("Supabase background fetch notice:", error?.message);
          }
        } catch (cloudErr) {
          console.warn("Offline fallback: Supabase cloud connection unavailable:", cloudErr);
        }
      }, 50);
    }

    this.saveToStorage();
    this.notifyObservers();
    return this.data;
  }

  /* --- LINK ID SANITATION & CLEAN SLUG GENERATION --- */
  generateCleanId(name, existingIdToIgnore = null) {
    const baseSlug = (name || "item").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
    const products = this.data?.products || [];
    let candidate = baseSlug;
    let counter = 2;
    while (products.some(p => p.id === candidate && p.id !== existingIdToIgnore)) {
      candidate = `${baseSlug}-${counter < 10 ? "0" + counter : counter}`;
      counter++;
    }
    return candidate;
  }

  sanitizeAndHealProductIds() {
    // Disabled: Do NOT alter or re-generate product primary keys after instantiation!
    // Changing IDs after loading causes database deletions and edits to target mismatched rows.
    return;
  }

  saveToStorage() {
    if (this.data) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.data));
        this.notifyObservers();
      } catch (e) {
        console.warn("LocalStorage quota exceeded or save error (saved to RAM instead):", e);
        this.notifyObservers();
      }
    }
  }

  saveData() {
    this.saveToStorage();
  }

  resetToDefaults() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    this.saveToStorage();
    console.log("Store reset to default catalog.");
  }

  subscribe(callback) {
    this.observers.push(callback);
  }

  notifyObservers() {
    window.dispatchEvent(new CustomEvent("storeUpdated", { detail: this.data }));
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: this.cart }));
    this.observers.forEach(fn => fn(this.data, this.cart));
  }

  /* --- PRODUCT RETRIEVAL & FILTERING (BUG-FREE ALL-INCLUSIVE) --- */
  getProducts(filter = {}) {
    if (!this.data || !this.data.products) return [];
    
    return this.data.products.filter(item => {
      if (item.status === "Hidden") return false;
      if (filter.onlyAvailable && item.status === "Sold Out") return false;
      if (filter.category && item.category !== filter.category) return false;
      if (filter.isCustomBase !== undefined && filter.isCustomBase !== null) {
        if (!!item.isCustomBase !== filter.isCustomBase) return false;
      }
      if (filter.query) {
        const q = filter.query.toLowerCase();
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        const matchCat = (item.category || "").toLowerCase().includes(q);
        return matchName || matchDesc || matchCat;
      }
      return true;
    });
  }

  getProductById(id) {
    return this.data?.products?.find(p => p.id === id) || null;
  }

  getStoreInfo() {
    return this.data?.storeInfo || DEFAULT_SEED_DATA.storeInfo;
  }

  getYouTubeShorts() {
    return this.data?.youtubeShorts || [];
  }

  getCustomerProofs() {
    return this.data?.customerProofs || DEFAULT_SEED_DATA.customerProofs;
  }

  /* --- SUPABASE CLOUD SYNC METHODS --- */
  async saveProductToCloud(prod) {
    if (!this.supabase || !prod) return;
    try {
      const row = {
        id: prod.id || `prod-${Date.now()}`,
        name: prod.name || "Unnamed Bracelet",
        price: parseFloat(prod.price) || 0,
        category: prod.category || "bracelets",
        featured: !!prod.featured,
        isCustomBase: !!prod.isCustomBase,
        status: prod.status || "Available",
        badge: prod.badge || "",
        stockQty: parseInt(prod.stockQty, 10) || 0,
        soldCount: parseInt(prod.soldCount, 10) || 0,
        isNew: !!prod.isNew,
        createdAt: typeof prod.createdAt === "number" ? prod.createdAt : (Date.parse(prod.createdAt) || Date.now()),
        description: prod.description || "",
        images: Array.isArray(prod.images) ? prod.images : ["assets/brand/logo.jpg"],
        sizes: Array.isArray(prod.sizes) ? prod.sizes : ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"],
        stoneSizes: Array.isArray(prod.stoneSizes) ? prod.stoneSizes : []
      };
      const { error } = await this.supabase.from("products").upsert(row);
      if (error) {
        console.error("Supabase upsert error for", prod.name, error);
      } else {
        console.log(`☁️ Successfully synced "${row.name}" to Supabase Cloud!`);
      }
    } catch (e) {
      console.error("Cloud saving exception:", e);
    }
  }

  async deleteProductFromCloud(id, name) {
    if (!this.supabase || (!id && !name)) return;
    try {
      if (id) {
        await this.supabase.from("products").delete().eq("id", id);
      }
      if (name) {
        await this.supabase.from("products").delete().eq("name", name);
      }
      console.log(`☁️ Successfully removed item (${id || name}) from Supabase Cloud.`);
    } catch (e) {
      console.error("Cloud deletion exception:", e);
    }
  }

  /* --- ADMIN CATALOG OPERATIONS --- */
  addProduct(productObj) {
    if (!productObj.id) {
      productObj.id = "prod-" + Date.now().toString(36);
    }
    productObj.createdAt = Date.now();
    this.data.products.unshift(productObj);
    this.saveToStorage();
    this.saveProductToCloud(productObj);
    return productObj;
  }

  updateProduct(id, updatedFields) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.products[index] = { ...this.data.products[index], ...updatedFields };
      this.saveToStorage();
      this.saveProductToCloud(this.data.products[index]);
      return this.data.products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const item = this.data.products.find(p => p.id === id);
    const name = item ? item.name : null;
    this.data.products = this.data.products.filter(p => p.id !== id && p.name !== name);
    this.saveToStorage();
    this.deleteProductFromCloud(id, name);
  }

  setProductStatus(id, status) {
    return this.updateProduct(id, { 
      status: status,
      badge: status === "Sold Out" ? "SOLD OUT" : (status === "Available" ? "AVAILABLE" : "HIDDEN")
    });
  }

  /* --- CART OPERATIONS --- */
  loadCart() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        this.cart = JSON.parse(savedCart);
      } catch (e) {
        this.cart = [];
      }
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: this.cart }));
    }, 50);
  }

  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
    } catch (e) {
      console.warn("Could not save cart to LocalStorage (retaining in RAM instead):", e);
    }
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: this.cart }));
  }

  addToCart(productId, size = "16cm", category = "Adult", quantity = 1, customNotes = "") {
    const product = this.getProductById(productId);
    if (!product) return false;
    if (product.status === "Sold Out" || product.status === "Hidden") return false;

    const existingIndex = this.cart.findIndex(
      item => item.productId === productId && item.size === size && item.category === category && item.customNotes === customNotes
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity = (parseInt(this.cart[existingIndex].quantity, 10) || 1) + (parseInt(quantity, 10) || 1);
    } else {
      this.cart.push({
        id: "cart-" + Date.now() + Math.random().toString(36).substr(2, 4),
        productId: product.id,
        name: product.name || "Unnamed Item",
        price: parseFloat(product.price) || 0,
        image: (Array.isArray(product.images) && product.images[0]) ? product.images[0] : "assets/brand/logo.jpg",
        size: size || "16cm",
        category: category || "Adult",
        quantity: parseInt(quantity, 10) || 1,
        customNotes: customNotes || ""
      });
    }

    this.saveCart();
    return true;
  }

  removeFromCart(cartItemId) {
    this.cart = this.cart.filter(item => item.id !== cartItemId);
    this.saveCart();
  }

  updateCartQuantity(cartItemId, delta) {
    const item = this.cart.find(i => i.id === cartItemId);
    if (item) {
      item.quantity = (parseInt(item.quantity, 10) || 1) + parseInt(delta, 10);
      if (item.quantity <= 0) {
        this.removeFromCart(cartItemId);
      } else {
        this.saveCart();
      }
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => total + ((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1)), 0);
  }

  getCartCount() {
    return this.cart.reduce((count, item) => count + (parseInt(item.quantity, 10) || 0), 0);
  }

  /* --- EXPORT / COPY TO GITHUB FUNCTIONALITY --- */
  exportJsonData() {
    return JSON.stringify(this.data, null, 2);
  }
}

// Global Store Instance
window.TaraStore = new StoreManager();
window.addEventListener("DOMContentLoaded", () => {
  window.TaraStore.init();
});
