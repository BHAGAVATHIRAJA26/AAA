import './App.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';

// ✅ ADD THIS
const API = "https://aaa-v1.vercel.app";

function Detail() {

  const { did, id } = useParams();

  const [mii, setmii] = useState();
  const [a, setA] = useState(null);
  const navigate = useNavigate();

  function s1() {
    navigate(`/${id}/Sell`);
  }

  // ✅ FIXED
  function c1(url, desc, cos, dis) {
    axios.post(`${API}/itdata`, { id, url, desc, cos, dis })
      .then((response) => {
        console.log(response.data.message);
      })
      .catch(() => console.log("Error adding to cart"));
  }

  // ✅ FIXED
  useEffect(() => {
    axios.post(`${API}/perinf`, id, {
      headers: { "Content-Type": "text/plain" }
    })
      .then((response) => {
        setmii(response.data);
      })
      .catch(error => console.error(error));
  }, [id]);

  // ✅ FIXED
  useEffect(() => {
    axios.get(`${API}/product/${did}`)
      .then((response) => {
        setA(response.data);
      })
      .catch(error => console.error(error));
  }, [did]);

  return (
    <>
      {/* HEADER */}
      <div id='a2'>
        <b id='i'>BS Traders</b>

        <div id='a4'>
          <input type='text' size='60' placeholder='Search for Products...' />
          <i className="bi bi-search"></i>
        </div>

        <div>
          <div id='a7' className='btn btn-lg btn-light'
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasWithBothOptions">
            <i className="bi bi-person-circle"></i> Profile
          </div>

          <Link to={`/${id}/Sell`}>
            <div id='a7' className='btn btn-lg btn-light'>
              <i className="bi bi-shop" onClick={s1}></i> Sell
            </div>
          </Link>

          <Link to={`/${id}/Card`}>
            <div id='a8' className='btn btn-lg btn-light'>
              <i className="bi bi-cart"></i> Cart
            </div>
          </Link>
        </div>
      </div>

      {/* PROFILE */}
      {mii && (
        <div className="offcanvas-body">
          <h2>{mii.username}</h2>
          <p>Email: {mii.useremail}</p>
          <p>Phone: {mii.phone}</p>
        </div>
      )}

      {/* PRODUCT */}
      {a && (
        <div id="u1" style={{
          display: "flex",
          gap: "50px",
          padding: "40px",
          maxWidth: "1200px",
          margin: "auto"
        }}>

          <div style={{ flex: 1 }}>
            <img src={a.url} alt="product" style={{ width: "100%" }} />
          </div>

          <div style={{ flex: 1 }}>
            <h2>{a.desc}</h2>

            <h3>
              ₹{a.cos - (a.cos * a.dis / 100)}
            </h3>

            <button onClick={() => c1(a.url, a.desc, a.cos, a.dis)}>
              🛒 Add to Cart
            </button>
          </div>

        </div>
      )}
    </>
  );
}

export default Detail;