/**
 * ==========================================================================
 * TARA'S COLLECTION - DISCRETE ACCOUNT & SECRET ADMIN AUTHENTICATION
 * Masks admin inventory controls behind a standard Customer Account portal.
 * Features automatic Draft Saving and full Customer Proofs of Transaction management!
 * Admin Credentials: Username: "tara" / "admin" | PIN: "tara2026"
 * ==========================================================================
 */

const ADMIN_DRAFT_KEY = "tara_admin_unsaved_product_draft";

class AdminDashboard {
  constructor() {
    this.adminUsername = "tara";
    this.adminPin = "tara2026";
    
    this.isAdminLoggedIn = localStorage.getItem("tara_admin_authenticated") === "true";
    this.currentCustomer = JSON.parse(localStorage.getItem("tara_active_customer")) || null;

    this.editingProductId = null;
    this.uploadedImageBase64 = null;
    this.uploadedProofBase64 = null;
  }

  init() {
    this.bindAccountPortal();
    this.bindProductForm();
    this.bindAutoDraftSaver();
    this.bindProofForm();
    this.checkSession();

    window.addEventListener("storeUpdated", () => {
      if (this.isAdminLoggedIn) {
        this.renderInventoryList();
        this.renderProofsList();
      }
    });

    console.log("Discrete Account & Admin Auth with Auto-Draft & Proof Management Initialized.");
  }

  /* --- AUTO-DRAFT SAVER ENGINE --- */
  bindAutoDraftSaver() {
    const inputs = ["#form-prod-name", "#form-prod-price", "#form-prod-cat", "#form-prod-status", "#form-prod-badge", "#form-prod-qty", "#form-prod-sold", "#form-prod-img-url", "#form-prod-desc", "#form-prod-sale-pct", "#form-prod-sale-until"];
    inputs.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        el.addEventListener("input", () => { this.saveUnfinishedDraft(); this.updateSalePricePreview(); });
        el.addEventListener("change", () => { this.saveUnfinishedDraft(); this.updateSalePricePreview(); });
      }
    });
  }

  saveUnfinishedDraft() {
    if (this.editingProductId !== null) return;

    const draft = {
      name: document.getElementById("form-prod-name")?.value || "",
      price: document.getElementById("form-prod-price")?.value || "",
      salePct: document.getElementById("form-prod-sale-pct")?.value || "",
      saleUntil: document.getElementById("form-prod-sale-until")?.value || "",
      cat: document.getElementById("form-prod-cat")?.value || "bracelets-featured",
      status: document.getElementById("form-prod-status")?.value || "Available",
      badge: document.getElementById("form-prod-badge")?.value || "",
      qty: document.getElementById("form-prod-qty")?.value || "",
      sold: document.getElementById("form-prod-sold")?.value || "",
      url: document.getElementById("form-prod-img-url")?.value || "",
      desc: document.getElementById("form-prod-desc")?.value || "",
      images: this.uploadedImages || [],
      sizes: this.selectedWristSizes || ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"],
      stoneSizes: this.selectedStoneSizes || [],
      savedAt: Date.now()
    };

    if (!draft.name && !draft.price && !draft.desc && (!draft.images || draft.images.length === 0) && !draft.url) {
      localStorage.removeItem(ADMIN_DRAFT_KEY);
      return;
    }

    localStorage.setItem(ADMIN_DRAFT_KEY, JSON.stringify(draft));
  }

  clearUnfinishedDraft() {
    localStorage.removeItem(ADMIN_DRAFT_KEY);
    this.uploadedImages = [];
    this.selectedWristSizes = ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"];
    this.selectedStoneSizes = [];
    if (document.getElementById("form-prod-name")) document.getElementById("form-prod-name").value = "";
    if (document.getElementById("form-prod-price")) document.getElementById("form-prod-price").value = "";
    if (document.getElementById("form-prod-sale-pct")) document.getElementById("form-prod-sale-pct").value = "";
    if (document.getElementById("form-prod-sale-until")) document.getElementById("form-prod-sale-until").value = "";
    if (document.getElementById("form-prod-cat")) document.getElementById("form-prod-cat").value = "bracelets-featured";
    if (document.getElementById("form-prod-status")) document.getElementById("form-prod-status").value = "Available";
    if (document.getElementById("form-prod-badge")) document.getElementById("form-prod-badge").value = "NEW";
    if (document.getElementById("form-prod-img-url")) document.getElementById("form-prod-img-url").value = "";
    if (document.getElementById("form-prod-desc")) document.getElementById("form-prod-desc").value = "";
    if (document.getElementById("admin-file-upload")) document.getElementById("admin-file-upload").value = "";
    this.updateSalePricePreview();
    this.renderMultiImagePreview();
    this.renderWristSizeSelector();
    if (this.renderStoneSizeSelector) this.renderStoneSizeSelector();
    this.updateSizeSectionVisibility();
    window.TaraApp?.showToast("Draft cleared. Ready for a new item!", "info");
  }

  /* --- ACCOUNT PORTAL & DISCRETE AUTH ENGINE --- */
  checkSession() {
    const loginBox = document.getElementById("account-login-box");
    const regBox = document.getElementById("account-register-box");
    const custWorkspace = document.getElementById("customer-workspace-box");
    const adminWorkspace = document.getElementById("admin-workspace-box");
    if (!loginBox) return;

    if (this.isAdminLoggedIn) {
      loginBox.classList.add("hidden");
      regBox.classList.add("hidden");
      custWorkspace.classList.add("hidden");
      adminWorkspace.classList.remove("hidden");
      this.renderInventoryList();
      this.renderProofsList();
    } else if (this.currentCustomer) {
      loginBox.classList.add("hidden");
      regBox.classList.add("hidden");
      adminWorkspace.classList.add("hidden");
      custWorkspace.classList.remove("hidden");
      const nameEl = document.getElementById("customer-profile-name");
      if (nameEl) nameEl.textContent = this.currentCustomer.name || "Collector";
    } else {
      loginBox.classList.remove("hidden");
      regBox.classList.add("hidden");
      custWorkspace.classList.add("hidden");
      adminWorkspace.classList.add("hidden");
    }
  }

  bindAccountPortal() {
    const loginBtn = document.getElementById("account-login-btn");
    const userInput = document.getElementById("account-user-input");
    const pwInput = document.getElementById("account-pw-input");
    const errorMsg = document.getElementById("account-login-error");

    const toRegBtn = document.getElementById("switch-to-register");
    const toLogBtn = document.getElementById("switch-to-login");
    const regBtn = document.getElementById("account-register-btn");

    if (toRegBtn) {
      toRegBtn.addEventListener("click", (e) => {
        if (e) e.preventDefault();
        alert("On-going upgrade - Please use the messenger icon or chat with us button to connect with us. Thank you!");
        window.TaraApp?.showToast("⚠️ On-going upgrade - Please use the chat with us button to connect with us. Thank you!", "info");
      });
    }

    if (toLogBtn) {
      toLogBtn.addEventListener("click", () => {
        document.getElementById("account-register-box")?.classList.add("hidden");
        document.getElementById("account-login-box")?.classList.remove("hidden");
      });
    }

    if (loginBtn) {
      const handleLogin = () => {
        const userVal = (userInput?.value || "").trim().toLowerCase();
        const pwVal = (pwInput?.value || "").trim();

        if (!userVal || !pwVal) {
          if (errorMsg) {
            errorMsg.textContent = "Please enter both username/email and password.";
            errorMsg.classList.remove("hidden");
          }
          return;
        }

        if ((userVal === "tara" || userVal === "admin" || userVal === "tara@admin.com") && pwVal === this.adminPin) {
          this.isAdminLoggedIn = true;
          localStorage.setItem("tara_admin_authenticated", "true");
          this.currentCustomer = null;
          if (userInput) userInput.value = "";
          if (pwInput) pwInput.value = "";
          if (errorMsg) errorMsg.classList.add("hidden");
          this.checkSession();
          window.TaraApp?.showToast("Authenticated as Store Manager! 👑", "success");
          return;
        }

        const savedCustomers = JSON.parse(localStorage.getItem("tara_registered_customers") || "{}");
        const account = savedCustomers[userVal];

        if (account && account.password === pwVal) {
          this.currentCustomer = { name: account.name, email: userVal };
          localStorage.setItem("tara_active_customer", JSON.stringify(this.currentCustomer));
          this.isAdminLoggedIn = false;
          if (userInput) userInput.value = "";
          if (pwInput) pwInput.value = "";
          if (errorMsg) errorMsg.classList.add("hidden");
          this.checkSession();
          window.TaraApp?.showToast(`Welcome back, ${account.name}! ✨`, "success");
        } else {
          if (errorMsg) {
            errorMsg.textContent = "Invalid username or password. If new, create an account!";
            errorMsg.classList.remove("hidden");
          }
        }
      };

      loginBtn.addEventListener("click", handleLogin);
      pwInput?.addEventListener("keyup", (e) => { if (e.key === "Enter") handleLogin(); });
    }

    if (regBtn) {
      regBtn.addEventListener("click", () => {
        const nameVal = document.getElementById("reg-name-input")?.value.trim() || "Client";
        const emailVal = document.getElementById("reg-email-input")?.value.trim().toLowerCase() || "";
        const regError = document.getElementById("reg-error");

        if (!emailVal) {
          if (regError) {
            regError.textContent = "Please enter a valid email address.";
            regError.classList.remove("hidden");
          }
          return;
        }

        const savedCustomers = JSON.parse(localStorage.getItem("tara_registered_customers") || "{}");
        savedCustomers[emailVal] = { name: nameVal, email: emailVal, password: "client" };
        localStorage.setItem("tara_registered_customers", JSON.stringify(savedCustomers));

        this.currentCustomer = { name: nameVal, email: emailVal };
        localStorage.setItem("tara_active_customer", JSON.stringify(this.currentCustomer));
        
        if (regError) regError.classList.add("hidden");
        this.checkSession();
        window.TaraApp?.showToast("Customer profile created! ✨", "success");
      });
    }

    document.querySelectorAll(".account-logout-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.isAdminLoggedIn = false;
        localStorage.removeItem("tara_admin_authenticated");
        this.currentCustomer = null;
        localStorage.removeItem("tara_active_customer");
        this.checkSession();
        window.TaraApp?.selectTab('home');
        window.TaraApp?.showToast("You have signed out. All inventory updates are safely stored!", "info");
      });
    });
  }

  /* --- INVENTORY LIST & STATUS FILTERING --- */
  filterByStatus(status) {
    this.activeStatusFilter = status;
    ["all", "Available", "Sold", "Hidden", "Sale"].forEach(k => {
      const cardId = k === "Sold Out" || k === "Sold" ? "stat-card-Sold" : `stat-card-${k}`;
      const card = document.getElementById(cardId);
      if (card) {
        const isMatch = (status === "all" && k === "all") || (status === k) || (status === "Sold Out" && (k === "Sold" || k === "Sold Out"));
        if (isMatch) {
          card.classList.add("ring-2", "ring-ocean", "bg-ocean/5");
        } else {
          card.classList.remove("ring-2", "ring-ocean", "bg-ocean/5");
        }
      }
    });
    this.renderInventoryList();
  }

  renderInventoryList() {
    const list = document.getElementById("admin-product-list");
    if (!list || !window.TaraStore) return;

    const products = window.TaraStore.data.products || [];
    list.innerHTML = "";

    let total = products.length;
    let avail = 0;
    let sold = 0;
    let hidden = 0;
    let sale = 0;
    let grossSales = 0;

    products.forEach(prod => {
      if (prod.status === "Available") avail++;
      else if (prod.status === "Sold Out") sold++;
      else if (prod.status === "Hidden") hidden++;
      if (parseFloat(prod.salePercentage) > 0 && prod.status !== "Sold Out") sale++;

      const soldNum = parseInt(prod.soldCount || 0, 10);
      const effectiveSold = soldNum > 0 ? soldNum : (prod.status === "Sold Out" ? 1 : 0);
      if (effectiveSold > 0) {
        const origPrice = parseFloat(prod.price) || 0;
        const salePct = parseFloat(prod.salePercentage) || 0;
        const finalPrice = (salePct > 0) ? Number((origPrice * (1 - salePct / 100)).toFixed(2)) : origPrice;
        grossSales += (effectiveSold * finalPrice);
      }
    });

    const searchQuery = document.getElementById("admin-search-catalog")?.value.trim().toLowerCase() || "";
    const statusFilter = this.activeStatusFilter || "all";
    let visibleProducts = products.filter(p => {
      const matchesSearch = !searchQuery || (p.name || "").toLowerCase().includes(searchQuery) || (p.category && p.category.toLowerCase().includes(searchQuery));
      const matchesStatus = statusFilter === "all" || (statusFilter === "Sale" ? (parseFloat(p.salePercentage) > 0 && p.status !== "Sold Out") : p.status === statusFilter);
      return matchesSearch && matchesStatus;
    });

    // Ensure NEW items and recently added items are always displayed at the very top
    visibleProducts = visibleProducts.sort((a, b) => {
      const aNew = (a.badge === "NEW" || a.isNew === true) ? 1 : 0;
      const bNew = (b.badge === "NEW" || b.isNew === true) ? 1 : 0;
      if (aNew !== bNew) return bNew - aNew;
      const aTime = typeof a.createdAt === "number" ? a.createdAt : (Date.parse(a.createdAt) || 0);
      const bTime = typeof b.createdAt === "number" ? b.createdAt : (Date.parse(b.createdAt) || 0);
      return bTime - aTime;
    });

    if (visibleProducts.length === 0) {
      list.innerHTML = `<p class="text-center text-stone text-xs italic py-6">No catalog items found matching "${searchQuery}".</p>`;
    }

    visibleProducts.forEach(prod => {

      const row = document.createElement("div");
      row.className = "flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-stone/25 shadow-sm gap-3 transition-all hover:border-ocean/40";

      const thumb = (Array.isArray(prod.images) && prod.images[0]) ? prod.images[0] : "assets/brand/logo.jpg";
      let badgeColor = "bg-green-100 text-green-800 border-green-300";
      if (prod.status === "Sold Out") badgeColor = "bg-red-100 text-red-800 border-red-300";
      if (prod.status === "Hidden") badgeColor = "bg-gray-100 text-gray-800 border-gray-300";

      const sectionLabel = (prod.category === "personalized" ? "Custom" : (prod.category || "")) + (prod.featured ? " + Featured ⭐" : "");
      const formattedPrice = (parseFloat(prod.price) || 0).toLocaleString();

      row.innerHTML = `
        <div class="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
          <img src="${thumb}" class="w-14 h-14 rounded-xl object-cover border border-stone/30 flex-shrink-0">
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <h4 class="font-serif font-bold text-base text-charcoal truncate">${prod.name || 'Unnamed Item'}</h4>
              <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex-shrink-0 ${badgeColor}">${prod.status}</span>
            </div>
            <div class="flex flex-wrap items-center gap-2 mt-1.5">
              <span class="text-sm font-extrabold text-ocean">₱${formattedPrice}</span>
              ${parseFloat(prod.salePercentage) > 0 && prod.status !== "Sold Out" ? `<span class="text-[10px] bg-rust text-white border border-rust/30 px-2 py-0.5 rounded font-extrabold shadow-sm animate-pulse">🔥 ${prod.salePercentage}% OFF</span>` : ""}
              <span class="text-[10px] bg-sand/80 px-2 py-0.5 rounded text-charcoal font-bold truncate">${sectionLabel}</span>
              ${prod.stockQty && parseInt(prod.stockQty, 10) > 0 ? `<span class="text-[10px] bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded font-extrabold">📦 Qty: ${prod.stockQty}</span>` : ""}
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone/15 flex-shrink-0">
          <div class="flex items-center bg-sand/60 border border-stone/30 rounded-lg px-2 py-1 text-xs font-bold text-charcoal shadow-sm" title="Quickly adjust sold count">
            <button onclick="window.TaraAdmin.adjustSoldCount('${prod.id}', -1)" class="w-6 h-6 rounded hover:bg-stone/20 text-charcoal flex items-center justify-center font-extrabold text-sm cursor-pointer">-</button>
            <span class="px-2.5 text-xs text-rust font-extrabold whitespace-nowrap">${prod.soldCount || 0} Sold</span>
            <button onclick="window.TaraAdmin.adjustSoldCount('${prod.id}', 1)" class="w-6 h-6 rounded hover:bg-stone/20 text-charcoal flex items-center justify-center font-extrabold text-sm cursor-pointer">+</button>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.TaraAdmin.openEditModal('${prod.id}')" class="px-4 py-2 bg-charcoal hover:bg-ocean text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm">
              Edit
            </button>
            <button onclick="window.TaraAdmin.deleteProduct('${prod.id}')" class="text-red-500 hover:text-red-700 p-2 rounded-lg cursor-pointer transition-colors border border-red-200 hover:border-red-400 bg-red-50/50" title="Remove Product">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      `;
      list.appendChild(row);
    });

    const elTotal = document.getElementById("stat-total");
    const elAvail = document.getElementById("stat-available");
    const elSold = document.getElementById("stat-sold");
    const elHidden = document.getElementById("stat-hidden");
    const elSale = document.getElementById("stat-sale");
    const elGross = document.getElementById("stat-gross-sales");

    if (elTotal) elTotal.textContent = total;
    if (elAvail) elAvail.textContent = avail;
    if (elSold) elSold.textContent = sold;
    if (elHidden) elHidden.textContent = hidden;
    if (elSale) elSale.textContent = sale;
    if (elGross) elGross.textContent = `₱ ${grossSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }

  adjustSoldCount(id, delta) {
    const p = window.TaraStore?.getProductById(id);
    if (!p) return;
    const current = parseInt(p.soldCount || 0, 10);
    const updated = Math.max(0, current + delta);
    p.soldCount = updated;
    window.TaraStore.saveData();
    if (window.TaraStore?.saveProductToCloud) window.TaraStore.saveProductToCloud(p);
    window.TaraApp?.showToast(`🏷️ "${p.name}" marked as ${updated} sold!`, "success");
  }

  toggleStatus(productId) {
    const product = window.TaraStore.getProductById(productId);
    if (!product) return;
    const statuses = ["Available", "Sold Out", "Hidden"];
    const currentIdx = statuses.indexOf(product.status || "Available");
    const nextIdx = (currentIdx + 1) % statuses.length;
    product.status = statuses[nextIdx];
    if (product.status === "Sold Out") {
      product.badge = "SOLD OUT";
    } else if (product.badge === "SOLD OUT" && product.status !== "Sold Out") {
      product.badge = "NEW";
    }
    window.TaraStore.saveData();
    if (window.TaraStore?.saveProductToCloud) window.TaraStore.saveProductToCloud(product);
    window.TaraApp?.showToast(`Updated "${product.name}" to ${product.status}`, "info");
  }

  deleteProduct(productId) {
    const product = window.TaraStore.getProductById(productId);
    if (!product) return;
    if (confirm(`Are you sure you want to delete "${product.name}" from your store inventory?`)) {
      window.TaraStore.data.products = window.TaraStore.data.products.filter(p => p.id !== productId && p.name !== product.name);
      window.TaraStore.saveData();
      if (window.TaraStore?.deleteProductFromCloud) window.TaraStore.deleteProductFromCloud(product.id, product.name);
      window.TaraApp?.showToast(`Removed "${product.name}" from catalog.`, "info");
      this.renderInventoryList();
    }
  }

  /* --- PRODUCT FORM & EXPLICIT FEATURED OPTIONS --- */
  /* --- PRODUCT FORM & EXPLICIT FEATURED OPTIONS --- */
  bindProductForm() {
    const openAddBtn = document.getElementById("admin-open-add-modal-btn");
    const saveBtn = document.getElementById("admin-save-product-btn");
    const fileInput = document.getElementById("admin-file-upload");
    const exportBtn = document.getElementById("admin-export-github-btn");
    const importInput = document.getElementById("admin-import-json");
    const searchCat = document.getElementById("admin-search-catalog");
    const catSelect = document.getElementById("form-prod-cat");

    if (openAddBtn) openAddBtn.addEventListener("click", () => this.openAddModal());
    if (saveBtn) saveBtn.addEventListener("click", () => this.saveProductFromForm());
    if (exportBtn) exportBtn.addEventListener("click", () => this.openExportModal());
    if (fileInput) fileInput.addEventListener("change", (e) => this.handleMobilePhotoUpload(e));
    if (importInput) importInput.addEventListener("change", (e) => this.importDraftJsonFile(e));
    if (searchCat) searchCat.addEventListener("input", () => this.renderInventoryList());
    if (catSelect) catSelect.addEventListener("change", () => this.updateSizeSectionVisibility());

    const statusSelect = document.getElementById("form-prod-status");
    if (statusSelect) {
      statusSelect.addEventListener("change", () => {
        const badgeInput = document.getElementById("form-prod-badge");
        if (badgeInput && statusSelect.value === "Sold Out") {
          badgeInput.value = "SOLD OUT";
        } else if (badgeInput && badgeInput.value.toUpperCase() === "SOLD OUT" && statusSelect.value !== "Sold Out") {
          badgeInput.value = "NEW";
        }
        this.saveUnfinishedDraft();
      });
    }
  }

  updateSizeSectionVisibility() {
    const wrapper = document.getElementById("form-prod-sizes-wrapper");
    const stonesWrapper = document.getElementById("form-prod-stones-wrapper");
    const catVal = document.getElementById("form-prod-cat")?.value || "";
    const isBracelet = catVal.startsWith("bracelets") || catVal.startsWith("personalized");
    if (wrapper) {
      if (isBracelet) wrapper.classList.remove("hidden");
      else wrapper.classList.add("hidden");
    }
    if (stonesWrapper) {
      if (isBracelet) stonesWrapper.classList.remove("hidden");
      else stonesWrapper.classList.add("hidden");
    }
  }

  renderWristSizeSelector() {
    const container = document.getElementById("form-prod-sizes-container");
    if (!container) return;
    container.innerHTML = "";
    const standardSizes = ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"];
    if (!this.selectedWristSizes) this.selectedWristSizes = [...standardSizes];

    standardSizes.forEach(size => {
      const isSelected = this.selectedWristSizes.includes(size);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase border transition-all cursor-pointer ${
        isSelected ? "bg-green-100 text-green-800 border-green-400 shadow-sm" : "bg-red-50 text-red-700/60 border-red-200 line-through"
      }`;
      chip.textContent = isSelected ? `${size} 🟢` : `${size} 🚫`;
      chip.onclick = () => this.toggleWristSize(size);
      container.appendChild(chip);
    });
  }

  toggleWristSize(size) {
    if (!this.selectedWristSizes) this.selectedWristSizes = [];
    const idx = this.selectedWristSizes.indexOf(size);
    if (idx > -1) {
      this.selectedWristSizes.splice(idx, 1);
    } else {
      this.selectedWristSizes.push(size);
    }
    this.renderWristSizeSelector();
    this.saveUnfinishedDraft();
  }

  renderStoneSizeSelector() {
    const container = document.getElementById("form-prod-stones-container");
    if (!container) return;
    container.innerHTML = "";
    const standardStones = ["6mm", "6mm+", "7mm+", "8mm", "8mm+", "9mm+", "10mm", "10mm+", "11mm", "11mm+", "12mm", "12mm+", "13mm", "13mm+", "14mm", "14mm+", "Other Sizes"];
    if (!this.selectedStoneSizes) this.selectedStoneSizes = [];

    standardStones.forEach(size => {
      const isSelected = this.selectedStoneSizes.includes(size);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
        isSelected ? "bg-ocean text-white border-ocean shadow-sm font-extrabold" : "bg-white text-charcoal border-stone/40 hover:border-ocean"
      }`;
      chip.textContent = isSelected ? `💎 ${size}` : size;
      chip.onclick = () => this.toggleStoneSize(size);
      container.appendChild(chip);
    });
  }

  toggleStoneSize(size) {
    if (!this.selectedStoneSizes) this.selectedStoneSizes = [];
    const idx = this.selectedStoneSizes.indexOf(size);
    if (idx > -1) {
      this.selectedStoneSizes.splice(idx, 1);
    } else {
      this.selectedStoneSizes.push(size);
    }
    this.renderStoneSizeSelector();
    this.saveUnfinishedDraft();
  }

  compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const maxW = 1200; // Crisp Full HD e-commerce standard
        const maxH = 1200;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        } else {
          if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        // Upload directly to Supabase Storage 'media' bucket if connected
        if (window.TaraStore && window.TaraStore.supabase) {
          try {
            canvas.toBlob(async (blob) => {
              if (blob) {
                const cleanName = file.name ? file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "_") : "photo.jpg";
                const fileName = `hd_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${cleanName}`;
                window.TaraApp?.showToast("☁️ Uploading HD photo to Supabase Cloud...", "info");
                const { data, error } = await window.TaraStore.supabase.storage
                  .from("media")
                  .upload(fileName, blob, { contentType: "image/jpeg", cacheControl: "3600", upsert: true });

                if (!error && data) {
                  const { data: publicUrlData } = window.TaraStore.supabase.storage
                    .from("media")
                    .getPublicUrl(fileName);
                  if (publicUrlData && publicUrlData.publicUrl) {
                    window.TaraApp?.showToast("✨ HD Photo uploaded successfully!", "success");
                    callback(publicUrlData.publicUrl);
                    return;
                  }
                } else {
                  console.warn("Supabase upload failed, falling back to data URL:", error?.message);
                }
              }
              callback(canvas.toDataURL("image/jpeg", 0.85));
            }, "image/jpeg", 0.85);
            return;
          } catch (cloudErr) {
            console.warn("Cloud media upload exception:", cloudErr);
          }
        }

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        callback(dataUrl);
      };
      img.onerror = () => callback(e.target.result);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  handleMobilePhotoUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    if (!this.uploadedImages) this.uploadedImages = [];

    Array.from(files).forEach(file => {
      if (file.size > 25 * 1024 * 1024) {
        alert(`Image "${file.name}" exceeds 25MB limit!`);
        return;
      }
      this.compressImage(file, (compressedDataUrl) => {
        this.uploadedImages.push(compressedDataUrl);
        this.renderMultiImagePreview();
        this.saveUnfinishedDraft();
      });
    });
  }

  addPhotoFromUrl() {
    const input = document.getElementById("form-prod-img-url");
    const val = input?.value.trim();
    if (!val) {
      alert("⚠️ Please paste an image URL first!");
      return;
    }
    if (!this.uploadedImages) this.uploadedImages = [];
    this.uploadedImages.push(val);
    input.value = "";
    this.renderMultiImagePreview();
    this.saveUnfinishedDraft();
  }

  removePhoto(index) {
    if (!this.uploadedImages || !this.uploadedImages[index]) return;
    this.uploadedImages.splice(index, 1);
    this.renderMultiImagePreview();
    this.saveUnfinishedDraft();
  }

  renderMultiImagePreview() {
    const container = document.getElementById("admin-image-preview-container");
    const grid = document.getElementById("admin-multi-image-preview");
    if (!container || !grid) return;

    grid.innerHTML = "";
    if (!this.uploadedImages || this.uploadedImages.length === 0) {
      container.classList.add("hidden");
      return;
    }

    container.classList.remove("hidden");
    this.uploadedImages.forEach((src, idx) => {
      const thumbBox = document.createElement("div");
      thumbBox.className = "relative group aspect-square rounded-xl overflow-hidden border-2 bg-white shadow-sm flex flex-col justify-between " + (idx === 0 ? "border-green-600 shadow-md" : "border-stone/30");
      thumbBox.setAttribute("draggable", "true");
      thumbBox.ondragstart = (e) => { e.dataTransfer.setData("text/plain", idx.toString()); };
      thumbBox.ondragover = (e) => { e.preventDefault(); };
      thumbBox.ondrop = (e) => {
        e.preventDefault();
        const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (!isNaN(fromIdx)) this.movePhoto(fromIdx, idx);
      };

      const coverTag = idx === 0 ? `<span class="absolute top-1.5 left-1.5 bg-green-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow z-10">⭐ #1 COVER</span>` : "";

      thumbBox.innerHTML = `
        <img src="${src}" class="w-full h-full object-cover absolute inset-0">
        ${coverTag}
        <button type="button" onclick="window.TaraAdmin.removePhoto(${idx})" class="absolute top-1.5 right-1.5 bg-red-600/95 text-white w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center hover:bg-red-700 shadow-md cursor-pointer z-10" title="Delete Photo">✕</button>
        <div class="absolute bottom-0 inset-x-0 bg-charcoal/85 py-1 px-1 flex items-center justify-between gap-1 z-10 backdrop-blur-xs">
          <button type="button" ${idx === 0 ? "disabled class='opacity-20 pointer-events-none px-2 py-0.5 text-[11px] text-white'" : `onclick="window.TaraAdmin.movePhoto(${idx}, ${idx-1})" class="px-2 py-0.5 bg-white/20 hover:bg-ocean text-white rounded text-[11px] font-extrabold cursor-pointer"`} title="Move Left / Towards Front">⬅️</button>
          <span class="text-[10px] font-bold text-sand">${idx + 1} of ${this.uploadedImages.length}</span>
          <button type="button" ${idx === this.uploadedImages.length - 1 ? "disabled class='opacity-20 pointer-events-none px-2 py-0.5 text-[11px] text-white'" : `onclick="window.TaraAdmin.movePhoto(${idx}, ${idx+1})" class="px-2 py-0.5 bg-white/20 hover:bg-ocean text-white rounded text-[11px] font-extrabold cursor-pointer"`} title="Move Right">➡️</button>
        </div>
      `;
      grid.appendChild(thumbBox);
    });
  }

  movePhoto(fromIdx, toIdx) {
    if (!this.uploadedImages || fromIdx < 0 || toIdx < 0 || fromIdx >= this.uploadedImages.length || toIdx >= this.uploadedImages.length) return;
    const item = this.uploadedImages.splice(fromIdx, 1)[0];
    this.uploadedImages.splice(toIdx, 0, item);
    this.renderMultiImagePreview();
    this.saveUnfinishedDraft();
  }

  openAddModal() {
    this.editingProductId = null;
    this.uploadedImages = [];
    this.selectedWristSizes = ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"];
    this.selectedStoneSizes = [];
    document.getElementById("admin-modal-title").innerHTML = `
      <span>Add New Product</span>
      <button onclick="window.TaraAdmin.clearUnfinishedDraft()" class="ml-3 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-300 font-bold uppercase hover:bg-red-200 cursor-pointer" title="Wipe draft text and start clean">🗑️ Clear Draft</button>
    `;
    
    const savedDraftStr = localStorage.getItem(ADMIN_DRAFT_KEY);
    if (savedDraftStr) {
      try {
        const d = JSON.parse(savedDraftStr);
        document.getElementById("form-prod-name").value = d.name || "";
        document.getElementById("form-prod-price").value = d.price || "";
        if (document.getElementById("form-prod-sale-pct")) document.getElementById("form-prod-sale-pct").value = d.salePct || "";
        if (document.getElementById("form-prod-sale-until")) document.getElementById("form-prod-sale-until").value = d.saleUntil || "";
        document.getElementById("form-prod-cat").value = d.cat || "bracelets-featured";
        document.getElementById("form-prod-status").value = d.status || "Available";
        document.getElementById("form-prod-badge").value = d.badge || "NEW";
        if (document.getElementById("form-prod-qty")) document.getElementById("form-prod-qty").value = d.qty || "";
        if (document.getElementById("form-prod-sold")) document.getElementById("form-prod-sold").value = d.sold || "";
        document.getElementById("form-prod-img-url").value = d.url || "";
        document.getElementById("form-prod-desc").value = d.desc || "";
        if (d.images && Array.isArray(d.images)) {
          this.uploadedImages = d.images;
        } else if (d.imgBase64) {
          this.uploadedImages = [d.imgBase64];
        }
        if (d.sizes && Array.isArray(d.sizes)) {
          this.selectedWristSizes = d.sizes;
        }
        if (d.stoneSizes && Array.isArray(d.stoneSizes)) {
          this.selectedStoneSizes = d.stoneSizes;
        }
        window.TaraApp?.showToast("✨ Restored your unfinished draft!", "info");
      } catch (err) {
        localStorage.removeItem(ADMIN_DRAFT_KEY);
      }
    } else {
      document.getElementById("form-prod-name").value = "";
      document.getElementById("form-prod-price").value = "";
      if (document.getElementById("form-prod-sale-pct")) document.getElementById("form-prod-sale-pct").value = "";
      if (document.getElementById("form-prod-sale-until")) document.getElementById("form-prod-sale-until").value = "";
      document.getElementById("form-prod-cat").value = "bracelets-featured";
      document.getElementById("form-prod-status").value = "Available";
      document.getElementById("form-prod-badge").value = "NEW";
      if (document.getElementById("form-prod-qty")) document.getElementById("form-prod-qty").value = "";
      if (document.getElementById("form-prod-sold")) document.getElementById("form-prod-sold").value = "";
      document.getElementById("form-prod-img-url").value = "";
      document.getElementById("form-prod-desc").value = "";
    }

    this.updateSalePricePreview();
    this.renderMultiImagePreview();
    this.renderWristSizeSelector();
    this.renderStoneSizeSelector();
    this.updateSizeSectionVisibility();

    const modal = document.getElementById("admin-edit-modal");
    if (modal) {
      modal.style.removeProperty("display");
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.style.overflow = "hidden";
    }
  }

  openEditModal(productId) {
    const p = window.TaraStore.getProductById(productId);
    if (!p) return;

    this.editingProductId = p.id;
    this.uploadedImages = [...(p.images || [])];
    this.selectedWristSizes = [...(p.sizes || ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"])];
    this.selectedStoneSizes = [...(p.stoneSizes || [])];
    
    document.getElementById("admin-modal-title").textContent = `Edit: ${p.name}`;
    document.getElementById("form-prod-name").value = p.name;
    document.getElementById("form-prod-price").value = p.price;
    if (document.getElementById("form-prod-sale-pct")) document.getElementById("form-prod-sale-pct").value = p.salePercentage || "";
    if (document.getElementById("form-prod-sale-until")) document.getElementById("form-prod-sale-until").value = p.saleUntil || "";
    
    let catVal = p.category;
    if (p.featured === true) catVal += "-featured";
    const catSelect = document.getElementById("form-prod-cat");
    if (catSelect) catSelect.value = catVal;

    document.getElementById("form-prod-status").value = p.status;
    document.getElementById("form-prod-badge").value = p.badge || (p.status === "Sold Out" ? "SOLD OUT" : "");
    if (document.getElementById("form-prod-qty")) document.getElementById("form-prod-qty").value = p.stockQty || "";
    if (document.getElementById("form-prod-sold")) document.getElementById("form-prod-sold").value = p.soldCount || "";
    document.getElementById("form-prod-img-url").value = "";
    document.getElementById("form-prod-desc").value = p.description || "";

    this.updateSalePricePreview();
    this.renderMultiImagePreview();
    this.renderWristSizeSelector();
    this.renderStoneSizeSelector();
    this.updateSizeSectionVisibility();

    const modal = document.getElementById("admin-edit-modal");
    if (modal) {
      modal.style.removeProperty("display");
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.style.overflow = "hidden";
    }
  }

  closeProductModal() {
    const modal = document.getElementById("admin-edit-modal");
    if (modal) {
      modal.style.setProperty("display", "none", "important");
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
    }
    this.isSaving = false;
    const saveBtn = document.getElementById("admin-save-product-btn");
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerText = "Save Product";
    }
  }

  saveProductFromForm() {
    if (this.isSaving) return; // Prevent double-clicking and duplicate uploads!
    const name = document.getElementById("form-prod-name")?.value.trim();
    const priceVal = parseFloat(document.getElementById("form-prod-price")?.value);
    const salePercentage = parseFloat(document.getElementById("form-prod-sale-pct")?.value) || 0;
    const saleUntil = document.getElementById("form-prod-sale-until")?.value || "";
    const rawCatVal = document.getElementById("form-prod-cat")?.value || "bracelets-featured";
    const status = document.getElementById("form-prod-status")?.value || "Available";
    const badge = document.getElementById("form-prod-badge")?.value.trim() || "";
    const stockQty = parseInt(document.getElementById("form-prod-qty")?.value, 10) || 0;
    const soldCount = parseInt(document.getElementById("form-prod-sold")?.value, 10) || 0;
    const desc = document.getElementById("form-prod-desc")?.value.trim() || "";

    if (!name || isNaN(priceVal)) {
      alert("⚠️ Please enter both a Product Name and a valid Price (in PHP)!");
      return;
    }

    this.isSaving = true;
    const saveBtn = document.getElementById("admin-save-product-btn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerText = "Saving...";
    }

    const isFeatured = rawCatVal.endsWith("-featured");
    const actualCategory = rawCatVal.replace("-featured", "");

    const finalImages = (this.uploadedImages && this.uploadedImages.length > 0) ? [...this.uploadedImages] : ["assets/brand/logo.jpg"];
    const finalSizes = this.selectedWristSizes || ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"];
    const finalStones = this.selectedStoneSizes || [];

    const tabNames = {
      "personalized": "Personalized tab",
      "bracelets": "Bracelets tab",
      "gemstones": "Natural Stones > Gemstones sub-tab",
      "charms": "Natural Stones > Charms sub-tab",
      "charms_grid": "Natural Stones > Charms Grid sub-tab"
    };
    const targetTabName = tabNames[actualCategory] || "catalog";
    const destName = isFeatured ? `${targetTabName} & Home (Featured)` : `${targetTabName} only`;

    try {
      if (this.editingProductId) {
        const existing = window.TaraStore.getProductById(this.editingProductId);
        if (existing) {
          const expectedSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          if (expectedSlug && !existing.id.startsWith(expectedSlug)) {
            const oldId = existing.id;
            const newCleanId = window.TaraStore.generateCleanId ? window.TaraStore.generateCleanId(name, oldId) : (expectedSlug + "-" + Date.now().toString(36));
            existing.id = newCleanId;
            this.editingProductId = newCleanId;
            if (window.TaraStore.cart && Array.isArray(window.TaraStore.cart)) {
              window.TaraStore.cart.forEach(c => {
                if (c.productId === oldId) c.productId = newCleanId;
              });
              if (typeof window.TaraStore.saveCart === "function") window.TaraStore.saveCart();
            }
            if (window.TaraApp && window.TaraApp.activeProductId === oldId) {
              window.TaraApp.activeProductId = newCleanId;
            }
          }
          existing.name = name;
          existing.price = priceVal;
          existing.salePercentage = salePercentage;
          existing.saleUntil = saleUntil;
          existing.category = actualCategory;
          existing.featured = isFeatured;
          existing.isCustomBase = (actualCategory === "personalized");
          existing.status = status;
          existing.badge = status === "Sold Out" ? "SOLD OUT" : badge;
          existing.stockQty = stockQty;
          existing.soldCount = soldCount;
          existing.description = desc;
          existing.images = finalImages;
          existing.sizes = finalSizes;
          existing.stoneSizes = finalStones;
          if (window.TaraStore?.saveProductToCloud) window.TaraStore.saveProductToCloud(existing);
        }
      } else {
        const newId = window.TaraStore.generateCleanId ? window.TaraStore.generateCleanId(name) : (name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "-" + Date.now().toString(36));
        const newProduct = {
          id: newId,
          name: name,
          price: priceVal,
          salePercentage: salePercentage,
          saleUntil: saleUntil,
          category: actualCategory,
          featured: isFeatured,
          isCustomBase: (actualCategory === "personalized"),
          status: status,
          badge: status === "Sold Out" ? "SOLD OUT" : (badge || "NEW"),
          stockQty: stockQty,
          soldCount: soldCount,
          isNew: true,
          createdAt: Date.now(),
          description: desc,
          images: finalImages,
          sizes: finalSizes,
          stoneSizes: finalStones
        };
        if (window.TaraStore && window.TaraStore.data && window.TaraStore.data.products) {
          window.TaraStore.data.products.unshift(newProduct);
          if (window.TaraStore?.saveProductToCloud) window.TaraStore.saveProductToCloud(newProduct);
        }
      }

      window.TaraStore.saveData();
      localStorage.removeItem(ADMIN_DRAFT_KEY);

      const actionText = this.editingProductId ? `Updated "${name}" in ${destName}` : `New product is added to ${destName}`;
      window.TaraApp?.showToast(`✅ ${actionText}! Redirecting in 2s...`, "success");

      // Automatically navigate to the destination tab after 2 seconds
      const targetTab = (actualCategory && ["personalized", "bracelets", "gemstones", "charms", "charms_grid"].includes(actualCategory)) 
        ? (["gemstones", "charms", "charms_grid"].includes(actualCategory) ? "natural-stones" : actualCategory) : "home";
      setTimeout(() => {
        if (window.TaraApp && typeof window.TaraApp.selectTab === "function") {
          if (["gemstones", "charms", "charms_grid"].includes(actualCategory) && typeof window.TaraApp.setNaturalStonesSubTab === "function") {
            window.TaraApp.setNaturalStonesSubTab(actualCategory);
          } else {
            window.TaraApp.selectTab(targetTab);
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 2000);
    } catch (err) {
      console.error("Error saving product:", err);
      alert("⚠️ Error saving product. Storage limit may have been reached. Please check image sizes or use URLs.");
    } finally {
      // ALWAYS release saving lock and instantly close modal so user is NEVER stuck on 'Saving...'!
      this.isSaving = false;
      const saveBtn = document.getElementById("admin-save-product-btn");
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerText = "Save Product";
      }
      this.closeProductModal();
      this.renderInventoryList();
    }
  }

  /* --- ZERO-CODE CUSTOMER PROOFS OF TRANSACTION MANAGEMENT --- */
  bindProofForm() {
    const proofFile = document.getElementById("proof-file-upload");
    if (proofFile) {
      proofFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        this.compressImage(file, (compressedDataUrl) => {
          this.uploadedProofBase64 = compressedDataUrl;
          window.TaraApp?.showToast("Photo ready! Enter link and caption below.", "info");
        });
      });
    }
  }

  toggleAddProofForm() {
    const form = document.getElementById("admin-add-proof-form");
    if (!form) return;
    form.classList.toggle("hidden");
    if (document.getElementById("proof-file-upload")) document.getElementById("proof-file-upload").value = "";
    if (document.getElementById("proof-img-url")) document.getElementById("proof-img-url").value = "";
    if (document.getElementById("proof-fb-url")) document.getElementById("proof-fb-url").value = "";
    if (document.getElementById("proof-caption-input")) document.getElementById("proof-caption-input").value = "";
    this.uploadedProofBase64 = null;
  }

  saveNewProof() {
    let img = this.uploadedProofBase64 || document.getElementById("proof-img-url")?.value.trim();
    const fbUrl = document.getElementById("proof-fb-url")?.value.trim() || "";
    const cap = document.getElementById("proof-caption-input")?.value.trim() || "Verified Transaction";

    if (!img) {
      alert("⚠️ Please pick a photo from your phone or enter an image link!");
      return;
    }

    const newProof = {
      id: "proof-" + Date.now(),
      image: img,
      link: fbUrl,
      caption: cap
    };

    if (!window.TaraStore.data.customerProofs) {
      window.TaraStore.data.customerProofs = [];
    }

    window.TaraStore.data.customerProofs.unshift(newProof);
    window.TaraStore.saveData();
    this.toggleAddProofForm();
    this.renderProofsList();
    window.TaraApp?.showToast("✅ New Proof of Transaction published to storefront!", "success");
  }

  deleteProof(proofId) {
    if (confirm("Are you sure you want to delete this Proof of Transaction photo?")) {
      window.TaraStore.data.customerProofs = (window.TaraStore.data.customerProofs || []).filter(p => p.id !== proofId && p.image !== proofId);
      window.TaraStore.saveData();
      this.renderProofsList();
      window.TaraApp?.showToast("Removed proof from website carousel.", "info");
    }
  }

  renderProofsList() {
    const list = document.getElementById("admin-proofs-list");
    if (!list || !window.TaraStore || !window.TaraStore.data) return;
    const proofs = window.TaraStore.data.customerProofs || [];
    list.innerHTML = "";

    if (proofs.length === 0) {
      list.innerHTML = `<p class="col-span-3 text-stone text-xs italic">No customer proofs uploaded yet.</p>`;
      return;
    }

    proofs.forEach(proof => {
      const card = document.createElement("div");
      card.className = "flex items-center space-x-3 bg-sand/40 p-3 rounded-xl border border-stone/20 shadow-sm relative group";
      
      const linkPreview = proof.link ? `<a href="${proof.link}" target="_blank" class="text-[10px] font-bold text-[#1877F2] hover:underline block truncate">🔗 View Facebook Post</a>` : `<span class="text-[10px] text-stone font-semibold">No FB Link attached</span>`;
      
      card.innerHTML = `
        <img src="${proof.image}" class="w-16 h-16 object-cover rounded-lg border border-stone/30 flex-shrink-0">
        <div class="flex-1 min-w-0">
          <h4 class="font-serif font-bold text-xs text-charcoal truncate">${proof.caption || 'Verified Transaction'}</h4>
          ${linkPreview}
        </div>
        <button onclick="window.TaraAdmin.deleteProof('${proof.id || proof.image}')" class="p-2 text-red-500 hover:bg-red-100 rounded-lg cursor-pointer transition-colors" title="Delete Proof">
          🗑️
        </button>
      `;
      list.appendChild(card);
    });
  }

  /* --- PHONE / LAPTOP DRAFT BACKUP EXPORTER & IMPORTER --- */
  exportDraftJsonFile() {
    const jsonString = JSON.stringify(window.TaraStore.data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taras_collection_draft_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.TaraApp?.showToast("Downloaded backup draft file! You can transfer this to your laptop.", "success");
  }

  importDraftJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData && Array.isArray(importedData.products)) {
          window.TaraApp?.showToast(`⚡ Importing & syncing ${importedData.products.length} items to Supabase Cloud...`, "info");
          
          // Sanitize out bloated Base64 photo strings to prevent 7MB memory crash quotas
          for (const prod of importedData.products) {
            if (Array.isArray(prod.images)) {
              prod.images = prod.images.filter(url => typeof url === "string" && !url.startsWith("data:image/"));
              if (prod.images.length === 0) {
                prod.images = ["assets/brand/logo.jpg"]; // Clean lightweight placeholder until re-uploaded via HD cloud
              }
            } else {
              prod.images = ["assets/brand/logo.jpg"];
            }
            if (window.TaraStore && typeof window.TaraStore.saveProductToCloud === "function") {
              await window.TaraStore.saveProductToCloud(prod);
            }
          }

          if (window.TaraStore) {
            window.TaraStore.data = importedData;
            if (typeof window.TaraStore.sanitizeAndHealProductIds === "function") {
              window.TaraStore.sanitizeAndHealProductIds();
            }
            window.TaraStore.saveData();
          }

          this.renderInventoryList();
          this.renderProofsList();
          window.TaraApp?.showToast(`✅ Successfully synced all ${importedData.products.length} items to Supabase Cloud!`, "success");
        } else {
          alert("Invalid catalog JSON file. Missing products list.");
        }
      } catch (err) {
        console.error("Import error:", err);
        alert("Error parsing JSON file. Please ensure it is a valid file.");
      }
    };
    reader.readAsText(file);
  }

  openExportModal() {
    const modal = document.getElementById("export-modal");
    const textarea = document.getElementById("github-export-textarea");
    if (modal && textarea) {
      const formattedJson = JSON.stringify(window.TaraStore.data, null, 2);
      textarea.value = formattedJson;
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  copyGithubJson() {
    const textarea = document.getElementById("github-export-textarea");
    if (textarea) {
      navigator.clipboard.writeText(textarea.value).then(() => {
        window.TaraApp?.showToast("All product updates copied to your clipboard! 📋", "success");
      }).catch(() => {
        textarea.select();
        document.execCommand("copy");
      });
    }
  }

  updateSalePricePreview() {
    const price = parseFloat(document.getElementById("form-prod-price")?.value) || 0;
    const salePct = parseFloat(document.getElementById("form-prod-sale-pct")?.value) || 0;
    const previewBox = document.getElementById("sale-price-preview");
    const previewVal = document.getElementById("preview-discount-val");
    if (!previewBox || !previewVal) return;
    if (price > 0 && salePct > 0 && salePct < 100) {
      const discounted = Number((price * (1 - salePct / 100)).toFixed(2));
      previewVal.textContent = discounted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      previewBox.classList.remove("hidden");
    } else {
      previewBox.classList.add("hidden");
    }
  }

  openGrossSalesModal() {
    const modal = document.getElementById("gross-sales-modal");
    const summaryList = document.getElementById("gross-sales-items");
    const totalHeader = document.getElementById("gross-sales-total");
    if (!modal || !summaryList || !totalHeader) return;

    const products = window.TaraStore?.getProducts({}) || [];
    let grossTotal = 0;
    let itemsHTML = "";

    products.forEach(p => {
      const soldNum = parseInt(p.soldCount || 0, 10);
      const effectiveSold = soldNum > 0 ? soldNum : (p.status === "Sold Out" ? 1 : 0);
      if (effectiveSold > 0) {
        const origPrice = parseFloat(p.price) || 0;
        const salePct = parseFloat(p.salePercentage) || 0;
        const isSale = salePct > 0;
        const unitPrice = isSale ? Number((origPrice * (1 - salePct / 100)).toFixed(2)) : origPrice;
        const itemTotal = effectiveSold * unitPrice;
        grossTotal += itemTotal;

        const priceNote = isSale 
          ? `Sale price (${effectiveSold} x ₱ ${unitPrice.toLocaleString()})`
          : `List price (${effectiveSold} x ₱ ${unitPrice.toLocaleString()})`;

        itemsHTML += `
          <div class="flex justify-between items-center py-3 border-b border-stone/20 text-xs sm:text-sm">
            <div class="pr-2">
              <p class="font-serif font-bold text-charcoal">${effectiveSold} x ${p.name || 'Custom Bracelet'}</p>
              <p class="text-[11px] text-stone font-medium mt-0.5">${priceNote}</p>
            </div>
            <span class="font-extrabold text-rust ml-2 whitespace-nowrap">₱ ${itemTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
        `;
      }
    });

    if (!itemsHTML) {
      itemsHTML = `<p class="text-center text-stone text-xs italic py-8">No sold items recorded yet!</p>`;
    }

    totalHeader.textContent = `Gross Sale: ₱ ${grossTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    summaryList.innerHTML = itemsHTML;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
  }

  closeGrossSalesModal() {
    const modal = document.getElementById("gross-sales-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
    document.body.style.overflow = "";
  }
}

window.TaraAdmin = new AdminDashboard();
window.addEventListener("DOMContentLoaded", () => {
  window.TaraAdmin.init();
});
