/**
 * ==========================================================================
 * TARA'S COLLECTION - STOREFRONT RENDERER & INTERACTIVE MESSENGER ENGINE
 * Robust tab switching with exact single-tab highlighting, Facebook proof verification button,
 * removal of size selection for stones/charms, and persistent cart rendering.
 * ==========================================================================
 */

class StorefrontApp {
  constructor() {
    this.currentView = "home-view";
    this.activeTab = "home";
    this.selectedCategory = "Adult";
    this.selectedSize = "16cm";
    this.activeProductId = null;
    this.currentOrderText = "";
    this.activeImageIndex = 0;
  }

  init() {
    this.bindSearch();
    this.bindChatWidget();
    
    window.addEventListener("storeUpdated", () => {
      this.renderCurrentTab();
      this.renderYouTubeShorts();
      this.renderCustomerProofs();
      if (window.TaraStore && window.TaraStore.cart) {
        this.updateCartBadges(window.TaraStore.cart);
        this.renderCartItems(window.TaraStore.cart);
      }
    });

    window.addEventListener("cartUpdated", (e) => {
      this.updateCartBadges(e.detail || window.TaraStore.cart);
      this.renderCartItems(e.detail || window.TaraStore.cart);
    });

    if (window.TaraStore) {
      if (window.TaraStore.data) {
        this.selectTab("home", true, true);
        this.renderYouTubeShorts();
        this.renderCustomerProofs();
      }
      if (window.TaraStore.cart) {
        this.updateCartBadges(window.TaraStore.cart);
        this.renderCartItems(window.TaraStore.cart);
      }
    }

    // Automatically collapse floating chat button into circular messenger icon when near footer
    window.addEventListener("scroll", () => {
      const chatBtn = document.getElementById("floating-chat-btn");
      const chatText = document.getElementById("floating-chat-text");
      if (!chatBtn || !chatText) return;

      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      if (docHeight - scrollBottom < 350) {
        chatText.style.maxWidth = "0px";
        chatText.style.opacity = "0";
        chatText.style.margin = "0px";
        chatBtn.style.padding = "14px";
        chatBtn.style.borderRadius = "9999px";
      } else {
        chatText.style.maxWidth = "200px";
        chatText.style.opacity = "1";
        chatText.style.marginLeft = "10px";
        chatBtn.style.padding = "14px 24px";
      }
    });

    // Mobile cellphone Back Button history support
    window.addEventListener("popstate", (e) => {
      const cartModal = document.getElementById("cart-drawer-modal");
      if (cartModal && !cartModal.classList.contains("cart-closed")) {
        this.toggleCartDrawer(false);
        return;
      }
      const chatWidget = document.getElementById("messenger-chat-widget");
      if (chatWidget && !chatWidget.classList.contains("hidden")) {
        this.closeChatWidget();
        return;
      }

      if (e.state) {
        if (e.state.view === "product-view" && e.state.productId) {
          this.openProductDetail(e.state.productId, true);
        } else if (e.state.view === "admin-view") {
          this.switchView("admin-view", null, true);
        } else if (e.state.view === "home-view" || e.state.tab) {
          this.selectTab(e.state.tab || "home", false, true);
        }
      } else {
        this.selectTab("home", false, true);
      }
    });

    // Parse incoming Facebook link parameter (?item=)
    const urlParams = new URLSearchParams(window.location.search);
    const targetItem = urlParams.get("item");
    if (targetItem && window.TaraStore && window.TaraStore.getProductById(targetItem)) {
      setTimeout(() => this.openProductDetail(targetItem, true), 100);
    }

    console.log("Tara's Collection Storefront & Messenger Widget Initialized.");
  }

  /* --- ROBUST TAB SWITCHER WITH EXACT ACTIVE-ONLY HIGHLIGHTING --- */
  selectTab(tabName, isInit = false, skipPush = false) {
    this.toggleCartDrawer(false);
    this.activeTab = tabName;

    if (!skipPush && !isInit) {
      history.pushState({ tab: tabName, view: "home-view" }, "", `#${tabName}`);
    }

    // 1. Force view to home-view so the catalog is actually visible
    this.switchView("home-view", tabName, true);

    // 2. Cleanly remove highlights from ALL tabs first
    document.querySelectorAll(".nav-tier-item").forEach(btn => {
      btn.classList.remove("text-rust", "font-extrabold", "border-rust");
      btn.classList.add("border-transparent");
    });

    // Highlight ONLY the current active tab
    const activeNavBtn = document.getElementById(`nav-tab-${tabName}`);
    if (activeNavBtn) {
      activeNavBtn.classList.remove("border-transparent");
      activeNavBtn.classList.add("text-rust", "font-extrabold", "border-rust");
    }

    // 3. Update active item in mobile bottom nav bar
    document.querySelectorAll(".bottom-nav-bar .nav-item").forEach(item => item.classList.remove("active"));
    const mobileHome = document.getElementById("mobile-nav-home");
    const mobileCatalog = document.getElementById("mobile-nav-catalog");

    if (tabName === "home") {
      if (mobileHome) mobileHome.classList.add("active");
    } else {
      if (mobileCatalog) mobileCatalog.classList.add("active");
    }

    // 4. Adjust layout sections based on the selected tab
    const heroSection = document.getElementById("hero-banner-section");
    const customSection = document.getElementById("custom-bracelets-section");
    const titleEl = document.getElementById("catalog-section-title");
    const subEl = document.getElementById("catalog-section-subtitle");

    if (tabName === "home") {
      if (heroSection) heroSection.classList.remove("hidden");
      if (customSection) customSection.classList.remove("hidden");
      if (titleEl) titleEl.textContent = "Featured Collection";
      if (subEl) subEl.textContent = "Handcrafted Healing Stones & Tailored Bracelets";
      this.renderFeaturedProducts({ featuredOnly: true });
      this.renderCustomBracelets();
    } else if (tabName === "bracelets") {
      if (heroSection) heroSection.classList.add("hidden");
      if (customSection) customSection.classList.add("hidden");
      if (titleEl) titleEl.textContent = "Bracelets Collection";
      if (subEl) subEl.textContent = "Explore our handcrafted stone arrays & crystal bracelets";
      this.renderFeaturedProducts({ category: "bracelets" });
    } else if (tabName === "personalized") {
      if (heroSection) heroSection.classList.add("hidden");
      if (customSection) customSection.classList.add("hidden");
      if (titleEl) titleEl.textContent = "Personalized & Custom Bracelets";
      if (subEl) subEl.textContent = "Tailored designs made specifically to match your energy needs";
      this.renderFeaturedProducts({ category: "personalized" });
    } else if (tabName === "gemstones") {
      if (heroSection) heroSection.classList.add("hidden");
      if (customSection) customSection.classList.add("hidden");
      if (titleEl) titleEl.textContent = "Gemstones & Healing Stones";
      if (subEl) subEl.textContent = "Raw and polished natural crystals cleansed with sound vibrations";
      this.renderFeaturedProducts({ category: "gemstones" });
    } else if (tabName === "charms") {
      if (heroSection) heroSection.classList.add("hidden");
      if (customSection) customSection.classList.add("hidden");
      if (titleEl) titleEl.textContent = "Sacred Charms & Amulets";
      if (subEl) subEl.textContent = "Symbolic elements that bring abundance, good luck, and protection";
      this.renderFeaturedProducts({ category: "charms" });
    }

    if (!isInit) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  renderCurrentTab() {
    this.selectTab(this.activeTab, true);
  }

  /* --- VIEW SWITCHER --- */
  switchView(viewId, currentTab = null, skipPush = false) {
    this.toggleCartDrawer(false);
    if (!skipPush && viewId === "admin-view") {
      history.pushState({ view: "admin-view" }, "", "#admin");
    }

    const views = ["home-view", "product-view", "admin-view"];
    views.forEach(v => {
      const el = document.getElementById(v);
      if (el) {
        if (v === viewId) {
          el.classList.remove("hidden");
          el.classList.add("block");
        } else {
          el.classList.add("hidden");
          el.classList.remove("block");
        }
      }
    });

    this.currentView = viewId;

    if (viewId === "admin-view") {
      document.querySelectorAll(".bottom-nav-bar .nav-item").forEach(item => item.classList.remove("active"));
      const mobileAcc = document.getElementById("mobile-nav-account");
      if (mobileAcc) mobileAcc.classList.add("active");

      if (window.TaraAdmin) {
        window.TaraAdmin.checkSession();
      }
    } else if (viewId === "product-view") {
      document.querySelectorAll(".bottom-nav-bar .nav-item").forEach(item => item.classList.remove("active"));
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  bindSearch() {
    const searchInput = document.getElementById("search-input");
    const clearBtn = document.getElementById("clear-search");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        if (clearBtn) {
          if (val.length > 0) clearBtn.classList.remove("hidden");
          else clearBtn.classList.add("hidden");
        }
        this.renderFeaturedProducts({ query: val });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        clearBtn.classList.add("hidden");
        this.selectTab(this.activeTab);
      });
    }
  }

  bindChatWidget() {
    const chatBtn = document.getElementById("floating-chat-btn");
    const closeBtn = document.getElementById("close-chat-widget");
    const sendChatBtn = document.getElementById("send-normal-chat-btn");
    const chatInput = document.getElementById("normal-chat-input");

    if (chatBtn) chatBtn.addEventListener("click", () => this.openChatWidget("normal"));
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeChatWidget());

    if (sendChatBtn) {
      sendChatBtn.addEventListener("click", () => this.sendNormalChat());
    }

    if (chatInput) {
      chatInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") this.sendNormalChat();
      });
    }
  }

  openChatWidget(mode = "normal") {
    const widget = document.getElementById("messenger-chat-widget");
    const normalView = document.getElementById("chat-widget-normal-view");
    const orderView = document.getElementById("chat-widget-order-view");
    const overlay = document.getElementById("chat-widget-overlay");
    if (!widget) return;

    if (overlay) overlay.classList.remove("hidden");

    if (mode === "order") {
      normalView.classList.add("hidden");
      orderView.classList.remove("hidden");
      
      const previewTextEl = document.getElementById("chat-order-preview-text");
      if (previewTextEl) previewTextEl.textContent = this.currentOrderText;
    } else {
      orderView.classList.add("hidden");
      normalView.classList.remove("hidden");
    }

    widget.classList.remove("hidden");
    widget.classList.add("flex");
  }

  closeChatWidget() {
    const widget = document.getElementById("messenger-chat-widget");
    const overlay = document.getElementById("chat-widget-overlay");
    if (widget) {
      widget.classList.add("hidden");
      widget.classList.remove("flex");
    }
    if (overlay) overlay.classList.add("hidden");
  }

  sendNormalChat() {
    const input = document.getElementById("normal-chat-input");
    const text = (input?.value || "").trim();
    if (!text) {
      alert("Please type a message first!");
      return;
    }
    const messengerUrl = `https://m.me/109568137198741?text=${encodeURIComponent(text)}`;
    window.open(messengerUrl, "_blank");
    if (input) input.value = "";
    this.closeChatWidget();
  }

  /* --- MESSENGER ORDER FORMATTING --- */
  showOrderInChatWidget() {
    const cart = window.TaraStore.cart;
    if (!cart || cart.length === 0) {
      alert("Your cart is empty! Add items before checking out.");
      return;
    }

    this.toggleCartDrawer(false);

    let summary = "Hi Tara's Collection! ✨ I would like to order the following items:\n\n";
    cart.forEach(item => {
      const itemSubtotal = item.price * item.quantity;
      summary += `- ${item.quantity}x ${item.name} (₱${item.price.toLocaleString()} each | Subtotal: ₱${itemSubtotal.toLocaleString()})\n`;
      
      if (item.size && item.size !== "N/A" && item.category && item.category !== "N/A") {
        summary += `  Wrist Size: ${item.size}\n`;
      } else {
        summary += `  Item Type: Natural Stone / Charm (No wrist size required)\n`;
      }
      
      const linkId = item.productId || item.id;
      summary += `  Link: ${window.location.origin}${window.location.pathname}?item=${encodeURIComponent(linkId)}\n\n`;
    });

    const total = window.TaraStore.getCartTotal();
    summary += `Estimated Total: ₱${total.toLocaleString()}\n\n`;
    summary += "Please let me know how to proceed with payment and J&T shipping. Thank you!";

    this.currentOrderText = summary;
    this.openChatWidget("order");
  }

  sendOrderToMessenger() {
    if (!this.currentOrderText) return;
    navigator.clipboard.writeText(this.currentOrderText).catch(() => {});
    const messengerUrl = `https://m.me/109568137198741?text=${encodeURIComponent(this.currentOrderText)}`;
    window.open(messengerUrl, "_blank");
    this.showToast("Opening Facebook Messenger with your order!", "success");
    this.closeChatWidget();
  }

  inquireViaMessenger() {
    if (!this.activeProductId) return;
    const p = window.TaraStore.getProductById(this.activeProductId);
    const text = `Hi Tara's Collection! ✨ I would like to inquire about the "${p?.name || 'Item'}" (₱${p?.price || 0}).\nLink: ${window.location.origin}${window.location.pathname}?item=${p?.id || this.activeProductId}`;
    
    const input = document.getElementById("normal-chat-input");
    if (input) input.value = text;
    this.openChatWidget("normal");
  }

  /* --- PRODUCT RENDERING --- */
  renderFeaturedProducts(options = {}) {
    const grid = document.getElementById("unified-product-grid");
    if (!grid) return;

    let all = window.TaraStore?.getProducts({}) || [];
    all = all.filter(p => p.status !== "Hidden");

    if (options.query) {
      const q = options.query.toLowerCase();
      all = all.filter(p => (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q));
    } else {
      if (options.featuredOnly) {
        all = all.filter(p => p.featured === true && p.category !== "personalized" && !p.isCustomBase);
      }
      else if (options.category === "personalized") {
        all = all.filter(p => p.category === "personalized" || p.isCustomBase === true);
      }
      else if (options.category) {
        all = all.filter(p => p.category === options.category);
      }
    }

    grid.innerHTML = "";

    if (all.length === 0) {
      grid.innerHTML = `
        <div class="col-span-2 md:col-span-4 text-center py-16">
          <p class="text-stone font-serif text-lg">No items found in this section yet.</p>
          <button onclick="window.TaraApp.selectTab('home')" class="mt-4 text-xs font-bold uppercase text-rust hover:underline cursor-pointer">Return to Home Catalog</button>
        </div>
      `;
      return;
    }

    all.forEach(product => {
      grid.appendChild(this.createProductCard(product));
    });
  }

  renderCustomBracelets() {
    const grid = document.getElementById("custom-bases-grid");
    if (!grid) return;

    const all = window.TaraStore?.getProducts({}) || [];
    const items = all.filter(p => (p.category === "personalized" || p.isCustomBase === true) && p.status !== "Hidden" && p.featured === true);
    
    grid.innerHTML = "";
    if (items.length === 0) {
      grid.innerHTML = `<p class="col-span-4 text-center text-stone text-xs italic py-8">No custom bracelets available right now.</p>`;
      return;
    }

    items.forEach(product => {
      grid.appendChild(this.createProductCard(product));
    });
  }

  createProductCard(product) {
    const div = document.createElement("div");
    const isSoldOut = product.status === "Sold Out";
    
    div.className = `product-card relative group flex flex-col justify-between cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 ${isSoldOut ? "card-sold-out" : ""}`;
    div.onclick = () => this.openProductDetail(product.id);

    const mainImg = product.images && product.images.length > 0 ? product.images[0] : "assets/brand/logo.jpg";
    const imgCount = product.images ? product.images.length : (mainImg ? 1 : 0);
    const photoCountBadge = imgCount > 1 ? `<span class="absolute top-3 right-3 bg-charcoal/85 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-white/20 z-10 flex items-center space-x-1 shadow-lg backdrop-blur-sm"><svg class="w-3.5 h-3.5 text-sand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span>${imgCount} pictures</span></span>` : "";

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const isOldUpload = product.createdAt && (Date.now() - product.createdAt >= thirtyDaysMs);

    let badgeText = product.badge || (isSoldOut ? "SOLD OUT" : "");
    if (!badgeText && product.isNew && !isOldUpload) {
      badgeText = "NEW";
    }

    // Automatically remove NEW banner after 1 month (30 days)
    if (badgeText === "NEW" && isOldUpload) {
      badgeText = (product.category === "personalized") ? "CUSTOMIZABLE" : "";
    }

    let badgeClass = "badge-bestseller";
    if (badgeText === "SOLD OUT") {
      badgeClass = "badge-soldout";
    } else if (badgeText === "HEALING") {
      badgeClass = "badge-healing";
    } else if (badgeText === "NEW") {
      badgeClass = "badge-new"; // Green ALWAYS wins when badge text is NEW!
    } else if (badgeText === "CUSTOMIZABLE" || product.category === "personalized") {
      badgeClass = "badge-customizable";
      if (!badgeText) badgeText = "CUSTOMIZABLE";
    }

    const catLabel = product.category === "personalized" ? "Custom Bracelet" : (product.category || "").toUpperCase();

    div.innerHTML = `
      <div>
        ${badgeText ? `<span class="product-badge ${badgeClass}">${badgeText}</span>` : ""}
        ${photoCountBadge}
        <div class="blob-wrapper mb-4 shadow-sm relative">
          <div class="blob-frame">
            <img src="${mainImg}" alt="${product.name}" class="blob-image loading='lazy'">
          </div>
        </div>
        <div class="text-center md:text-left px-1">
          <p class="text-[10px] font-bold text-stone uppercase tracking-widest mb-1">${catLabel}</p>
          <h3 class="text-sm md:text-base font-serif font-bold text-charcoal tracking-wide line-clamp-2 group-hover:text-rust transition-colors">${product.name}</h3>
          <div class="flex items-baseline justify-center md:justify-between mt-1.5 gap-2">
            <span class="text-sm md:text-base font-bold text-ocean">₱ ${product.price ? product.price.toLocaleString() : 0}</span>
            ${(product.soldCount && parseInt(product.soldCount, 10) > 0) ? `<span class="text-xs font-bold text-rust whitespace-nowrap">${product.soldCount} sold</span>` : ""}
          </div>
        </div>
      </div>
    `;
    return div;
  }

  /* --- FULL PRODUCT DETAIL & HIDING WRIST SIZE ON GEMSTONES/CHARMS --- */
  openProductDetail(productId, skipPush = false) {
    const product = window.TaraStore?.getProductById(productId);
    if (!product) return;

    if (!skipPush) {
      history.pushState({ productId, view: "product-view" }, "", `?item=${productId}`);
    }

    this.activeProductId = productId;
    this.activeImageIndex = 0;

    document.getElementById("pv-title-crumb").textContent = product.name;
    document.getElementById("pv-title").textContent = product.name;
    document.getElementById("pv-price").textContent = `₱ ${product.price ? product.price.toLocaleString() : 0}`;
    const soldBadgeEl = document.getElementById("pv-sold-badge");
    if (soldBadgeEl) {
      if (product.soldCount && parseInt(product.soldCount, 10) > 0) {
        soldBadgeEl.textContent = `${product.soldCount} sold`;
        soldBadgeEl.classList.remove("hidden");
      } else {
        soldBadgeEl.classList.add("hidden");
      }
    }
    document.getElementById("pv-desc").textContent = product.description || "Handcrafted natural energy piece by Tara's Collection.";

    const mainImg = document.getElementById("pv-main-image");
    const thumbContainer = document.getElementById("pv-thumbnails");
    const defaultImg = product.images && product.images.length > 0 ? product.images[0] : "assets/brand/logo.jpg";
    if (mainImg) mainImg.src = defaultImg;
    
    if (thumbContainer) {
      thumbContainer.innerHTML = "";
      product.images.forEach((url, idx) => {
        const btn = document.createElement("button");
        btn.className = `w-16 h-16 rounded-md overflow-hidden border-2 ${idx === 0 ? "border-rust" : "border-stone/30"} flex-shrink-0 cursor-pointer transition-transform hover:scale-105`;
        btn.innerHTML = `<img src="${url}" class="w-full h-full object-cover">`;
        btn.onclick = () => {
          this.activeImageIndex = idx;
          if (mainImg) mainImg.src = url;
          thumbContainer.querySelectorAll("button").forEach(b => b.className = b.className.replace("border-rust", "border-stone/30"));
          btn.className = btn.className.replace("border-stone/30", "border-rust");
        };
        thumbContainer.appendChild(btn);
      });
    }

    const sizeSelectorEl = document.getElementById("pv-size-selector");
    const isStoneOrCharm = (product.category === "gemstones" || product.category === "charms");
    
    if (isStoneOrCharm) {
      if (sizeSelectorEl) sizeSelectorEl.classList.add("hidden");
      this.selectedCategory = "N/A";
      this.selectedSize = "N/A";
    } else {
      if (sizeSelectorEl) sizeSelectorEl.classList.remove("hidden");
      this.selectedCategory = "Adult";
      const availSizes = product.sizes || window.TaraStore.getStoreInfo().defaultWristSizes || ["16cm"];
      this.selectedSize = availSizes.includes("16cm") ? "16cm" : (availSizes[0] || "16cm");
      this.renderSizePills(availSizes);
    }

    const btnContainer = document.getElementById("pv-button-container");
    const isSoldOut = product.status === "Sold Out";
    if (btnContainer) {
      if (isSoldOut) {
        btnContainer.innerHTML = `
          <button disabled class="w-full bg-stone text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-not-allowed">THIS ITEM IS CURRENTLY SOLD OUT</button>
        `;
      } else {
        btnContainer.innerHTML = `
          <button onclick="window.TaraApp.addDetailToCart()" class="w-full bg-charcoal hover:bg-ocean text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer touch-min mb-3">
            ADD TO CART &bull; ₱${product.price}
          </button>
          <button onclick="window.TaraApp.inquireViaMessenger()" class="w-full border border-charcoal bg-transparent hover:bg-charcoal hover:text-white text-charcoal py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer touch-min">
            INQUIRE VIA FACEBOOK MESSENGER
          </button>
        `;
      }
    }

    this.renderRelatedProducts(productId, product.category);
    this.switchView("product-view", null, true);
  }

  renderRelatedProducts(currentId, targetCategory) {
    const grid = document.getElementById("pv-related-grid");
    const titleEl = document.getElementById("related-section-title");
    if (!grid) return;
    grid.innerHTML = "";

    if (titleEl) {
      const displayCat = targetCategory === "personalized" ? "Custom Bracelets" : (targetCategory || "Items").charAt(0).toUpperCase() + (targetCategory || "").slice(1);
      titleEl.textContent = `More ${displayCat} You May Like`;
    }

    const all = window.TaraStore.getProducts({}).filter(p => p.id !== currentId && p.status !== "Hidden");
    const sameCategoryItems = all.filter(p => p.category === targetCategory);
    const suggestions = sameCategoryItems.slice(0, 4);

    if (suggestions.length === 0) {
      grid.innerHTML = `<p class="col-span-4 text-stone italic text-xs">No other items available in this category right now.</p>`;
      return;
    }

    suggestions.forEach(prod => {
      grid.appendChild(this.createProductCard(prod));
    });
  }

  openImageZoom() {
    if (!this.activeProductId) return;
    const p = window.TaraStore.getProductById(this.activeProductId);
    if (!p || !p.images || p.images.length === 0) return;

    const modal = document.getElementById("image-zoom-modal");
    const img = document.getElementById("zoom-enlarged-image");
    if (modal && img) {
      img.src = p.images[this.activeImageIndex] || p.images[0];
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  prevPvImage(e) {
    e.stopPropagation();
    if (!this.activeProductId) return;
    const p = window.TaraStore.getProductById(this.activeProductId);
    if (!p || !p.images || p.images.length <= 1) return;
    this.activeImageIndex = (this.activeImageIndex - 1 + p.images.length) % p.images.length;
    const mainImg = document.getElementById("pv-main-image");
    if (mainImg) mainImg.src = p.images[this.activeImageIndex];
    this.syncThumbnails();
  }

  nextPvImage(e) {
    e.stopPropagation();
    if (!this.activeProductId) return;
    const p = window.TaraStore.getProductById(this.activeProductId);
    if (!p || !p.images || p.images.length <= 1) return;
    this.activeImageIndex = (this.activeImageIndex + 1) % p.images.length;
    const mainImg = document.getElementById("pv-main-image");
    if (mainImg) mainImg.src = p.images[this.activeImageIndex];
    this.syncThumbnails();
  }

  prevZoomImage(e) {
    e.stopPropagation();
    if (!this.activeProductId) return;
    const p = window.TaraStore.getProductById(this.activeProductId);
    if (!p || !p.images || p.images.length <= 1) return;
    this.activeImageIndex = (this.activeImageIndex - 1 + p.images.length) % p.images.length;
    const img = document.getElementById("zoom-enlarged-image");
    const mainImg = document.getElementById("pv-main-image");
    if (img) img.src = p.images[this.activeImageIndex];
    if (mainImg) mainImg.src = p.images[this.activeImageIndex];
    this.syncThumbnails();
  }

  nextZoomImage(e) {
    e.stopPropagation();
    if (!this.activeProductId) return;
    const p = window.TaraStore.getProductById(this.activeProductId);
    if (!p || !p.images || p.images.length <= 1) return;
    this.activeImageIndex = (this.activeImageIndex + 1) % p.images.length;
    const img = document.getElementById("zoom-enlarged-image");
    const mainImg = document.getElementById("pv-main-image");
    if (img) img.src = p.images[this.activeImageIndex];
    if (mainImg) mainImg.src = p.images[this.activeImageIndex];
    this.syncThumbnails();
  }

  syncThumbnails() {
    const thumbs = document.querySelectorAll("#pv-thumbnails button");
    thumbs.forEach((b, idx) => {
      if (idx === this.activeImageIndex) {
        b.className = b.className.replace("border-stone/30", "border-rust");
      } else {
        b.className = b.className.replace("border-rust", "border-stone/30");
      }
    });
  }

  renderSizePills(availableSizes) {
    const container = document.getElementById("size-pills-container");
    const label = document.getElementById("selected-size-label");
    if (!container) return;

    container.innerHTML = "";
    if (label) label.textContent = this.selectedSize;

    const standardSizes = ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"];
    const allSizes = Array.from(new Set([...standardSizes, ...(availableSizes || [])]));

    allSizes.forEach(size => {
      const btn = document.createElement("button");
      const isAvailable = !availableSizes || availableSizes.includes(size);
      const isSelected = size === this.selectedSize;

      if (!isAvailable) {
        btn.className = "px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider border border-stone/30 bg-stone/15 text-stone/50 line-through cursor-not-allowed";
        btn.textContent = `${size} (Sold Out)`;
        btn.disabled = true;
        btn.title = "Size Currently Unavailable";
      } else {
        btn.className = `px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
          isSelected ? "bg-charcoal text-white border-charcoal shadow-sm" : "bg-white text-charcoal border-stone/50 hover:border-charcoal"
        }`;
        btn.textContent = size;
        btn.onclick = () => {
          this.selectedSize = size;
          if (label) label.textContent = size;
          this.renderSizePills(availableSizes);
        };
      }
      container.appendChild(btn);
    });
  }

  setCategory(cat) {
    this.selectedCategory = cat;
    const adBtn = document.getElementById("cat-adult");
    const kdBtn = document.getElementById("cat-kids");
    if (adBtn && kdBtn) {
      if (cat === "Adult") {
        adBtn.className = "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal text-white border border-charcoal cursor-pointer";
        kdBtn.className = "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-transparent text-charcoal border border-stone/50 hover:border-charcoal cursor-pointer";
      } else {
        kdBtn.className = "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal text-white border border-charcoal cursor-pointer";
        adBtn.className = "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-transparent text-charcoal border border-stone/50 hover:border-charcoal cursor-pointer";
      }
    }
  }

  triggerCartWiggle() {
    const fabCart = document.getElementById("floating-cart-btn");
    if (fabCart) {
      fabCart.classList.remove("animate-cart-wiggle");
      void fabCart.offsetWidth;
      fabCart.classList.add("animate-cart-wiggle");
      setTimeout(() => fabCart.classList.remove("animate-cart-wiggle"), 700);
    }
  }

  quickAddToCart(e, productId) {
    e.stopPropagation();
    const product = window.TaraStore.getProductById(productId);
    if (!product) return;
    window.TaraStore.addToCart(productId, "16cm", "Adult", 1);
    this.showToast("🛍️ Item added!", "success", true);
    this.triggerCartWiggle();
  }

  addDetailToCart() {
    if (!this.activeProductId) return;
    const product = window.TaraStore.getProductById(this.activeProductId);
    if (!product) return;
    window.TaraStore.addToCart(this.activeProductId, this.selectedSize, this.selectedCategory, 1);
    this.showToast("🛍️ Item added!", "success", true);
    this.triggerCartWiggle();
  }

  showToast(msg, type = "info", isCart = false) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast-message ${type === "success" ? "toast-success" : "toast-info"}`;
    const cartBtnHtml = (isCart || msg.toLowerCase().includes("cart") || msg.toLowerCase().includes("🛒") || msg.toLowerCase().includes("item added"))
      ? `<button onclick="window.TaraApp.toggleCartDrawer(true)" class="text-[10px] bg-rust text-white font-extrabold px-2.5 py-1 rounded-full uppercase hover:bg-ocean transition-colors cursor-pointer flex-shrink-0 shadow-sm">View Cart</button>`
      : ``;
    toast.innerHTML = `<span class="truncate">${msg}</span>${cartBtnHtml}`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("toast-fade-out");
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  updateCartBadges(cart) {
    const count = window.TaraStore.getCartCount();
    document.querySelectorAll(".cart-counter-badge").forEach(el => {
      el.textContent = count;
      if (count > 0) el.classList.remove("hidden");
      else el.classList.add("hidden");
    });

    const fabCart = document.getElementById("floating-cart-btn");
    if (fabCart) {
      if (count > 0) {
        fabCart.classList.remove("hidden");
        fabCart.classList.add("flex");
        const cnt = document.getElementById("cart-count");
        if (cnt) cnt.textContent = count;
      } else {
        fabCart.classList.add("hidden");
        fabCart.classList.remove("flex");
      }
    }
  }

  toggleCartDrawer(forceOpen = null) {
    const modal = document.getElementById("cart-modal");
    const overlay = document.getElementById("cart-overlay");
    if (!modal) return;
    const isOpen = modal.classList.contains("cart-open");
    const shouldOpen = forceOpen !== null ? forceOpen : !isOpen;

    if (shouldOpen) {
      modal.classList.remove("cart-closed");
      modal.classList.add("cart-open");
      if (overlay) overlay.classList.remove("hidden");
    } else {
      modal.classList.add("cart-closed");
      modal.classList.remove("cart-open");
      if (overlay) overlay.classList.add("hidden");
    }
  }

  renderCartItems(cart) {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    if (!container) return;

    if (!cart || cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 text-stone">
          <svg class="w-12 h-12 mx-auto mb-3 text-stone/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          <p class="font-serif text-base">Your shopping cart is empty.</p>
          <button onclick="window.TaraApp.toggleCartDrawer(false)" class="mt-4 text-xs font-bold text-ocean hover:underline uppercase">Continue Browsing</button>
        </div>
      `;
      if (totalEl) totalEl.textContent = "0";
      return;
    }

    container.innerHTML = "";
    cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "flex items-center space-x-3 bg-white p-3 rounded-xl border border-stone/20 shadow-sm";
      const detailDesc = (item.size === "N/A" || !item.size) ? "Stone / Charm Element" : `Wrist Size: ${item.size}`;
      
      const subtotal = (item.price * item.quantity).toLocaleString();
      const priceFormatted = item.price ? item.price.toLocaleString() : "0";
      row.innerHTML = `
        <img src="${item.image}" class="w-16 h-16 object-cover rounded-lg border border-stone/30 flex-shrink-0">
        <div class="flex-1 min-w-0">
          <h4 class="font-serif font-bold text-sm text-charcoal truncate">${item.name}</h4>
          <p class="text-[11px] text-ocean font-semibold">${detailDesc} &bull; ₱${priceFormatted} <span class="text-rust font-extrabold ml-1">* subtotal ₱${subtotal}</span></p>
          <div class="flex items-center space-x-2 mt-2">
            <button onclick="window.TaraStore.updateCartQuantity('${item.id}', -1)" class="w-6 h-6 rounded-full bg-sand hover:bg-stone/30 font-bold text-charcoal flex items-center justify-center text-xs">-</button>
            <span class="text-xs font-bold text-charcoal w-4 text-center">${item.quantity}</span>
            <button onclick="window.TaraStore.updateCartQuantity('${item.id}', 1)" class="w-6 h-6 rounded-full bg-sand hover:bg-stone/30 font-bold text-charcoal flex items-center justify-center text-xs">+</button>
            <button onclick="window.TaraStore.removeFromCart('${item.id}')" class="ml-auto text-[10px] uppercase text-red-500 hover:underline font-bold">REMOVE</button>
          </div>
        </div>
      `;
      container.appendChild(row);
    });

    if (totalEl) {
      totalEl.textContent = window.TaraStore.getCartTotal().toLocaleString();
    }
  }

  renderYouTubeShorts() {
    const container = document.getElementById("youtube-shorts-grid");
    if (!container) return;
    const shorts = window.TaraStore.getYouTubeShorts();
    container.innerHTML = "";
    shorts.forEach(video => {
      const a = document.createElement("a");
      a.href = video.url;
      a.target = "_blank";
      a.className = "block aspect-[9/16] bg-stone/20 rounded-xl overflow-hidden shadow-md relative group cursor-pointer border border-stone/40";
      a.innerHTML = `
        <img src="${video.thumbnail}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-transform duration-500 group-hover:scale-105" alt="${video.title}">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
          <h4 class="text-white text-xs md:text-sm font-bold truncate mb-2">${video.title}</h4>
          <div class="bg-rust rounded-full w-12 h-12 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mx-auto mb-2">
            <svg class="w-6 h-6 text-white pl-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      `;
      container.appendChild(a);
    });
  }

  renderCustomerProofs() {
    const track = document.getElementById("marquee-track");
    if (!track) return;
    const proofs = window.TaraStore.getCustomerProofs();
    track.innerHTML = "";
    [...proofs, ...proofs].forEach((proof, idx) => {
      const actualIdx = idx % proofs.length;
      const div = document.createElement("div");
      div.className = "w-64 h-64 rounded-xl overflow-hidden shadow-md relative flex-shrink-0 cursor-pointer border border-stone/30 group";
      div.onclick = () => this.openProofModal(proof, actualIdx);
      div.innerHTML = `
        <img src="${proof.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Customer Proof">
        <div class="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <p class="text-white text-xs font-medium">${proof.caption || 'Verified Transaction'}</p>
        </div>
      `;
      track.appendChild(div);
    });
  }

  /* --- VERIFIED FACEBOOK PROOF MODAL WITH FB LINK ROUTER & PREV/NEXT NAVIGATION --- */
  openProofModal(proof, idx = 0) {
    this.currentProofIndex = idx;
    const modal = document.getElementById("proof-modal");
    const img = document.getElementById("proof-enlarged-image");
    const caption = document.getElementById("proof-caption-text");
    const fbBtn = document.getElementById("proof-fb-link-btn");
    if (modal && img) {
      img.src = proof.image;
      if (caption) caption.textContent = proof.caption || "Verified Customer Transaction";
      
      if (fbBtn) {
        if (proof.link) {
          fbBtn.href = proof.link;
          fbBtn.classList.remove("hidden");
          fbBtn.classList.add("flex");
        } else {
          fbBtn.classList.add("hidden");
          fbBtn.classList.remove("flex");
        }
      }

      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  prevProof(e) {
    if (e) e.stopPropagation();
    const proofs = window.TaraStore?.getCustomerProofs() || [];
    if (proofs.length === 0) return;
    this.currentProofIndex = (this.currentProofIndex - 1 + proofs.length) % proofs.length;
    this.openProofModal(proofs[this.currentProofIndex], this.currentProofIndex);
  }

  nextProof(e) {
    if (e) e.stopPropagation();
    const proofs = window.TaraStore?.getCustomerProofs() || [];
    if (proofs.length === 0) return;
    this.currentProofIndex = (this.currentProofIndex + 1) % proofs.length;
    this.openProofModal(proofs[this.currentProofIndex], this.currentProofIndex);
  }

  closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) {
      m.classList.add("hidden");
      m.classList.remove("flex");
    }
  }
}

window.TaraApp = new StorefrontApp();
window.addEventListener("DOMContentLoaded", () => {
  window.TaraApp.init();
});
