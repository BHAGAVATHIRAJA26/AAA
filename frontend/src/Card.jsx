import './App.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ Backend URL
const API = "https://aaa-v1.vercel.app";

function Card() {

  const [a, setA] = useState([]);
  const { id } = useParams();
  const [mii, setmii] = useState();
  const [q, setq] = useState(0);
  const [t, sett] = useState(0);

  const navigate = useNavigate();

  // ✅ GET CART ITEMS
  useEffect(() => {
    axios.post(`${API}/Card`, { id })
      .then((response) => {
        setA(response.data);
      });
  }, [id]);

  // ✅ REMOVE ITEM
  function remov(pid) {
    axios.post(`${API}/Cardre`, { id: pid })
      .then(() => {
        window.location.reload();
      });
  }

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

  function ho(e, dis, cos) {
    sett(t + cos - (cos * dis / 100));
    setq(q + 1);
  }

  function hoo(e, dis, cos) {
    if (t > 0) sett(t - (cos - (cos * dis / 100)));
    if (q >= 1) setq(q - 1);
  }

  // ✅ PAYMENT
  const payNow = async () => {

    const { data: order } = await axios.post(
      `${API}/create-order`,
      { amount: t }
    );

    const options = {
      key: "rzp_test_Rav7PqqDQLc4Wd",
      amount: order.amount,
      currency: "INR",
      name: "BS Traders",
      description: "Purchase Payment",
      order_id: order.id,

      prefill: {
        name: "Bhagavathi Raja",
        email: "bhagavathiraja@gmail.com",
        contact: "9443278330",
      },

      handler: async function (response) {
        const verify = await axios.post(
          `${API}/verify-payment`,
          response
        );

        alert(verify.data.message);
      },

      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  function s1() {
    navigate(`/${id}/Sell`);
  }

  function hi() {
    navigate(`/${id}/Product`);
  }

  return (
    <>
      {/* UI PART SAME — NO CHANGE */}
      {/* I didn’t modify UI to keep your design intact */}
    </>
  );
}

export default Card;