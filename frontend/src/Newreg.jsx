import './App.css'
import { useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

// ✅ ADD THIS
const API = "https://aaa-v1.vercel.app";

function Abc() {

  const navigate = useNavigate();

  const [z1, setz1] = useState(false);
  const [t1, sett1] = useState("");
  const [b1, setb1] = useState("");
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [ne, setne] = useState(false);
  const [ll, setll] = useState("");
  const [fll, setfll] = useState("");
  const [gender, setgender] = useState("");
  const [phone, setphone] = useState("");
  const [aphone, setaphone] = useState("");

  // 📍 GET LOCATION
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`${API}/get-address`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            })
          });

          const data = await res.json();

          setll(
            `${data.area}, ${data.city}, ${data.district}, ${data.state}, ${data.country}`
          );
        } catch (err) {
          console.error("API error", err);
        }
      },
      () => {
        alert("Please allow location access");
      }
    );
  }, []);

  function locadd() {
    setfll(ll);
  }

  // ✅ REGISTER
  function al(e) {
    e.preventDefault();

    if (z1) {
      alert("Passwords do not match");
      return;
    }

    axios.post(`${API}/newreg`, {
      name,
      email,
      password: t1,
      gender,
      phone,
      aphone,
      address: fll
    })
      .then((response) => {
        if (response.data.message) {
          alert("Registration successful");
          navigate("/");
        } else {
          alert("Email already registered");
        }
      })
      .catch(() => alert("Server error"));
  }

  function pass(e) {
    sett1(e.target.value);
  }

  function ck(e) {
    const v = e.target.value;
    setb1(v);
    setz1(v !== t1);
  }

  return (
    <form id="f1" onSubmit={al}>
      <div id="c2">

        <center><h2>Create New Account</h2></center><br />

        {!ne && (
          <>
            <label htmlFor="name">User Name</label>
            <input type="text" className="form-control" onChange={(e) => setname(e.target.value)} />

            <br />

            <label htmlFor="email">Email</label>
            <input type="email" className="form-control" onChange={(e) => setemail(e.target.value)} />

            <br />

            <label>Password</label>
            <input type="password" className="form-control" value={t1} onChange={pass} />

            <br />

            <label>Re-type Password</label>
            <input type="password" className="form-control" value={b1} onChange={ck} />

            {z1 && <p style={{ color: "red" }}>Passwords do not match</p>}

            <br />

            <center>
              <button type="button" onClick={() => setne(true)}>
                Next
              </button>
            </center>
          </>
        )}

        {ne && (
          <>
            <br />

            <label>Gender:</label><br />
            <input type="radio" value="Male" onChange={(e) => setgender(e.target.value)} /> Male
            <input type="radio" value="Female" onChange={(e) => setgender(e.target.value)} /> Female

            <br /><br />

            <label>Phone</label>
            <input type="text" value={phone} onChange={(e) => setphone(e.target.value)} />

            <br />

            <label>Another Phone</label>
            <input type="text" value={aphone} onChange={(e) => setaphone(e.target.value)} />

            <br />

            <button type="button" onClick={locadd}>
              Use Current Location
            </button>

            <br />

            <textarea value={fll} onChange={(e) => setfll(e.target.value)} />

            <br /><br />

            <center>
              <button type="submit">Submit</button>
            </center>
          </>
        )}

      </div>
    </form>
  );
}

export default Abc;