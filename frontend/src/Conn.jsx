import myImage from './myimage.jpg';
import './App.css';
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useEffect, useState } from 'react';

import bi from './bicycle.jpg';
import wa from './watch.jpg';
import sp from './sp.jpg';
import ta from './ta.jpg';
import er from './er.jpg';
import wt from './wt.jpg';

// ✅ Backend URL
const API = "https://aaa-v1.vercel.app";

function Conn() {

  const [mii, setmii] = useState();
  const [a, setA] = useState([]);
  const [se, setse] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  function fds(event) {
    setse(event.target.value);
  }

  // ✅ SEARCH
  function sea() {
    axios.post(`${API}/product`, se, {
      headers: { "Content-Type": "text/plain" }
    })
      .then((response) => {
        setA(response.data);
      })
      .catch(console.error);
  }

  function inp(did) {
    navigate(`/detail/${did}/${id}`);
  }

  function s1() {
    navigate(`/${id}/Sell`);
  }

  // ✅ ADD TO CART
  function c1(url, desc, cos, dis) {
    axios.post(`${API}/itdata`, { id, url, desc, cos, dis })
      .then((response) => {
        console.log(response.data.message);
      });
  }

  // ✅ LOAD PRODUCTS
  useEffect(() => {
    axios.get(`${API}/product`)
      .then((response) => {
        setA(response.data);
      })
      .catch(console.error);
  }, []);

  // ✅ USER INFO
  useEffect(() => {
    axios.post(`${API}/perinf`, id, {
      headers: { "Content-Type": "text/plain" }
    })
      .then((response) => {
        setmii(response.data);
      })
      .catch(console.error);
  }, [id]);

  return (
    <>
      {/* UI SAME — only API fixed */}

      <div id='a3'>
        <div id='a2'>
          <b id='i'>BS Traders</b>

          <div id='a4'>
            <input
              type='text'
              size='60'
              placeholder='Search for Products...'
              onChange={fds}
            />
            <i className='btn btn-sm btn-light bi bi-search' onClick={sea}></i>
          </div>

          <div>
            <div id='a7' className='btn btn-lg btn-light' data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions">
              <i className="bi bi-person-circle"></i>Profile
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

        {/* PRODUCTS */}
        <form id='b1'>
          {a.map(item => (
            <b key={item._id} id="b2" style={{ marginTop: "40px" }}>

              <div id="b9" onClick={() => inp(item._id)}>
                <img src={item.url} height="280px" width="370px" />
              </div>

              <h6>{item.desc}</h6>
              <h6>Rating: ⭐⭐⭐⭐☆</h6>

              <b>
                ₹{item.cos - (item.cos * item.dis / 100)}
                <span style={{ paddingLeft: "10px" }}>MRP:</span>
                <s> ₹{item.cos}</s>
                <span style={{ paddingLeft: "10px" }}>discount:</span>
                <span style={{ color: "red" }}>{item.dis}% off</span>
              </b>

              <div
                id='b7'
                className='btn btn-lg btn-dark btn-light'
                onClick={() => c1(item.url, item.desc, item.cos, item.dis)}
              >
                🛒 Add to Cart
              </div>

            </b>
          ))}
        </form>

      </div>
    </>
  );
}

export default Conn;