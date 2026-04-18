import { useEffect, useState } from "react";
import {
  register,
  login,
  getProducts,
  addToFavorites,
  getFavorites,
  removeFromFavorites,
} from "./api";

function App() {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activePage, setActivePage] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [message, setMessage] = useState("");

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (token) {
      loadFavorites();
    }
  }, [token]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setProducts([]);
      showMessage("Failed to load products");
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await getFavorites(token);
      setFavorites(data.items || []);
    } catch (error) {
      setFavorites([]);
    }
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const data = await register(
        registerData.name,
        registerData.email,
        registerData.password
    );

    if (data.error) {
      showMessage(data.error);
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setRegisterData({ name: "", email: "", password: "" });
    setActivePage("home");
    showMessage("Registration successful");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const data = await login(loginData.email, loginData.password);

    if (data.error) {
      showMessage(data.error);
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setLoginData({ email: "", password: "" });
    setActivePage("home");
    showMessage("Login successful");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setFavorites([]);
    setActivePage("home");
    showMessage("Logged out");
  };

  const handleAddToFavorites = async (productId) => {
    if (!token) {
      showMessage("Please login first");
      setActivePage("auth");
      return;
    }

    const data = await addToFavorites(productId, token);

    if (data.error) {
      showMessage(data.error);
      return;
    }

    showMessage("Added to favorites");
    loadFavorites();
  };

  const handleRemoveFromFavorites = async (productId) => {
    if (!token) {
      showMessage("Please login first");
      setActivePage("auth");
      return;
    }

    const data = await removeFromFavorites(productId, token);

    if (data.error) {
      showMessage(data.error);
      return;
    }

    showMessage("Removed from favorites");
    loadFavorites();
  };

  const handleBuy = async (product) => {
    if (!token || !user) {
      showMessage("Please login before purchase");
      setActivePage("auth");
      return;
    }

    try {
      const customerRes = await fetch("http://localhost:8080/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: user.name,
          email: user.email,
        }),
      });

      const customer = await customerRes.json();

      const orderRes = await fetch("http://localhost:8080/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customer.id,
          product_id: product.id,
          quantity: 1,
          status: "created",
        }),
      });

      const orderData = await orderRes.json();

      if (orderData.error) {
        showMessage(orderData.error);
        return;
      }

      showMessage(`Order created: ${product.title}`);
    } catch (error) {
      showMessage("Failed to create order");
    }
  };

  const isFavorite = (productId) => {
    return favorites.some((favorite) => favorite.product_id === productId);
  };

  return (
      <div className="app">
        <header className="topbar">
          <div>
            <h1 className="brand">Luzmuerta Studio</h1>
            <p className="tagline">Minimal digital design resources for creators</p>
          </div>

          <nav className="nav">
            {user && <span className="user-badge">Hi, {user.name}</span>}

            <button
                className={activePage === "home" ? "nav-btn active" : "nav-btn"}
                onClick={() => setActivePage("home")}
            >
              Products
            </button>

            <button
                className={activePage === "favorites" ? "nav-btn active" : "nav-btn"}
                onClick={() => setActivePage("favorites")}
            >
              Favorites
            </button>

            <button
                className={activePage === "auth" ? "nav-btn active" : "nav-btn"}
                onClick={() => setActivePage("auth")}
            >
              {user ? "Account" : "Login"}
            </button>
          </nav>
        </header>

        {message && <div className="message">{message}</div>}

        {activePage === "home" && (
            <main>
              <section className="hero">
                <div className="hero-card">
                  <p className="hero-label">Luzmuerta Studio</p>
                  <h2>Curated UI kits, templates, and visual resources.</h2>
                  <p>
                    A clean online store for designers, developers, and students who
                    need polished digital assets.
                  </p>
                </div>
              </section>

              <section className="section-header">
                <div>
                  <h3>Featured Products</h3>
                  <p>Browse minimal digital resources for your next project.</p>
                </div>
              </section>

              {products.length === 0 ? (
                  <p className="empty-text">
                    No products yet. Add products through your backend API.
                  </p>
              ) : (
                  <section className="product-grid">
                    {products.map((product) => (
                        <article key={product.id} className="product-card">
                          <div className="product-preview">
                            <span>{product.format || "Digital Asset"}</span>
                          </div>

                          <div className="product-body">
                            <div className="product-top">
                              <h4>{product.title}</h4>
                              <p className="product-price">${product.price}</p>
                            </div>

                            <p className="product-description">{product.description}</p>

                            <div className="product-meta">
                              <span className="chip">{product.format}</span>
                            </div>

                            <div className="product-actions">
                              {isFavorite(product.id) ? (
                                  <button
                                      className="secondary-btn"
                                      onClick={() => handleRemoveFromFavorites(product.id)}
                                  >
                                    Remove Favorite
                                  </button>
                              ) : (
                                  <button
                                      className="secondary-btn"
                                      onClick={() => handleAddToFavorites(product.id)}
                                  >
                                    Add to Favorites
                                  </button>
                              )}

                              <button
                                  className="primary-btn"
                                  onClick={() => handleBuy(product)}
                              >
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </article>
                    ))}
                  </section>
              )}
            </main>
        )}

        {activePage === "favorites" && (
            <main>
              <section className="section-header">
                <div>
                  <h3>Your Favorites</h3>
                  <p>Saved products linked to your account.</p>
                </div>
              </section>

              {!token ? (
                  <div className="empty-box">
                    <p>Please login to view your favorites.</p>
                  </div>
              ) : favorites.length === 0 ? (
                  <div className="empty-box">
                    <p>You have no favorite products yet.</p>
                  </div>
              ) : (
                  <section className="product-grid">
                    {favorites.map((favorite) => (
                        <article key={favorite.id} className="product-card">
                          <div className="product-preview">
                            <span>{favorite.product?.format || "Favorite"}</span>
                          </div>

                          <div className="product-body">
                            <div className="product-top">
                              <h4>{favorite.product?.title}</h4>
                              <p className="product-price">${favorite.product?.price}</p>
                            </div>

                            <p className="product-description">
                              {favorite.product?.description}
                            </p>

                            <div className="product-meta">
                              <span className="chip">{favorite.product?.format}</span>
                            </div>

                            <div className="product-actions">
                              <button
                                  className="secondary-btn"
                                  onClick={() => handleRemoveFromFavorites(favorite.product_id)}
                              >
                                Remove
                              </button>

                              <button
                                  className="primary-btn"
                                  onClick={() => handleBuy(favorite.product)}
                              >
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </article>
                    ))}
                  </section>
              )}
            </main>
        )}

        {activePage === "auth" && (
            <main className="auth-page">
              {user ? (
                  <div className="auth-card">
                    <h3>Your Account</h3>
                    <p>
                      <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>

                    <div className="account-actions">
                      <button
                          className="secondary-btn"
                          onClick={() => setActivePage("favorites")}
                      >
                        View Favorites
                      </button>
                      <button className="primary-btn" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </div>
              ) : (
                  <div className="auth-layout">
                    <div className="auth-switch">
                      <button
                          className={authMode === "login" ? "nav-btn active" : "nav-btn"}
                          onClick={() => setAuthMode("login")}
                      >
                        Login
                      </button>
                      <button
                          className={authMode === "register" ? "nav-btn active" : "nav-btn"}
                          onClick={() => setAuthMode("register")}
                      >
                        Register
                      </button>
                    </div>

                    {authMode === "login" ? (
                        <form className="auth-card" onSubmit={handleLogin}>
                          <h3>Login</h3>

                          <input
                              type="email"
                              placeholder="Email"
                              value={loginData.email}
                              onChange={(e) =>
                                  setLoginData({ ...loginData, email: e.target.value })
                              }
                          />

                          <input
                              type="password"
                              placeholder="Password"
                              value={loginData.password}
                              onChange={(e) =>
                                  setLoginData({ ...loginData, password: e.target.value })
                              }
                          />

                          <button type="submit" className="primary-btn full-width">
                            Sign In
                          </button>
                        </form>
                    ) : (
                        <form className="auth-card" onSubmit={handleRegister}>
                          <h3>Create Account</h3>

                          <input
                              type="text"
                              placeholder="Name"
                              value={registerData.name}
                              onChange={(e) =>
                                  setRegisterData({ ...registerData, name: e.target.value })
                              }
                          />

                          <input
                              type="email"
                              placeholder="Email"
                              value={registerData.email}
                              onChange={(e) =>
                                  setRegisterData({ ...registerData, email: e.target.value })
                              }
                          />

                          <input
                              type="password"
                              placeholder="Password"
                              value={registerData.password}
                              onChange={(e) =>
                                  setRegisterData({ ...registerData, password: e.target.value })
                              }
                          />

                          <button type="submit" className="primary-btn full-width">
                            Create Account
                          </button>
                        </form>
                    )}
                  </div>
              )}
            </main>
        )}
      </div>
  );
}

export default App;