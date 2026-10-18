"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string | null;
};

type AuthResponse = {
  token: string;
  email: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function Home() {
  const [cart, setCart] = useState<number[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [category, setCategory] = useState("All pieces");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch(`${apiUrl}/api/products`);
        if (!response.ok) {
          throw new Error(`Could not load products (HTTP ${response.status}).`);
        }

        const apiProducts: Product[] = await response.json();
        if (!Array.isArray(apiProducts)) {
          throw new Error("The products API returned an invalid response.");
        }

        if (active) setCatalog(apiProducts);
      } catch (error) {
        if (active) {
          setProductError(error instanceof Error ? error.message : "Could not load products.");
        }
      } finally {
        if (active) setLoadingProducts(false);
      }
    }

    void loadProducts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("morrow-token");
    if (!token) return;

    let active = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch(`${apiUrl}/api/account/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("morrow-token");
          if (active) setNotice("Your session has expired. Please sign in again.");
          return;
        }
        if (!response.ok) {
          throw new Error(`Could not verify your account (HTTP ${response.status}).`);
        }

        const account: { email: string } = await response.json();
        if (active) setUser(account.email);
      } catch (error) {
        if (active) {
          setNotice(error instanceof Error ? error.message : "Could not verify your account.");
        }
      }
    }

    void loadCurrentUser();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => ["All pieces", ...new Set(catalog.map((product) => product.category))], [catalog]);
  const shown = useMemo(() => catalog.filter((product) => (category === "All pieces" || product.category === category) && product.name.toLowerCase().includes(search.toLowerCase())), [catalog, category, search]);
  const cartItems = useMemo(() => {
    const quantities = new Map<number, number>();
    cart.forEach((id) => quantities.set(id, (quantities.get(id) ?? 0) + 1));
    return catalog.flatMap((product) => {
      const quantity = quantities.get(product.id) ?? 0;
      return quantity ? [{ product, quantity }] : [];
    });
  }, [catalog, cart]);
  const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const formatPrice = (price: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
  const add = (id: number) => { setCart((items) => [...items, id]); setNotice("Added to your bag"); window.setTimeout(() => setNotice(""), 1800); };
  const updateQuantity = (id: number, change: number) => {
    setCart((items) => {
      if (change > 0) return [...items, id];
      const index = items.indexOf(id);
      return index < 0 ? items : items.filter((_, itemIndex) => itemIndex !== index);
    });
  };
  const openCheckout = () => {
    if (cart.length === 0) {
      setNotice("Your bag is waiting for something lovely");
      return;
    }
    setCheckoutComplete(false);
    setShowCheckout(true);
  };
  const completeDemoCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutComplete(true);
    setCart([]);
  };
  const signOut = () => {
    localStorage.removeItem("morrow-token");
    setUser(null);
    setNotice("You have been signed out.");
  };
  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/auth/${registerMode ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: Partial<AuthResponse> & { detail?: string; message?: string } = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ?? data.message ?? "Could not sign in. Check your details and try again.");
      }
      if (!data.token || !data.email) {
        throw new Error("The authentication API returned an invalid response.");
      }

      localStorage.setItem("morrow-token", data.token);
      setUser(data.email);
      setNotice(`Welcome${registerMode ? " to Morrow" : " back"}, ${data.email}`);
      setShowLogin(false);
      setPassword("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The API is unavailable. Start the backend to use accounts.");
    }
  };

  return <main>
    <div className="announcement">A little something extra — enjoy free shipping over $100 <span>✳</span></div>
    <header className="site-header container-fluid">
      <a className="wordmark" href="#top">morrow<span>.</span></a>
      <nav className="main-nav"><a href="#shop">Shop</a><a href="#story">Our story</a><a href="#newsletter">Journal</a></nav>
      <div className="header-actions"><button className="icon-button search-trigger" aria-label="Search" onClick={() => document.getElementById("product-search")?.focus()}>⌕</button>{user ? <><span className={styles.accountEmail} title={user}>Signed in as {user}</span><button className={styles.signoutButton} onClick={signOut}>Sign out</button></> : <button className="icon-button account-trigger" aria-label="Sign in" onClick={() => setShowLogin(true)}>♙</button>}<button className="bag-button" onClick={openCheckout}>Bag <span>{cart.length}</span></button></div>
    </header>

    <section className="hero container-fluid" id="top">
      <div className="hero-copy"><p className="eyebrow">A SLOWER KIND OF EVERYDAY</p><h1>Make room<br />for <em>good things.</em></h1><p className="hero-text">Considered pieces for the everyday rituals that make a house feel like yours.</p><a className="dark-button" href="#shop">Shop the collection <span>↗</span></a><div className="hero-note"><span className="note-star">✳</span><span>Thoughtfully made.<br />Made to be kept.</span></div></div>
      <div className="hero-visual"><div className="hero-image" role="img" aria-label="Sunlit, peaceful living room with natural materials"/><div className="image-caption"><span>THE SUNDAY EDIT</span><span>01 / 04</span></div><div className="sun-stamp">GOOD<br />THINGS<br /><span>✳</span></div></div>
      <div className="hero-side-label">OBJECTS FOR EVERYDAY LIVING — EST. 2021</div>
    </section>

    <section className="ticker"><div>MADE WITH INTENTION <span>✳</span> SENT WITH LOVE <span>✳</span> KEPT FOR YEARS <span>✳</span> MADE WITH INTENTION <span>✳</span> SENT WITH LOVE <span>✳</span></div></section>

    <section className="shop-section container-fluid" id="shop">
      <div className="section-heading"><div><p className="eyebrow">THE GOOD STUFF</p><h2>Find your <em>everyday.</em></h2></div><p className="section-description">Small-batch pieces with a point of view<br />and a place in your home.</p></div>
      <div className="shop-toolbar"><div className="category-list">{categories.map((item) => <button key={item} className={category === item ? "category active" : "category"} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><span>⌕</span><input id="product-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find something…" /></label></div>
      {loadingProducts && <p className="empty-state" role="status">Loading pieces…</p>}
      {productError && <p className="empty-state" role="alert">{productError}</p>}
      {!loadingProducts && !productError && <div className="product-grid">{shown.map((product) => <article className="product-card" key={product.id}><div className="product-image-wrap">{product.imageUrl && <img src={product.imageUrl} alt={product.name} className="product-image" />}<button className="quick-add" onClick={() => add(product.id)} aria-label={`Add ${product.name} to bag`}>+</button></div><div className="product-meta"><div><p>{product.category.toUpperCase()}</p><h3>{product.name}</h3></div><div className="product-price">{formatPrice(product.price)}</div></div></article>)}</div>}
      {!loadingProducts && !productError && shown.length === 0 && <p className="empty-state">{catalog.length === 0 ? "No pieces are available right now." : "No pieces found. Try another search."}</p>}
      <div className="all-products"><a href="#shop">VIEW ALL {catalog.length} PIECES <span>↗</span></a></div>
    </section>

    <section className="story-band" id="story"><div className="story-image"/><div className="story-copy"><p className="eyebrow">LESS, BUT LOVELIER</p><h2>Good design<br />should feel like<br /><em>coming home.</em></h2><p>We believe the things we live with should bring us joy. So we work with small makers, natural materials, and the kind of care you can feel.</p><a href="#newsletter" className="text-link">A LITTLE MORE ABOUT US <span>↗</span></a></div></section>

    <section className="newsletter" id="newsletter"><p className="eyebrow">NOTES FROM MORROW</p><h2>A little good in<br /><em>your inbox.</em></h2><p>New pieces, thoughtful reads, and 10% off your first order.</p><form onSubmit={(e) => { e.preventDefault(); setNotice("You're on the list — see you soon!"); }}><input type="email" placeholder="Your email address" required /><button type="submit">COUNT ME IN <span>↗</span></button></form><small>By subscribing, you agree to receive occasional notes from us. Unsubscribe anytime.</small></section>

    <footer className="footer"><a className="wordmark" href="#top">morrow<span>.</span></a><p>Objects for everyday living.</p><div className="footer-links"><a href="#shop">Shop</a><a href="#story">Our story</a><a href="mailto:hello@morrow.example">Get in touch</a><span>© 2025 MORROW STUDIO</span></div></footer>

    {notice && <div className="toast-message" role="status">✳ &nbsp;{notice}</div>}
    {showCheckout && <div className={styles.checkoutBackdrop} onClick={() => setShowCheckout(false)}>
      <section className={styles.checkoutModal} role="dialog" aria-modal="true" aria-labelledby="checkout-title" onClick={(event) => event.stopPropagation()}>
        <button className={styles.checkoutClose} type="button" aria-label="Close checkout" onClick={() => setShowCheckout(false)}>×</button>
        {checkoutComplete ? <div className={styles.checkoutSuccess} role="status">
          <p className="eyebrow">THANK YOU</p>
          <h2 id="checkout-title">Your demo order<br /><em>is complete.</em></h2>
          <p>This was a test checkout only. No payment was processed and no card details were collected.</p>
          <button className="dark-button" type="button" onClick={() => setShowCheckout(false)}>BACK TO SHOP <span>↗</span></button>
        </div> : <>
          <p className="eyebrow">YOUR BAG</p>
          <h2 id="checkout-title">A few good<br /><em>things.</em></h2>
          <div className={styles.checkoutItems}>
            {cartItems.map(({ product, quantity }) => <article className={styles.checkoutItem} key={product.id}>
              {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <div className={styles.checkoutImagePlaceholder} />}
              <div className={styles.checkoutProduct}>
                <h3>{product.name}</h3>
                <p>{formatPrice(product.price)} each</p>
                <div className={styles.quantityControl} aria-label={`Quantity for ${product.name}`}>
                  <button type="button" aria-label={`Remove one ${product.name}`} onClick={() => updateQuantity(product.id, -1)}>−</button>
                  <span>{quantity}</span>
                  <button type="button" aria-label={`Add one ${product.name}`} onClick={() => updateQuantity(product.id, 1)}>+</button>
                </div>
              </div>
              <strong>{formatPrice(product.price * quantity)}</strong>
            </article>)}
            {cartItems.length === 0 && <p className={styles.checkoutEmpty}>Your bag is empty.</p>}
          </div>
          <div className={styles.checkoutTotals}>
            <div><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
            <div><span>Shipping</span><span>Not charged in demo</span></div>
            <div className={styles.checkoutTotal}><strong>Demo total</strong><strong>{formatPrice(cartTotal)}</strong></div>
          </div>
          <div className={styles.testCard}>
            <span className={styles.cardMark} aria-hidden="true">VISA</span>
            <span>•••• &nbsp;•••• &nbsp;•••• &nbsp;4242</span>
            <small>TEST CARD — no real payment</small>
          </div>
          <p className={styles.demoNotice}>Demo checkout only. No real charge will be made. Card information is not requested, stored, or sent.</p>
          <form onSubmit={completeDemoCheckout}>
            <button className="dark-button" type="submit" disabled={cartItems.length === 0}>COMPLETE TEST CHECKOUT <span>↗</span></button>
          </form>
        </>}
      </section>
    </div>}
    {showLogin && <div className="modal-backdrop" onClick={() => setShowLogin(false)}><div className="login-modal" onClick={(e) => e.stopPropagation()}><button className="close-modal" onClick={() => setShowLogin(false)}>×</button><p className="eyebrow">WELCOME TO MORROW</p><h2>Good to have<br /><em>you here.</em></h2><p>{registerMode ? "Create an account to keep your favourites close." : "Sign in to keep your favourites close."}</p><form onSubmit={submitAuth}><label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required /></label><button className="dark-button" type="submit">{registerMode ? "CREATE ACCOUNT" : "SIGN IN"} <span>↗</span></button></form><button className="mode-switch" onClick={() => setRegisterMode(!registerMode)}>{registerMode ? "Already have an account? Sign in" : "New here? Create an account"}</button></div></div>}
  </main>;
}
