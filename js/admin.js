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
    
    this.isAdminLoggedIn = false;
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
    const inputs = ["#form-prod-name", "#form-prod-price", "#form-prod-cat", "#form-prod-status", "#form-prod-badge", "#form-prod-sold", "#form-prod-img-url", "#form-prod-desc"];
    inputs.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        el.addEventListener("input", () => this.saveUnfinishedDraft());
        el.addEventListener("change", () => this.saveUnfinishedDraft());
      }
    });
  }

  saveUnfinishedDraft() {
    if (this.editingProductId !== null) return;

    const draft = {
      name: document.getElementById("form-prod-name")?.value || "",
      price: document.getElementById("form-prod-price")?.value || "",
      cat: document.getElementById("form-prod-cat")?.value || "bracelets-featured",
      status: document.getElementById("form-prod-status")?.value || "Available",
      badge: document.getElementById("form-prod-badge")?.value || "",
      sold: document.getElementById("form-prod-sold")?.value || "",
      url: document.getElementById("form-prod-img-url")?.value || "",
      desc: document.getElementById("form-prod-desc")?.value || "",
      images: this.uploadedImages || [],
      sizes: this.selectedWristSizes || ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"],
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
    if (document.getElementById("form-prod-name")) document.getElementById("form-prod-name").value = "";
    if (document.getElementById("form-prod-price")) document.getElementById("form-prod-price").value = "";
    if (document.getElementById("form-prod-cat")) document.getElementById("form-prod-cat").value = "bracelets-featured";
    if (document.getElementById("form-prod-status")) document.getElementById("form-prod-status").value = "Available";
    if (document.getElementById("form-prod-badge")) document.getElementById("form-prod-badge").value = "";
    if (document.getElementById("form-prod-img-url")) document.getElementById("form-prod-img-url").value = "";
    if (document.getElementById("form-prod-desc")) document.getElementById("form-prod-desc").value = "";
    if (document.getElementById("admin-file-upload")) document.getElementById("admin-file-upload").value = "";
    this.renderMultiImagePreview();
    this.renderWristSizeSelector();
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
        this.currentCustomer = null;
        localStorage.removeItem("tara_active_customer");
        this.checkSession();
        window.TaraApp?.selectTab('home');
        window.TaraApp?.showToast("You have signed out. All inventory updates are safely stored!", "info");
      });
    });
  }

  /* --- INVENTORY LIST --- */
  renderInventoryList() {
    const list = document.getElementById("admin-product-list");
    if (!list || !window.TaraStore) return;

    const products = window.TaraStore.data.products || [];
    list.innerHTML = "";

    let total = products.length;
    let avail = 0;
    let sold = 0;
    let hidden = 0;

    products.forEach(prod => {
      if (prod.status === "Available") avail++;
      else if (prod.status === "Sold Out") sold++;
      else if (prod.status === "Hidden") hidden++;
    });

    const searchQuery = document.getElementById("admin-search-catalog")?.value.trim().toLowerCase() || "";
    const visibleProducts = products.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery) || (p.category && p.category.toLowerCase().includes(searchQuery)));

    if (visibleProducts.length === 0) {
      list.innerHTML = `<p class="text-center text-stone text-xs italic py-6">No catalog items found matching "${searchQuery}".</p>`;
    }

    visibleProducts.forEach(prod => {

      const row = document.createElement("div");
      row.className = "flex items-center justify-between p-3.5 bg-white rounded-xl border border-stone/20 shadow-sm gap-3";

      const thumb = prod.images && prod.images.length > 0 ? prod.images[0] : "assets/brand/logo.jpg";
      let badgeColor = "bg-green-100 text-green-800 border-green-300";
      if (prod.status === "Sold Out") badgeColor = "bg-red-100 text-red-800 border-red-300";
      if (prod.status === "Hidden") badgeColor = "bg-gray-100 text-gray-800 border-gray-300";

      const sectionLabel = (prod.category === "personalized" ? "Custom" : (prod.category || "")) + (prod.featured ? " + Featured ⭐" : "");

      row.innerHTML = `
        <div class="flex items-center space-x-3 min-w-0">
          <img src="${thumb}" class="w-12 h-12 rounded-lg object-cover border border-stone/30 flex-shrink-0">
          <div class="min-w-0">
            <h4 class="font-serif font-bold text-sm text-charcoal truncate">${prod.name}</h4>
            <div class="flex items-center space-x-2 mt-0.5">
              <span class="text-xs font-extrabold text-ocean">₱${prod.price ? prod.price.toLocaleString() : 0}</span>
              <span class="text-[9px] bg-sand/80 px-2 py-0.5 rounded text-charcoal font-bold">${sectionLabel}</span>
              <span class="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full border ${badgeColor}">${prod.status}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <div class="flex items-center bg-sand/60 border border-stone/30 rounded-lg px-1.5 py-1 text-xs font-bold text-charcoal shadow-sm" title="Quickly adjust sold count">
            <button onclick="window.TaraAdmin.adjustSoldCount('${prod.id}', -1)" class="w-5 h-5 rounded hover:bg-stone/20 text-charcoal flex items-center justify-center font-extrabold text-xs cursor-pointer">-</button>
            <span class="px-1.5 text-[11px] text-rust font-extrabold whitespace-nowrap">${prod.soldCount || 0} Sold</span>
            <button onclick="window.TaraAdmin.adjustSoldCount('${prod.id}', 1)" class="w-5 h-5 rounded hover:bg-stone/20 text-charcoal flex items-center justify-center font-extrabold text-xs cursor-pointer">+</button>
          </div>
          <button onclick="window.TaraAdmin.openEditModal('${prod.id}')" class="px-3 py-1.5 bg-charcoal hover:bg-ocean text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer">
            Edit
          </button>
          <button onclick="window.TaraAdmin.deleteProduct('${prod.id}')" class="text-red-500 hover:text-red-700 p-1.5 rounded-lg cursor-pointer transition-colors" title="Remove Product">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      `;
      list.appendChild(row);
    });

    const elTotal = document.getElementById("stat-total");
    const elAvail = document.getElementById("stat-available");
    const elSold = document.getElementById("stat-sold");
    const elHidden = document.getElementById("stat-hidden");

    if (elTotal) elTotal.textContent = total;
    if (elAvail) elAvail.textContent = avail;
    if (elSold) elSold.textContent = sold;
    if (elHidden) elHidden.textContent = hidden;
  }

  adjustSoldCount(id, delta) {
    const p = window.TaraStore?.getProductById(id);
    if (!p) return;
    const current = parseInt(p.soldCount || 0, 10);
    const updated = Math.max(0, current + delta);
    p.soldCount = updated;
    window.TaraStore.saveData();
    window.TaraApp?.showToast(`🏷️ "${p.name}" marked as ${updated} sold!`, "success");
  }

  toggleStatus(productId) {
    const product = window.TaraStore.getProductById(productId);
    if (!product) return;
    const statuses = ["Available", "Sold Out", "Hidden"];
    const currentIdx = statuses.indexOf(product.status || "Available");
    const nextIdx = (currentIdx + 1) % statuses.length;
    product.status = statuses[nextIdx];
    window.TaraStore.saveData();
    window.TaraApp?.showToast(`Updated "${product.name}" to ${product.status}`, "info");
  }

  deleteProduct(productId) {
    const product = window.TaraStore.getProductById(productId);
    if (!product) return;
    if (confirm(`Are you sure you want to delete "${product.name}" from your store inventory?`)) {
      window.TaraStore.data.products = window.TaraStore.data.products.filter(p => p.id !== productId);
      window.TaraStore.saveData();
      window.TaraApp?.showToast(`Removed "${product.name}" from catalog.`, "info");
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
  }

  updateSizeSectionVisibility() {
    const wrapper = document.getElementById("form-prod-sizes-wrapper");
    const catVal = document.getElementById("form-prod-cat")?.value || "";
    if (!wrapper) return;
    const isBracelet = catVal.startsWith("bracelets") || catVal.startsWith("personalized");
    if (isBracelet) {
      wrapper.classList.remove("hidden");
    } else {
      wrapper.classList.add("hidden");
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

  compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        const maxH = 800;
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
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
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
      thumbBox.className = "relative group aspect-square rounded-lg overflow-hidden border border-stone/30 bg-white shadow-sm";
      thumbBox.innerHTML = `
        <img src="${src}" class="w-full h-full object-cover">
        <button type="button" onclick="window.TaraAdmin.removePhoto(${idx})" class="absolute top-1 right-1 bg-red-600/90 text-white w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center hover:bg-red-700 shadow-md cursor-pointer" title="Delete Photo">✕</button>
      `;
      grid.appendChild(thumbBox);
    });
  }

  openAddModal() {
    this.editingProductId = null;
    this.uploadedImages = [];
    this.selectedWristSizes = ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"];
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
        document.getElementById("form-prod-cat").value = d.cat || "bracelets-featured";
        document.getElementById("form-prod-status").value = d.status || "Available";
        document.getElementById("form-prod-badge").value = d.badge || "";
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
        window.TaraApp?.showToast("✨ Restored your unfinished draft!", "info");
      } catch (err) {
        localStorage.removeItem(ADMIN_DRAFT_KEY);
      }
    } else {
      document.getElementById("form-prod-name").value = "";
      document.getElementById("form-prod-price").value = "";
      document.getElementById("form-prod-cat").value = "bracelets-featured";
      document.getElementById("form-prod-status").value = "Available";
      document.getElementById("form-prod-badge").value = "";
      if (document.getElementById("form-prod-sold")) document.getElementById("form-prod-sold").value = "";
      document.getElementById("form-prod-img-url").value = "";
      document.getElementById("form-prod-desc").value = "";
    }

    this.renderMultiImagePreview();
    this.renderWristSizeSelector();
    this.updateSizeSectionVisibility();

    const modal = document.getElementById("admin-edit-modal");
    if (modal) {
      modal.style.removeProperty("display");
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  openEditModal(productId) {
    const p = window.TaraStore.getProductById(productId);
    if (!p) return;

    this.editingProductId = p.id;
    this.uploadedImages = [...(p.images || [])];
    this.selectedWristSizes = [...(p.sizes || ["14cm", "15cm", "16cm", "17cm", "18cm", "19cm", "20cm"])];
    
    document.getElementById("admin-modal-title").textContent = `Edit: ${p.name}`;
    document.getElementById("form-prod-name").value = p.name;
    document.getElementById("form-prod-price").value = p.price;
    
    let catVal = p.category;
    if (p.featured === true) catVal += "-featured";
    const catSelect = document.getElementById("form-prod-cat");
    if (catSelect) catSelect.value = catVal;

    document.getElementById("form-prod-status").value = p.status;
    document.getElementById("form-prod-badge").value = p.badge || "";
    if (document.getElementById("form-prod-sold")) document.getElementById("form-prod-sold").value = p.soldCount || "";
    document.getElementById("form-prod-img-url").value = "";
    document.getElementById("form-prod-desc").value = p.description || "";

    this.renderMultiImagePreview();
    this.renderWristSizeSelector();
    this.updateSizeSectionVisibility();

    const modal = document.getElementById("admin-edit-modal");
    if (modal) {
      modal.style.removeProperty("display");
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  }

  closeProductModal() {
    const modal = document.getElementById("admin-edit-modal");
    if (modal) {
      modal.style.setProperty("display", "none", "important");
      modal.classList.add("hidden");
      modal.classList.remove("flex");
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
    const rawCatVal = document.getElementById("form-prod-cat")?.value || "bracelets-featured";
    const status = document.getElementById("form-prod-status")?.value || "Available";
    const badge = document.getElementById("form-prod-badge")?.value.trim() || "";
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

    const tabNames = {
      "personalized": "Personalized tab",
      "bracelets": "Bracelets tab",
      "gemstones": "Gemstones tab",
      "charms": "Charms tab"
    };
    const targetTabName = tabNames[actualCategory] || "catalog";
    const destName = isFeatured ? `${targetTabName} & Home (Featured)` : `${targetTabName} only`;

    try {
      if (this.editingProductId) {
        const existing = window.TaraStore.getProductById(this.editingProductId);
        if (existing) {
          existing.name = name;
          existing.price = priceVal;
          existing.category = actualCategory;
          existing.featured = isFeatured;
          existing.isCustomBase = (actualCategory === "personalized");
          existing.status = status;
          existing.badge = badge;
          existing.soldCount = soldCount;
          existing.description = desc;
          existing.images = finalImages;
          existing.sizes = finalSizes;
        }
      } else {
        const newId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
        const newProduct = {
          id: newId,
          name: name,
          price: priceVal,
          category: actualCategory,
          featured: isFeatured,
          isCustomBase: (actualCategory === "personalized"),
          status: status,
          badge: badge || "NEW",
          soldCount: soldCount,
          isNew: true,
          createdAt: Date.now(),
          description: desc,
          images: finalImages,
          sizes: finalSizes
        };
        if (window.TaraStore && window.TaraStore.data && window.TaraStore.data.products) {
          window.TaraStore.data.products.unshift(newProduct);
        }
      }

      window.TaraStore.saveData();
      localStorage.removeItem(ADMIN_DRAFT_KEY);

      const actionText = this.editingProductId ? `Updated "${name}" in ${destName}` : `New product is added to ${destName}`;
      window.TaraApp?.showToast(`✅ ${actionText}! Redirecting in 2s...`, "success");

      // Automatically navigate to the destination tab after 2 seconds
      const targetTab = (actualCategory && ["personalized", "bracelets", "gemstones", "charms"].includes(actualCategory)) 
        ? actualCategory : "home";
      setTimeout(() => {
        if (window.TaraApp && typeof window.TaraApp.selectTab === "function") {
          window.TaraApp.selectTab(targetTab);
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
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData && importedData.products && importedData.storeInfo) {
          window.TaraStore.data = importedData;
          window.TaraStore.saveData();
          this.renderInventoryList();
          this.renderProofsList();
          window.TaraApp?.showToast("✅ Successfully imported draft catalog from file!", "success");
        } else {
          alert("Invalid catalog JSON file.");
        }
      } catch (err) {
        alert("Error parsing JSON file.");
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
}

window.TaraAdmin = new AdminDashboard();
window.addEventListener("DOMContentLoaded", () => {
  window.TaraAdmin.init();
});
