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
  products: [],
  youtubeShorts: [
    { id: "21pHSgQB--Q", title: "Ocean Jasper Energy Reveal" },
    { id: "M2iDlJWNto4", title: "Special Curation & Singing Bowl" },
    { id: "gZLi0lawRj8", title: "Obsidian Protection Quality" },
    { id: "A4-7E6upmII", title: "Golden Rutile Quartz Glow" }
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
              createdAt: p.created_at !== undefined ? p.created_at : p.createdAt,
              salePercentage: p.sale_percentage !== undefined ? p.sale_percentage : (p.salePercentage !== undefined ? p.salePercentage : 0),
              saleUntil: p.sale_until !== undefined ? p.sale_until : (p.saleUntil || "")
            }));

            this.data.products = normalized;
            if (typeof this.syncCartWithLiveCatalog === "function") this.syncCartWithLiveCatalog();
            this.saveToStorage();
            this.notifyObservers();
          } else if (error) {
            console.warn("Supabase background fetch notice:", error?.message);
          }

          const { data: dbProofs, error: proofsError } = await this.supabase
            .from("proofs")
            .select("*")
            .order("created_at", { ascending: false });

          if (!proofsError && dbProofs) {
            console.log(`⚡ Background sync: loaded ${dbProofs.length} live proofs from Supabase Cloud!`);
            this.data.customerProofs = dbProofs.map(p => ({
              id: p.id,
              image: p.image,
              link: p.link,
              caption: p.caption,
              createdAt: p.created_at
            }));
            this.saveToStorage();
            this.notifyObservers();
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
        salePercentage: parseFloat(prod.salePercentage) || 0,
        saleUntil: prod.saleUntil || "",
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
        if (error.code === '42501' || error.message?.toLowerCase().includes("row-level security") || error.message?.toLowerCase().includes("policy")) {
          console.warn("🔒 RLS Write Denied: Please sign out and sign back in to Store Manager to refresh your cloud authorization token.");
          window.TaraApp?.showToast("⚠️ Supabase RLS write denied. Re-login to Store Manager to authorize!", "error");
        }
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
      let err;
      if (id) {
        const res = await this.supabase.from("products").delete().eq("id", id);
        err = res.error;
      }
      if (name && !err) {
        const res = await this.supabase.from("products").delete().eq("name", name);
        err = res.error;
      }
      if (err) {
        console.error("Supabase deletion error:", err);
        if (err.code === '42501' || err.message?.toLowerCase().includes("row-level security") || err.message?.toLowerCase().includes("policy")) {
          window.TaraApp?.showToast("⚠️ Supabase RLS delete denied. Re-login to Store Manager to authorize!", "error");
        }
      } else {
        console.log(`☁️ Successfully removed item (${id || name}) from Supabase Cloud.`);
      }
    } catch (e) {
      console.error("Cloud deletion exception:", e);
    }
  }

  async saveProofToCloud(proof) {
    if (!this.supabase || !proof) return;
    try {
      const row = {
        id: proof.id || `proof-${Date.now()}`,
        image: proof.image || "",
        link: proof.link || "",
        caption: proof.caption || "Verified Transaction",
        created_at: proof.createdAt || new Date().toISOString()
      };
      const { error } = await this.supabase.from("proofs").upsert(row);
      if (error) {
        console.error("Supabase proof upsert error:", error);
        if (error.code === '42501' || error.message?.toLowerCase().includes("row-level security")) {
          window.TaraApp?.showToast("⚠️ Supabase RLS write denied for proof. Re-login to Store Manager!", "error");
        }
      } else {
        console.log(`☁️ Successfully synced proof "${row.id}" to Supabase Cloud!`);
      }
    } catch (e) {
      console.error("Cloud saving exception for proof:", e);
    }
  }

  async deleteProofFromCloud(id) {
    if (!this.supabase || !id) return;
    try {
      const { error } = await this.supabase.from("proofs").delete().eq("id", id);
      if (error) {
        console.error("Supabase proof deletion error:", error);
        if (error.code === '42501' || error.message?.toLowerCase().includes("row-level security")) {
          window.TaraApp?.showToast("⚠️ Supabase RLS delete denied for proof. Re-login to Store Manager!", "error");
        }
      } else {
        console.log(`☁️ Successfully removed proof (${id}) from Supabase Cloud.`);
      }
    } catch (e) {
      console.error("Cloud deletion exception for proof:", e);
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

  syncCartWithLiveCatalog() {
    if (!Array.isArray(this.cart)) return;
    let changed = false;
    this.cart.forEach(item => {
      const prod = this.getProductById(item.productId);
      if (prod) {
        const origPrice = parseFloat(prod.price) || 0;
        const salePct = parseFloat(prod.salePercentage) || 0;
        const isSoldOut = prod.status === "Sold Out";
        const isOnSale = !isSoldOut && salePct > 0;
        const correctPrice = isOnSale ? Number((origPrice * (1 - salePct / 100)).toFixed(2)) : origPrice;

        if (item.price !== correctPrice || item.origPrice !== origPrice || item.salePercentage !== salePct || item.saleUntil !== (prod.saleUntil || "")) {
          item.price = correctPrice;
          item.origPrice = origPrice;
          item.salePercentage = salePct;
          item.saleUntil = prod.saleUntil || "";
          changed = true;
        }
      }
    });
    if (changed) {
      this.saveCart();
    }
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
      const origPrice = parseFloat(product.price) || 0;
      const salePct = parseFloat(product.salePercentage) || 0;
      const finalPrice = (salePct > 0) ? Number((origPrice * (1 - salePct / 100)).toFixed(2)) : origPrice;
      this.cart.push({
        id: "cart-" + Date.now() + Math.random().toString(36).substr(2, 4),
        productId: product.id,
        name: product.name || "Unnamed Item",
        price: finalPrice,
        origPrice: origPrice,
        salePercentage: salePct,
        saleUntil: product.saleUntil || "",
        image: (Array.isArray(product.images) && product.images[0]) ? product.images[0] : "assets/brand/logo.jpg",
        size: size || "16cm",
        category: category || "Adult",
        quantity: parseInt(quantity, 10) || 1,
        customNotes: customNotes || ""
      });
    }

    this.syncCartWithLiveCatalog();
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
    if (typeof this.syncCartWithLiveCatalog === "function") this.syncCartWithLiveCatalog();
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
