import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SafeAreaTopScrim } from "@hatch/space-sdk/client";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { api, type ApiResponse } from "./api";
import { catalogImages } from "./catalogImages";

type Dashboard = ApiResponse<typeof api, "getDashboard">;
type Store = Dashboard["stores"][number];
type RetailerId = Store["id"];
type Deal = Dashboard["deals"][number];
type Item = Dashboard["items"][number];
type Product = Dashboard["catalog"][number];
type Tab = "shop" | "basket" | "compare" | "deals";

const stopWords = new Set(["and", "the", "with", "for", "from", "each", "item", "pack", "size", "fresh", "whole"]);

function dealMatchesBasket(deal: Deal, items: Item[]) {
  const dealWords = new Set(`${deal.title} ${deal.detail}`.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2 && !stopWords.has(word)));
  return items.some((item) => item.name.toLowerCase().split(/[^a-z0-9]+/).some((word) => word.length > 2 && dealWords.has(word)));
}

const money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

function fmt(value: number) {
  return money.format(value);
}

function dateRange(start: string | null, end: string | null) {
  if (!start && !end) return "Current listing";
  const parse = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (start && end) return `${parse(start)}–${parse(end)}`;
  if (end) return `Through ${parse(end)}`;
  return `From ${parse(start ?? "")}`;
}

function updatedDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function freshnessRange(from: string | null, through: string | null) {
  if (!from || !through) return "Price date unavailable";
  const first = updatedDate(from);
  const last = updatedDate(through);
  return first === last ? `Updated ${last}` : `Updated ${first}–${last}`;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

export function App() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("shop");
  const [dealStore, setDealStore] = useState<RetailerId | "all">("all");
  const [couponSearch, setCouponSearch] = useState("");
  const [basketMatchesOnly, setBasketMatchesOnly] = useState(false);
  const [priceStore, setPriceStore] = useState<Store | null>(null);
  const [checkout, setCheckout] = useState<ApiResponse<typeof api, "chooseCheckout"> | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => api.getDashboard({}) });
  const refresh = useMutation({
    mutationFn: () => api.refreshDeals({ includeBaseline: false }),
    onSuccess: async (result) => {
      setToast(result.message);
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  const choose = useMutation({
    mutationFn: (retailer: RetailerId) => api.chooseCheckout({ retailer }),
    onSuccess: (result) => {
      if (result.locked) { setShowPricing(true); return; }
      setCheckout(result);
    },
  });
  const setRegion = useMutation({
    mutationFn: (region: Dashboard["region"]) => api.setRegion({ region }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
  });

  if (dashboard.isPending) {
    return <div className="loading"><span className="loader" />Loading your basket…</div>;
  }
  if (dashboard.error || !dashboard.data) {
    return <div className="loading"><strong>We couldn’t open the basket.</strong><button className="primary" onClick={() => dashboard.refetch()}>Try again</button></div>;
  }

  const data = dashboard.data;
  const activeItems = data.items.filter((item) => !item.checked);
  const best = data.comparisons.find((entry) => entry.complete);
  const searchText = couponSearch.trim().toLowerCase();
  const filteredDeals = data.deals.filter((deal) => {
    if (dealStore !== "all" && deal.retailer !== dealStore) return false;
    if (basketMatchesOnly && !dealMatchesBasket(deal, activeItems)) return false;
    if (!searchText) return true;
    return `${deal.title} ${deal.detail} ${deal.couponSteps}`.toLowerCase().includes(searchText);
  });

  return (
    <div className="app-shell">
      <SafeAreaTopScrim backgroundColor="var(--bg)" />
      <main className="page">
        <header className="masthead">
          <div>
            <p className="eyebrow">Basket in progress</p>
            <h1>{activeItems.length === 0 ? "Build your grocery run" : `${activeItems.length} ${activeItems.length === 1 ? "item" : "items"} to price`}</h1>
          </div>
          <div className="masthead-actions">
            <button className="scan-button" onClick={() => setShowScanner(true)} aria-label="Scan a product barcode"><span className="scan-mark" aria-hidden="true" />Scan UPC</button>
            <button className="plan-stamp" onClick={() => setShowPricing(true)} aria-label={data.plan.tier === "saver" ? "Checkout Saver is on — view plan" : "View $7 monthly Checkout Saver plan"}>{data.plan.tier === "saver" ? <><b>Saver</b><span>is on</span></> : <><b>$7</b><span>/month</span></>}</button>
          </div>
        </header>
        <label className="region-picker">Shopping area<select aria-label="Shopping region" value={data.region} onChange={(event) => setRegion.mutate(event.target.value as Dashboard["region"])}>{data.regions.map((region) => <option value={region.id} key={region.id}>{region.label}</option>)}</select></label>
        <p className="price-date-key">Every grocery amount shows its update date. App plan price: $7/month, set Oct 8, 2026.</p>

        {tab === "shop" && <ShopView data={data} onBasket={() => setTab("basket")} onToast={setToast} />}
        {tab === "basket" && <BasketView data={data} onCompare={() => setTab("compare")} />}
        {tab === "compare" && (
          <CompareView
            data={data}
            bestRetailer={best?.retailer ?? null}
            onPrice={setPriceStore}
            onCheckout={(retailer) => choose.mutate(retailer)}
            checkoutBusy={choose.isPending}
            onPricing={() => setShowPricing(true)}
          />
        )}
        {tab === "deals" && (
          <DealsView
            data={data}
            deals={filteredDeals}
            filter={dealStore}
            onFilter={setDealStore}
            search={couponSearch}
            onSearch={setCouponSearch}
            basketMatchesOnly={basketMatchesOnly}
            onBasketMatchesOnly={setBasketMatchesOnly}
            onRefresh={() => refresh.mutate()}
            refreshBusy={refresh.isPending}
            onToast={setToast}
            onPricing={() => setShowPricing(true)}
          />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Primary">
        <button className={tab === "shop" ? "active" : ""} onClick={() => setTab("shop")}><span>Shop</span><b>{data.catalog.length}</b></button>
        <button className={tab === "basket" ? "active" : ""} onClick={() => setTab("basket")}><span>Basket</span><b>{activeItems.length}</b></button>
        <button className={tab === "compare" ? "active" : ""} onClick={() => setTab("compare")}><span>Compare</span><b>{best ? fmt(best.total) : "—"}</b></button>
        <button className={tab === "deals" ? "active" : ""} onClick={() => setTab("deals")}><span>Coupons</span><b>{data.deals.length}</b></button>
      </nav>

      {priceStore && <PriceSheet store={priceStore} items={activeItems} onClose={() => setPriceStore(null)} onSaved={async () => { setPriceStore(null); await queryClient.invalidateQueries({ queryKey: ["dashboard"] }); }} />}
      {checkout && <CheckoutSheet checkout={checkout} onClose={() => setCheckout(null)} onToast={setToast} />}
      {showPricing && <PricingSheet plan={data.plan} onClose={() => setShowPricing(false)} onToast={setToast} />}
      {showScanner && <ScannerSheet onClose={() => setShowScanner(false)} onAdded={async (message) => { setShowScanner(false); setToast(message); await queryClient.invalidateQueries({ queryKey: ["dashboard"] }); }} />}
      {toast && <button className="toast" onClick={() => setToast(null)} aria-label="Dismiss message">{toast}</button>}
    </div>
  );
}

function ShopView({ data, onBasket, onToast }: { data: Dashboard; onBasket: () => void; onToast: (message: string) => void }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [visibleCount, setVisibleCount] = useState(48);
  const categories = Array.from(new Set(data.catalog.map((product) => product.category)));
  const categoryCounts = new Map(categories.map((entry) => [entry, data.catalog.filter((product) => product.category === entry).length]));
  const needle = query.trim().toLowerCase();
  const products = data.catalog.filter((product) => {
    const categoryMatches = category === null || product.category === category;
    const textMatches = !needle || `${product.name} ${product.brand} ${product.category} ${product.keywords}`.toLowerCase().includes(needle);
    return categoryMatches && textMatches;
  });
  const browsingProducts = Boolean(needle || category);
  const add = useMutation({
    mutationFn: (catalogId: string) => api.addCatalogItem({ catalogId, quantity: 1 }),
    onSuccess: async () => { onToast("Added to basket."); await queryClient.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
  const addProduct = (product: Product) => add.mutate(product.id);
  return (
    <section className="view shop-view">
      <section className="shop-search" aria-labelledby="shop-title">
        <p className="eyebrow">Visual grocery catalog</p>
        <h2 id="shop-title">Find what you need</h2>
        <label className="product-search">Search products, brands, and categories<input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setCategory(null); setVisibleCount(48); }} placeholder="Try cereal, coffee, chicken breast…" autoComplete="off" /></label>
      </section>
      {!browsingProducts ? <>
        <div className="catalog-summary"><div><h3>Shop by category</h3><span>Pick an aisle to see every product in it</span></div><button onClick={onBasket}>View basket</button></div>
        <div className="category-grid" role="list" aria-label="Grocery categories">
          {categories.map((entry) => {
            const previews = data.catalog.filter((product) => product.category === entry).slice(0, 4);
            return <button className="category-card" key={entry} role="listitem" onClick={() => { setCategory(entry); setVisibleCount(48); }}>
              <span className="category-image category-mosaic">{previews.map((product) => <img key={product.id} src={catalogImages[product.imageSlug]} alt="" />)}</span>
              <span className="category-copy"><strong>{entry}</strong><small>{categoryCounts.get(entry) ?? 0} individually pictured products</small></span>
              <span className="category-arrow" aria-hidden="true">→</span>
            </button>;
          })}
        </div>
      </> : <>
        <div className="catalog-summary product-results-summary"><div><button className="back-to-categories" onClick={() => { setCategory(null); setQuery(""); setVisibleCount(48); }}>← All categories</button><h3>{needle ? `Results for “${query.trim()}”` : category}</h3><span>{products.length} {products.length === 1 ? "product" : "products"}</span></div><button onClick={onBasket}>View basket</button></div>
        {products.length === 0 ? <Empty><strong>No products match that search.</strong><p>Try a broader word, or return to all categories.</p></Empty> : (<>
          <div className="product-grid">{products.slice(0, visibleCount).map((product) => {
            const lowest = [...product.prices].sort((a, b) => a.amount - b.amount)[0];
            return <article className="product-card" key={product.id}>
              <button className="product-open" onClick={() => setSelectedProduct(product)} aria-label={`View ${product.name}`}>
                <div className="product-image"><img src={catalogImages[product.imageSlug]} alt={product.imageAlt} /></div>
                <div className="product-copy"><span>{product.brand}</span><h3>{product.name}</h3><p>{product.unit}</p>{lowest ? <><strong>{lowest.priceType === "sale" ? "sale " : "from "}{fmt(lowest.amount)}</strong><small>{lowest.priceType === "sale" ? `${lowest.sourceLabel} · ` : "Planning estimate · "}updated {updatedDate(lowest.updatedAt)}</small></> : <><strong>Price at store</strong><small>Add it, then enter a local price to compare.</small></>}</div>
              </button>
              <button className="product-add" onClick={() => addProduct(product)} disabled={add.isPending} aria-label={`Add ${product.name} to basket`}>Add</button>
            </article>;
          })}</div>
          {visibleCount < products.length && <button className="secondary full catalog-more" onClick={() => setVisibleCount((current) => current + 48)}>Show 48 more <span>{products.length - visibleCount} remaining</span></button>}
        </>)}
        <p className="catalog-note">Each product has its own item-specific image. Package appearance can vary by store. Every shown amount carries its update date.</p>
      </>}
      {selectedProduct && <ProductSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={() => { addProduct(selectedProduct); setSelectedProduct(null); }} />}
    </section>
  );
}

function ProductSheet({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: () => void }) {
  return <div className="modal-backdrop" role="presentation"><section className="sheet product-sheet" role="dialog" aria-modal="true" aria-labelledby="product-sheet-title">
    <div className="sheet-head"><div><p className="eyebrow">{product.category}</p><h2 id="product-sheet-title">{product.name}</h2><span>{product.brand} · {product.unit}</span></div><button className="close" onClick={onClose} aria-label="Close product details">×</button></div>
    <img className="product-sheet-image" src={catalogImages[product.imageSlug]} alt={product.imageAlt} />
    <div className="section-heading"><h3>Area store prices</h3><span>{product.prices.length > 0 ? `${product.prices.length} dated quotes` : "No dated prices yet"}</span></div>
    {product.prices.length > 0 ? <div className="store-price-list">{[...product.prices].sort((a, b) => a.amount - b.amount).map((price, index) => <div key={price.retailer}><span>{price.storeName}{index === 0 ? <b>{price.priceType === "sale" ? "Lowest sale" : "Lowest estimate"}</b> : null}<small>{price.priceType === "sale" ? `${price.sourceLabel} sale` : price.sourceLabel} · updated {updatedDate(price.updatedAt)}</small></span><strong>{fmt(price.amount)}</strong></div>)}</div> : <Empty><strong>Price at the store.</strong><p>Add this item, then enter a local shelf price in Compare.</p></Empty>}
    <button className="primary full" onClick={onAdd}>Add to basket</button>
  </section></div>;
}

function ScannerSheet({ onClose, onAdded }: { onClose: () => void; onAdded: (message: string) => Promise<void> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const handledRef = useRef(false);
  const [mode, setMode] = useState<"camera" | "manual" | "unknown">("camera");
  const [manualUpc, setManualUpc] = useState("");
  const [detectedUpc, setDetectedUpc] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("item");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Point the camera at the UPC bars.");

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    BrowserMultiFormatReader.releaseAllStreams();
  }, []);

  const lookUp = useCallback(async (raw: string) => {
    const upc = raw.replace(/\D/g, "");
    if (upc.length < 8 || upc.length > 14) {
      setMessage("Enter the 8–14 digits printed under the barcode.");
      handledRef.current = false;
      return;
    }
    setBusy(true);
    setMessage(`Checking ${upc}…`);
    try {
      const result = await api.addScannedItem({ upc });
      if (result.status === "unknown") {
        stopCamera();
        setDetectedUpc(upc);
        setManualUpc(upc);
        setMessage("This barcode is new. Name and price it once so Stack & Save remembers it.");
        setMode("unknown");
      } else {
        await onAdded(`${result.name ?? "Product"} scanned and added to your basket.`);
      }
    } catch {
      setMessage("That scan did not save. Try again or enter the UPC digits.");
      handledRef.current = false;
    } finally {
      setBusy(false);
    }
  }, [onAdded, stopCamera]);

  useEffect(() => {
    if (mode !== "camera") return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Camera scanning is not available here. Enter the UPC digits instead.");
      setMode("manual");
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    handledRef.current = false;
    const reader = new BrowserMultiFormatReader();
    void reader.decodeFromVideoDevice(undefined, video, (result, _error, controls) => {
      if (!result || handledRef.current) return;
      handledRef.current = true;
      controls.stop();
      void lookUp(result.getText());
    }).then((controls) => {
      controlsRef.current = controls;
    }).catch(() => {
      setMessage("Camera access was blocked or no camera was found. Enter the UPC digits instead.");
      setMode("manual");
    });
    return stopCamera;
  }, [lookUp, mode, stopCamera]);

  const submitManual = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    handledRef.current = true;
    void lookUp(manualUpc);
  };

  const remember = async (event: FormEvent) => {
    event.preventDefault();
    const numericPrice = Number(price);
    if (!name.trim() || !Number.isFinite(numericPrice) || numericPrice < 0) return;
    setBusy(true);
    try {
      const result = await api.rememberScannedProduct({ upc: detectedUpc, name: name.trim(), unit: unit.trim() || "item", price: numericPrice });
      await onAdded(`${result.name} remembered and added. Its estimate is ready to compare.`);
    } catch {
      setMessage("That product could not be saved. Check the name and price and try again.");
      setBusy(false);
    }
  };

  return <div className="modal-backdrop scanner-backdrop" role="presentation"><section className="sheet scanner-sheet" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
    <div className="sheet-head"><div><p className="eyebrow">In-store shortcut</p><h2 id="scanner-title">Scan a product</h2></div><button className="close" onClick={() => { stopCamera(); onClose(); }} aria-label="Close barcode scanner">×</button></div>
    {mode === "camera" && <>
      <div className="camera-frame"><video ref={videoRef} muted playsInline aria-label="Barcode camera preview" /><span className="scan-line" aria-hidden="true" /></div>
      <p className="scanner-status" role="status">{message}</p>
      <button className="secondary full" onClick={() => { stopCamera(); handledRef.current = false; setMode("manual"); }}>Enter UPC digits instead</button>
    </>}
    {mode === "manual" && <form className="scanner-form" onSubmit={submitManual}>
      <p>Type the numbers printed under the barcode.</p>
      <label>UPC or EAN<input inputMode="numeric" autoComplete="off" value={manualUpc} onChange={(event) => setManualUpc(event.target.value.replace(/\D/g, ""))} placeholder="0001600027526" aria-label="UPC or EAN digits" /></label>
      <p className="scanner-status" role="status">{message}</p>
      <div className="sheet-actions"><button type="button" className="secondary" onClick={() => { setMessage("Point the camera at the UPC bars."); setMode("camera"); }}>Use camera</button><button className="primary" type="submit" disabled={busy || manualUpc.length < 8}>{busy ? "Checking…" : "Check barcode"}</button></div>
    </form>}
    {mode === "unknown" && <form className="scanner-form" onSubmit={remember}>
      <div className="unknown-upc"><span>New barcode</span><strong>{detectedUpc}</strong></div>
      <p>{message}</p>
      <label>Product name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Product name" autoFocus /></label>
      <div className="scanner-fields"><label>Price<input type="number" inputMode="decimal" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0.00" /></label><label>Unit<input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="item" /></label></div>
      <p className="scanner-note">This price becomes an editable estimate for your area stores so the item enters comparison immediately. Correct any store price from Compare.</p>
      <button className="primary full" type="submit" disabled={busy || name.trim().length < 2 || price === ""}>{busy ? "Saving…" : "Remember and add"}</button>
    </form>}
  </section></div>;
}

function BasketView({ data, onCompare }: { data: Dashboard; onCompare: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("item");
  const add = useMutation({
    mutationFn: () => api.addBasketItem({ name, quantity, unit }),
    onSuccess: async () => { setName(""); setQuantity(1); await queryClient.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
  const update = useMutation({ mutationFn: (args: { id: number; quantity?: number; checked?: boolean }) => api.updateBasketItem(args), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard"] }) });
  const remove = useMutation({ mutationFn: (id: number) => api.removeBasketItem({ id }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard"] }) });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    add.mutate();
  };
  const active = data.items.filter((item) => !item.checked);
  const packed = data.items.filter((item) => item.checked);

  return (
    <section className="view">
      <form className="add-strip" onSubmit={submit}>
        <label htmlFor="item-name">Add an item</label>
        <div className="add-row">
          <input id="item-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Milk, eggs, coffee…" />
          <button className="add-button" type="submit" disabled={add.isPending || name.trim().length < 2}>Add</button>
        </div>
        <div className="small-fields">
          <label>Qty<input aria-label="Item quantity" type="number" min="1" max="99" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} /></label>
          <label>Unit<input aria-label="Item unit" value={unit} onChange={(event) => setUnit(event.target.value)} /></label>
        </div>
      </form>

      <div className="section-heading"><h2>Your list</h2><span>{active.length} active</span></div>
      {active.length === 0 ? (
        <Empty><strong>Start with one grocery.</strong><p>Add your own item above, or choose a researched deal from the Deals tab.</p></Empty>
      ) : (
        <div className="basket-list">
          {active.map((item) => (
            <article className="basket-line" key={item.id}>
              <button className="check" aria-label={`Mark ${item.name} packed`} onClick={() => update.mutate({ id: item.id, checked: true })} />
              <div className="basket-copy"><strong>{item.name}</strong><span>{item.quotes.filter((quote) => data.stores.some((store) => store.id === quote.retailer)).length}/{data.stores.length} area stores priced · per {item.unit}</span></div>
              <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                <button aria-label={`Decrease ${item.name} quantity`} onClick={() => update.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}>−</button>
                <b>{item.quantity}</b>
                <button aria-label={`Increase ${item.name} quantity`} onClick={() => update.mutate({ id: item.id, quantity: Math.min(99, item.quantity + 1) })}>+</button>
              </div>
              <button className="remove" aria-label={`Remove ${item.name}`} onClick={() => remove.mutate(item.id)}>×</button>
            </article>
          ))}
        </div>
      )}

      {active.length > 0 && <button className="primary compare-cta" onClick={onCompare}>Compare {data.stores.length} area stores <span>→</span></button>}

      {packed.length > 0 && (
        <details className="packed">
          <summary>Packed · {packed.length}</summary>
          {packed.map((item) => <button key={item.id} onClick={() => update.mutate({ id: item.id, checked: false })}>Restore {item.name}</button>)}
        </details>
      )}

      <aside className="membership-note">
        <div><b>Free</b><span>Browse the catalog, scan barcodes + build a basket</span></div>
        <div><b>{data.plan.tier === "saver" ? "Saver on" : "$7/mo"}</b><span>{data.plan.tier === "saver" ? "Coupon matching, checkout comparison, split finder + deal alerts are unlocked" : "Coupon math + regional checkout finder + split finder + alerts"}</span></div>
        <p>Membership billing is separate from groceries. You pay the chosen store in its own checkout.</p>
      </aside>
    </section>
  );
}

function CompareView({ data, bestRetailer, onPrice, onCheckout, checkoutBusy, onPricing }: { data: Dashboard; bestRetailer: RetailerId | null; onPrice: (store: Store) => void; onCheckout: (retailer: RetailerId) => void; checkoutBusy: boolean; onPricing: () => void }) {
  const activeItems = data.items.filter((item) => !item.checked);
  const best = data.comparisons.find((entry) => entry.retailer === bestRetailer);
  const splitWins = Boolean(data.splitComparison && best && data.splitComparison.total < best.total);
  if (data.plan.tier !== "saver") {
    return (
      <section className="view">
        <div className="compare-intro">
          <p className="eyebrow">Checkout finder</p>
          <h2>Comparison is a Saver tool</h2>
          <p>Checkout Saver prices your whole basket at every store in your area — coupons matched automatically, delivery estimates included — and finds the cheapest two-store split.</p>
        </div>
        <div className="locked-panel">
          <strong>{activeItems.length > 0 ? `${activeItems.length} ${activeItems.length === 1 ? "item is" : "items are"} ready to price` : "Your basket is ready when you are"}</strong>
          <p>The free plan covers browsing the catalog, building your basket, scanning barcodes, and reading the deal feed. Store-by-store totals, coupon auto-matching, the two-store split finder, and deal alerts unlock with Checkout Saver at $7/month.</p>
          <button className="primary full" onClick={onPricing}>See Checkout Saver — $7/month</button>
          <p className="locked-note">{data.plan.billingConfigured ? "Billing runs through Stripe. Cancel anytime; Saver stays on until the period ends." : "The app owner has not connected Stripe yet, so billing is not live. The setup step is in the plan sheet."}</p>
        </div>
        <div className="truth-note"><b>Why prices need confirmation</b><p>Local inventory, membership, substitutions, taxes, and delivery fees change inside each retailer’s checkout. Catalog figures are editable planning estimates, not live prices.</p></div>
      </section>
    );
  }
  return (
    <section className="view">
      <div className="compare-intro">
        <p className="eyebrow">Checkout finder</p>
        <h2>{bestRetailer ? "Lowest planning estimate" : "Price the basket"}</h2>
        <p>Totals are planning estimates built from editable October 2026 samples, matched deal rows, coupon savings, and delivery estimates. Confirm current prices in the store link before paying.</p>
      </div>
      {best && <button className="savings-reveal" onClick={onPricing}><span>Coupon savings found</span><strong>{fmt(best.savings)}</strong><small>Coupon matching, checkout picks, split plans, and alerts are on with your Saver plan.</small></button>}
      {splitWins && data.splitComparison && (
        <article className="split-result">
          <p className="eyebrow">Two-store split wins</p>
          <div><h3>{data.splitComparison.storeNames.join(" + ")}</h3><strong>{fmt(data.splitComparison.total)}</strong></div>
          <p>{freshnessRange(data.splitComparison.priceUpdatedFrom, data.splitComparison.priceUpdatedThrough)}. Delivery is included only where a dated estimate was entered. {data.splitComparison.lines.map((line) => `${line.item} at ${line.storeName} (${updatedDate(line.updatedAt)})`).join("; ")}.</p>
        </article>
      )}
      {activeItems.length === 0 ? (
        <Empty><strong>Your basket is empty.</strong><p>Add items before comparing stores.</p></Empty>
      ) : (
        <div className="comparison-list">
          {data.comparisons.map((comparison, index) => {
            const store = data.stores.find((candidate) => candidate.id === comparison.retailer);
            if (!store) return null;
            const winner = comparison.retailer === bestRetailer && !splitWins;
            return (
              <article className={`store-result ${winner ? "winner" : ""}`} key={comparison.retailer}>
                <div className="rank">{comparison.complete ? index + 1 : "–"}</div>
                <div className="store-result-main">
                  <div className="store-title"><h3>{store.name}</h3>{winner && <span>Lowest estimate</span>}</div>
                  {comparison.complete ? <><strong className="total">{fmt(comparison.total)}</strong><p>{fmt(comparison.subtotal)} items − {fmt(comparison.savings)} coupons + {comparison.deliveryUpdatedAt ? `${fmt(comparison.delivery)} delivery (updated ${updatedDate(comparison.deliveryUpdatedAt)})` : "delivery not entered"}</p><p className="freshness">{freshnessRange(comparison.priceUpdatedFrom, comparison.priceUpdatedThrough)}</p></> : <p className="missing">Needs {comparison.missingCount} {comparison.missingCount === 1 ? "dated price" : "dated prices"}</p>}
                  <div className="result-actions"><button className="secondary" onClick={() => onPrice(store)}>{comparison.complete ? "Edit prices" : "Price this store"}</button>{comparison.complete && <button className="primary small" disabled={checkoutBusy} onClick={() => onCheckout(store.id)}>Choose store</button>}</div>
                  <details className="store-profile"><summary>Store rules & delivery</summary><p>{store.delivery}</p><p>{store.rule}</p><p>{store.membership}</p>{store.policyStatus === "confirm_local" && <b>Confirm this policy with your local store.</b>}<div>{store.couponUrl && <a href={store.couponUrl} target="_blank" rel="noreferrer">Coupons ↗</a>}<a href={store.orderUrl} target="_blank" rel="noreferrer">Order online ↗</a></div></details>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <div className="truth-note"><b>Why prices need confirmation</b><p>Local inventory, membership, substitutions, taxes, and delivery fees change inside each retailer’s checkout. October 2026 catalog figures are editable planning samples, not live prices.</p></div>
    </section>
  );
}

function DealsView({ data, deals, filter, onFilter, search, onSearch, basketMatchesOnly, onBasketMatchesOnly, onRefresh, refreshBusy, onToast, onPricing }: { data: Dashboard; deals: Deal[]; filter: RetailerId | "all"; onFilter: (filter: RetailerId | "all") => void; search: string; onSearch: (value: string) => void; basketMatchesOnly: boolean; onBasketMatchesOnly: (value: boolean) => void; onRefresh: () => void; refreshBusy: boolean; onToast: (message: string) => void; onPricing: () => void }) {
  const queryClient = useQueryClient();
  const activeItems = data.items.filter((item) => !item.checked);
  const saver = data.plan.tier === "saver";
  const today = new Date().toISOString().slice(0, 10);
  const add = useMutation({
    mutationFn: (dealId: number) => api.addDealToBasket({ dealId }),
    onSuccess: async () => { onToast("Added to basket."); await queryClient.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
  const markSeen = useMutation({
    mutationFn: (dealId: number) => api.markAlertSeen({ dealId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
  });
  return (
    <section className="view">
      <div className="deal-header">
        <div><p className="eyebrow">Coupon center</p><h2>Available coupons & offers</h2></div>
        <button className="refresh" onClick={onRefresh} disabled={refreshBusy}>{refreshBusy ? "Checking…" : "Refresh"}</button>
      </div>
      <p className="as-of">Showing every sourced offer currently in the app for your area · last checked {data.lastRefresh ? new Date(data.lastRefresh).toLocaleString() : "not yet"}. Expired offers stay visible and are labeled — they are never silently deleted. Account-only and local coupons can differ.</p>

      {saver ? (
        <section className="alerts-panel" aria-labelledby="alerts-title">
          <div className="section-heading"><h3 id="alerts-title">Deal alerts for your basket</h3><span>{data.alerts.length} active</span></div>
          {data.alerts.length === 0 ? <p className="alerts-empty">No current deals match your basket and area right now. Alerts appear here automatically when a weekly refresh finds a deal that matches what is in your basket.</p> : (
            <div className="alert-list">
              {data.alerts.map((alert) => {
                const store = data.stores.find((candidate) => candidate.id === alert.retailer);
                return <article className="alert-row" key={alert.dealId}>
                  <div><strong>{alert.title}</strong><span>{store?.name ?? alert.retailer} · {alert.priceLabel}{alert.validThrough ? ` · through ${alert.validThrough}` : ""}</span></div>
                  {alert.isNew ? <button className="alert-new" onClick={() => markSeen.mutate(alert.dealId)} aria-label={`Mark alert for ${alert.title} as seen`}>New — tap when seen</button> : <span className="alert-seen">Seen</span>}
                </article>;
              })}
            </div>
          )}
        </section>
      ) : (
        <aside className="alerts-panel alerts-locked">
          <strong>Deal alerts are a Checkout Saver feature</strong>
          <p>When a weekly refresh finds a deal at one of your area stores that matches what is already in your basket, Saver flags it here as an alert.</p>
          <button className="secondary" onClick={onPricing}>Unlock alerts — $7/month</button>
        </aside>
      )}

      <aside className="matching-note">
        <strong>Coupon matching ≠ competitor matching</strong>
        <p>This app matches eligible offers to your basket. Most retailers do not honor another store’s coupon. Each store’s own stacking rule is listed below, and the retailer’s coupon center has the complete account-specific list.</p>
      </aside>

      <div className="coupon-tools">
        <label>Search coupons<input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Cereal, detergent, $5 off…" /></label>
        <label className="match-toggle"><input type="checkbox" checked={saver && basketMatchesOnly} disabled={!saver} onChange={(event) => onBasketMatchesOnly(event.target.checked)} /><span>{saver ? "Matches my basket only" : "Basket matching is a Saver feature"}</span></label>
      </div>

      <div className="filters" role="group" aria-label="Filter coupons by store">
        <button className={filter === "all" ? "active" : ""} onClick={() => onFilter("all")}>All stores</button>
        {data.stores.map((store) => <button key={store.id} className={filter === store.id ? "active" : ""} onClick={() => onFilter(store.id)}>{store.short}</button>)}
      </div>

      <section className="coupon-directory" aria-labelledby="coupon-directory-title">
        <div className="section-heading"><h3 id="coupon-directory-title">Store coupon centers</h3><span>{data.stores.length} area stores</span></div>
        <div className="coupon-directory-list">
          {data.stores.map((store) => {
            const count = data.deals.filter((deal) => deal.retailer === store.id).length;
            const check = data.feedChecks.find((candidate) => candidate.retailer === store.id);
            return <article key={store.id} className="coupon-store-row"><div><strong>{store.name}</strong><span>{count} sourced {count === 1 ? "offer" : "offers"} in app{check ? ` · ${check.currentDeals} current · feed checked ${updatedDate(check.checkedAt)}` : ""}</span></div><p>{store.rule}</p>{check?.note ? <p className="feed-note">{check.note}</p> : null}{store.couponUrl ? <a href={store.couponUrl} target="_blank" rel="noreferrer">Browse all at {store.short} ↗</a> : <a href={store.orderUrl} target="_blank" rel="noreferrer">Check {store.short} offers ↗</a>}</article>;
          })}
        </div>
      </section>

      <div className="section-heading"><h3>All sourced offers</h3><span>{deals.length} shown</span></div>
      {deals.length === 0 ? <Empty><strong>No matching coupons found.</strong><p>Clear the search or basket filter, choose another store, or refresh the sourced offer list.</p></Empty> : (
        <div className="deal-list">
          {deals.map((deal) => {
            const store = data.stores.find((candidate) => candidate.id === deal.retailer);
            const basketMatch = saver && dealMatchesBasket(deal, activeItems);
            const expired = Boolean(deal.validThrough && deal.validThrough < today);
            return (
              <article className={`deal-card${expired ? " expired" : ""}`} key={deal.id}>
                <div className="deal-meta"><span>{store?.name ?? deal.retailer}</span><time>{dateRange(deal.validFrom, deal.validThrough)}</time></div>
                {expired && <span className="expired-badge">Expired {deal.validThrough ? updatedDate(`${deal.validThrough}T12:00:00.000Z`) : ""}</span>}
                {basketMatch && <span className="basket-match">Matches basket</span>}
                <h3>{deal.title}</h3>
                <p>{deal.detail}</p>
                <div className="deal-price">{deal.priceLabel}<small>Updated {updatedDate(deal.refreshedAt)}</small></div>
                <details><summary>Coupon details</summary><p>{deal.couponSteps}</p>{deal.caveat && <p className="caveat">{deal.caveat}</p>}<a href={deal.sourceUrl} target="_blank" rel="noreferrer">Source: {deal.sourceName} ↗</a></details>
                {saver ? <button className="deal-add" onClick={() => add.mutate(deal.id)} disabled={add.isPending || expired}>{expired ? "Offer expired" : "Add offer to basket"}</button> : <button className="deal-add" onClick={onPricing}>Add with Checkout Saver</button>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function PriceSheet({ store, items, onClose, onSaved }: { store: Store; items: Item[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [values, setValues] = useState<Record<number, { price: string; savings: string }>>(() => Object.fromEntries(items.map((item) => {
    const quote = item.quotes.find((candidate) => candidate.retailer === store.id);
    return [item.id, { price: quote ? String(quote.unitPrice) : "", savings: quote ? String(quote.savings) : "0" }];
  })));
  const [delivery, setDelivery] = useState("0");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      for (const item of items) {
        const value = values[item.id];
        if (!value || value.price.trim() === "") continue;
        await api.setQuote({ basketItemId: item.id, retailer: store.id, unitPrice: Math.max(0, Number(value.price) || 0), savings: Math.max(0, Number(value.savings) || 0) });
      }
      await api.setDeliveryFee({ retailer: store.id, amount: Math.max(0, Number(delivery) || 0) });
      await onSaved();
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="price-sheet-title">
        <div className="sheet-head"><div><p className="eyebrow">Local quote</p><h2 id="price-sheet-title">Price at {store.name}</h2></div><button className="close" onClick={onClose} aria-label="Close price editor">×</button></div>
        <p className="sheet-intro">Use the shelf or app price per unit. Put only the coupon amount that will actually apply.</p>
        <div className="price-grid">
          {items.map((item) => {
            const value = values[item.id] ?? { price: "", savings: "0" };
            const quote = item.quotes.find((candidate) => candidate.retailer === store.id);
            return <div className="price-row" key={item.id}><div><strong>{item.name}</strong><span>{item.quantity} × {item.unit}</span>{quote && <small>{quote.sourceLabel} · updated {updatedDate(quote.updatedAt)}</small>}</div><label>Price<input aria-label={`${store.name} price for ${item.name}`} type="number" inputMode="decimal" min="0" step="0.01" value={value.price} onChange={(event) => setValues((current) => ({ ...current, [item.id]: { ...value, price: event.target.value } }))} /></label><label>Coupon<input aria-label={`${store.name} coupon savings for ${item.name}`} type="number" inputMode="decimal" min="0" step="0.01" value={value.savings} onChange={(event) => setValues((current) => ({ ...current, [item.id]: { ...value, savings: event.target.value } }))} /></label></div>;
          })}
        </div>
        <label className="delivery-field">Delivery estimate<input aria-label={`${store.name} delivery fee estimate`} type="number" min="0" step="0.01" value={delivery} onChange={(event) => setDelivery(event.target.value)} /></label>
        <p className="store-note">{store.delivery}</p>
        <div className="sheet-actions"><a className="secondary link-button" href={store.orderUrl} target="_blank" rel="noreferrer">Check {store.name} prices ↗</a><button className="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save quote"}</button></div>
      </section>
    </div>
  );
}

function PricingSheet({ plan, onClose, onToast }: { plan: Dashboard["plan"]; onClose: () => void; onToast: (message: string) => void }) {
  const queryClient = useQueryClient();
  const billing = useQuery({ queryKey: ["billing"], queryFn: () => api.getBilling({}) });
  const [paymentLinkUrl, setPaymentLinkUrl] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["billing"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const saveSettings = useMutation({
    mutationFn: () => api.saveStripeSettings({ paymentLinkUrl: paymentLinkUrl.trim() || undefined, publishableKey: publishableKey.trim() || undefined, secretKey: secretKey.trim() || undefined }),
    onSuccess: async (result) => { setSecretKey(""); onToast(result.configured ? "Stripe connected. Billing is live." : "Settings saved. Add both the payment link and the secret key to turn billing on."); await invalidate(); },
    onError: (error) => onToast(error instanceof Error ? error.message : "Those settings did not save."),
  });
  const verify = useMutation({
    mutationFn: (email: string) => api.verifySubscription({ email }),
    onSuccess: async (result) => { setVerifyMessage(result.message); if (result.status === "active" || result.status === "trialing") await invalidate(); },
    onError: () => setVerifyMessage("That check did not go through. Try again in a moment."),
  });
  const refreshStatus = useMutation({
    mutationFn: () => api.refreshSubscriptionStatus({}),
    onSuccess: async (result) => { onToast(result.message); await invalidate(); },
  });
  const cancel = useMutation({
    mutationFn: () => api.cancelSubscription({}),
    onSuccess: async (result) => { onToast(result.message); await invalidate(); },
  });

  const data = billing.data;
  const subscription = data?.subscription ?? null;
  const subscribed = plan.tier === "saver";
  const configured = data?.configured ?? plan.billingConfigured;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="sheet pricing-sheet" role="dialog" aria-modal="true" aria-labelledby="pricing-title">
        <div className="sheet-head"><div><p className="eyebrow">Stack & Save</p><h2 id="pricing-title">Pay for the savings tools, not the groceries</h2></div><button className="close" onClick={onClose} aria-label="Close pricing">×</button></div>
        <div className="pricing-grid"><article><b>Free</b><strong>$0</strong><ul><li>Browse the grocery catalog</li><li>Build and keep a basket</li><li>Scan UPC barcodes</li><li>Read the researched deal feed</li></ul></article><article className="paid"><b>Checkout Saver</b><strong>$7 <small>/ month</small></strong><ul><li>Automatic coupon matching</li><li>Regional checkout comparison</li><li>Two-store split finder</li><li>Deal alerts for your basket</li></ul></article></div>

        {subscribed && subscription ? (
          <div className="billing-status">
            <strong>Checkout Saver is on</strong>
            <p>{subscription.email ? `Subscription for ${subscription.email}. ` : ""}{subscription.cancelAtPeriodEnd ? `Cancels at the end of the current period${subscription.currentPeriodEnd ? ` (${updatedDate(subscription.currentPeriodEnd)})` : ""} — Saver stays on until then.` : subscription.currentPeriodEnd ? `Current period runs through ${updatedDate(subscription.currentPeriodEnd)}.` : "Status confirmed with Stripe."}</p>
            <div className="sheet-actions">
              <button className="secondary" onClick={() => refreshStatus.mutate()} disabled={refreshStatus.isPending}>{refreshStatus.isPending ? "Checking…" : "Refresh status from Stripe"}</button>
              {!subscription.cancelAtPeriodEnd && <button className="secondary danger" onClick={() => cancel.mutate()} disabled={cancel.isPending}>{cancel.isPending ? "Scheduling…" : "Cancel at period end"}</button>}
            </div>
          </div>
        ) : configured && data?.paymentLinkUrl ? (
          <div className="subscribe-box">
            <strong>Turn on Checkout Saver</strong>
            <p>Billing runs through Stripe — Stack & Save never sees your card. After subscribing, come back here and verify with the same email so the app can confirm your subscription with Stripe.</p>
            <a className="primary link-button full" href={data.paymentLinkUrl} target="_blank" rel="noreferrer">Subscribe — $7/month via Stripe ↗</a>
            <form className="billing-form" onSubmit={(event) => { event.preventDefault(); if (verifyEmail.trim()) verify.mutate(verifyEmail.trim()); }}>
              <label>Email used at Stripe checkout<input type="email" value={verifyEmail} onChange={(event) => setVerifyEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
              <button className="secondary full" type="submit" disabled={verify.isPending || !verifyEmail.trim()}>{verify.isPending ? "Checking with Stripe…" : "I subscribed — verify my plan"}</button>
            </form>
            {verifyMessage && <p className="billing-message" role="status">{verifyMessage}</p>}
          </div>
        ) : (
          <div className="setup-box">
            <strong>Owner setup: connect Stripe to turn on billing</strong>
            <p>Billing is <b>not live yet</b>. Checkout Saver cannot charge anyone until the app owner connects their own Stripe account:</p>
            <ol>
              <li>In the Stripe dashboard, create a <b>$7/month subscription product</b> and a <b>Payment Link</b> for it.</li>
              <li>Paste that payment link below, plus the <b>secret key</b> (starts with <code>sk_live_</code>) from Stripe → Developers → API keys. The publishable key is optional.</li>
              <li>Save. Subscribing, verification, and cancellation then run against Stripe for real.</li>
            </ol>
            <form className="billing-form" onSubmit={(event) => { event.preventDefault(); saveSettings.mutate(); }}>
              <label>Stripe payment link URL<input value={paymentLinkUrl} onChange={(event) => setPaymentLinkUrl(event.target.value)} placeholder={data?.paymentLinkUrl ?? "https://buy.stripe.com/…"} autoComplete="off" /></label>
              <label>Stripe secret key<input type="password" value={secretKey} onChange={(event) => setSecretKey(event.target.value)} placeholder={data?.secretKeySet ? "Saved — leave blank to keep it" : "sk_live_…"} autoComplete="off" /></label>
              <label>Stripe publishable key (optional)<input value={publishableKey} onChange={(event) => setPublishableKey(event.target.value)} placeholder={data?.publishableKey ?? "pk_live_…"} autoComplete="off" /></label>
              <button className="primary full" type="submit" disabled={saveSettings.isPending}>{saveSettings.isPending ? "Saving…" : "Save Stripe connection"}</button>
            </form>
            <p className="billing-note">Keys are stored only in this app’s private database. The secret key is write-only here — it is never displayed again after saving. Until this step is done, Saver features stay locked and nobody is charged.</p>
          </div>
        )}

        {configured && !subscribed && (
          <details className="billing-update">
            <summary>Owner: update the Stripe connection</summary>
            <form className="billing-form" onSubmit={(event) => { event.preventDefault(); saveSettings.mutate(); }}>
              <label>Stripe payment link URL<input value={paymentLinkUrl} onChange={(event) => setPaymentLinkUrl(event.target.value)} placeholder={data?.paymentLinkUrl ?? "https://buy.stripe.com/…"} autoComplete="off" /></label>
              <label>Stripe secret key<input type="password" value={secretKey} onChange={(event) => setSecretKey(event.target.value)} placeholder={data?.secretKeySet ? "Saved — leave blank to keep it" : "sk_live_…"} autoComplete="off" /></label>
              <label>Stripe publishable key (optional)<input value={publishableKey} onChange={(event) => setPublishableKey(event.target.value)} placeholder={data?.publishableKey ?? "pk_live_…"} autoComplete="off" /></label>
              <button className="secondary full" type="submit" disabled={saveSettings.isPending}>{saveSettings.isPending ? "Saving…" : "Save Stripe connection"}</button>
            </form>
          </details>
        )}

        <p className="store-note">Grocery payments always happen directly in the retailer’s own checkout. The $7/month membership is a separate Stripe charge and never touches grocery money.</p>
        <button className="primary full" onClick={onClose}>Done</button>
      </section>
    </div>
  );
}

function CheckoutSheet({ checkout, onClose, onToast }: { checkout: ApiResponse<typeof api, "chooseCheckout">; onClose: () => void; onToast: (message: string) => void }) {
  const orderText = useMemo(() => `${checkout.storeName} order\n${checkout.lines.join("\n")}${checkout.quotedTotal === null ? "" : `\nQuoted total: ${fmt(checkout.quotedTotal)}`}`, [checkout]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(orderText); onToast("Order sheet copied."); }
    catch { onToast("Copy was blocked. Keep this sheet open while you order."); }
  };
  const downloadCsv = () => {
    const rows = [["store", "item"], ...checkout.lines.map((line) => [checkout.storeName, line])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `${checkout.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-order.csv`; link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="sheet checkout-sheet" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div className="sheet-head"><div><p className="eyebrow">Store handoff</p><h2 id="checkout-title">Finish at {checkout.storeName}</h2></div><button className="close" onClick={onClose} aria-label="Close checkout sheet">×</button></div>
        <div className="quote-total"><span>Quoted total<small>{freshnessRange(checkout.priceUpdatedFrom, checkout.priceUpdatedThrough)}</small></span><strong>{checkout.quotedTotal === null ? "Incomplete" : fmt(checkout.quotedTotal)}</strong></div>
        <ol className="order-lines">{checkout.lines.map((line) => <li key={line}>{line}</li>)}</ol>
        <p className="store-note">Your grocery payment, final substitutions, taxes, and fees are handled by {checkout.storeName}. The $7/month app membership is a separate charge.</p>
        <div className="handoff-actions"><button className="secondary full" onClick={copy}>Copy pick list</button><button className="secondary full" onClick={downloadCsv}>Download CSV</button></div>
        {checkout.orderUrl && <a className="primary link-button full" href={checkout.orderUrl} target="_blank" rel="noreferrer">Open {checkout.storeName} checkout ↗</a>}
      </section>
    </div>
  );
}
